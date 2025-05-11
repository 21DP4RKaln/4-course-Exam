import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import { createUnauthorizedResponse, createForbiddenResponse, createBadRequestResponse } from '@/lib/apiErrors';
import { z } from 'zod';

const specKeySchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  componentCategoryId: z.string().uuid().optional().nullable(),
  peripheralCategoryId: z.string().uuid().optional().nullable(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse();
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse();
    }

    const specKey = await prisma.specificationKey.findUnique({
      where: { id: params.id },
      include: {
        componentCategory: {
          select: { id: true, name: true }
        },
        peripheralCategory: {
          select: { id: true, name: true }
        },
        componentSpecValues: {
          include: {
            component: {
              select: { id: true, name: true }
            }
          }
        },
        peripheralSpecValues: {
          include: {
            peripheral: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!specKey) {
      return NextResponse.json({ error: 'Specification key not found' }, { status: 404 });
    }

    return NextResponse.json(specKey);
  } catch (error) {
    console.error('Error fetching specification key:', error);
    return NextResponse.json({ error: 'Failed to fetch specification key' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const validationResult = specKeySchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', { errors: validationResult.error.errors });
    }

    const data = validationResult.data;
    
    // Check if this name is already used by another spec key
    const existingSpecKey = await prisma.specificationKey.findFirst({
      where: {
        name: data.name,
        NOT: { id: params.id }
      }
    });

    if (existingSpecKey) {
      return createBadRequestResponse('Another specification key with this name already exists');
    }
    
    // Ensure at least one category is specified
    if (!data.componentCategoryId && !data.peripheralCategoryId) {
      return createBadRequestResponse('You must specify either a component category or a peripheral category');
    }
    
    const specKey = await prisma.specificationKey.update({
      where: { id: params.id },
      data: {
        name: data.name,
        displayName: data.displayName,
        componentCategoryId: data.componentCategoryId,
        peripheralCategoryId: data.peripheralCategoryId,
      },
      include: {
        componentCategory: {
          select: { id: true, name: true }
        },
        peripheralCategory: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(specKey);
  } catch (error) {
    console.error('Error updating specification key:', error);
    return NextResponse.json({ error: 'Failed to update specification key' }, { status: 500 });
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
    const partialSchema = specKeySchema.partial();
    const validationResult = partialSchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', { errors: validationResult.error.errors });
    }

    const data = validationResult.data;
    const updateData: any = {};
    
    // Check if updating name and if it's unique
    if (data.name !== undefined) {
      const existingSpecKey = await prisma.specificationKey.findFirst({
        where: {
          name: data.name,
          NOT: { id: params.id }
        }
      });
      
      if (existingSpecKey) {
        return createBadRequestResponse('Another specification key with this name already exists');
      }
      
      updateData.name = data.name;
    }
    
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.componentCategoryId !== undefined) updateData.componentCategoryId = data.componentCategoryId;
    if (data.peripheralCategoryId !== undefined) updateData.peripheralCategoryId = data.peripheralCategoryId;
    
    // Check if both categories are being set to null
    if (
      (data.componentCategoryId === null || (data.componentCategoryId === undefined && await prisma.specificationKey.findUnique({ where: { id: params.id } }).then(key => key?.componentCategoryId === null))) &&
      (data.peripheralCategoryId === null || (data.peripheralCategoryId === undefined && await prisma.specificationKey.findUnique({ where: { id: params.id } }).then(key => key?.peripheralCategoryId === null)))
    ) {
      return createBadRequestResponse('You must specify either a component category or a peripheral category');
    }
    
    const specKey = await prisma.specificationKey.update({
      where: { id: params.id },
      data: updateData,
      include: {
        componentCategory: {
          select: { id: true, name: true }
        },
        peripheralCategory: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(specKey);
  } catch (error) {
    console.error('Error updating specification key:', error);
    return NextResponse.json({ error: 'Failed to update specification key' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse();
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse();
    }

    // Check if this spec key is used in any component or peripheral specs
    const [componentSpecCount, peripheralSpecCount] = await Promise.all([
      prisma.componentSpec.count({
        where: { specKeyId: params.id }
      }),
      prisma.peripheralSpec.count({
        where: { specKeyId: params.id }
      })
    ]);

    if (componentSpecCount > 0 || peripheralSpecCount > 0) {
      return createBadRequestResponse('Cannot delete specification key that is in use. Remove specifications from components and peripherals first.');
    }

    await prisma.specificationKey.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Specification key deleted successfully' });
  } catch (error) {
    console.error('Error deleting specification key:', error);
    return NextResponse.json({ error: 'Failed to delete specification key' }, { status: 500 });
  }
}
