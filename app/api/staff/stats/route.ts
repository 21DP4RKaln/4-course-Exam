import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';

interface RecentRepair {
  id: string;
  title: string;
  status: string;
  customer: string;
  createdAt: string;
  updatedAt: string;
}

interface RecentConfiguration {
  id: string;
  name: string;
  status: string;
  user: string;
  createdAt: string;
}

interface StaffStats {
  repairs: {
    pendingRepairs: number;
    activeRepairs: number;
    completedRepairs: number;
    totalRepairs: number;
  };
  configurations: {
    pendingConfigurations: number;
    approvedConfigurations: number;
    totalConfigurations: number;
  };
  inventory: {
    components: number;
    lowStock: number;
    peripherals: number;
  };
  recentActivity: {
    repairs: RecentRepair[];
    configurations: RecentConfiguration[];
  };
  admin?: {
    users: number;
    orders: {
      total: number;
      pending: number;
    };
    revenue: number;
  };
}

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

    if (!['ADMIN', 'SPECIALIST'].includes(payload.role)) {
      return createUnauthorizedResponse('Insufficient permissions');
    }

    const [
      pendingRepairs,
      inProgressRepairs,
      completedRepairs,
      pendingConfigurations,
      approvedConfigurations,
      totalComponents,
      lowStockComponents,
      totalPeripherals,
      totalUsers,
      totalOrders,
      pendingOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.repair.count({ where: { status: 'PENDING' } }),
      prisma.repair.count({
        where: {
          status: { in: ['DIAGNOSING', 'WAITING_FOR_PARTS', 'IN_PROGRESS'] },
        },
      }),
      prisma.repair.count({ where: { status: 'COMPLETED' } }),
      prisma.configuration.count({
        where: { status: 'SUBMITTED', isTemplate: false },
      }),
      prisma.configuration.count({ where: { status: 'APPROVED' } }),
      prisma.component.count(),
      prisma.component.count({ where: { quantity: { lt: 10 } } }),
      prisma.peripheral.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);

    const recentRepairs = await prisma.repair.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const recentConfigurations = await prisma.configuration.findMany({
      where: { status: 'SUBMITTED', isTemplate: false },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const stats: StaffStats = {
      repairs: {
        pendingRepairs,
        activeRepairs: inProgressRepairs,
        completedRepairs,
        totalRepairs: pendingRepairs + inProgressRepairs + completedRepairs,
      },
      configurations: {
        pendingConfigurations,
        approvedConfigurations,
        totalConfigurations: pendingConfigurations + approvedConfigurations,
      },
      inventory: {
        components: totalComponents,
        lowStock: lowStockComponents,
        peripherals: totalPeripherals,
      },
      recentActivity: {
        repairs: recentRepairs.map(repair => ({
          id: repair.id,
          title: repair.title,
          status: repair.status,
          customer: repair.user?.name || 'Unknown',
          createdAt: repair.createdAt.toISOString(),
          updatedAt: repair.updatedAt.toISOString(),
        })),
        configurations: recentConfigurations.map(config => ({
          id: config.id,
          name: config.name,
          status: config.status,
          user: config.user?.name || 'Unknown',
          createdAt: config.createdAt.toISOString(),
        })),
      },
    };

    if (payload.role === 'ADMIN') {
      stats.admin = {
        users: totalUsers,
        orders: {
          total: totalOrders,
          pending: pendingOrders,
        },
        revenue: totalRevenue._sum.totalAmount || 0,
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    return createServerErrorResponse('Failed to fetch statistics');
  }
}
