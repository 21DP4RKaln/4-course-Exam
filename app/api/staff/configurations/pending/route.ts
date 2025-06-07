import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
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

    if (!['ADMIN', 'SPECIALIST'].includes(payload.role)) {
      return createUnauthorizedResponse('Insufficient permissions');
    }

    const pendingConfigurations = await prisma.configuration.findMany({
      where: {
        status: 'SUBMITTED',
        isTemplate: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedConfigurations = pendingConfigurations.map(config => ({
      id: config.id,
      name: config.name,
      description: config.description,
      status: config.status,
      totalPrice: config.totalPrice,
      user: {
        id: config.user?.id,
        name: config.user?.name || 'Anonymous',
        email: config.user?.email,
        phone: config.user?.phone,
      },
      components: config.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        quantity: item.quantity,
        price: item.component.price,
        stock: item.component.quantity,
      })),
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedConfigurations);
  } catch (error) {
    console.error('Error fetching pending configurations:', error);
    return createServerErrorResponse('Failed to fetch pending configurations');
  }
}
