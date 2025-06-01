import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import { createUnauthorizedResponse, createForbiddenResponse, createNotFoundResponse, createBadRequestResponse } from '@/lib/apiErrors';
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

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { params } = context;
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse();
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse();
    }    const component = await prisma.component.findUnique({
      where: { id: params.id },
      include: {
        category: true
      }
    });

    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }

    return NextResponse.json(component);
  } catch (error) {
    console.error('Error fetching component:', error);
    return NextResponse.json({ error: 'Failed to fetch component' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
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
      const validationResult = componentSchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', { errors: validationResult.error.errors });
    }

    const data = validationResult.data;
      const component = await prisma.component.update({
      where: { id: params.id },
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

    return NextResponse.json(component);
  } catch (error) {
    console.error('Error updating component:', error);
    return NextResponse.json({ error: 'Failed to update component' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
      // Allow partial updates with PATCH
    const partialSchema = componentSchema.partial();
    const validationResult = partialSchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', { errors: validationResult.error.errors });
    }

    const data = validationResult.data;
    const updateData: any = {};
      // Only update fields that were provided
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.discountPrice !== undefined) updateData.discountPrice = data.discountPrice;
    if (data.discountExpiresAt !== undefined) 
      updateData.discountExpiresAt = data.discountExpiresAt ? new Date(data.discountExpiresAt) : null;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.imagesUrl !== undefined) updateData.imagesUrl = data.imagesUrl;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.subType !== undefined) updateData.subType = data.subType;
      const component = await prisma.component.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true
      }
    });

    return NextResponse.json(component);
  } catch (error) {
    console.error('Error updating component:', error);
    return NextResponse.json({ error: 'Failed to update component' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
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

    await prisma.component.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Component deleted successfully' });
  } catch (error) {
    console.error('Error deleting component:', error);
    return NextResponse.json({ error: 'Failed to delete component' }, { status: 500 });
  }
}
