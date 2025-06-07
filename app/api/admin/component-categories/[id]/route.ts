import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
  createBadRequestResponse,
} from '@/lib/apiErrors';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
  slug: z.string().min(1),
  type: z.string().optional().default('component'),
});

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse();
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse();
    }

    const category = await prisma.componentCategory.findUnique({
      where: { id: params.id },
      include: {
        components: {
          select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            imagesUrl: true,
            sku: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse();
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse();
    }

    const body = await request.json();

    const validationResult = categorySchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', {
        errors: validationResult.error.errors,
      });
    }

    const data = validationResult.data;

    const existingCategory = await prisma.componentCategory.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
        NOT: {
          id: params.id,
        },
      },
    });

    if (existingCategory) {
      return createBadRequestResponse(
        'Another category with this name or slug already exists'
      );
    }

    const category = await prisma.componentCategory.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder || 0,
        slug: data.slug,
        type: data.type || 'component',
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse();
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse();
    }

    const body = await request.json();

    const partialSchema = categorySchema.partial();
    const validationResult = partialSchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', {
        errors: validationResult.error.errors,
      });
    }

    const data = validationResult.data;
    const updateData: any = {};

    if (data.name !== undefined) {
      if (data.name) {
        const existingCategory = await prisma.componentCategory.findFirst({
          where: {
            name: data.name,
            NOT: { id: params.id },
          },
        });
        if (existingCategory) {
          return createBadRequestResponse(
            'Another category with this name already exists'
          );
        }
      }
      updateData.name = data.name;
    }

    if (data.slug !== undefined) {
      if (data.slug) {
        const existingCategory = await prisma.componentCategory.findFirst({
          where: {
            slug: data.slug,
            NOT: { id: params.id },
          },
        });
        if (existingCategory) {
          return createBadRequestResponse(
            'Another category with this slug already exists'
          );
        }
      }
      updateData.slug = data.slug;
    }

    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.displayOrder !== undefined)
      updateData.displayOrder = data.displayOrder;
    if (data.type !== undefined) updateData.type = data.type;

    const category = await prisma.componentCategory.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse();
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse();
    }

    const componentCount = await prisma.component.count({
      where: { categoryId: params.id },
    });

    if (componentCount > 0) {
      return createBadRequestResponse(
        'Cannot delete category that contains components. Move or delete components first.'
      );
    }

    await prisma.componentCategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
