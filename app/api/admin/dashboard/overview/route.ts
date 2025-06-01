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
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); 
    
    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(); 
    
    const [
      totalUsers,
      totalComponents,
      totalPeripherals,
      totalConfigurations,
      totalOrders,
      totalRepairs,
      lowStockComponents,
      pendingRepairs,
      pendingOrders,
      recentOrders,
      usersByRole,
      productCounts,
      productRevenue,
      orderStatuses,
      repairStatuses
    ] = await Promise.all([
      prisma.user.count(),
      
      prisma.component.count(),
      
      prisma.peripheral.count(),
      
      prisma.configuration.count(),
      
      prisma.order.count(),
      
      prisma.repair.count(),
      prisma.component.findMany({
        where: { quantity: { lt: 10 } },
        select: {
          id: true,
          name: true,
          quantity: true,
          category: {
            select: { name: true }
          }
        }
      }),
      
      prisma.repair.count({
        where: { status: 'PENDING' }
      }),
      
      prisma.order.count({
        where: { status: 'PENDING' }
      }),
      
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          configuration: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      
      prisma.$queryRaw`
        SELECT 'component' as type, c.name as category, COUNT(*) as count
        FROM component comp
        JOIN componentcategory c ON comp.categoryId = c.id
        GROUP BY c.name
        UNION
        SELECT 'peripheral' as type, p.name as category, COUNT(*) as count
        FROM peripheral per
        JOIN peripheralcategory p ON per.categoryId = p.id
        GROUP BY p.name
      `,
      
      prisma.$queryRaw`
        SELECT
          SUM(CASE WHEN oi.productType = 'COMPONENT' THEN oi.price * oi.quantity ELSE 0 END) as componentRevenue,
          SUM(CASE WHEN oi.productType = 'PERIPHERAL' THEN oi.price * oi.quantity ELSE 0 END) as peripheralRevenue,
          SUM(CASE WHEN oi.productType = 'CONFIGURATION' THEN oi.price * oi.quantity ELSE 0 END) as configurationRevenue
        FROM orderitem oi
        JOIN \`order\` o ON oi.orderId = o.id
        WHERE o.createdAt BETWEEN ${startDate} AND ${endDate}
      `,
      
      prisma.order.groupBy({
        by: ['status'],
        _count: true,
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      prisma.repair.groupBy({
        by: ['status'],
        _count: true,
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    ]);      
    const formattedUsersByRole = Object.fromEntries(
      usersByRole.map(item => [item.role, item._count])
    );
    
    const formattedOrderStatuses = Object.fromEntries(
      orderStatuses.map(item => [item.status, item._count])
    );
    
    const formattedRepairStatuses = Object.fromEntries(
      repairStatuses.map(item => [item.status, item._count])
    );
    
    interface ProductRevenue {
      componentRevenue: number;
      peripheralRevenue: number;
      configurationRevenue: number;
    }

    const revenueData = (productRevenue as unknown as ProductRevenue[])[0] || {
      componentRevenue: 0,
      peripheralRevenue: 0,
      configurationRevenue: 0
    };

    return NextResponse.json({
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      counts: {
        users: totalUsers,
        components: totalComponents,
        peripherals: totalPeripherals,
        configurations: totalConfigurations,
        orders: totalOrders,
        repairs: totalRepairs
      },
      alerts: {
        lowStockComponents,
        pendingRepairsCount: pendingRepairs,
        pendingOrdersCount: pendingOrders
      },
      recentActivity: {
        orders: recentOrders
      },      analytics: {
        usersByRole: formattedUsersByRole,
        productsByCategory: productCounts,
        revenue: revenueData,
        ordersByStatus: formattedOrderStatuses,
        repairsByStatus: formattedRepairStatuses
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
