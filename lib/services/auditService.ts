import { prisma } from '@/lib/prismaService'

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  dateRange?: { start: Date; end: Date };
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId || '',
        details: JSON.stringify(data.details || {}),
        ipAddress: data.ipAddress || '',
        userAgent: data.userAgent || ''
      }
    });
    
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters?: AuditFilters, pagination?: { page: number; limit: number }) {
  try {
    const where: any = {};
    
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }
    
    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination ? (pagination.page - 1) * pagination.limit : 0,
        take: pagination?.limit || 100
      }),
      prisma.auditLog.count({ where })
    ]);
    
    const formattedLogs = logs.map(log => ({
      id: log.id,
      userId: log.userId,
      userName: log.user?.name || 'System',
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      details: JSON.parse(log.details as string),
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt
    }));
    
    return {
      logs: formattedLogs,
      total,
      page: pagination?.page || 1,
      totalPages: Math.ceil(total / (pagination?.limit || 100))
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}

/**
 * Get audit log statistics
 */
export async function getAuditStatistics(dateRange: { start: Date; end: Date }) {
  try {
    const [
      actionCounts,
      entityTypeCounts,
      userActivityCounts
    ] = await prisma.$transaction([      prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _count: true,
        orderBy: {
          _count: {
            action: 'desc'
          }
        }
      }),
      prisma.auditLog.groupBy({
        by: ['entityType'],
        where: {
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _count: true,
        orderBy: {
          _count: {
            entityType: 'desc'
          }
        }
      }),
      prisma.auditLog.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _count: true,
        orderBy: {
          _count: {
            userId: 'desc'
          }
        },
        take: 10
      })
    ]);
    
    const userIds = userActivityCounts.map(item => item.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true }
    });
    
    const userMap = new Map(users.map(user => [user.id, user.name]));
    
    return {
      actionCounts: actionCounts.map(item => ({
        action: item.action,
        count: item._count
      })),
      entityTypeCounts: entityTypeCounts.map(item => ({
        entityType: item.entityType,
        count: item._count
      })),
      topActiveUsers: userActivityCounts.map(item => ({
        userId: item.userId,
        userName: userMap.get(item.userId) || 'Unknown User',
        count: item._count
      }))
    };
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    throw error;
  }
}

/**
 * Export audit logs
 */
export async function exportAuditLogs(filters?: AuditFilters, format: 'csv' | 'json' = 'json') {
  try {
    const logs = await getAuditLogs(filters);
    
    if (format === 'json') {
      return JSON.stringify(logs.logs, null, 2);
    } else {
      const headers = ['ID', 'User ID', 'User Name', 'Action', 'Entity Type', 'Entity ID', 'Details', 'IP Address', 'Date'];
      const csvRows = [headers.join(',')];
      
      logs.logs.forEach(log => {
        const row = [
          log.id,
          log.userId,
          log.userName || '',
          log.action,
          log.entityType,
          log.entityId || '',
          JSON.stringify(log.details || {}),
          log.ipAddress || '',
          log.createdAt.toISOString()
        ];
        csvRows.push(row.map(value => `"${value}"`).join(','));
      });
      
      return csvRows.join('\n');
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    throw error;
  }
}

/**
 * Helper function to log actions with context
 */
export async function logAction(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>,
  request?: { ip?: string; headers?: any }
) {
  try {
    const ipAddress = request?.ip;
    const userAgent = request?.headers?.['user-agent'];
    
    await createAuditLog({
      userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
}