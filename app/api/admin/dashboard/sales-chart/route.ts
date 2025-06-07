import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { prisma } from '@/lib/prismaService';

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

    if (payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        status: 'COMPLETED',
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const salesByDate: Record<
      string,
      { date: string; sales: number; revenue: number }
    > = {};

    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = {
          date: dateKey,
          sales: 0,
          revenue: 0,
        };
      }
      salesByDate[dateKey].sales += 1;
      salesByDate[dateKey].revenue += order.totalAmount;
    });

    const salesData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      salesData.push(
        salesByDate[dateKey] || {
          date: dateKey,
          sales: 0,
          revenue: 0,
        }
      );
    }

    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Error fetching sales chart data:', error);
    return createServerErrorResponse('Failed to fetch sales chart data');
  }
}
