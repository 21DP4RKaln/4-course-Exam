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

const componentUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().min(0).optional(),
  sku: z.string().optional(),
  subType: z.string().optional(),
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
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock') === 'true';
    const id = searchParams.get('id');

    // If requesting a specific component
    if (id) {
      const component = await prisma.component.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

      if (!component) {
        return createNotFoundResponse('Component not found');
      }

      return NextResponse.json({
        id: component.id,
        name: component.name,
        description: component.description,
        price: component.price,
        quantity: component.quantity,
        sku: component.sku,
        subType: component.subType,
        imagesUrl: component.imagesUrl,
        category: {
          id: component.category.id,
          name: component.category.name,
          description: component.category.description,
        },
        viewCount: component.viewCount,
        createdAt: component.createdAt.toISOString(),
        updatedAt: component.updatedAt.toISOString(),
      });
    }

    let whereClause: any = {};

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (lowStock) {
      whereClause.quantity = { lt: 10 };
    }

    const components = await prisma.component.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const categories = await prisma.componentCategory.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
    });

    const formattedComponents = components.map(component => ({
      id: component.id,
      name: component.name,
      description: component.description,
      price: component.price,
      quantity: component.quantity,
      sku: component.sku,
      subType: component.subType,
      imagesUrl: component.imagesUrl,
      category: {
        id: component.category.id,
        name: component.category.name,
        description: component.category.description,
      },
      viewCount: component.viewCount,
      createdAt: component.createdAt.toISOString(),
      updatedAt: component.updatedAt.toISOString(),
      stockStatus:
        component.quantity === 0
          ? 'out_of_stock'
          : component.quantity < 10
            ? 'low_stock'
            : 'in_stock',
    }));

    return NextResponse.json({
      components: formattedComponents,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        displayOrder: cat.displayOrder,
      })),
      total: formattedComponents.length,
      lowStockCount: formattedComponents.filter(c => c.quantity < 10).length,
      outOfStockCount: formattedComponents.filter(c => c.quantity === 0).length,
    });
  } catch (error) {
    console.error('Error fetching components:', error);
    return createServerErrorResponse('Failed to fetch components');
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
      return createBadRequestResponse('Component ID is required');
    }

    const validationResult = componentUpdateSchema.safeParse(updateData);
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid data', {
        errors: validationResult.error.errors,
      });
    }

    const component = await prisma.component.findUnique({
      where: { id },
    });

    if (!component) {
      return createNotFoundResponse('Component not found');
    }

    const updatedComponent = await prisma.component.update({
      where: { id },
      data: validationResult.data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedComponent.id,
      name: updatedComponent.name,
      description: updatedComponent.description,
      price: updatedComponent.price,
      quantity: updatedComponent.quantity,
      sku: updatedComponent.sku,
      subType: updatedComponent.subType,
      imagesUrl: updatedComponent.imagesUrl,
      category: updatedComponent.category,
      viewCount: updatedComponent.viewCount,
      createdAt: updatedComponent.createdAt.toISOString(),
      updatedAt: updatedComponent.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating component:', error);
    return createServerErrorResponse('Failed to update component');
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

    // Only allow ADMIN to create new components
    if (payload.role !== 'ADMIN') {
      return createUnauthorizedResponse(
        'Admin access required for creating components'
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      categoryId,
      price,
      quantity,
      sku,
      subType,
      imagesUrl,
    } = body;

    if (!name || !categoryId || price === undefined || quantity === undefined) {
      return createBadRequestResponse(
        'Name, category, price, and quantity are required'
      );
    }

    // Verify category exists
    const category = await prisma.componentCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return createBadRequestResponse('Category not found');
    }

    // Check if SKU already exists
    if (sku) {
      const existingComponent = await prisma.component.findFirst({
        where: { sku },
      });

      if (existingComponent) {
        return createBadRequestResponse(
          'Component with this SKU already exists'
        );
      }
    }

    const component = await prisma.component.create({
      data: {
        name,
        description: description || '',
        categoryId,
        price,
        quantity,
        sku: sku || `COMP-${Date.now()}`,
        subType: subType || '',
        imagesUrl: imagesUrl || [],
        viewCount: 0,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: component.id,
      name: component.name,
      description: component.description,
      price: component.price,
      quantity: component.quantity,
      sku: component.sku,
      subType: component.subType,
      imagesUrl: component.imagesUrl,
      category: component.category,
      viewCount: component.viewCount,
      createdAt: component.createdAt.toISOString(),
      updatedAt: component.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating component:', error);
    return createServerErrorResponse('Failed to create component');
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

    // Only allow ADMIN to delete components
    if (payload.role !== 'ADMIN') {
      return createUnauthorizedResponse(
        'Admin access required for deleting components'
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createBadRequestResponse('Component ID is required');
    }

    const component = await prisma.component.findUnique({
      where: { id },
    });

    if (!component) {
      return createNotFoundResponse('Component not found');
    }

    // Check if component is used in any configurations
    const usedInConfigurations = await prisma.configurationComponent.count({
      where: { componentId: id },
    });

    if (usedInConfigurations > 0) {
      return createBadRequestResponse(
        'Cannot delete component that is used in configurations'
      );
    }

    await prisma.component.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Component deleted successfully' });
  } catch (error) {
    console.error('Error deleting component:', error);
    return createServerErrorResponse('Failed to delete component');
  }
}
