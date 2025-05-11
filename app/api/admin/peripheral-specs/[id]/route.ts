import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import { createUnauthorizedResponse, createForbiddenResponse, createBadRequestResponse } from '@/lib/apiErrors';
import { z } from 'zod';

const peripheralSpecSchema = z.object({
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

    const peripheralSpec = await prisma.peripheralSpec.findUnique({
      where: { id: params.id },
      include: {
        peripheral: {
          select: { id: true, name: true, categoryId: true }
        },
        specKey: true
      }
    });

    if (!peripheralSpec) {
      return NextResponse.json({ error: 'Peripheral specification not found' }, { status: 404 });
    }

    return NextResponse.json(peripheralSpec);
  } catch (error) {
    console.error('Error fetching peripheral specification:', error);
    return NextResponse.json({ error: 'Failed to fetch peripheral specification' }, { status: 500 });
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
    
    const validationResult = peripheralSpecSchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', { errors: validationResult.error.errors });
    }

    const data = validationResult.data;
    
    // Check if spec exists
    const existingSpec = await prisma.peripheralSpec.findUnique({
      where: { id: params.id }
    });
    
    if (!existingSpec) {
      return NextResponse.json({ error: 'Peripheral specification not found' }, { status: 404 });
    }
    
    const peripheralSpec = await prisma.peripheralSpec.update({
      where: { id: params.id },
      data: {
        value: data.value
      },
      include: {
        peripheral: {
          select: { id: true, name: true }
        },
        specKey: true
      }
    });

    return NextResponse.json(peripheralSpec);
  } catch (error) {
    console.error('Error updating peripheral specification:', error);
    return NextResponse.json({ error: 'Failed to update peripheral specification' }, { status: 500 });
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
    const existingSpec = await prisma.peripheralSpec.findUnique({
      where: { id: params.id }
    });
    
    if (!existingSpec) {
      return NextResponse.json({ error: 'Peripheral specification not found' }, { status: 404 });
    }

    await prisma.peripheralSpec.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Peripheral specification deleted successfully' });
  } catch (error) {
    console.error('Error deleting peripheral specification:', error);
    return NextResponse.json({ error: 'Failed to delete peripheral specification' }, { status: 500 });
  }
}
