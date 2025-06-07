import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import {
  createNotFoundResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return createNotFoundResponse('Order ID is required');
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        configuration: true,
      },
    });

    if (!order) {
      return createNotFoundResponse('Order not found');
    }

    const responseOrder = {
      ...order,
      discount: (order as any).discount || 0,
      shippingCost: (order as any).shippingCost || 10,
    };

    return NextResponse.json(responseOrder);
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return createServerErrorResponse('Failed to fetch order');
  }
}
