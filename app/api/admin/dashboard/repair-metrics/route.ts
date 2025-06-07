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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const repairs = await prisma.repair.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const repairsByMonth: Record<
      string,
      {
        month: string;
        pending: number;
        inProgress: number;
        completed: number;
        cancelled: number;
      }
    > = {};

    repairs.forEach(repair => {
      const monthKey = repair.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const monthName = new Date(monthKey + '-01').toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      if (!repairsByMonth[monthKey]) {
        repairsByMonth[monthKey] = {
          month: monthName,
          pending: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
        };
      }

      switch (repair.status) {
        case 'PENDING':
          repairsByMonth[monthKey].pending += 1;
          break;
        case 'IN_PROGRESS':
        case 'WAITING_FOR_PARTS':
          repairsByMonth[monthKey].inProgress += 1;
          break;
        case 'COMPLETED':
          repairsByMonth[monthKey].completed += 1;
          break;
        case 'CANCELLED':
          repairsByMonth[monthKey].cancelled += 1;
          break;
      }
    });

    const repairData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().substring(0, 7);
      const monthName = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      repairData.push(
        repairsByMonth[monthKey] || {
          month: monthName,
          pending: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
        }
      );
    }

    return NextResponse.json(repairData);
  } catch (error) {
    console.error('Error fetching repair metrics chart data:', error);
    return createServerErrorResponse(
      'Failed to fetch repair metrics chart data'
    );
  }
}
