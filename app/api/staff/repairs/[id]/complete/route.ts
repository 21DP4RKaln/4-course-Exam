import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createNotFoundResponse,
  createBadRequestResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { sendRepairCompletionEmail, EmailConfig } from '@/lib/mail/email';

const completeRepairSchema = z.object({
  finalCost: z.number(),
  completionNotes: z.string(),
  parts: z
    .array(
      z.object({
        componentId: z.string(),
        quantity: z.number().min(1),
        price: z.number(),
      })
    )
    .optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    if (!['ADMIN', 'SPECIALIST'].includes(payload.role)) {
      return createUnauthorizedResponse('Insufficient permissions');
    }

    const formData = await request.formData();
    const finalCost = parseFloat(formData.get('finalCost') as string);
    const completionNotes = formData.get('completionNotes') as string;
    const partsJson = formData.get('parts') as string;
    const completionImage = formData.get('completionImage') as File | null;

    const validationData = {
      finalCost,
      completionNotes,
      parts: partsJson ? JSON.parse(partsJson) : undefined,
    };

    const validationResult = completeRepairSchema.safeParse(validationData);

    if (!validationResult.success) {
      return createBadRequestResponse(
        'Invalid completion data',
        validationResult.error.flatten()
      );
    }

    const { parts } = validationResult.data;

    const repair = await prisma.repair.findUnique({
      where: { id: params.id },
      include: {
        specialists: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        peripheral: true,
        configuration: true,
      },
    });

    if (!repair) {
      return createNotFoundResponse('Repair not found');
    }

    if (payload.role === 'SPECIALIST') {
      const isAssigned = repair.specialists.some(
        s => s.specialistId === payload.userId
      );
      if (!isAssigned) {
        return createUnauthorizedResponse(
          'You are not assigned to this repair'
        );
      }
    }

    if (repair.status === 'COMPLETED') {
      return createBadRequestResponse('Repair is already completed');
    }

    let imageUrl: string | null = null;
    if (completionImage) {
      const bytes = await completionImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${randomUUID()}-${completionImage.name}`;
      const uploadDir = join(
        process.cwd(),
        'public',
        'uploads',
        'repairs',
        'completed'
      );

      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const imagePath = join(uploadDir, filename);
      await writeFile(imagePath, buffer);

      imageUrl = `/uploads/repairs/completed/${filename}`;
    }

    const updateData: any = {
      status: 'COMPLETED',
      finalCost,
      completionDate: new Date(),
      diagnosticNotes: repair.diagnosticNotes
        ? `${repair.diagnosticNotes}\n\nCompletion Notes:\n${completionNotes}`
        : `Completion Notes:\n${completionNotes}`,
    };

    if (imageUrl) {
      updateData.diagnosticNotes = `${updateData.diagnosticNotes}\n\nCompletion Image: ${imageUrl}`;
    }

    if (parts && parts.length > 0) {
      await prisma.repairPart.deleteMany({
        where: { repairId: params.id },
      });

      updateData.parts = {
        create: parts.map(part => ({
          componentId: part.componentId,
          quantity: part.quantity,
          price: part.price,
        })),
      };
    }

    const completedRepair = await prisma.repair.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        peripheral: true,
        configuration: true,
        parts: {
          include: {
            component: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    try {
      const emailConfig: EmailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASS || '',
        },
        fromEmail: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        fromName: process.env.EMAIL_FROM_NAME || 'IvaPro Support',
      };

      const repairCompletionData = {
        repairId: completedRepair.id,
        title: completedRepair.title || 'Repair Request',
        customerName: completedRepair.user.name || 'Customer',
        finalCost: completedRepair.finalCost || 0,
        completionNotes: completionNotes,
        completionImage: imageUrl || undefined,
        parts: completedRepair.parts.map(part => ({
          name: part.component.name,
          quantity: part.quantity,
          price: part.price,
        })),
        productName:
          completedRepair.peripheral?.name ||
          completedRepair.configuration?.name,
        productType: completedRepair.peripheral
          ? 'peripheral'
          : completedRepair.configuration
            ? 'configuration'
            : undefined,
      };
      if (completedRepair.user.email) {
        await sendRepairCompletionEmail(
          completedRepair.user.email,
          repairCompletionData,
          emailConfig
        );
      }
    } catch (emailError) {
      console.error('Failed to send repair completion email:', emailError);
    }

    return NextResponse.json({
      id: completedRepair.id,
      title: completedRepair.title,
      status: completedRepair.status,
      finalCost: completedRepair.finalCost,
      completionDate: completedRepair.completionDate,
      diagnosticNotes: completedRepair.diagnosticNotes,
      customer: {
        id: completedRepair.user.id,
        name: completedRepair.user.name,
        email: completedRepair.user.email,
        notified: true,
      },
      product: completedRepair.peripheral
        ? {
            type: 'peripheral',
            name: completedRepair.peripheral.name,
          }
        : completedRepair.configuration
          ? {
              type: 'configuration',
              name: completedRepair.configuration.name,
            }
          : null,
      parts: completedRepair.parts.map(part => ({
        name: part.component.name,
        quantity: part.quantity,
        price: part.price,
      })),
      completionImage: imageUrl,
    });
  } catch (error) {
    console.error('Error completing repair:', error);
    return createServerErrorResponse('Failed to complete repair');
  }
}
