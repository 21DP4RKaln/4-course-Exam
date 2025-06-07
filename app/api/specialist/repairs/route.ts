import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';

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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (!user || !['ADMIN', 'SPECIALIST'].includes(user.role)) {
      return createUnauthorizedResponse('Unauthorized access');
    }

    const repairs = await prisma.repair.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
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
      title: repair.title || `Repair #${repair.id.substring(0, 8)}`,
      status: repair.status,
      priority: repair.priority,
      userId: repair.userId,
      userName: repair.user.name,
      createdAt: repair.createdAt,
      estimatedCost: repair.estimatedCost || 0,
      finalCost: repair.finalCost,
      diagnosticNotes: repair.diagnosticNotes,
      completionDate: repair.completionDate,
      customer: {
        id: repair.userId,
        name: repair.user.name,
        email: repair.user.email,
        phone: repair.user.phone,
      },
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
