import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import { createUnauthorizedResponse, createForbiddenResponse, createBadRequestResponse } from '@/lib/apiErrors';
import { z } from 'zod';

const componentSpecSchema = z.object({
  componentId: z.string().uuid(),
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
    const componentId = searchParams.get('componentId');

    if (!componentId) {
      return createBadRequestResponse('Component ID is required');
    }

    const componentSpecs = await prisma.componentSpec.findMany({
      where: { componentId },
      include: {
        specKey: true
      },
      orderBy: {
        specKey: {
          name: 'asc'
        }
      }
    });

    return NextResponse.json(componentSpecs);
  } catch (error) {
    console.error('Error fetching component specifications:', error);
    return NextResponse.json({ error: 'Failed to fetch component specifications' }, { status: 500 });
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
      const validationResult = componentSpecSchema.safeParse(specData);
      if (!validationResult.success) {
        errors.push({ data: specData, errors: validationResult.error.errors });
        continue;
      }
      
      const data = validationResult.data;
      
      // Check if component exists
      const component = await prisma.component.findUnique({
        where: { id: data.componentId },
        include: { category: true }
      });
      
      if (!component) {
        errors.push({ data, error: 'Component not found' });
        continue;
      }
      
      // Check if spec key exists and belongs to this component's category
      const specKey = await prisma.specificationKey.findUnique({
        where: { id: data.specKeyId }
      });
      
      if (!specKey) {
        errors.push({ data, error: 'Specification key not found' });
        continue;
      }
      
      if (specKey.componentCategoryId !== component.categoryId) {
        errors.push({ data, error: 'Specification key does not belong to this component category' });
        continue;
      }
      
      // Check if this component already has a value for this spec key
      const existingSpec = await prisma.componentSpec.findUnique({
        where: {
          componentId_specKeyId: {
            componentId: data.componentId,
            specKeyId: data.specKeyId
          }
        }
      });
      
      if (existingSpec) {
        errors.push({ data, error: 'Component already has a value for this specification key' });
        continue;
      }
      
      // Create the spec
      try {
        const spec = await prisma.componentSpec.create({
          data: {
            componentId: data.componentId,
            specKeyId: data.specKeyId,
            value: data.value
          },
          include: {
            specKey: true
          }
        });
        
        results.push(spec);
      } catch (error) {
        console.error('Error creating component spec:', error);
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
    console.error('Error creating component specifications:', error);
    return NextResponse.json({ error: 'Failed to create component specifications' }, { status: 500 });
  }
}
