import { prisma } from '@/lib/prismaService'
import { RepairStatus, RepairPriority } from '@prisma/client'

export interface RepairUpdateData {
  status?: RepairStatus;
  priority?: RepairPriority;
  diagnosticNotes?: string;
  estimatedCost?: number;
  finalCost?: number;
  completionDate?: Date;
}

export interface RepairCompletionData {
  finalCost: number;
  description: string;
  imageUrl?: string;
  partsUsed?: {
    componentId: string;
    quantity: number;
    price: number;
  }[];
}

/**
 * Get all repairs with filters
 */
export async function getRepairs(filters?: {
  status?: RepairStatus;
  priority?: RepairPriority;
  specialistId?: string;
  userId?: string;
  dateRange?: { start: Date; end: Date };
}) {
  try {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.specialistId) {
      where.specialists = {
        some: { specialistId: filters.specialistId }
      };
    }
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }

    const repairs = await prisma.repair.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        specialists: {
          include: {
            specialist: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        parts: {
          include: {
            component: true
          }
        },
        peripheral: true,
        configuration: true
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return repairs;
  } catch (error) {
    console.error('Error fetching repairs:', error);
    throw error;
  }
}

/**
 * Get repair by ID
 */
export async function getRepairById(repairId: string) {
  try {
    const repair = await prisma.repair.findUnique({
      where: { id: repairId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        specialists: {
          include: {
            specialist: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        parts: {
          include: {
            component: true
          }
        },
        peripheral: true,
        configuration: true
      }
    });

    return repair;
  } catch (error) {
    console.error('Error fetching repair:', error);
    throw error;
  }
}

/**
 * Update repair status and details
 */
export async function updateRepair(repairId: string, data: RepairUpdateData) {
  try {
    const repair = await prisma.repair.update({
      where: { id: repairId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return repair;
  } catch (error) {
    console.error('Error updating repair:', error);
    throw error;
  }
}

/**
 * Complete repair and notify customer
 */
export async function completeRepair(repairId: string, data: RepairCompletionData) {
  try {
    const repair = await prisma.$transaction(async (tx) => {
      // Update repair status
      const updatedRepair = await tx.repair.update({
        where: { id: repairId },
        data: {
          status: 'COMPLETED',
          finalCost: data.finalCost,
          completionDate: new Date(),
          diagnosticNotes: data.description
        },
        include: {
          user: true
        }
      });

      // Add parts used
      if (data.partsUsed && data.partsUsed.length > 0) {
        await tx.repairPart.createMany({
          data: data.partsUsed.map(part => ({
            repairId,
            componentId: part.componentId,
            quantity: part.quantity,
            price: part.price
          }))
        });

        // Update component stock
        for (const part of data.partsUsed) {
          await tx.component.update({
            where: { id: part.componentId },
            data: {
              stock: {
                decrement: part.quantity
              }
            }
          });
        }
      }

      return updatedRepair;
    });

    // Send email notification
    await sendRepairCompletionEmail(repair.user.email!, {
      repairId: repair.id,
      description: data.description,
      finalCost: data.finalCost,
      imageUrl: data.imageUrl
    });

    return repair;
  } catch (error) {
    console.error('Error completing repair:', error);
    throw error;
  }
}

/**
 * Assign specialist to repair
 */
export async function assignSpecialist(repairId: string, specialistId: string, notes?: string) {
  try {
    const assignment = await prisma.repairSpecialist.create({
      data: {
        repairId,
        specialistId,
        notes
      }
    });

    return assignment;
  } catch (error) {
    console.error('Error assigning specialist:', error);
    throw error;
  }
}

// Email notification function (placeholder)
async function sendRepairCompletionEmail(email: string, data: any) {
  // Implement email sending logic
  console.log(`Sending repair completion email to ${email}`, data);
}