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
  displayOrder: z.number().int().min(0).optional(),
  slug: z.string().min(1),
  type: z.string().optional().default('component'),
});

export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse();
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const category = await prisma.componentCategory.findUnique({
        where: { id },
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
    }
    const categories = await prisma.componentCategory.findMany({
      include: {
        _count: {
          select: { components: true },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
      },
    });

    if (existingCategory) {
      return createBadRequestResponse(
        'Category with this name or slug already exists'
      );
    }

    const category = await prisma.componentCategory.create({
      data: {
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder || 0,
        slug: data.slug,
        type: data.type || 'component',
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
