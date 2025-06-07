import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createNotFoundResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { getOrderById } from '@/lib/services/dashboardService';

export async function GET(
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

    const userId = payload.userId;
    const orderId = params.id;
    const order = await getOrderById(orderId, userId);

    if (!order) {
      return createNotFoundResponse('Order not found');
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return createServerErrorResponse('Failed to fetch order details');
  }
}
