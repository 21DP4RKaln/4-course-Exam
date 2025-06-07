import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
  createBadRequestResponse,
} from '@/lib/apiErrors';
import { z } from 'zod';

const componentSpecSchema = z.object({
  value: z.string().min(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        error:
          'ComponentSpec model is not available in the current database schema',
        missingModels: ['ComponentSpec', 'SpecificationKey'],
        suggestedFix:
          'Add these models to your schema.prisma file and run prisma migrate',
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching component specification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch component specification' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    return NextResponse.json(
      {
        error:
          'ComponentSpec model is not available in the current database schema',
        missingModels: ['ComponentSpec', 'SpecificationKey'],
        suggestedFix:
          'Add these models to your schema.prisma file and run prisma migrate',
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error updating component specification:', error);
    return NextResponse.json(
      { error: 'Failed to update component specification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        error:
          'ComponentSpec model is not available in the current database schema',
        missingModels: ['ComponentSpec', 'SpecificationKey'],
        suggestedFix:
          'Add these models to your schema.prisma file and run prisma migrate',
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error deleting component specification:', error);
    return NextResponse.json(
      { error: 'Failed to delete component specification' },
      { status: 500 }
    );
  }
}
