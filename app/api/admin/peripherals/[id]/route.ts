import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
  createBadRequestResponse,
} from '@/lib/apiErrors';
import { z } from 'zod';

const peripheralSchema = z.object({
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
    const peripheral = await prisma.peripheral.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    });

    if (!peripheral) {
      return NextResponse.json(
        { error: 'Peripheral not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(peripheral);
  } catch (error) {
    console.error('Error fetching peripheral:', error);
    return NextResponse.json(
      { error: 'Failed to fetch peripheral' },
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

    const validationResult = peripheralSchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', {
        errors: validationResult.error.errors,
      });
    }

    const data = validationResult.data;

    if (data.sku) {
      const existingPeripheral = await prisma.peripheral.findUnique({
        where: { sku: data.sku },
      });

      if (existingPeripheral && existingPeripheral.id !== params.id) {
        return createBadRequestResponse(
          'Another peripheral with this SKU already exists'
        );
      }
    }
    const peripheral = await prisma.peripheral.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        discountExpiresAt: data.discountExpiresAt
          ? new Date(data.discountExpiresAt)
          : null,
        quantity: data.quantity,
        imagesUrl: data.imagesUrl || null,
        categoryId: data.categoryId,
        sku: data.sku,
        subType: data.subType,
      },
    });

    return NextResponse.json(peripheral);
  } catch (error) {
    console.error('Error updating peripheral:', error);
    return NextResponse.json(
      { error: 'Failed to update peripheral' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const partialSchema = peripheralSchema.partial();
    const validationResult = partialSchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', {
        errors: validationResult.error.errors,
      });
    }

    const data = validationResult.data;
    const updateData: any = {};

    if (data.sku !== undefined) {
      const existingPeripheral = await prisma.peripheral.findUnique({
        where: { sku: data.sku },
      });

      if (existingPeripheral && existingPeripheral.id !== params.id) {
        return createBadRequestResponse(
          'Another peripheral with this SKU already exists'
        );
      }
    }
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.discountPrice !== undefined)
      updateData.discountPrice = data.discountPrice;
    if (data.discountExpiresAt !== undefined)
      updateData.discountExpiresAt = data.discountExpiresAt
        ? new Date(data.discountExpiresAt)
        : null;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.imagesUrl !== undefined) updateData.imagesUrl = data.imagesUrl;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.subType !== undefined) updateData.subType = data.subType;
    const peripheral = await prisma.peripheral.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json(peripheral);
  } catch (error) {
    console.error('Error updating peripheral:', error);
    return NextResponse.json(
      { error: 'Failed to update peripheral' },
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

    const repairCount = await prisma.repair.count({
      where: { peripheralId: params.id },
    });

    if (repairCount > 0) {
      return createBadRequestResponse(
        'Cannot delete peripheral that is referenced in repairs. Update repairs first.'
      );
    }

    await prisma.peripheral.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Peripheral deleted successfully' });
  } catch (error) {
    console.error('Error deleting peripheral:', error);
    return NextResponse.json(
      { error: 'Failed to delete peripheral' },
      { status: 500 }
    );
  }
}
