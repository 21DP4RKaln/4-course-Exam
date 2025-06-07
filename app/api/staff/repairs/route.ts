import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  createUnauthorizedResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { sendRepairRequestNotification, EmailConfig } from '@/lib/mail/email';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const serviceId = formData.get('serviceId') as string;
    const issue = formData.get('issue') as string;
    const image = formData.get('image') as File | null;
    const peripheralId = formData.get('peripheralId') as string | null;

    const token = getJWTFromRequest(request);
    let userId = null;

    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    let imageUrl: string | null = null;
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const originalName = image.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filename = `${timestamp}-${originalName}`;

      const uploadDir = join(process.cwd(), 'public', 'uploads', 'repairs');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const imagePath = join(uploadDir, filename);
      await writeFile(imagePath, buffer);

      imageUrl = `/uploads/repairs/${filename}`;
    }

    const serviceMap: Record<string, { price: number; time: string }> = {
      diagnostics: { price: 10, time: '1-3 days' },
      'hardware-replacement': { price: 20, time: '1-2 weeks' },
      'data-recovery': { price: 30, time: '3-7 days' },
      'virus-removal': { price: 20, time: '1-3 days' },
      'performance-optimization': { price: 25, time: '1-3 days' },
      custom: { price: 35, time: '1-7 days' },
    };

    const selectedService = serviceMap[serviceId] || serviceMap.custom;

    if (!userId && email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            phone: phone || null,
            password: Math.random().toString(36).substring(2, 15),
          },
        });
        userId = newUser.id;
      }
    }

    if (!userId) {
      return createServerErrorResponse(
        'Unable to create repair - user identification required'
      );
    }

    const repair = await prisma.repair.create({
      data: {
        title: `${serviceId} - ${firstName} ${lastName}`,
        description: `
Service: ${serviceId}
Issue: ${issue}
Contact: ${email}${phone ? ' / ' + phone : ''}
${imageUrl ? 'Image attached: ' + imageUrl : ''}
`,
        status: 'PENDING',
        priority: 'NORMAL',
        estimatedCost: selectedService.price,
        userId: userId,
        peripheralId: peripheralId,
        diagnosticNotes: `Service requested: ${serviceId}\nEstimated time: ${selectedService.time}`,
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

      const repairRequestData = {
        repairId: repair.id,
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phone || undefined,
        serviceType: serviceId,
        issueDescription: issue,
        estimatedCost: selectedService.price,
        estimatedTime: selectedService.time,
        hasImage: !!imageUrl,
        imageUrl: imageUrl || undefined,
      };

      const staffEmail =
        process.env.STAFF_NOTIFICATION_EMAIL || process.env.EMAIL_USER;
      if (staffEmail) {
        await sendRepairRequestNotification(
          staffEmail,
          repairRequestData,
          emailConfig
        );
      }
    } catch (emailError) {
      console.error('Failed to send repair request notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      repairId: repair.id,
      message: 'Repair request submitted successfully',
    });
  } catch (error) {
    console.error('Error creating repair request:', error);
    return createServerErrorResponse('Failed to submit repair request');
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    const repairs = await prisma.repair.findMany({
      where: {
        userId: payload.userId,
      },
      include: {
        peripheral: {
          select: {
            name: true,
            category: true,
          },
        },
        configuration: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedRepairs = repairs.map(repair => ({
      id: repair.id,
      title: repair.title,
      status: repair.status,
      createdAt: repair.createdAt,
      estimatedCost: repair.estimatedCost,
      finalCost: repair.finalCost,
      completionDate: repair.completionDate,
      product: repair.peripheral
        ? {
            type: 'peripheral',
            name: repair.peripheral.name,
            category: repair.peripheral.category.name,
          }
        : repair.configuration
          ? {
              type: 'configuration',
              name: repair.configuration.name,
            }
          : null,
    }));

    return NextResponse.json(formattedRepairs);
  } catch (error) {
    console.error('Error fetching repairs:', error);
    return createServerErrorResponse('Failed to fetch repairs');
  }
}
