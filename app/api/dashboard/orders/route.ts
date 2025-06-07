import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { getUserOrders } from '@/lib/services/dashboardService';

export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    const userId = payload.userId;
    const orders = await getUserOrders(userId);

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return createServerErrorResponse('Failed to fetch orders');
  }
}
