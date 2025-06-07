import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt';
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
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      totalOrders,
      totalRepairs,
      totalRevenue,
      pendingConfigurations,
      activeRepairs,
      lowStockComponents,
      lastMonthOrders,
      thisMonthOrders,
      lastMonthUsers,
      thisMonthUsers,
      lastMonthRevenue,
      thisMonthRevenue,
      lastMonthRepairs,
      thisMonthRepairs,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.order.count(),
      prisma.repair.count(),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
      prisma.configuration.count({
        where: { status: 'SUBMITTED' },
      }),
      prisma.repair.count({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS', 'WAITING_FOR_PARTS'] },
        },
      }),
      prisma.component.count({
        where: { quantity: { lt: 10 } },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: thisMonthStart,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: thisMonthStart,
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: thisMonthStart,
          },
        },
        _sum: { totalAmount: true },
      }),
      prisma.repair.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      }),
      prisma.repair.count({
        where: {
          createdAt: {
            gte: thisMonthStart,
          },
        },
      }),
    ]);
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    };

    const userGrowth = calculateGrowth(thisMonthUsers, lastMonthUsers);
    const orderGrowth = calculateGrowth(thisMonthOrders, lastMonthOrders);
    const revenueGrowth = calculateGrowth(
      thisMonthRevenue._sum.totalAmount || 0,
      lastMonthRevenue._sum.totalAmount || 0
    );
    const repairGrowth = calculateGrowth(thisMonthRepairs, lastMonthRepairs);

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRepairs,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingConfigurations,
      activeRepairs,
      lowStockItems: lowStockComponents,
      monthlyGrowth: orderGrowth,
      trends: {
        users: userGrowth,
        orders: orderGrowth,
        revenue: revenueGrowth,
        repairs: repairGrowth,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return createServerErrorResponse('Failed to fetch dashboard stats');
  }
}
