import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
} from '@/lib/apiErrors';

export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse();
    }

    const payload = await verifyJWT(token);
    if (!payload || !['ADMIN', 'SPECIALIST'].includes(payload.role)) {
      return createForbiddenResponse();
    }

    const specialistId = payload.userId;

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const endDate = endDateParam ? new Date(endDateParam) : new Date();

    const isAdmin = payload.role === 'ADMIN';

    const repairWhereClause = isAdmin
      ? {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }
      : {
          specialists: {
            some: {
              specialistId,
            },
          },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        };

    const [
      assignedRepairs,
      repairsByStatus,
      repairsByPriority,
      pendingRepairs,
      inProgressRepairs,
      completedRepairs,
      lowStockComponents,
      recentRepairAssignments,
    ] = await Promise.all([
      isAdmin
        ? prisma.repair.count()
        : prisma.repair.count({
            where: {
              specialists: {
                some: {
                  specialistId,
                },
              },
            },
          }),

      prisma.repair.groupBy({
        by: ['status'],
        _count: true,
        where: repairWhereClause,
      }),

      prisma.repair.groupBy({
        by: ['priority'],
        _count: true,
        where: repairWhereClause,
      }),

      prisma.repair.findMany({
        where: {
          status: 'PENDING',
          ...(isAdmin
            ? {}
            : {
                specialists: {
                  some: {
                    specialistId,
                  },
                },
              }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          specialists: {
            include: {
              specialist: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 10,
      }),

      prisma.repair.findMany({
        where: {
          status: 'IN_PROGRESS',
          ...(isAdmin
            ? {}
            : {
                specialists: {
                  some: {
                    specialistId,
                  },
                },
              }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          specialists: {
            include: {
              specialist: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 10,
      }),

      prisma.repair.findMany({
        where: {
          status: 'COMPLETED',
          ...(isAdmin
            ? {}
            : {
                specialists: {
                  some: {
                    specialistId,
                  },
                },
              }),
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          specialists: {
            include: {
              specialist: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 10,
      }),
      prisma.component.findMany({
        where: { quantity: { lt: 10 } },
        select: {
          id: true,
          name: true,
          quantity: true,
          category: {
            select: { name: true },
          },
        },
        orderBy: {
          quantity: 'asc',
        },
        take: 20,
      }),

      isAdmin
        ? prisma.repairSpecialist.findMany({
            take: 10,
            orderBy: {
              assignedAt: 'desc',
            },
            include: {
              repair: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                },
              },
              specialist: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })
        : [],
    ]);

    const formattedRepairsByStatus = Object.fromEntries(
      repairsByStatus.map(item => [item.status, item._count])
    );

    const formattedRepairsByPriority = Object.fromEntries(
      repairsByPriority.map(item => [item.priority, item._count])
    );

    return NextResponse.json({
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      counts: {
        assignedRepairs,
        repairsByStatus: formattedRepairsByStatus,
        repairsByPriority: formattedRepairsByPriority,
      },
      repairs: {
        pending: pendingRepairs,
        inProgress: inProgressRepairs,
        completed: completedRepairs,
      },
      inventory: {
        lowStockComponents,
      },
      ...(isAdmin && {
        administration: {
          recentAssignments: recentRepairAssignments,
        },
      }),
      isAdmin,
    });
  } catch (error) {
    console.error('Error fetching specialist dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
