import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createNotFoundResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';

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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (!user || !['ADMIN', 'SPECIALIST'].includes(user.role)) {
      return createUnauthorizedResponse('Unauthorized access');
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
        peripheral: {
          select: {
            id: true,
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
            id: true,
            name: true,
          },
        },
        parts: {
          include: {
            component: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!repair) {
      return createNotFoundResponse('Repair not found');
    }

    const formattedRepair = {
      id: repair.id,
      title: repair.title,
      description: repair.description,
      status: repair.status,
      priority: repair.priority,
      userId: repair.userId,
      createdAt: repair.createdAt,
      updatedAt: repair.updatedAt,
      estimatedCost: repair.estimatedCost,
      finalCost: repair.finalCost,
      diagnosticNotes: repair.diagnosticNotes,
      completionDate: repair.completionDate,
      customer: {
        id: repair.user.id,
        name: repair.user.name,
        email: repair.user.email,
        phone: repair.user.phone,
      },
      parts: repair.parts.map(part => ({
        id: part.id,
        componentId: part.componentId,
        componentName: part.component.name,
        price: part.price || part.component.price,
        quantity: part.quantity,
      })),
      product: repair.peripheral
        ? {
            type: 'peripheral' as const,
            id: repair.peripheral.id,
            name: repair.peripheral.name,
            category: repair.peripheral.category.name,
          }
        : repair.configuration
          ? {
              type: 'configuration' as const,
              id: repair.configuration.id,
              name: repair.configuration.name,
            }
          : undefined,
    };

    return NextResponse.json(formattedRepair);
  } catch (error) {
    console.error('Error fetching repair details:', error);
    return createServerErrorResponse('Failed to fetch repair details');
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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (!user || !['ADMIN', 'SPECIALIST'].includes(user.role)) {
      return createUnauthorizedResponse('Unauthorized access');
    }

    const data = await request.json();

    const allowedFields = [
      'status',
      'priority',
      'estimatedCost',
      'finalCost',
      'diagnosticNotes',
      'completionDate',
    ];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (field in data && data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const updatedRepair = await prisma.repair.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedRepair);
  } catch (error) {
    console.error('Error updating repair:', error);
    return createServerErrorResponse('Failed to update repair');
  }
}
