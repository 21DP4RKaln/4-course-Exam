import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createBadRequestResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { prisma } from '@/lib/prismaService';
import { ProductType } from '@prisma/client';

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

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const productType = searchParams.get('productType');

    if (!productId || !productType) {
      return createBadRequestResponse('Product ID and type are required');
    }

    let hasPurchased = false;

    if (productType === 'CONFIGURATION') {
      const order = await prisma.order.findFirst({
        where: {
          userId,
          configurationId: productId,
          status: {
            in: ['COMPLETED', 'PROCESSING'],
          },
        },
      });

      hasPurchased = !!order;
    } else {
      const orders = await prisma.order.findMany({
        where: {
          userId,
          status: {
            in: ['COMPLETED', 'PROCESSING'],
          },
        },
        include: {
          orderItems: {
            where: {
              productId: productId,
              productType: productType as ProductType,
            },
          },
        },
      });

      hasPurchased = orders.some(order => order.orderItems.length > 0);
    }

    return NextResponse.json({ hasPurchased });
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return createServerErrorResponse('Failed to check purchase status');
  }
}
