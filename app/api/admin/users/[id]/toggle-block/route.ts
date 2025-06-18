import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
  createNotFoundResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    if (payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin privileges required');
    }

    const userId = params.id;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return createNotFoundResponse('User not found');
    }

    // Prevent admin from blocking themselves
    if (userId === payload.userId) {
      return NextResponse.json(
        { error: 'You cannot block yourself' },
        { status: 400 }
      );
    }

    // Toggle the blocked status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: !existingUser.isBlocked,
        blockReason: !existingUser.isBlocked ? 'Blocked by admin' : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        profileImageUrl: true,
        isBlocked: true,
        blockReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error toggling user block status:', error);
    return createServerErrorResponse('Failed to toggle user block status');
  }
}
