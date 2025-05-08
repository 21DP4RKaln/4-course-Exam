import { prisma } from '@/lib/prismaService'
import { ConfigStatus } from '@prisma/client'

export interface ConfigurationFilters {
  status?: ConfigStatus;
  userId?: string;
  isTemplate?: boolean;
  isPublic?: boolean;
  dateRange?: { start: Date; end: Date };
}

/**
 * Get configurations with filters
 */
export async function getConfigurations(filters?: ConfigurationFilters) {
  try {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.isTemplate !== undefined) where.isTemplate = filters.isTemplate;
    if (filters?.isPublic !== undefined) where.isPublic = filters.isPublic;
    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }

    const configurations = await prisma.configuration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        components: {
          include: {
            component: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return configurations;
  } catch (error) {
    console.error('Error fetching configurations:', error);
    throw error;
  }
}

/**
 * Review configuration (approve/reject)
 */
export async function reviewConfiguration(
  configId: string,
  action: 'APPROVED' | 'REJECTED',
  comment?: string
) {
  try {
    const configuration = await prisma.configuration.update({
      where: { id: configId },
      data: {
        status: action,
        description: comment ? 
          `${configuration.description}\n\nReview comment: ${comment}` : 
          configuration.description
      }
    });

    return configuration;
  } catch (error) {
    console.error('Error reviewing configuration:', error);
    throw error;
  }
}

/**
 * Publish configuration to shop
 */
export async function publishConfiguration(
  configId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    imageUrl?: string;
  }
) {
  try {
    const configuration = await prisma.configuration.update({
      where: { id: configId },
      data: {
        ...data,
        isTemplate: true,
        isPublic: true,
        status: 'APPROVED'
      }
    });

    return configuration;
  } catch (error) {
    console.error('Error publishing configuration:', error);
    throw error;
  }
}

/**
 * Create custom configuration
 */
export async function createCustomConfiguration(
  userId: string,
  data: {
    name: string;
    description?: string;
    components: {
      componentId: string;
      quantity: number;
    }[];
  }
) {
  try {
    // Calculate total price
    const componentIds = data.components.map(c => c.componentId);
    const components = await prisma.component.findMany({
      where: { id: { in: componentIds } }
    });

    const totalPrice = data.components.reduce((total, item) => {
      const component = components.find(c => c.id === item.componentId);
      return total + (component?.price || 0) * item.quantity;
    }, 0);

    const configuration = await prisma.configuration.create({
      data: {
        name: data.name,
        description: data.description,
        totalPrice,
        userId,
        status: 'DRAFT',
        components: {
          create: data.components.map(item => ({
            componentId: item.componentId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        components: {
          include: {
            component: true
          }
        }
      }
    });

    return configuration;
  } catch (error) {
    console.error('Error creating configuration:', error);
    throw error;
  }
}

/**
 * Update configuration
 */
export async function updateConfiguration(
  configId: string,
  data: {
    name?: string;
    description?: string;
    components?: {
      componentId: string;
      quantity: number;
    }[];
  }
) {
  try {
    // If components are updated, recalculate price
    let totalPrice: number | undefined;
    
    if (data.components) {
      const componentIds = data.components.map(c => c.componentId);
      const components = await prisma.component.findMany({
        where: { id: { in: componentIds } }
      });

      totalPrice = data.components.reduce((total, item) => {
        const component = components.find(c => c.id === item.componentId);
        return total + (component?.price || 0) * item.quantity;
      }, 0);
    }

    const configuration = await prisma.configuration.update({
      where: { id: configId },
      data: {
        name: data.name,
        description: data.description,
        totalPrice: totalPrice,
        updatedAt: new Date()
      }
    });

    // Update components if provided
    if (data.components) {
      // Delete existing components
      await prisma.configItem.deleteMany({
        where: { configurationId: configId }
      });

      // Create new components
      await prisma.configItem.createMany({
        data: data.components.map(item => ({
          configurationId: configId,
          componentId: item.componentId,
          quantity: item.quantity
        }))
      });
    }

    return configuration;
  } catch (error) {
    console.error('Error updating configuration:', error);
    throw error;
  }
}