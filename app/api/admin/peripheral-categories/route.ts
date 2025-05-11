import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import { createUnauthorizedResponse, createForbiddenResponse, createBadRequestResponse } from '@/lib/apiErrors';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
  slug: z.string().min(1),
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
      // Get a specific category
      const category = await prisma.peripheralCategory.findUnique({
        where: { id },
        include: {
          peripherals: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              sku: true,
            }
          },
          specificationKeys: true
        }
      });

      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      return NextResponse.json(category);
    }

    // Get all categories
    const categories = await prisma.peripheralCategory.findMany({
      include: {
        _count: {
          select: { peripherals: true }
        },
        specificationKeys: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching peripheral categories:', error);
    return NextResponse.json({ error: 'Failed to fetch peripheral categories' }, { status: 500 });
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
      return createBadRequestResponse('Validation failed', { errors: validationResult.error.errors });
    }

    const data = validationResult.data;
    
    // Check if category with this name or slug already exists
    const existingCategory = await prisma.peripheralCategory.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug: data.slug }
        ]
      }
    });

    if (existingCategory) {
      return createBadRequestResponse('Peripheral category with this name or slug already exists');
    }
    
    const category = await prisma.peripheralCategory.create({
      data: {
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder || 0,
        slug: data.slug,
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating peripheral category:', error);
    return NextResponse.json({ error: 'Failed to create peripheral category' }, { status: 500 });
  }
}
