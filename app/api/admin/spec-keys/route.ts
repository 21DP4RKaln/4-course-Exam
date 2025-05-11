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

    let whereClause: any = {};
    
    if (componentCategoryId) {
      whereClause.componentCategoryId = componentCategoryId;
    }
    
    if (peripheralCategoryId) {
      whereClause.peripheralCategoryId = peripheralCategoryId;
    }

    const specKeys = await prisma.specificationKey.findMany({
      where: whereClause,
      include: {
        componentCategory: {
          select: { id: true, name: true }
        },
        peripheralCategory: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(specKeys);
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
    
    // Check if a specification key with this name already exists
    const existingSpecKey = await prisma.specificationKey.findUnique({
      where: { name: data.name }
    });

    if (existingSpecKey) {
      return createBadRequestResponse('A specification key with this name already exists');
    }
    
    // Ensure at least one category is specified
    if (!data.componentCategoryId && !data.peripheralCategoryId) {
      return createBadRequestResponse('You must specify either a component category or a peripheral category');
    }
    
    const specKey = await prisma.specificationKey.create({
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

    return NextResponse.json(specKey, { status: 201 });
  } catch (error) {
    console.error('Error creating specification key:', error);
    return NextResponse.json({ error: 'Failed to create specification key' }, { status: 500 });
  }
}
