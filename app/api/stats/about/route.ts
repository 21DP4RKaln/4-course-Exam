import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { createServerErrorResponse } from '@/lib/apiErrors';

let cachedStats: any = null;
let cacheTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    if (cachedStats && now - cacheTime < CACHE_DURATION) {
      return NextResponse.json(cachedStats);
    }

    const [configurationsCount, customersCount, ordersCount, oldestUser] =
      await Promise.all([
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
            createdAt: true,
          },
        }),
      ]);

    let yearsInBusiness = 1;
    if (oldestUser) {
      const startYear = oldestUser.createdAt.getFullYear();
      const currentYear = new Date().getFullYear();
      yearsInBusiness = currentYear - startYear;
      if (yearsInBusiness < 1) yearsInBusiness = 1;
    }
    const formatNumber = (num: number): string => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    cachedStats = {
      computersBuilt: formatNumber(configurationsCount),
      customers: formatNumber(customersCount),
      completedOrders: formatNumber(ordersCount),
      yearsInBusiness,
    };

    cacheTime = now;

    return NextResponse.json(cachedStats);
  } catch (error) {
    console.error('Error retrieving statistics:', error);

    return NextResponse.json(
      {
        computersBuilt: '1,000+',
        customers: '2,500+',
        completedOrders: '3,000+',
        yearsInBusiness: 5,
      },
      { status: 200 }
    );
  }
}
