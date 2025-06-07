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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate') as string)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));

    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate') as string)
      : new Date();

    const reportType = searchParams.get('type') || 'summary';

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalSales = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const completedOrders = orders.filter(
      order => order.status === 'COMPLETED'
    ).length;
    const pendingOrders = orders.filter(
      order => order.status === 'PENDING'
    ).length;
    const processingOrders = orders.filter(
      order => order.status === 'PROCESSING'
    ).length;
    const cancelledOrders = orders.filter(
      order => order.status === 'CANCELLED'
    ).length;

    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    const dailySales: Record<string, { count: number; revenue: number }> = {};

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];

      if (!dailySales[dateKey]) {
        dailySales[dateKey] = { count: 0, revenue: 0 };
      }

      dailySales[dateKey].count += 1;
      dailySales[dateKey].revenue += order.totalAmount;
    }

    const salesByDate = Object.entries(dailySales)
      .map(([date, data]) => ({
        date,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    let responseData;

    switch (reportType) {
      case 'summary':
        responseData = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalSales,
          totalRevenue,
          averageOrderValue,
          orderStatus: {
            completed: completedOrders,
            pending: pendingOrders,
            processing: processingOrders,
            cancelled: cancelledOrders,
          },
          salesByDate,
        };
        break;

      case 'detailed':
        const productPerformance: Record<
          string,
          {
            name: string;
            quantity: number;
            revenue: number;
          }
        > = {};

        orders.forEach(order => {
          order.orderItems.forEach(item => {
            if (!productPerformance[item.productId]) {
              productPerformance[item.productId] = {
                name: item.name,
                quantity: 0,
                revenue: 0,
              };
            }

            productPerformance[item.productId].quantity += item.quantity;
            productPerformance[item.productId].revenue +=
              item.price * item.quantity;
          });
        });

        const topProducts = Object.entries(productPerformance)
          .map(([id, data]) => ({
            id,
            ...data,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

        responseData = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalSales,
          totalRevenue,
          averageOrderValue,
          orderStatus: {
            completed: completedOrders,
            pending: pendingOrders,
            processing: processingOrders,
            cancelled: cancelledOrders,
          },
          salesByDate,
          topProducts,
          orders: orders.map(order => ({
            id: order.id,
            date: order.createdAt,
            customer: order.user
              ? {
                  id: order.user.id,
                  name: order.user.name,
                  email: order.user.email,
                }
              : null,
            amount: order.totalAmount,
            status: order.status,
            itemCount: order.orderItems.length,
          })),
        };
        break;

      case 'export':
        const csvRows = [
          [
            'Order ID',
            'Date',
            'Customer Name',
            'Customer Email',
            'Status',
            'Total Amount',
            'Items',
          ].join(','),

          ...orders.map(order =>
            [
              order.id,
              order.createdAt.toISOString(),
              order.user?.name || 'Unknown',
              order.user?.email || 'Unknown',
              order.status,
              order.totalAmount.toFixed(2),
              order.orderItems.length,
            ].join(',')
          ),
        ];

        const csvContent = csvRows.join('\n');

        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="financial-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv"`,
          },
        });

      default:
        responseData = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalSales,
          totalRevenue,
        };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error generating financial report:', error);
    return createServerErrorResponse('Failed to generate financial report');
  }
}

export async function POST(request: NextRequest) {
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

    const {
      startDate,
      endDate,
      reportType = 'summary',
      filters = {},
    } = await request.json();

    const startDateTime = startDate
      ? new Date(startDate)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDateTime = endDate ? new Date(endDate) : new Date();

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const whereClause: any = {
      createdAt: {
        gte: startDateTime,
        lte: endDateTime,
      },
    };

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.minAmount) {
      whereClause.totalAmount = {
        ...whereClause.totalAmount,
        gte: parseFloat(filters.minAmount),
      };
    }

    if (filters.maxAmount) {
      whereClause.totalAmount = {
        ...whereClause.totalAmount,
        lte: parseFloat(filters.maxAmount),
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const averageOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0;

    const salesByStatus = {
      COMPLETED: orders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + o.totalAmount, 0),
      PENDING: orders
        .filter(o => o.status === 'PENDING')
        .reduce((sum, o) => sum + o.totalAmount, 0),
      PROCESSING: orders
        .filter(o => o.status === 'PROCESSING')
        .reduce((sum, o) => sum + o.totalAmount, 0),
      CANCELLED: orders
        .filter(o => o.status === 'CANCELLED')
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };

    let reportData;

    switch (reportType) {
      case 'monthly':
        const monthlySales: Record<string, number> = {};

        orders.forEach(order => {
          const month = order.createdAt.toISOString().substring(0, 7); // YYYY-MM format
          monthlySales[month] = (monthlySales[month] || 0) + order.totalAmount;
        });

        reportData = {
          reportType: 'monthly',
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          totalOrders: orders.length,
          totalRevenue,
          averageOrderValue,
          salesByStatus,
          salesByMonth: Object.entries(monthlySales)
            .map(([month, amount]) => ({
              month,
              amount,
            }))
            .sort((a, b) => a.month.localeCompare(b.month)),
        };
        break;

      case 'product':
        const productSales: Record<
          string,
          {
            id: string;
            name: string;
            quantity: number;
            revenue: number;
          }
        > = {};

        orders.forEach(order => {
          order.orderItems.forEach(item => {
            if (!productSales[item.productId]) {
              productSales[item.productId] = {
                id: item.productId,
                name: item.name,
                quantity: 0,
                revenue: 0,
              };
            }

            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.price * item.quantity;
          });
        });

        reportData = {
          reportType: 'product',
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          totalOrders: orders.length,
          totalRevenue,
          productPerformance: Object.values(productSales).sort(
            (a, b) => b.revenue - a.revenue
          ),
        };
        break;

      default:
        reportData = {
          reportType: 'summary',
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          totalOrders: orders.length,
          totalRevenue,
          averageOrderValue,
          salesByStatus,
          orderCounts: {
            COMPLETED: orders.filter(o => o.status === 'COMPLETED').length,
            PENDING: orders.filter(o => o.status === 'PENDING').length,
            PROCESSING: orders.filter(o => o.status === 'PROCESSING').length,
            CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
          },
        };
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating custom financial report:', error);
    return createServerErrorResponse('Failed to generate financial report');
  }
}
