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

const publishConfigurationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
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

    const body = await request.json();
    const validationResult = publishConfigurationSchema.safeParse(body);

    if (!validationResult.success) {
      return createBadRequestResponse(
        'Invalid publish data',
        validationResult.error.flatten()
      );
    }

    const { name, description, price, category, imageUrl } =
      validationResult.data;

    const configuration = await prisma.configuration.findUnique({
      where: { id: params.id },
      include: {
        components: {
          include: {
            component: true,
          },
        },
      },
    });

    if (!configuration) {
      return createNotFoundResponse('Configuration not found');
    }

    if (configuration.isTemplate && configuration.isPublic) {
      return createBadRequestResponse('Configuration is already published');
    }

    const updatedConfiguration = await prisma.configuration.update({
      where: { id: params.id },
      data: {
        name: name || configuration.name,
        description: description || configuration.description,
        totalPrice: price || configuration.totalPrice,
        category: category || configuration.category,
        imageUrl: imageUrl || configuration.imageUrl,
        status: 'APPROVED',
        isTemplate: true,
        isPublic: true,
        updatedAt: new Date(),
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
      id: updatedConfiguration.id,
      name: updatedConfiguration.name,
      description: updatedConfiguration.description,
      status: updatedConfiguration.status,
      isTemplate: updatedConfiguration.isTemplate,
      isPublic: updatedConfiguration.isPublic,
      totalPrice: updatedConfiguration.totalPrice,
      category: updatedConfiguration.category,
      imageUrl: updatedConfiguration.imageUrl,
      components: updatedConfiguration.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        quantity: item.quantity,
        price: item.component.price,
      })),
      publishedAt: updatedConfiguration.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error publishing configuration:', error);
    return createServerErrorResponse('Failed to publish configuration');
  }
}
