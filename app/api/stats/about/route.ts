import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { createServerErrorResponse } from '@/lib/apiErrors'

// Cache the stats for 24 hours since they don't change often
let cachedStats: any = null;
let cacheTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  try {
    // Return cached stats if available and not expired
    const now = Date.now();
    if (cachedStats && now - cacheTime < CACHE_DURATION) {
      return NextResponse.json(cachedStats);
    }
    
    // Run all database queries in parallel for efficiency
    const [configurationsCount, customersCount, ordersCount, oldestUser] = await Promise.all([
      prisma.configuration.count({
        where: {
          status: 'APPROVED',
        },
      }),
      
      prisma.user.count({
        where: {
          role: 'USER',
        },
      }),
      
      prisma.order.count({
        where: {
          status: 'COMPLETED',
        },
      }),
      
      prisma.user.findFirst({
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          createdAt: true // Only select the field we need
        }
      })
    ]);

    let yearsInBusiness = 1
    if (oldestUser) {
      const startYear = oldestUser.createdAt.getFullYear()
      const currentYear = new Date().getFullYear()
      yearsInBusiness = currentYear - startYear
      if (yearsInBusiness < 1) yearsInBusiness = 1 
    }    const formatNumber = (num: number): string => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    // Create stats object
    cachedStats = {
      computersBuilt: formatNumber(configurationsCount),
      customers: formatNumber(customersCount),
      completedOrders: formatNumber(ordersCount),
      yearsInBusiness
    };
    
    // Update cache time
    cacheTime = now;

    return NextResponse.json(cachedStats);
  } catch (error) {
    console.error('Error retrieving statistics:', error)
    
    // Provide fallback data rather than error response
    return NextResponse.json({
      computersBuilt: '1,000+',
      customers: '2,500+',
      completedOrders: '3,000+',
      yearsInBusiness: 5
    }, { status: 200 })
  }
}