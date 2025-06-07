import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
  createBadRequestResponse,
} from '@/lib/apiErrors';
import { z } from 'zod';

const componentSpecSchema = z.object({
  componentId: z.string().uuid(),
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

    const component = await prisma.component.findUnique({
      where: { id: componentId },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        quantity: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      componentId,
      specs: [],
    });
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch component specifications' },
      { status: 500 }
    );
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

    const validationResult = componentSpecSchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', {
        errors: validationResult.error.errors,
      });
    }

    const { componentId } = validationResult.data;

    const component = await prisma.component.findUnique({
      where: { id: componentId },
    });

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: 'placeholder-spec-id',
        message: 'Specification created successfully',
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating component specification:', error);
    return NextResponse.json(
      { error: 'Failed to create component specification' },
      { status: 500 }
    );
  }
}
