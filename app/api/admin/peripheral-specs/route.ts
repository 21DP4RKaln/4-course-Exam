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

    const peripheralSpecs = await prisma.peripheralSpec.findMany({
      where: { peripheralId },
      include: {
        specKey: true
      },
      orderBy: {
        specKey: {
          name: 'asc'
        }
      }
    });

    return NextResponse.json(peripheralSpecs);
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
    
    // Handle both single and batch spec creation
    const isArray = Array.isArray(body);
    const specsToCreate = isArray ? body : [body];
    
    // Validate all specs
    const results = [];
    const errors = [];
    
    for (const specData of specsToCreate) {
      const validationResult = peripheralSpecSchema.safeParse(specData);
      if (!validationResult.success) {
        errors.push({ data: specData, errors: validationResult.error.errors });
        continue;
      }
      
      const data = validationResult.data;
      
      // Check if peripheral exists
      const peripheral = await prisma.peripheral.findUnique({
        where: { id: data.peripheralId },
        include: { category: true }
      });
      
      if (!peripheral) {
        errors.push({ data, error: 'Peripheral not found' });
        continue;
      }
      
      // Check if spec key exists and belongs to this peripheral's category
      const specKey = await prisma.specificationKey.findUnique({
        where: { id: data.specKeyId }
      });
      
      if (!specKey) {
        errors.push({ data, error: 'Specification key not found' });
        continue;
      }
      
      if (specKey.peripheralCategoryId !== peripheral.categoryId) {
        errors.push({ data, error: 'Specification key does not belong to this peripheral category' });
        continue;
      }
      
      // Check if this peripheral already has a value for this spec key
      const existingSpec = await prisma.peripheralSpec.findUnique({
        where: {
          peripheralId_specKeyId: {
            peripheralId: data.peripheralId,
            specKeyId: data.specKeyId
          }
        }
      });
      
      if (existingSpec) {
        errors.push({ data, error: 'Peripheral already has a value for this specification key' });
        continue;
      }
      
      // Create the spec
      try {
        const spec = await prisma.peripheralSpec.create({
          data: {
            peripheralId: data.peripheralId,
            specKeyId: data.specKeyId,
            value: data.value
          },
          include: {
            specKey: true
          }
        });
        
        results.push(spec);
      } catch (error) {
        console.error('Error creating peripheral spec:', error);
        errors.push({ data, error: 'Failed to create specification' });
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
