import { prisma } from '@/lib/prismaService'

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

/**
 * Get sales analytics data
 */
export async function getSalesAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'COMPLETED'
      },
      select: {
        createdAt: true,
        totalAmount: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by date
    const salesByDate: Record<string, number> = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + order.totalAmount;
    });

    const chartData: TimeSeriesData[] = Object.entries(salesByDate).map(([date, value]) => ({
      date,
      value
    }));

    return chartData;
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    throw error;
  }
}

/**
 * Get user growth data
 */
export async function getUserGrowthAnalytics(period: 'week' | 'month' | 'year' = 'month') {
  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
        role: 'USER'
      },
      select: {
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by date
    const usersByDate: Record<string, number> = {};
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      usersByDate[date] = (usersByDate[date] || 0) + 1;
    });

    const chartData: TimeSeriesData[] = Object.entries(usersByDate).map(([date, value]) => ({
      date,
      value
    }));

    return chartData;
  } catch (error) {
    console.error('Error fetching user growth analytics:', error);
    throw error;
  }
}

/**
 * Get repair metrics
 */
export async function getRepairMetrics() {
  try {
    const repairs = await prisma.repair.groupBy({
      by: ['status'],
      _count: {
        _all: true
      }
    });

    const chartData: ChartDataPoint[] = repairs.map(item => ({
      label: item.status,
      value: item._count._all
    }));

    return chartData;
  } catch (error) {
    console.error('Error fetching repair metrics:', error);
    throw error;
  }
}

/**
 * Get revenue by category
 */
export async function getRevenueByCategoryAnalytics() {
  try {
    // First, get all completed orders
    const orders = await prisma.order.findMany({
      where: { 
        status: 'COMPLETED' 
      },
      select: {
        id: true,
        configurationId: true
      }
    });

    const revenueByCategory: Record<string, number> = {};
    
    // Process each order
    for (const order of orders) {
      // Handle configuration-based orders
      if (order.configurationId) {
        const configuration = await prisma.configuration.findUnique({
          where: { id: order.configurationId },
          include: {
            components: {
              include: {
                component: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        });

        if (configuration) {
          configuration.components.forEach(item => {
            const category = item.component.category.name;
            revenueByCategory[category] = (revenueByCategory[category] || 0) + 
              item.component.price * item.quantity;
          });
        }
      }

      // Handle individual order items
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id }
      });

      for (const item of orderItems) {
        if (item.productType === 'COMPONENT' || item.productType === 'PERIPHERAL') {
          const component = await prisma.component.findUnique({
            where: { id: item.productId },
            include: { category: true }
          });

          if (component) {
            const category = component.category.name;
            revenueByCategory[category] = (revenueByCategory[category] || 0) + 
              item.price * item.quantity;
          }
        }
      }
    }

    // Format data for chart
    const chartData: ChartDataPoint[] = Object.entries(revenueByCategory).map(([label, value]) => ({
      label,
      value
    }));

    return chartData;
  } catch (error) {
    console.error('Error fetching revenue by category:', error);
    throw error;
  }
}

/**
 * Get stock level analytics
 */
export async function getStockLevelAnalytics() {
  try {
    const components = await prisma.component.findMany({
      include: {
        category: true
      }
    });

    const stockByCategory: Record<string, { inStock: number; lowStock: number; outOfStock: number }> = {};

    components.forEach(component => {
      const category = component.category.name;
      if (!stockByCategory[category]) {
        stockByCategory[category] = { inStock: 0, lowStock: 0, outOfStock: 0 };
      }

      if (component.stock === 0) {
        stockByCategory[category].outOfStock++;
      } else if (component.stock < 10) {
        stockByCategory[category].lowStock++;
      } else {
        stockByCategory[category].inStock++;
      }
    });

    return stockByCategory;
  } catch (error) {
    console.error('Error fetching stock level analytics:', error);
    throw error;
  }
}

/**
 * Get top selling products
 */
export async function getTopSellingProducts(limit = 10) {
  try {
    const orderItems = await prisma.orderItem.groupBy({
      by: ['productId', 'productType'],
      _sum: {
        quantity: true
      },
      _count: {
        _all: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: limit
    });

    const topProducts = await Promise.all(
      orderItems.map(async (item) => {
        let name = 'Unknown Product';
        
        try {
          switch (item.productType) {
            case 'COMPONENT':
              const component = await prisma.component.findUnique({
                where: { id: item.productId },
                select: { name: true }
              });
              if (component) name = component.name;
              break;
            case 'CONFIGURATION':
              const config = await prisma.configuration.findUnique({
                where: { id: item.productId },
                select: { name: true }
              });
              if (config) name = config.name;
              break;
            case 'PERIPHERAL':
              const peripheral = await prisma.peripheral.findUnique({
                where: { id: item.productId },
                select: { name: true }
              });
              if (peripheral) name = peripheral.name;
              break;
          }
        } catch (err) {
          console.error(`Error fetching product ${item.productId}:`, err);
        }

        return {
          name,
          quantity: item._sum.quantity || 0,
          orders: item._count._all
        };
      })
    );

    return topProducts;
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    throw error;
  }
}

/**
 * Get performance overview
 */
export async function getPerformanceOverview(dateRange: { start: Date; end: Date }) {
  try {
    const [
      totalRevenue,
      totalOrders,
      averageOrderValue,
      repairStats,
      newCustomers
    ] = await prisma.$transaction([
      // Total revenue
      prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _sum: { totalAmount: true }
      }),
      // Total orders
      prisma.order.count({
        where: {
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        }
      }),
      // Average order value
      prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _avg: { totalAmount: true }
      }),
      // Repair statistics - fixed groupBy format
      prisma.repair.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _count: {
          _all: true
        }
      }),
      // New customers
      prisma.user.count({
        where: {
          role: 'USER',
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        }
      })
    ]);

    return {
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalOrders,
      averageOrderValue: averageOrderValue._avg.totalAmount || 0,
      repairStats: repairStats.map(stat => ({
        status: stat.status,
        count: stat._count._all
      })),
      newCustomers
    };
  } catch (error) {
    console.error('Error fetching performance overview:', error);
    throw error;
  }
}