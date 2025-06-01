import { NextRequest, NextResponse } from 'next/server'
import { createServerErrorResponse } from '@/lib/apiErrors'
import { prisma } from '@/lib/prismaService'
import { authenticateAdmin } from '@/lib/middleware/authMiddleware'

/**
 * GET - Fetch sales analytics data for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
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

    const [
      orders,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      productMap
    ] = await prisma.$transaction(async (tx) => {
      const orderData = await tx.order.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end
          },
          status: {
            in: ['COMPLETED', 'PROCESSING']
          }
        },
        include: {
          orderItems: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      const totalRev = orderData.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalCount = orderData.length;
      const avgValue = totalCount > 0 ? totalRev / totalCount : 0;
      
      const products = new Map();
      
      orderData.forEach(order => {
        order.orderItems.forEach(item => {
          const key = item.productId;
          const currentProduct = products.get(key) || {
            id: item.productId,
            name: item.name,
            quantity: 0,
            revenue: 0,
            type: item.productType
          };
          
          currentProduct.quantity += item.quantity;
          currentProduct.revenue += (item.price * item.quantity);
          
          products.set(key, currentProduct);
        });
      });
      
      return [orderData, totalRev, totalCount, avgValue, products];
    });

    let salesData = [];
    
    if (period === 'day') {
      const hourlyMap = new Map();
      
      orders.forEach(order => {
        const hour = order.createdAt.getHours();
        const hourKey = `${hour}:00`;
        
        const currentTotal = hourlyMap.get(hourKey)?.total || 0;
        const currentCount = hourlyMap.get(hourKey)?.count || 0;
        
        hourlyMap.set(hourKey, {
          date: hourKey,
          total: currentTotal + order.totalAmount,
          count: currentCount + 1
        });
      });
      
      for (let i = 0; i < 24; i++) {
        const hourKey = `${i}:00`;
        if (!hourlyMap.has(hourKey)) {
          hourlyMap.set(hourKey, {
            date: hourKey,
            total: 0,
            count: 0
          });
        }
      }
      
      salesData = Array.from(hourlyMap.values())
        .sort((a, b) => {
          const hourA = parseInt(a.date.split(':')[0]);
          const hourB = parseInt(b.date.split(':')[0]);
          return hourA - hourB;
        });
    } else if (period === 'week' || period === 'month') {
      const dailyMap = new Map();
      
      orders.forEach(order => {
        const day = order.createdAt.toISOString().split('T')[0];
        
        const currentTotal = dailyMap.get(day)?.total || 0;
        const currentCount = dailyMap.get(day)?.count || 0;
        
        dailyMap.set(day, {
          date: day,
          total: currentTotal + order.totalAmount,
          count: currentCount + 1
        });
      });
      
      // Ensure all days in range are represented
      const dayIterator = new Date(start);
      while (dayIterator <= end) {
        const dayKey = dayIterator.toISOString().split('T')[0];
        if (!dailyMap.has(dayKey)) {
          dailyMap.set(dayKey, {
            date: dayKey,
            total: 0,
            count: 0
          });
        }
        dayIterator.setDate(dayIterator.getDate() + 1);
      }
      
      salesData = Array.from(dailyMap.values())
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Add 7-day rolling average if week view
      if (period === 'week') {
        salesData = salesData.map((day, index, array) => {
          // Calculate rolling average
          let rollingTotal = 0;
          let rollingCount = 0;
          
          for (let i = Math.max(0, index - 6); i <= index; i++) {
            rollingTotal += array[i].total;
            rollingCount += array[i].count;
          }
          
          return {
            ...day,
            rollingAverage: rollingTotal / Math.min(index + 1, 7)
          };
        });
      }
    } else {
      // Group by month for year view
      const monthlyMap = new Map();
      
      orders.forEach(order => {
        const month = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
        
        const currentTotal = monthlyMap.get(month)?.total || 0;
        const currentCount = monthlyMap.get(month)?.count || 0;
        
        monthlyMap.set(month, {
          date: month,
          total: currentTotal + order.totalAmount,
          count: currentCount + 1
        });
      });
      
      // Ensure all months in range are represented
      let monthIterator = new Date(start);
      while (monthIterator <= end) {
        const monthKey = monthIterator.toISOString().substring(0, 7);
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            date: monthKey,
            total: 0,
            count: 0
          });
        }
        monthIterator.setMonth(monthIterator.getMonth() + 1);
      }
      
      salesData = Array.from(monthlyMap.values())
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    // Get top selling products
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Format response data
    return NextResponse.json({
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      salesData,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue
      },
      topProducts
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    return createServerErrorResponse('Failed to fetch sales analytics data');
  }
}