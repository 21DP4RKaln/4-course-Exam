import { prisma } from '@/lib/prismaService'

export interface UserConfiguration {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  totalPrice: number;
  createdAt: string;
  components?: ComponentItem[];
}

export interface ComponentItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UserOrder {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: string;
  paymentMethod?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  productType: string;
}

export interface UserRepair {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'DIAGNOSING' | 'WAITING_FOR_PARTS' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  estimatedCost?: number;
  finalCost?: number;
  createdAt: string;
  completionDate?: string;
  product?: {
    type: 'peripheral' | 'configuration';
    name: string;
    category?: string;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Gets all configurations for a specific user with pagination
 */
export async function getUserConfigurations(
  userId: string, 
  options: PaginationOptions = { page: 1, limit: 10 }
): Promise<PaginatedResult<UserConfiguration>> {
  try {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    
    const [configurations, total] = await prisma.$transaction([
      prisma.configuration.findMany({
        where: {
          userId: userId,
          isTemplate: false,
        },
        include: {
          components: {
            include: {
              component: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.configuration.count({
        where: {
          userId: userId,
          isTemplate: false,
        }
      })
    ]);

    const formattedConfigurations = configurations.map(config => ({
      id: config.id,
      name: config.name,
      description: config.description || undefined,
      status: config.status,
      totalPrice: config.totalPrice,
      createdAt: config.createdAt.toISOString(),
      components: config.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      })),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: formattedConfigurations,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  } catch (error) {
    console.error('Error fetching user configurations:', error);
    throw error;
  }
}

/**
 * Gets all orders for a specific user with pagination
 */
export async function getUserOrders(
  userId: string,
  options: PaginationOptions = { page: 1, limit: 10 }
): Promise<PaginatedResult<UserOrder>> {
  try {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: {
          userId: userId,
        },
        include: {
          orderItems: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: {
          userId: userId,
        }
      })
    ]);

    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      shippingAddress: order.shippingAddress || undefined,
      paymentMethod: order.paymentMethod || undefined,
      items: order.orderItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        productType: item.productType,
      })),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: formattedOrders,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}

/**
 * Gets all repairs for a specific user with pagination
 */
export async function getUserRepairs(
  userId: string,
  options: PaginationOptions = { page: 1, limit: 10 }
): Promise<PaginatedResult<UserRepair>> {
  try {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    
    const [repairs, total] = await prisma.$transaction([
      prisma.repair.findMany({
        where: {
          userId: userId,
        },
        include: {
          peripheral: {
            select: {
              name: true,
              category: {
                select: {
                  name: true,
                }
              }
            }
          },
          configuration: {
            select: {
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.repair.count({
        where: {
          userId: userId,
        }
      })
    ]);

    const formattedRepairs = repairs.map(repair => ({
      id: repair.id,
      title: repair.title,
      description: repair.description || undefined,
      status: repair.status,
      priority: repair.priority,
      estimatedCost: repair.estimatedCost || undefined,
      finalCost: repair.finalCost || undefined,
      createdAt: repair.createdAt.toISOString(),
      completionDate: repair.completionDate?.toISOString(),
      product: repair.peripheral ? {
        type: 'peripheral' as const,
        name: repair.peripheral.name,
        category: repair.peripheral.category?.name,
      } : repair.configuration ? {
        type: 'configuration' as const,
        name: repair.configuration.name,
      } : undefined,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: formattedRepairs,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  } catch (error) {
    console.error('Error fetching user repairs:', error);
    throw error;
  }
}

/**
 * Gets a specific configuration by ID
 */
export async function getConfigurationById(configId: string, userId: string): Promise<UserConfiguration | null> {
  try {
    const configuration = await prisma.configuration.findFirst({
      where: {
        id: configId,
        userId: userId,
      },
      include: {
        components: {
          include: {
            component: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!configuration) {
      return null;
    }

    return {
      id: configuration.id,
      name: configuration.name,
      description: configuration.description || undefined,
      status: configuration.status,
      totalPrice: configuration.totalPrice,
      createdAt: configuration.createdAt.toISOString(),
      components: configuration.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      })),
    };
  } catch (error) {
    console.error(`Error fetching configuration with ID ${configId}:`, error);
    throw error;
  }
}

/**
 * Gets a specific order by ID
 */
export async function getOrderById(orderId: string, userId: string): Promise<UserOrder | null> {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return null;
    }

    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      shippingAddress: order.shippingAddress || undefined,
      paymentMethod: order.paymentMethod || undefined,
      items: order.orderItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        productType: item.productType,
      })),
    };
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    throw error;
  }
}

/**
 * Gets a specific repair by ID
 */
export async function getRepairById(repairId: string, userId: string): Promise<UserRepair | null> {
  try {
    const repair = await prisma.repair.findFirst({
      where: {
        id: repairId,
        userId: userId,
      },
      include: {
        peripheral: {
          select: {
            name: true,
            category: {
              select: {
                name: true,
              }
            }
          }
        },
        configuration: {
          select: {
            name: true,
          }
        },
        parts: {
          include: {
            component: true,
          }
        },
      },
    });

    if (!repair) {
      return null;
    }

    return {
      id: repair.id,
      title: repair.title,
      description: repair.description || undefined,
      status: repair.status,
      priority: repair.priority,
      estimatedCost: repair.estimatedCost || undefined,
      finalCost: repair.finalCost || undefined,
      createdAt: repair.createdAt.toISOString(),
      completionDate: repair.completionDate?.toISOString(),
      product: repair.peripheral ? {
        type: 'peripheral' as const,
        name: repair.peripheral.name,
        category: repair.peripheral.category?.name,
      } : repair.configuration ? {
        type: 'configuration' as const,
        name: repair.configuration.name,
      } : undefined,
    };
  } catch (error) {
    console.error(`Error fetching repair with ID ${repairId}:`, error);
    throw error;
  }
}

/**
 * Create a new configuration for a user
 */
export async function createConfiguration(
  userId: string, 
  data: { 
    name: string; 
    description?: string; 
    components: { id: string; quantity: number }[] 
  }
): Promise<UserConfiguration> {
  try {
    // Use transaction for data integrity
    const result = await prisma.$transaction(async (tx) => {
      const componentIds = data.components.map(c => c.id);
      const components = await tx.component.findMany({
        where: {
          id: {
            in: componentIds
          }
        }
      });
      
      const totalPrice = data.components.reduce((total, comp) => {
        const component = components.find(c => c.id === comp.id);
        return total + (component ? component.price * comp.quantity : 0);
      }, 0);
      
      const configuration = await tx.configuration.create({
        data: {
          name: data.name,
          description: data.description,
          totalPrice,
          status: 'DRAFT',
          userId,
          components: {
            create: data.components.map(comp => ({
              quantity: comp.quantity,
              component: {
                connect: {
                  id: comp.id
                }
              }
            }))
          }
        },
        include: {
          components: {
            include: {
              component: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });
      
      return configuration;
    });
    
    return {
      id: result.id,
      name: result.name,
      description: result.description || undefined,
      status: result.status,
      totalPrice: result.totalPrice,
      createdAt: result.createdAt.toISOString(),
      components: result.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      })),
    };
  } catch (error) {
    console.error('Error creating configuration:', error);
    throw error;
  }
}

/**
 * Update an existing configuration
 */
export async function updateConfiguration(
  configId: string,
  userId: string,
  data: { 
    name?: string; 
    description?: string; 
    components?: { id: string; quantity: number }[] 
  }
): Promise<UserConfiguration> {
  try {
    // Check if configuration exists and belongs to the user
    const existingConfig = await prisma.configuration.findFirst({
      where: {
        id: configId,
        userId: userId,
      }
    });
    
    if (!existingConfig) {
      throw new Error('Configuration not found or not owned by the user');
    }
    
    // Use transaction for data integrity
    const result = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      
      // If updating components, recalculate price
      if (data.components) {
        const componentIds = data.components.map(c => c.id);
        const components = await tx.component.findMany({
          where: {
            id: {
              in: componentIds
            }
          }
        });
        
        const totalPrice = data.components.reduce((total, comp) => {
          const component = components.find(c => c.id === comp.id);
          return total + (component ? component.price * comp.quantity : 0);
        }, 0);
        
        updateData.totalPrice = totalPrice;
        
        // Remove existing components
        await tx.configItem.deleteMany({
          where: { configurationId: configId }
        });
        
        // Add new components
        for (const comp of data.components) {
          await tx.configItem.create({
            data: {
              configurationId: configId,
              componentId: comp.id,
              quantity: comp.quantity
            }
          });
        }
      }
      
      // Update configuration
      const configuration = await tx.configuration.update({
        where: { id: configId },
        data: updateData,
        include: {
          components: {
            include: {
              component: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });
      
      return configuration;
    });
    
    return {
      id: result.id,
      name: result.name,
      description: result.description || undefined,
      status: result.status,
      totalPrice: result.totalPrice,
      createdAt: result.createdAt.toISOString(),
      components: result.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      })),
    };
  } catch (error) {
    console.error('Error updating configuration:', error);
    throw error;
  }
}

/**
 * Submit configuration for review
 */
export async function submitConfiguration(configId: string, userId: string): Promise<boolean> {
  try {
    const config = await prisma.configuration.findFirst({
      where: {
        id: configId,
        userId: userId,
      },
    });

    if (!config) {
      throw new Error('Configuration not found or not owned by the user');
    }
    
    if (config.status !== 'DRAFT') {
      throw new Error('Only configurations in DRAFT status can be submitted');
    }

    await prisma.configuration.update({
      where: {
        id: configId,
      },
      data: {
        status: 'SUBMITTED',
      },
    });

    return true;
  } catch (error) {
    console.error(`Error submitting configuration ${configId}:`, error);
    throw error;
  }
}

/**
 * Delete a configuration
 */
export async function deleteConfiguration(configId: string, userId: string): Promise<boolean> {
  try {
    const config = await prisma.configuration.findFirst({
      where: {
        id: configId,
        userId: userId,
      },
    });

    if (!config) {
      throw new Error('Configuration not found or not owned by the user');
    }
    
    // Use transaction to ensure all related data is deleted
    await prisma.$transaction(async (tx) => {
      // Delete config items first
      await tx.configItem.deleteMany({
        where: { configurationId: configId }
      });
      
      // Delete configuration
      await tx.configuration.delete({
        where: { id: configId }
      });
    });

    return true;
  } catch (error) {
    console.error(`Error deleting configuration ${configId}:`, error);
    throw error;
  }
}

/**
 * Get user dashboard summary
 */
export async function getUserDashboardSummary(userId: string): Promise<{
  totalConfigurations: number;
  pendingConfigurations: number;
  totalOrders: number;
  activeOrders: number;
  totalRepairs: number;
  activeRepairs: number;
  recentActivity: Array<{
    type: 'configuration' | 'order' | 'repair';
    id: string;
    title: string;
    status: string;
    date: string;
  }>;
}> {
  try {
    const [
      totalConfigurations,
      pendingConfigurations,
      totalOrders,
      activeOrders,
      totalRepairs,
      activeRepairs,
      recentConfigurations,
      recentOrders,
      recentRepairs
    ] = await prisma.$transaction([
      // Count configurations
      prisma.configuration.count({
        where: { userId }
      }),
      
      // Count pending configurations
      prisma.configuration.count({
        where: { 
          userId,
          status: 'SUBMITTED'
        }
      }),
      
      // Count orders
      prisma.order.count({
        where: { userId }
      }),
      
      // Count active orders
      prisma.order.count({
        where: { 
          userId,
          status: { in: ['PENDING', 'PROCESSING'] }
        }
      }),
      
      // Count repairs
      prisma.repair.count({
        where: { userId }
      }),
      
      // Count active repairs
      prisma.repair.count({
        where: { 
          userId,
          status: { in: ['PENDING', 'DIAGNOSING', 'WAITING_FOR_PARTS', 'IN_PROGRESS'] }
        }
      }),
      
      // Recent configurations
      prisma.configuration.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          name: true,
          status: true,
          updatedAt: true
        }
      }),
      
      // Recent orders
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          status: true,
          createdAt: true
        }
      }),
      
      // Recent repairs
      prisma.repair.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true
        }
      })
    ]);
    
    // Combine recent activity and sort by date
    const recentActivity = [
      ...recentConfigurations.map(config => ({
        type: 'configuration' as const,
        id: config.id,
        title: config.name,
        status: config.status,
        date: config.updatedAt.toISOString()
      })),
      
      ...recentOrders.map(order => ({
        type: 'order' as const,
        id: order.id,
        title: `Order #${order.id.slice(0, 8)}`,
        status: order.status,
        date: order.createdAt.toISOString()
      })),
      
      ...recentRepairs.map(repair => ({
        type: 'repair' as const,
        id: repair.id,
        title: repair.title,
        status: repair.status,
        date: repair.updatedAt.toISOString()
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
      totalConfigurations,
      pendingConfigurations,
      totalOrders,
      activeOrders,
      totalRepairs,
      activeRepairs,
      recentActivity
    };
  } catch (error) {
    console.error('Error fetching user dashboard summary:', error);
    throw error;
  }
}