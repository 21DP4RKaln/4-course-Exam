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
    
    const peripheral = await prisma.peripheral.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        categoryId: true,
        category: {
          select: { id: true, name: true }
        }
      }
    });    if (!peripheral) {
      return NextResponse.json({ error: 'Peripheral not found' }, { status: 404 });
    }

    const formattedResponse = {
      id: peripheral.id,
      value: peripheral.description || '',
      peripheral: {
        id: peripheral.id,
        name: peripheral.name,
        categoryId: peripheral.categoryId
      },
      specKey: {
        name: 'description',
        displayName: 'Description'
      }
    };

    return NextResponse.json(formattedResponse);
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
    
    // Check if peripheral exists
    const existingPeripheral = await prisma.peripheral.findUnique({
      where: { id: params.id }
    });
    
    if (!existingPeripheral) {
      return NextResponse.json({ error: 'Peripheral not found' }, { status: 404 });
    }
    
    const updatedPeripheral = await prisma.peripheral.update({
      where: { id: params.id },
      data: {
        description: data.value
      },
      select: {
        id: true,
        name: true,
        description: true,
        categoryId: true
      }
    });

    const formattedResponse = {
      id: updatedPeripheral.id,
      value: updatedPeripheral.description || '',
      peripheral: {
        id: updatedPeripheral.id,
        name: updatedPeripheral.name
      },
      specKey: {
        name: 'description',
        displayName: 'Description'
      }
    };

    return NextResponse.json(formattedResponse);
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

    return NextResponse.json(
      { 
        message: 'Deleting peripheral specifications is not supported in this version. ' +
                 'To modify peripheral details, please use the peripheral management interface.' 
      }, 
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling peripheral specification delete request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
