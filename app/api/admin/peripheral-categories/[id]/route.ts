import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
  createBadRequestResponse,
} from '@/lib/apiErrors';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().min(1),
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
    const category = await prisma.peripheralCategory.findUnique({
      where: { id: params.id },
      include: {
        peripherals: {
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
        { error: 'Peripheral category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching peripheral category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch peripheral category' },
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

    const existingCategory = await prisma.peripheralCategory.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
        NOT: {
          id: params.id,
        },
      },
    });

    if (existingCategory) {
      return createBadRequestResponse(
        'Another peripheral category with this name or slug already exists'
      );
    }
    const category = await prisma.peripheralCategory.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating peripheral category:', error);
    return NextResponse.json(
      { error: 'Failed to update peripheral category' },
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
        const existingCategory = await prisma.peripheralCategory.findFirst({
          where: {
            name: data.name,
            NOT: { id: params.id },
          },
        });
        if (existingCategory) {
          return createBadRequestResponse(
            'Another peripheral category with this name already exists'
          );
        }
      }
      updateData.name = data.name;
    }

    if (data.slug !== undefined) {
      if (data.slug) {
        const existingCategory = await prisma.peripheralCategory.findFirst({
          where: {
            slug: data.slug,
            NOT: { id: params.id },
          },
        });
        if (existingCategory) {
          return createBadRequestResponse(
            'Another peripheral category with this slug already exists'
          );
        }
      }
      updateData.slug = data.slug;
    }
    if (data.description !== undefined)
      updateData.description = data.description;
    const category = await prisma.peripheralCategory.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating peripheral category:', error);
    return NextResponse.json(
      { error: 'Failed to update peripheral category' },
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

    const peripheralCount = await prisma.peripheral.count({
      where: { categoryId: params.id },
    });

    if (peripheralCount > 0) {
      return createBadRequestResponse(
        'Cannot delete category that contains peripherals. Move or delete peripherals first.'
      );
    }

    await prisma.peripheralCategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Peripheral category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting peripheral category:', error);
    return NextResponse.json(
      { error: 'Failed to delete peripheral category' },
      { status: 500 }
    );
  }
}
