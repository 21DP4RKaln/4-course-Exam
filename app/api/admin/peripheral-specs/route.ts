import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import { createUnauthorizedResponse, createForbiddenResponse, createBadRequestResponse } from '@/lib/apiErrors';
import { z } from 'zod';

const peripheralSpecSchema = z.object({
  peripheralId: z.string().uuid(),
  specKeyId: z.string().uuid(),
  value: z.string().min(1),
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
    const peripheralId = searchParams.get('peripheralId');

    if (!peripheralId) {
      return createBadRequestResponse('Peripheral ID is required');
    }

    const peripheral = await prisma.peripheral.findUnique({
      where: { id: peripheralId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        quantity: true,
        subType: true,
        categoryId: true
      }    });
    
    if (!peripheral) {
      return NextResponse.json({ error: 'Peripheral not found' }, { status: 404 });
    }

    const simulatedSpecs = [
      {
        id: `${peripheral.id}-desc`,
        peripheralId: peripheral.id,
        value: peripheral.description || '',
        specKey: {
          id: 'desc',
          name: 'description',
          displayName: 'Description'
        }
      },
      {
        id: `${peripheral.id}-subtype`,
        peripheralId: peripheral.id,
        value: peripheral.subType,
        specKey: {
          id: 'subtype',
          name: 'subType',
          displayName: 'Sub Type'
        }
      }
    ];

    return NextResponse.json(simulatedSpecs);
  } catch (error) {
    console.error('Error fetching peripheral specifications:', error);
    return NextResponse.json({ error: 'Failed to fetch peripheral specifications' }, { status: 500 });
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

    const isArray = Array.isArray(body);
    const specsToCreate = isArray ? body : [body];

    const results = [];
    const errors = [];
    
    for (const specData of specsToCreate) {
      const validationResult = peripheralSpecSchema.safeParse(specData);
      if (!validationResult.success) {
        errors.push({ data: specData, errors: validationResult.error.errors });
        continue;
      }
      
      const data = validationResult.data;

      const peripheral = await prisma.peripheral.findUnique({
        where: { id: data.peripheralId }
      });
      
      if (!peripheral) {
        errors.push({ data, error: 'Peripheral not found' });
        continue;
      }

      try {
        const updatedPeripheral = await prisma.peripheral.update({
          where: { id: data.peripheralId },
          data: {
            description: data.value
          },
          select: {
            id: true,
            name: true,
            description: true
          }
        });
        
        const simulatedSpec = {
          id: `${updatedPeripheral.id}-desc`,
          peripheralId: updatedPeripheral.id,
          specKeyId: data.specKeyId,
          value: updatedPeripheral.description || '',
          specKey: {
            id: data.specKeyId,
            name: 'description',
            displayName: 'Description'
          }
        };
        
        results.push(simulatedSpec);
      } catch (error) {
        console.error('Error updating peripheral:', error);
        errors.push({ data, error: 'Failed to update peripheral information' });
      }
    }
    
    if (errors.length > 0 && results.length === 0) {
      return createBadRequestResponse('Failed to create any specifications', { errors });
    }
    
    return NextResponse.json({
      success: true,
      results,
      errors: errors.length > 0 ? errors : undefined
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating peripheral specifications:', error);
    return NextResponse.json({ error: 'Failed to create peripheral specifications' }, { status: 500 });
  }
}
