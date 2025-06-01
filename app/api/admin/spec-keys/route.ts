import { NextRequest, NextResponse } from 'next/server';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import { createUnauthorizedResponse, createForbiddenResponse, createBadRequestResponse } from '@/lib/apiErrors';
import { z } from 'zod';

const specKeySchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  componentCategoryId: z.string().uuid().optional().nullable(),
  peripheralCategoryId: z.string().uuid().optional().nullable(),
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
    const componentCategoryId = searchParams.get('componentCategoryId');
    const peripheralCategoryId = searchParams.get('peripheralCategoryId');

    const mockSpecKeys = [];
    
    if (componentCategoryId) {
      mockSpecKeys.push({
        id: 'mock-spec-1',
        name: 'manufacturer',
        displayName: 'Manufacturer',
        componentCategoryId,
        peripheralCategoryId: null,
        componentCategory: {
          id: componentCategoryId,
          name: 'CPU'
        },
        peripheralCategory: null
      });
    }
    
    if (peripheralCategoryId) {
      mockSpecKeys.push({
        id: 'mock-spec-2',
        name: 'brand',
        displayName: 'Brand',
        componentCategoryId: null,
        peripheralCategoryId,
        componentCategory: null,
        peripheralCategory: {
          id: peripheralCategoryId,
          name: 'Keyboard'
        }
      });
    }

    return NextResponse.json(mockSpecKeys);
  } catch (error) {
    console.error('Error fetching specification keys:', error);
    return NextResponse.json({ error: 'Failed to fetch specification keys' }, { status: 500 });
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
    
    const validationResult = specKeySchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', { errors: validationResult.error.errors });
    }

    const data = validationResult.data;
    
    if (!data.componentCategoryId && !data.peripheralCategoryId) {
      return createBadRequestResponse('You must specify either a component category or a peripheral category');
    }
    
    const mockSpecKey = {
      id: `mock-${Date.now()}`,
      name: data.name,
      displayName: data.displayName,
      componentCategoryId: data.componentCategoryId,
      peripheralCategoryId: data.peripheralCategoryId,
      componentCategory: data.componentCategoryId ? { id: data.componentCategoryId, name: 'Category' } : null,
      peripheralCategory: data.peripheralCategoryId ? { id: data.peripheralCategoryId, name: 'Category' } : null
    };

    return NextResponse.json(mockSpecKey, { status: 201 });
  } catch (error) {
    console.error('Error creating specification key:', error);
    return NextResponse.json({ error: 'Failed to create specification key' }, { status: 500 });
  }
}
