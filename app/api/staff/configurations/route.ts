import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createBadRequestResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { z } from 'zod';

const createConfigurationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  components: z.array(
    z.object({
      componentId: z.string(),
      quantity: z.number().min(1),
    })
  ),
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isTemplate = searchParams.get('isTemplate');
    const isPublic = searchParams.get('isPublic');

    let whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (isTemplate !== null) {
      whereClause.isTemplate = isTemplate === 'true';
    }

    if (isPublic !== null) {
      whereClause.isPublic = isPublic === 'true';
    }

    const configurations = await prisma.configuration.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    const formattedConfigurations = configurations.map(config => ({
      id: config.id,
      name: config.name,
      description: config.description,
      status: config.status,
      isTemplate: config.isTemplate,
      isPublic: config.isPublic,
      totalPrice: config.totalPrice,
      user: config.user
        ? {
            id: config.user.id,
            name: config.user.name,
            email: config.user.email,
          }
        : null,
      components: config.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        quantity: item.quantity,
        price: item.component.price,
      })),
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedConfigurations);
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return createServerErrorResponse('Failed to fetch configurations');
  }
}

export async function POST(request: NextRequest) {
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
    const validationResult = createConfigurationSchema.safeParse(body);

    if (!validationResult.success) {
      return createBadRequestResponse(
        'Invalid configuration data',
        validationResult.error.flatten()
      );
    }

    const { name, description, components, isTemplate, isPublic } =
      validationResult.data;

    const componentIds = components.map(c => c.componentId);
    const componentPrices = await prisma.component.findMany({
      where: {
        id: {
          in: componentIds,
        },
      },
      select: {
        id: true,
        price: true,
      },
    });

    const priceMap = new Map(componentPrices.map(c => [c.id, c.price]));
    const totalPrice = components.reduce((total, item) => {
      const price = priceMap.get(item.componentId) || 0;
      return total + price * item.quantity;
    }, 0);

    const configuration = await prisma.configuration.create({
      data: {
        name,
        description,
        totalPrice,
        status: 'APPROVED',
        isTemplate: isTemplate || false,
        isPublic: isPublic || false,
        userId: payload.userId,
        components: {
          create: components.map(item => ({
            componentId: item.componentId,
            quantity: item.quantity,
          })),
        },
      },
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
    });

    return NextResponse.json({
      id: configuration.id,
      name: configuration.name,
      description: configuration.description,
      status: configuration.status,
      isTemplate: configuration.isTemplate,
      isPublic: configuration.isPublic,
      totalPrice: configuration.totalPrice,
      components: configuration.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        quantity: item.quantity,
        price: item.component.price,
      })),
      createdAt: configuration.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating configuration:', error);
    return createServerErrorResponse('Failed to create configuration');
  }
}
