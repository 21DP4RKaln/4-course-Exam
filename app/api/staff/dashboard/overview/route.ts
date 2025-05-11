import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt';
import { createUnauthorizedResponse, createForbiddenResponse } from '@/lib/apiErrors';

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
    
    // Get date range parameters (default to last 30 days)
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(); // Today
    
    const isAdmin = payload.role === 'ADMIN';
    
    // Build repair query based on role
    const repairWhereClause = isAdmin
      ? {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      : {
          specialists: {
            some: {
              specialistId
            }
          },
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        };
    
    // Get counts and data for the specialist dashboard
    const [
      assignedRepairs,
      repairsByStatus,
      repairsByPriority,
      pendingRepairs,
      inProgressRepairs,
      completedRepairs,
      lowStockComponents,
      recentRepairAssignments
    ] = await Promise.all([
      // Total repairs assigned to this specialist
      isAdmin
        ? prisma.repair.count()
        : prisma.repair.count({
            where: {
              specialists: {
                some: {
                  specialistId
                }
              }
            }
          }),
      
      // Repairs by status
      prisma.repair.groupBy({
        by: ['status'],
        _count: true,
        where: repairWhereClause
      }),
      
      // Repairs by priority
      prisma.repair.groupBy({
        by: ['priority'],
        _count: true,
        where: repairWhereClause
      }),
      
      // Pending repairs
      prisma.repair.findMany({
        where: {
          status: 'PENDING',
          ...(isAdmin ? {} : {
            specialists: {
              some: {
                specialistId
              }
            }
          })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          specialists: {
            include: {
              specialist: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        take: 10
      }),
      
      // In-progress repairs
      prisma.repair.findMany({
        where: {
          status: 'IN_PROGRESS',
          ...(isAdmin ? {} : {
            specialists: {
              some: {
                specialistId
              }
            }
          })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          specialists: {
            include: {
              specialist: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        take: 10
      }),
      
      // Recently completed repairs
      prisma.repair.findMany({
        where: {
          status: 'COMPLETED',
          ...(isAdmin ? {} : {
            specialists: {
              some: {
                specialistId
              }
            }
          }),
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          specialists: {
            include: {
              specialist: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 10
      }),
      
      // Low stock components
      prisma.component.findMany({
        where: { stock: { lt: 10 } },
        select: {
          id: true,
          name: true,
          stock: true,
          category: {
            select: { name: true }
          }
        },
        orderBy: {
          stock: 'asc'
        },
        take: 20
      }),
      
      // Recent repair assignments (for admin view)
      isAdmin ? prisma.repairSpecialist.findMany({
        take: 10,
        orderBy: {
          assignedAt: 'desc'
        },
        include: {
          repair: {
            select: {
              id: true,
              title: true,
              status: true
            }
          },
          specialist: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }) : []
    ]);
    
    // Format response data
    const formattedRepairsByStatus = Object.fromEntries(
      repairsByStatus.map(item => [item.status, item._count])
    );
    
    const formattedRepairsByPriority = Object.fromEntries(
      repairsByPriority.map(item => [item.priority, item._count])
    );

    return NextResponse.json({
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      counts: {
        assignedRepairs,
        repairsByStatus: formattedRepairsByStatus,
        repairsByPriority: formattedRepairsByPriority
      },
      repairs: {
        pending: pendingRepairs,
        inProgress: inProgressRepairs,
        completed: completedRepairs
      },
      inventory: {
        lowStockComponents
      },
      ...(isAdmin && { administration: {
        recentAssignments: recentRepairAssignments
      }}),
      isAdmin
    });
  } catch (error) {
    console.error('Error fetching specialist dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
