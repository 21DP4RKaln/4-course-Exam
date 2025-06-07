import { prisma } from '@/lib/prismaService';

export interface StaffDashboardStats {
  totalRepairs: number;
  pendingRepairs: number;
  completedRepairs: number;
  totalConfigurations: number;
  pendingConfigurations: number;
  approvedConfigurations: number;
  lowStockComponents: number;
  totalOrders?: number;
  totalRevenue?: number;
  activeUsers?: number;
}

/**
 * Get dashboard statistics based on user role
 */
export async function getDashboardStats(
  userId: string,
  role: 'ADMIN' | 'SPECIALIST'
): Promise<StaffDashboardStats> {
  try {
    const baseStats = await prisma.$transaction([
      prisma.repair.count(),
      prisma.repair.count({ where: { status: 'PENDING' } }),
      prisma.repair.count({ where: { status: 'COMPLETED' } }),
      prisma.configuration.count({ where: { isTemplate: false } }),
      prisma.configuration.count({
        where: { status: 'SUBMITTED', isTemplate: false },
      }),
      prisma.configuration.count({
        where: { status: 'APPROVED', isTemplate: false },
      }),
      prisma.component.count({ where: { quantity: { lt: 10 } } }),
    ]);

    const stats: StaffDashboardStats = {
      totalRepairs: baseStats[0],
      pendingRepairs: baseStats[1],
      completedRepairs: baseStats[2],
      totalConfigurations: baseStats[3],
      pendingConfigurations: baseStats[4],
      approvedConfigurations: baseStats[5],
      lowStockComponents: baseStats[6],
    };

    if (role === 'ADMIN') {
      const adminStats = await prisma.$transaction([
        prisma.order.count(),
        prisma.order.aggregate({ _sum: { totalAmount: true } }),
        prisma.user.count({ where: { role: 'USER' } }),
      ]);

      stats.totalOrders = adminStats[0];
      stats.totalRevenue = adminStats[1]._sum.totalAmount || 0;
      stats.activeUsers = adminStats[2];
    }

    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

/**
 * Get recent activity feed
 */
export async function getRecentActivity(
  role: 'ADMIN' | 'SPECIALIST',
  limit = 10
) {
  try {
    const repairs = await prisma.repair.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });

    const configurations = await prisma.configuration.findMany({
      where: { isTemplate: false },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });

    const orders =
      role === 'ADMIN'
        ? await prisma.order.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } },
          })
        : [];

    const allActivities = [
      ...repairs.map(repair => ({
        type: 'repair',
        id: repair.id,
        title: repair.title,
        status: repair.status,
        user: repair.user?.name || 'Unknown',
        createdAt: repair.createdAt,
      })),
      ...configurations.map(config => ({
        type: 'configuration',
        id: config.id,
        title: config.name,
        status: config.status,
        user: config.user?.name || 'Unknown',
        createdAt: config.createdAt,
      })),
      ...orders.map(order => ({
        type: 'order',
        id: order.id,
        title: `Order #${order.id.slice(0, 8)}`,
        status: order.status,
        user: order.user?.name || 'Unknown',
        createdAt: order.createdAt,
      })),
    ];

    return allActivities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
}
