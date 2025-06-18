import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
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

interface SpecialistStats {
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
  performance: {
    completedThisWeek: number;
    completedThisMonth: number;
    averageCompletionTime: number;
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

    const specialistId = payload.userId;
    const isAdmin = payload.role === 'ADMIN';

    // Get date ranges for performance metrics
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Base where clause for specialist-specific queries
    const specialistWhere = isAdmin
      ? {}
      : {
          specialists: {
            some: {
              specialistId: specialistId,
            },
          },
        };

    const [
      pendingRepairs,
      activeRepairs,
      completedRepairs,
      pendingConfigurations,
      approvedConfigurations,
      totalComponents,
      lowStockComponents,
      totalPeripherals,
      completedThisWeek,
      completedThisMonth,
    ] = await Promise.all([
      // Repairs assigned to this specialist (or all if admin)
      prisma.repair.count({
        where: {
          status: 'PENDING',
          ...specialistWhere,
        },
      }),
      prisma.repair.count({
        where: {
          status: { in: ['DIAGNOSING', 'WAITING_FOR_PARTS', 'IN_PROGRESS'] },
          ...specialistWhere,
        },
      }),
      prisma.repair.count({
        where: {
          status: 'COMPLETED',
          ...specialistWhere,
        },
      }),
      // Configuration reviews (all pending for specialists to review)
      prisma.configuration.count({
        where: { status: 'SUBMITTED', isTemplate: false },
      }),
      prisma.configuration.count({ where: { status: 'APPROVED' } }),
      // Inventory (visible to all staff)
      prisma.component.count(),
      prisma.component.count({ where: { quantity: { lt: 10 } } }),
      prisma.peripheral.count(),
      // Performance metrics
      prisma.repair.count({
        where: {
          status: 'COMPLETED',
          completionDate: {
            gte: startOfWeek,
          },
          ...specialistWhere,
        },
      }),
      prisma.repair.count({
        where: {
          status: 'COMPLETED',
          completionDate: {
            gte: startOfMonth,
          },
          ...specialistWhere,
        },
      }),
    ]);

    // Get recent repairs assigned to this specialist
    const recentRepairs = await prisma.repair.findMany({
      where: specialistWhere,
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // Get recent configurations for review
    const recentConfigurations = await prisma.configuration.findMany({
      where: { status: 'SUBMITTED', isTemplate: false },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // Calculate average completion time
    const completedRepairsWithTimes = await prisma.repair.findMany({
      where: {
        status: 'COMPLETED',
        completionDate: { not: null },
        ...specialistWhere,
      },
      select: {
        createdAt: true,
        completionDate: true,
      },
      take: 50, // Last 50 completed repairs for average
    });

    const averageCompletionTime =
      completedRepairsWithTimes.length > 0
        ? completedRepairsWithTimes.reduce((acc, repair) => {
            const timeDiff =
              repair.completionDate!.getTime() - repair.createdAt.getTime();
            return acc + timeDiff / (1000 * 60 * 60 * 24); // Days
          }, 0) / completedRepairsWithTimes.length
        : 0;

    const stats: SpecialistStats = {
      repairs: {
        pendingRepairs,
        activeRepairs,
        completedRepairs,
        totalRepairs: pendingRepairs + activeRepairs + completedRepairs,
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
          title: repair.title || `Repair #${repair.id.substring(0, 8)}`,
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
      performance: {
        completedThisWeek,
        completedThisMonth,
        averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching specialist stats:', error);
    return createServerErrorResponse('Failed to fetch specialist stats');
  }
}
