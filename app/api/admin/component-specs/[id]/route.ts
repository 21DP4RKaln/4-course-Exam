import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import { createUnauthorizedResponse, createForbiddenResponse, createBadRequestResponse } from '@/lib/apiErrors';
import { z } from 'zod';

const componentSpecSchema = z.object({
  value: z.string().min(1),
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

    const componentSpec = await prisma.componentSpec.findUnique({
      where: { id: params.id },
      include: {
        component: {
          select: { id: true, name: true, categoryId: true }
        },
        specKey: true
      }
    });

    if (!componentSpec) {
      return NextResponse.json({ error: 'Component specification not found' }, { status: 404 });
    }

    return NextResponse.json(componentSpec);
  } catch (error) {
    console.error('Error fetching component specification:', error);
    return NextResponse.json({ error: 'Failed to fetch component specification' }, { status: 500 });
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
    
    const validationResult = componentSpecSchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', { errors: validationResult.error.errors });
    }

    const data = validationResult.data;
    
    // Check if spec exists
    const existingSpec = await prisma.componentSpec.findUnique({
      where: { id: params.id }
    });
    
    if (!existingSpec) {
      return NextResponse.json({ error: 'Component specification not found' }, { status: 404 });
    }
    
    const componentSpec = await prisma.componentSpec.update({
      where: { id: params.id },
      data: {
        value: data.value
      },
      include: {
        component: {
          select: { id: true, name: true }
        },
        specKey: true
      }
    });

    return NextResponse.json(componentSpec);
  } catch (error) {
    console.error('Error updating component specification:', error);
    return NextResponse.json({ error: 'Failed to update component specification' }, { status: 500 });
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

    // Check if spec exists
    const existingSpec = await prisma.componentSpec.findUnique({
      where: { id: params.id }
    });
    
    if (!existingSpec) {
      return NextResponse.json({ error: 'Component specification not found' }, { status: 404 });
    }

    await prisma.componentSpec.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Component specification deleted successfully' });
  } catch (error) {
    console.error('Error deleting component specification:', error);
    return NextResponse.json({ error: 'Failed to delete component specification' }, { status: 500 });
  }
}
