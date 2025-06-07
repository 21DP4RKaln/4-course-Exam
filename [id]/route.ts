import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
} from '@/lib/apiErrors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) return createUnauthorizedResponse();
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'ADMIN') return createForbiddenResponse();

    const component = await prisma.component.findUnique({
      where: { id: params.id },
      select: { id: true, name: true },
    });

    if (!component) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ ...component, specs: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
