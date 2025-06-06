import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '4', 10);
    const period = searchParams.get('period') || 'all';
    const sortBy = searchParams.get('sortBy') || 'viewCount';

    const periodDate = new Date();
    if (period === 'day') {
      periodDate.setDate(periodDate.getDate() - 1);
    } else if (period === 'week') {
      periodDate.setDate(periodDate.getDate() - 7);
    } else if (period === 'month') {
      periodDate.setMonth(periodDate.getMonth() - 1);
    } else if (period === 'year') {
      periodDate.setFullYear(periodDate.getFullYear() - 1);
    }

    const whereCondition = {
      isTemplate: true,
      isPublic: true,
    };

    const popularConfigurations = await prisma.configuration.findMany({
      where: whereCondition,
      orderBy:
        sortBy === 'viewCount'
          ? [{ viewCount: 'desc' }, { createdAt: 'desc' }]
          : [{ createdAt: 'desc' }],
      take: limit,
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (popularConfigurations.length === 0) {
      const allConfigurations = await prisma.configuration.findMany({
        where: {
          isPublic: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

      const formattedAllConfigs = allConfigurations.map(config => ({
        id: config.id,
        name: config.name,
        description: config.description || '',
        price: config.totalPrice,
        imageUrl: config.imageUrl,
        viewCount: config.viewCount || 0,
        orderCount: config._count.orders,
        isPopular: true,
      }));

      return NextResponse.json(formattedAllConfigs);
    }

    const formattedConfigs = popularConfigurations.map(config => ({
      id: config.id,
      name: config.name,
      description: config.description || '',
      price: config.totalPrice,
      imageUrl: config.imageUrl,
      viewCount: config.viewCount || 0,
      orderCount: config._count.orders,
      isPopular: true,
    }));

    return NextResponse.json(formattedConfigs);
  } catch (error) {
    console.error('Error fetching popular configurations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular configurations' },
      { status: 500 }
    );
  }
}
