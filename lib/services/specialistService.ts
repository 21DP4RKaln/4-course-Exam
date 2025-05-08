import { prisma } from '@/lib/prismaService'

export interface SpecialistTask {
  id: string;
  type: 'REPAIR' | 'CONFIGURATION_REVIEW';
  title: string;
  priority: string;
  status: string;
  assignedAt: Date;
  dueDate?: Date;
}

/**
 * Get tasks assigned to specialist
 */
export async function getSpecialistTasks(specialistId: string): Promise<SpecialistTask[]> {
  try {
    const [repairs, configurations] = await prisma.$transaction([
      // Get assigned repairs
      prisma.repair.findMany({
        where: {
          specialists: {
            some: {
              specialistId: specialistId
            }
          },
          status: {
            in: ['PENDING', 'DIAGNOSING', 'IN_PROGRESS']
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      }),
      // Get configurations pending review
      prisma.configuration.findMany({
        where: {
          status: 'SUBMITTED',
          isTemplate: false
        },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    const tasks: SpecialistTask[] = [
      ...repairs.map(repair => ({
        id: repair.id,
        type: 'REPAIR' as const,
        title: repair.title,
        priority: repair.priority,
        status: repair.status,
        assignedAt: repair.createdAt,
        dueDate: repair.updatedAt
      })),
      ...configurations.map(config => ({
        id: config.id,
        type: 'CONFIGURATION_REVIEW' as const,
        title: config.name,
        priority: 'NORMAL',
        status: config.status,
        assignedAt: config.createdAt
      }))
    ];

    return tasks;
  } catch (error) {
    console.error('Error fetching specialist tasks:', error);
    throw error;
  }
}

/**
 * Get specialist performance metrics
 */
export async function getSpecialistMetrics(specialistId: string, dateRange?: { start: Date; end: Date }) {
  try {
    const whereClause = dateRange ? {
      AND: [
        { createdAt: { gte: dateRange.start } },
        { createdAt: { lte: dateRange.end } }
      ]
    } : {};

    const metrics = await prisma.$transaction([
      // Repairs completed
      prisma.repair.count({
        where: {
          specialists: {
            some: { specialistId }
          },
          status: 'COMPLETED',
          ...whereClause
        }
      }),
      // Average repair time
      prisma.repair.findMany({
        where: {
          specialists: {
            some: { specialistId }
          },
          status: 'COMPLETED',
          completionDate: { not: null },
          ...whereClause
        },
        select: {
          createdAt: true,
          completionDate: true
        }
      }),
      // Configurations reviewed
      prisma.configuration.count({
        where: {
          status: { in: ['APPROVED', 'REJECTED'] },
          updatedAt: whereClause.AND ? { gte: dateRange!.start, lte: dateRange!.end } : undefined
        }
      })
    ]);

    // Calculate average repair time
    const avgRepairTime = metrics[1].length > 0
      ? metrics[1].reduce((acc, repair) => {
          const duration = repair.completionDate!.getTime() - repair.createdAt.getTime();
          return acc + duration;
        }, 0) / metrics[1].length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      repairsCompleted: metrics[0],
      averageRepairTime: Math.round(avgRepairTime * 10) / 10, // Round to 1 decimal
      configurationsReviewed: metrics[2]
    };
  } catch (error) {
    console.error('Error fetching specialist metrics:', error);
    throw error;
  }
}