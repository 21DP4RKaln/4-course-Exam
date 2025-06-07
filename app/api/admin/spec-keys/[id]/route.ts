import { NextRequest, NextResponse } from 'next/server';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
  createBadRequestResponse,
} from '@/lib/apiErrors';
import { z } from 'zod';

const specKeySchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  componentCategoryId: z.string().uuid().optional().nullable(),
  peripheralCategoryId: z.string().uuid().optional().nullable(),
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

    const mockSpecKey = {
      id: params.id,
      name: 'specification',
      displayName: 'Specification',
      componentCategoryId: null,
      peripheralCategoryId: null,
      componentCategory: null,
      peripheralCategory: null,
      componentSpecValues: [],
      peripheralSpecValues: [],
    };

    return NextResponse.json(mockSpecKey);
  } catch (error) {
    console.error('Error fetching specification key:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specification key' },
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

    const validationResult = specKeySchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', {
        errors: validationResult.error.errors,
      });
    }

    const mockUpdatedSpecKey = {
      id: params.id,
      name: validationResult.data.name,
      displayName: validationResult.data.displayName,
      componentCategoryId: validationResult.data.componentCategoryId,
      peripheralCategoryId: validationResult.data.peripheralCategoryId,
    };

    return NextResponse.json(mockUpdatedSpecKey);
  } catch (error) {
    console.error('Error updating specification key:', error);
    return NextResponse.json(
      { error: 'Failed to update specification key' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const partialSchema = specKeySchema.partial();
    const validationResult = partialSchema.safeParse(body);
    if (!validationResult.success) {
      return createBadRequestResponse('Validation failed', {
        errors: validationResult.error.errors,
      });
    }

    const mockUpdatedSpecKey = {
      id: params.id,
      name: validationResult.data.name || 'specification',
      displayName: validationResult.data.displayName || 'Specification',
      componentCategoryId: validationResult.data.componentCategoryId || null,
      peripheralCategoryId: validationResult.data.peripheralCategoryId || null,
    };

    return NextResponse.json(mockUpdatedSpecKey);
  } catch (error) {
    console.error('Error updating specification key:', error);
    return NextResponse.json(
      { error: 'Failed to update specification key' },
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

    return NextResponse.json({
      message: 'Specification key deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting specification key:', error);
    return NextResponse.json(
      { error: 'Failed to delete specification key' },
      { status: 500 }
    );
  }
}
