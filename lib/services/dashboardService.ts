import { prisma } from '@/lib/prismaService'

export interface UserConfiguration {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  totalPrice: number;
  createdAt: string;
  components?: any[];
}

export interface UserOrder {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  configurationName?: string;
  items?: any[];
}

/**
 * Gets all configurations for a specific user
 */
export async function getUserConfigurations(userId: string): Promise<UserConfiguration[]> {
  try {
    const configurations = await prisma.configuration.findMany({
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
    });

    return configurations.map(config => ({
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
  } catch (error) {
    console.error('Error fetching user configurations:', error);
    return [];
  }
}

/**
 * Gets all orders for a specific user
 */
export async function getUserOrders(userId: string): Promise<UserOrder[]> {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        configuration: {
          include: {
            components: {
              include: {
                component: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      configurationName: order.configuration?.name,
      items: order.configuration?.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        price: item.component.price,
        quantity: item.quantity,
      })) || [],
    }));
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
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
    return null;
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
        configuration: {
          include: {
            components: {
              include: {
                component: true,
              },
            },
          },
        },
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
      configurationName: order.configuration?.name,
      items: order.configuration?.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        price: item.component.price,
        quantity: item.quantity,
      })) || [],
    };
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    return null;
  }
}

/**
 * Create a new configuration
 */
export async function createConfiguration(
  userId: string, 
  data: { 
    name: string; 
    description?: string; 
    components: { id: string; quantity: number }[] 
  }
): Promise<UserConfiguration | null> {
  try {
    const componentIds = data.components.map(c => c.id);
    const components = await prisma.component.findMany({
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
    
    const configuration = await prisma.configuration.create({
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
    console.error('Error creating configuration:', error);
    return null;
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
      return false;
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
    return false;
  }
}