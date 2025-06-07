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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    const end = endDate
      ? new Date(endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (!startDate && !endDate) {
      if (period === 'week') {
        start.setDate(now.getDate() - 7);
        end.setDate(now.getDate());
      } else if (period === 'year') {
        start.setMonth(0, 1);
        end.setMonth(11, 31);
      }
    }

    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            configurations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Get users with orders
    const usersWithOrders = await prisma.user.findMany({
      where: {
        role: 'USER',
        orders: {
          some: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    let signupData = [];

    if (period === 'day' || period === 'week') {
      const dailyMap = new Map();

      users.forEach(user => {
        const day = user.createdAt.toISOString().split('T')[0];
        const currentCount = dailyMap.get(day) || 0;
        dailyMap.set(day, currentCount + 1);
      });

      const days = getDaysArray(start, end);
      signupData = days.map(day => ({
        date: day,
        count: dailyMap.get(day) || 0,
      }));
    } else if (period === 'month') {
      const weekMap = new Map();

      users.forEach(user => {
        const weekNumber = getWeekNumber(user.createdAt);
        const weekLabel = `Week ${weekNumber}`;
        const currentCount = weekMap.get(weekLabel) || 0;
        weekMap.set(weekLabel, currentCount + 1);
      });

      const weeks = getWeeksArray(start, end);
      signupData = weeks.map(week => ({
        date: week,
        count: weekMap.get(week) || 0,
      }));
    } else {
      const monthlyMap = new Map();

      users.forEach(user => {
        const month = user.createdAt.toISOString().substring(0, 7); // YYYY-MM
        const monthName = new Date(month + '-01').toLocaleString('default', {
          month: 'short',
        });
        const currentCount = monthlyMap.get(monthName) || 0;
        monthlyMap.set(monthName, currentCount + 1);
      });

      const months = getMonthsArray(start, end);
      signupData = months.map(month => ({
        date: month,
        count: monthlyMap.get(month) || 0,
      }));
    }

    const totalUsers = users.length;
    const activeUsers = usersWithOrders.length;
    const conversionRate =
      totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    const userOrders = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: {
          in: ['COMPLETED', 'PROCESSING'],
        },
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        _all: true,
      },
    });
    const userDetails = await prisma.user.findMany({
      where: {
        id: {
          in: userOrders
            .map(user => user.userId)
            .filter((id): id is string => id !== null),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const topUsers = userOrders
      .map(order => {
        const user = userDetails.find(u => u.id === order.userId);
        return {
          id: order.userId,
          email: user?.email || 'Unknown',
          name: user?.name || 'Unknown',
          orderCount: order._count._all,
          totalSpent: order._sum.totalAmount || 0,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return NextResponse.json({
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      signupData,
      summary: {
        totalUsers,
        activeUsers,
        conversionRate,
        averageOrdersPerUser:
          users.reduce((sum, user) => sum + user._count.orders, 0) /
          Math.max(1, users.length),
      },
      topUsers,
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return createServerErrorResponse('Failed to fetch user analytics data');
  }
}

function getDaysArray(start: Date, end: Date): string[] {
  const arr = [];
  const dt = new Date(start);

  while (dt <= end) {
    arr.push(dt.toISOString().split('T')[0]);
    dt.setDate(dt.getDate() + 1);
  }

  return arr;
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const daysSinceFirstDay = Math.floor(
    (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7);
}

function getWeeksArray(start: Date, end: Date): string[] {
  const arr = [];
  const startWeek = getWeekNumber(start);
  const endWeek = getWeekNumber(end);

  for (let i = startWeek; i <= endWeek; i++) {
    arr.push(`Week ${i}`);
  }

  return arr;
}

function getMonthsArray(start: Date, end: Date): string[] {
  const arr = [];
  const startMonth = start.getMonth();
  const endMonth =
    end.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;

  for (let i = startMonth; i <= endMonth; i++) {
    const date = new Date(start.getFullYear(), i, 1);
    arr.push(date.toLocaleString('default', { month: 'short' }));
  }

  return arr;
}
