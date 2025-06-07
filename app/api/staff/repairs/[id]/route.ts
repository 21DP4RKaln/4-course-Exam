import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createNotFoundResponse,
  createBadRequestResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { z } from 'zod';

const updateRepairSchema = z.object({
  status: z
    .enum([
      'PENDING',
      'DIAGNOSING',
      'WAITING_FOR_PARTS',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
    ])
    .optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  estimatedCost: z.number().optional(),
  finalCost: z.number().optional(),
  diagnosticNotes: z.string().optional(),
  assignedTo: z.string().optional(),
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

export async function GET(
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

    const repair = await prisma.repair.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        specialists: {
          include: {
            specialist: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        peripheral: {
          include: {
            category: true,
          },
        },
        configuration: {
          include: {
            components: {
              include: {
                component: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
        parts: {
          include: {
            component: {
              include: {
                category: true,
              },
            },
          },
        },
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

    const formattedRepair = {
      id: repair.id,
      title: repair.title,
      description: repair.description,
      status: repair.status,
      priority: repair.priority,
      customer: {
        id: repair.user.id,
        name: repair.user.name,
        email: repair.user.email,
        phone: repair.user.phone,
      },
      specialists: repair.specialists.map(s => ({
        id: s.specialist.id,
        name: s.specialist.name,
        email: s.specialist.email,
        assignedAt: s.assignedAt,
        notes: s.notes,
      })),
      product: repair.peripheral
        ? {
            type: 'peripheral',
            id: repair.peripheral.id,
            name: repair.peripheral.name,
            category: repair.peripheral.category.name,
            imageUrl: repair.peripheral.imagesUrl,
            description: repair.peripheral.description,
          }
        : repair.configuration
          ? {
              type: 'configuration',
              id: repair.configuration.id,
              name: repair.configuration.name,
              components: repair.configuration.components.map(item => ({
                id: item.component.id,
                name: item.component.name,
                category: item.component.category.name,
                quantity: item.quantity,
              })),
            }
          : null,
      parts: repair.parts.map(part => ({
        id: part.id,
        componentId: part.componentId,
        name: part.component.name,
        category: part.component.category.name,
        quantity: part.quantity,
        price: part.price,
      })),
      estimatedCost: repair.estimatedCost,
      finalCost: repair.finalCost,
      diagnosticNotes: repair.diagnosticNotes,
      completionDate: repair.completionDate,
      createdAt: repair.createdAt.toISOString(),
      updatedAt: repair.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedRepair);
  } catch (error) {
    console.error('Error fetching repair:', error);
    return createServerErrorResponse('Failed to fetch repair');
  }
}

export async function PATCH(
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

    const body = await request.json();
    const validationResult = updateRepairSchema.safeParse(body);

    if (!validationResult.success) {
      return createBadRequestResponse(
        'Invalid update data',
        validationResult.error.flatten()
      );
    }

    const {
      status,
      priority,
      estimatedCost,
      finalCost,
      diagnosticNotes,
      assignedTo,
      parts,
    } = validationResult.data;

    const existingRepair = await prisma.repair.findUnique({
      where: { id: params.id },
      include: {
        specialists: true,
      },
    });

    if (!existingRepair) {
      return createNotFoundResponse('Repair not found');
    }

    if (payload.role === 'SPECIALIST') {
      const isAssigned = existingRepair.specialists.some(
        s => s.specialistId === payload.userId
      );
      if (!isAssigned) {
        return createUnauthorizedResponse(
          'You are not assigned to this repair'
        );
      }
    }

    const updateData: any = {
      status,
      priority,
      estimatedCost,
      finalCost,
      diagnosticNotes,
      updatedAt: new Date(),
    };

    if (status === 'COMPLETED' && !existingRepair.completionDate) {
      updateData.completionDate = new Date();
    }

    if (parts) {
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

    if (payload.role === 'ADMIN' && assignedTo) {
      updateData.specialists = {
        create: {
          specialistId: assignedTo,
          notes: 'Assigned by admin',
        },
      };
    }

    const updatedRepair = await prisma.repair.update({
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
        specialists: {
          include: {
            specialist: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        peripheral: true,
        configuration: true,
        parts: {
          include: {
            component: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedRepair.id,
      title: updatedRepair.title,
      status: updatedRepair.status,
      priority: updatedRepair.priority,
      customer: {
        id: updatedRepair.user.id,
        name: updatedRepair.user.name,
        email: updatedRepair.user.email,
        phone: updatedRepair.user.phone,
      },
      specialists: updatedRepair.specialists.map(s => ({
        id: s.specialist.id,
        name: s.specialist.name,
        email: s.specialist.email,
        assignedAt: s.assignedAt,
      })),
      product: updatedRepair.peripheral
        ? {
            type: 'peripheral',
            id: updatedRepair.peripheral.id,
            name: updatedRepair.peripheral.name,
          }
        : updatedRepair.configuration
          ? {
              type: 'configuration',
              id: updatedRepair.configuration.id,
              name: updatedRepair.configuration.name,
            }
          : null,
      parts: updatedRepair.parts.map(part => ({
        id: part.id,
        name: part.component.name,
        quantity: part.quantity,
        price: part.price,
      })),
      estimatedCost: updatedRepair.estimatedCost,
      finalCost: updatedRepair.finalCost,
      diagnosticNotes: updatedRepair.diagnosticNotes,
      completionDate: updatedRepair.completionDate,
      updatedAt: updatedRepair.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating repair:', error);
    return createServerErrorResponse('Failed to update repair');
  }
}

export async function DELETE(
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

    if (payload.role !== 'ADMIN') {
      return createUnauthorizedResponse(
        'Only administrators can delete repairs'
      );
    }

    const repair = await prisma.repair.findUnique({
      where: { id: params.id },
    });

    if (!repair) {
      return createNotFoundResponse('Repair not found');
    }

    await prisma.repair.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting repair:', error);
    return createServerErrorResponse('Failed to delete repair');
  }
}
