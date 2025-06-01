import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import { createUnauthorizedResponse, createForbiddenResponse, createBadRequestResponse } from '@/lib/apiErrors';
import { z } from 'zod';

const componentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional().nullable(),
  discountExpiresAt: z.string().datetime().optional().nullable(),
  quantity: z.number().int().min(0),
  imagesUrl: z.string().optional().nullable(),
  categoryId: z.string().uuid(),
  sku: z.string().min(1),
  subType: z.string().min(1),
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
    const id = searchParams.get('id');    if (id) {
      const component = await prisma.component.findUnique({
        where: { id },
        include: {
          category: true
        }
      });

      if (!component) {
        return NextResponse.json({ error: 'Component not found' }, { status: 404 });
      }

      return NextResponse.json(component);
    }

    const components = await prisma.component.findMany({
      include: {
        category: true
      }
    });

    return NextResponse.json(components);
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json({ error: 'Failed to fetch components' }, { status: 500 });
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
      const validationResult = componentSchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', { errors: validationResult.error.errors });
    }

    const data = validationResult.data;    const component = await prisma.component.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        discountExpiresAt: data.discountExpiresAt ? new Date(data.discountExpiresAt) : null,
        quantity: data.quantity,
        imagesUrl: data.imagesUrl || null,
        categoryId: data.categoryId,
        sku: data.sku,
        subType: data.subType,
      }
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    console.error('Error creating component:', error);
    return NextResponse.json({ error: 'Failed to create component' }, { status: 500 });
  }
}
