import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createServerErrorResponse,
  createBadRequestResponse,
  createNotFoundResponse,
} from '@/lib/apiErrors';
import { z } from 'zod';

const configurationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  category: z.string().optional(),
  isPublic: z.boolean().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']).optional(),
  notes: z.string().optional(),
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
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const isPublic = searchParams.get('isPublic');

    let whereClause: any = {
      isTemplate: true, // Ready-made PCs are templates
    };

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      whereClause.status = status;
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
              select: {
                id: true,
                name: true,
                price: true,
                category: {
                  select: {
                    name: true,
                  },
                },
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
      category: config.category,
      price: config.price,
      status: config.status,
      isPublic: config.isPublic,
      isTemplate: config.isTemplate,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
      user: config.user
        ? {
            id: config.user.id,
            name: config.user.name,
            email: config.user.email,
          }
        : null,
      components: config.components.map(comp => ({
        id: comp.id,
        componentId: comp.componentId,
        quantity: comp.quantity,
        component: {
          id: comp.component.id,
          name: comp.component.name,
          price: comp.component.price,
          category: comp.component.category.name,
        },
      })),
      totalComponents: config.components.length,
      estimatedPrice: config.components.reduce(
        (total, comp) => total + comp.component.price * comp.quantity,
        0
      ),
    }));

    // Get available categories for filtering
    const categories = await prisma.configuration.findMany({
      where: { isTemplate: true },
      select: { category: true },
      distinct: ['category'],
    });

    const uniqueCategories = categories
      .map(c => c.category)
      .filter(Boolean)
      .sort();

    return NextResponse.json({
      configurations: formattedConfigurations,
      categories: uniqueCategories,
      total: formattedConfigurations.length,
    });
  } catch (error) {
    console.error('Error fetching ready-made PCs:', error);
    return createServerErrorResponse('Failed to fetch ready-made PCs');
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
    const {
      name,
      description,
      category,
      price,
      components,
      isPublic = false,
    } = body;

    if (!name || !components || !Array.isArray(components)) {
      return createBadRequestResponse('Name and components are required');
    }

    // Validate components exist
    const componentIds = components.map(c => c.componentId);
    const existingComponents = await prisma.component.findMany({
      where: { id: { in: componentIds } },
    });

    if (existingComponents.length !== componentIds.length) {
      return createBadRequestResponse('Some components do not exist');
    }

    // Calculate total price
    const totalPrice =
      price ||
      existingComponents.reduce((total, comp) => {
        const configComp = components.find(c => c.componentId === comp.id);
        return total + comp.price * (configComp?.quantity || 1);
      }, 0);

    const configuration = await prisma.configuration.create({
      data: {
        name,
        description: description || '',
        category: category || 'Ready-Made PC',
        price: totalPrice,
        isTemplate: true,
        isPublic,
        status: 'APPROVED',
        userId: payload.userId,
        components: {
          create: components.map(comp => ({
            componentId: comp.componentId,
            quantity: comp.quantity || 1,
          })),
        },
      },
      include: {
        components: {
          include: {
            component: {
              select: {
                id: true,
                name: true,
                price: true,
                category: {
                  select: {
                    name: true,
                  },
                },
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
      category: configuration.category,
      price: configuration.price,
      status: configuration.status,
      isPublic: configuration.isPublic,
      components: configuration.components.map(comp => ({
        id: comp.id,
        componentId: comp.componentId,
        quantity: comp.quantity,
        component: comp.component,
      })),
    });
  } catch (error) {
    console.error('Error creating ready-made PC:', error);
    return createServerErrorResponse('Failed to create ready-made PC');
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body;

    if (!id) {
      return createBadRequestResponse('Configuration ID is required');
    }

    const validationResult = configurationUpdateSchema.safeParse(updateData);
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid data', {
        errors: validationResult.error.errors,
      });
    }

    const configuration = await prisma.configuration.findUnique({
      where: { id },
    });

    if (!configuration) {
      return createNotFoundResponse('Configuration not found');
    }

    const updatedConfiguration = await prisma.configuration.update({
      where: { id },
      data: validationResult.data,
      include: {
        components: {
          include: {
            component: {
              select: {
                id: true,
                name: true,
                price: true,
                category: {
                  select: {
                    name: true,
                  },
                },
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
      category: updatedConfiguration.category,
      price: updatedConfiguration.price,
      status: updatedConfiguration.status,
      isPublic: updatedConfiguration.isPublic,
      components: updatedConfiguration.components.map(comp => ({
        id: comp.id,
        componentId: comp.componentId,
        quantity: comp.quantity,
        component: comp.component,
      })),
    });
  } catch (error) {
    console.error('Error updating ready-made PC:', error);
    return createServerErrorResponse('Failed to update ready-made PC');
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return createBadRequestResponse('Configuration ID is required');
    }

    const configuration = await prisma.configuration.findUnique({
      where: { id },
    });

    if (!configuration) {
      return createNotFoundResponse('Configuration not found');
    }

    await prisma.configuration.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting ready-made PC:', error);
    return createServerErrorResponse('Failed to delete ready-made PC');
  }
}
