import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { authenticate } from '@/lib/middleware/authMiddleware';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  createUnauthorizedResponse,
  createBadRequestResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { sendRepairConfirmationEmail, EmailConfig } from '@/lib/mail/email';
import { z } from 'zod';

const createRepairSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  serviceId: z.string().min(1, 'Service type is required'),
  issue: z
    .string()
    .min(10, 'Please provide a detailed description of the issue'),
  peripheralId: z.string().optional(),
  configurationId: z.string().optional(),
});

const SERVICE_DETAILS: Record<string, { price: number; time: string }> = {
  diagnostics: { price: 10, time: '1-3 days' },
  'hardware-replacement': { price: 20, time: '1-2 weeks' },
  'data-recovery': { price: 30, time: '3-7 days' },
  'virus-removal': { price: 20, time: '1-3 days' },
  'performance-optimization': { price: 25, time: '1-3 days' },
  custom: { price: 35, time: '1-7 days' },
};

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let imageUrl: string | null = null;
    let userId: string | null = null;
    let body: any;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const image = formData.get('image') as File | null;

      body = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        serviceId: formData.get('serviceId'),
        issue: formData.get('issue'),
        peripheralId: formData.get('peripheralId'),
        configurationId: formData.get('configurationId'),
      };

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
    } else {
      body = await request.json();
    }

    const validationResult = createRepairSchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse(
        'Invalid repair request data',
        validationResult.error.format()
      );
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      serviceId,
      issue,
      peripheralId,
      configurationId,
    } = validationResult.data;

    const token = await authenticate(request);
    if (!(token instanceof Response)) {
      userId = token.userId;
    }

    if (!userId && email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const tempPassword = Math.random().toString(36).substring(2, 15);
        const hashedPassword = await import('bcryptjs').then(bcrypt =>
          bcrypt.hash(tempPassword, 10)
        );

        const newUser = await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            phone: phone || null,
            password: hashedPassword,
          },
        });

        userId = newUser.id;
      }
    }

    if (!userId) {
      return createBadRequestResponse(
        'Unable to create repair - user identification required'
      );
    }

    const selectedService =
      SERVICE_DETAILS[serviceId] || SERVICE_DETAILS.custom;

    const repair = await prisma
      .$transaction(async tx => {
        if (peripheralId) {
          const peripheral = await tx.peripheral.findUnique({
            where: { id: peripheralId },
          });

          if (!peripheral) {
            throw new Error('Invalid peripheral ID');
          }
        }

        if (configurationId) {
          const configuration = await tx.configuration.findUnique({
            where: { id: configurationId },
          });

          if (!configuration) {
            throw new Error('Invalid configuration ID');
          }
        }

        return await tx.repair.create({
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
            peripheralId: peripheralId || null,
            configurationId: configurationId || null,
            diagnosticNotes: `Service requested: ${serviceId}\nEstimated time: ${selectedService.time}`,
          },
        });
      })
      .catch(error => {
        console.error('Transaction error:', error);

        if (error.message === 'Invalid peripheral ID') {
          throw { code: 'INVALID_PERIPHERAL' };
        }

        if (error.message === 'Invalid configuration ID') {
          throw { code: 'INVALID_CONFIGURATION' };
        }

        throw error;
      });

    // Send automatic email confirmation to customer
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

      const repairConfirmationData = {
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

      await sendRepairConfirmationEmail(
        email,
        repairConfirmationData,
        emailConfig
      );

      console.log(
        `Repair confirmation email sent to: ${email} for repair ID: ${repair.id}`
      );
    } catch (emailError) {
      console.error('Failed to send repair confirmation email:', emailError);
      // Don't fail the entire request if email fails - log the error and continue
    }

    return NextResponse.json({
      success: true,
      repairId: repair.id,
      message: 'Repair request submitted successfully',
      estimatedTime: selectedService.time,
      estimatedCost: selectedService.price,
    });
  } catch (error) {
    console.error('Error creating repair request:', error);

    if ((error as { code?: string }).code === 'INVALID_PERIPHERAL') {
      return createBadRequestResponse('Invalid peripheral selected');
    }

    if ((error as { code?: string }).code === 'INVALID_CONFIGURATION') {
      return createBadRequestResponse('Invalid configuration selected');
    }

    return createServerErrorResponse('Failed to submit repair request');
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const [repairs, total] = await prisma.$transaction([
      prisma.repair.findMany({
        where: {
          userId: authResult.userId,
        },
        include: {
          peripheral: {
            select: {
              name: true,
              category: {
                select: {
                  name: true,
                },
              },
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
        skip,
        take: limit,
      }),
      prisma.repair.count({
        where: {
          userId: authResult.userId,
        },
      }),
    ]);

    const formattedRepairs = repairs.map(repair => ({
      id: repair.id,
      title: repair.title,
      status: repair.status,
      priority: repair.priority,
      createdAt: repair.createdAt.toISOString(),
      updatedAt: repair.updatedAt.toISOString(),
      estimatedCost: repair.estimatedCost,
      finalCost: repair.finalCost,
      completionDate: repair.completionDate?.toISOString(),
      product: repair.peripheral
        ? {
            type: 'peripheral',
            name: repair.peripheral.name,
            category: repair.peripheral.category?.name,
          }
        : repair.configuration
          ? {
              type: 'configuration',
              name: repair.configuration.name,
            }
          : null,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      repairs: formattedRepairs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching repairs:', error);
    return createServerErrorResponse('Failed to fetch repairs');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const body = await request.json();
    if (!body.id) {
      return createBadRequestResponse('Repair ID is required');
    }

    if (!body.action) {
      return createBadRequestResponse('Action is required');
    }

    if (body.action !== 'cancel') {
      return createBadRequestResponse(
        'Invalid action. Only "cancel" is supported'
      );
    }

    const repair = await prisma.repair.findFirst({
      where: {
        id: body.id,
        userId: authResult.userId,
      },
    });

    if (!repair) {
      return createBadRequestResponse(
        'Repair not found or does not belong to the user'
      );
    }

    if (!['PENDING', 'DIAGNOSING'].includes(repair.status)) {
      return createBadRequestResponse(
        'Only pending or diagnosing repairs can be cancelled'
      );
    }

    await prisma.repair.update({
      where: { id: repair.id },
      data: {
        status: 'CANCELLED',
        diagnosticNotes: repair.diagnosticNotes
          ? `${repair.diagnosticNotes}\n\nCancelled by customer: ${body.reason || 'No reason provided'}`
          : `Cancelled by customer: ${body.reason || 'No reason provided'}`,
      },
    });

    return NextResponse.json({
      id: repair.id,
      status: 'CANCELLED',
      message: 'Repair cancelled successfully',
    });
  } catch (error) {
    console.error('Error updating repair:', error);
    return createServerErrorResponse('Failed to update repair');
  }
}
