import { prisma } from '@/lib/prismaService';

export interface AdminOverviewStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingOrders: number;
  systemHealth: {
    cpuUsage?: number;
    memoryUsage?: number;
    diskSpace?: number;
  };
}

/**
 * Get comprehensive admin dashboard stats
 */
export async function getAdminOverview(): Promise<AdminOverviewStats> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      totalRevenue,
      monthlyRevenue,
      pendingOrders,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({
        where: {
          orders: {
            some: {
              createdAt: {
                gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
      pendingOrders,
      systemHealth: {
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskSpace: Math.random() * 100,
      },
    };
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    throw error;
  }
}

/**
 * Manage user accounts
 */
export async function manageUser(
  userId: string,
  action: 'BLOCK' | 'UNBLOCK' | 'DELETE' | 'CHANGE_ROLE',
  data?: { role?: 'USER' | 'SPECIALIST' | 'ADMIN'; reason?: string }
) {
  try {
    switch (action) {
      case 'BLOCK':
        return await prisma.user.update({
          where: { id: userId },
          data: {
            isBlocked: true,
            blockReason: data?.reason,
          },
        });

      case 'UNBLOCK':
        return await prisma.user.update({
          where: { id: userId },
          data: {
            isBlocked: false,
            blockReason: null,
          },
        });

      case 'DELETE':
        return await prisma.user.delete({
          where: { id: userId },
        });

      case 'CHANGE_ROLE':
        if (!data?.role) throw new Error('Role is required');
        return await prisma.user.update({
          where: { id: userId },
          data: { role: data.role },
        });

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error managing user:', error);
    throw error;
  }
}

/**
 * Get system settings
 */
export async function getSystemSettings() {
  return {
    general: {
      siteName: 'IvaPro PC Configurator',
      siteUrl: 'https://ivapro.com',
      maintenanceMode: false,
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '14dprkalninskvdarbs@gmail.com',
      emailFrom: 'IvaPro <14dprkalninskvdarbs@gmail.com>',
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
    },
  };
}

/**
 * Update system settings
 */
export async function updateSystemSettings(
  category: string,
  settings: Record<string, any>
) {
  return settings;
}
