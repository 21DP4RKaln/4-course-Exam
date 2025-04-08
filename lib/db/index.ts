import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// ==== PRISMA INSTANCE MANAGEMENT ====

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Singleton PrismaClient instance with connection management
 * This ensures only one instance is used across the application
 */
class PrismaService {
  private static instance: PrismaService;
  private client: PrismaClient;
  private isConnected = false;

  private constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.client = new PrismaClient({
        log: ['error'],
      });
    } else {
      if (!global.prisma) {
        global.prisma = new PrismaClient({
          log: process.env.DEBUG_PRISMA === 'true' 
            ? ['query', 'error', 'warn'] 
            : ['error'],
        });
      }
      this.client = global.prisma;
    }
  }

  /**
   * Get the PrismaService singleton instance
   */
  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  /**
   * Get the PrismaClient instance
   */
  public getClient(): PrismaClient {
    return this.client;
  }

  /**
   * Connect to the database
   */
  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.$connect();
      this.isConnected = true;
      console.log('Connected to database');
    }
  }

  /**
   * Disconnect from the database
   */
  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.$disconnect();
      this.isConnected = false;
      console.log('Disconnected from database');
    }
  }

  /**
   * Execute a transaction
   */
  public async transaction<T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.client.$transaction(async (tx) => {
      return callback(tx as unknown as PrismaClient);
    });
  }
}

const prismaService = PrismaService.getInstance();

if (process.env.NODE_ENV !== 'test') {
  prismaService.connect()
    .catch(e => {
      console.error('Failed to connect to database', e);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });
}

// Handle disconnection on process shutdown
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', () => {
    prismaService.disconnect();
  });
}

const prisma = prismaService.getClient();

// ==== AUTHENTICATION UTILITIES ====

const JWT_SECRET = process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8';

/**
 * User authentication interface
 */
export interface UserAuthInfo {
  userId: string;
  email?: string | null;
  role: string;
}

/**
 * Get user ID and role from cookie
 */
export function getUserInfoFromCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(
      token.value,
      JWT_SECRET
    ) as UserAuthInfo;
    
    return {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get the user ID if available
 */
export function getUserId(): string | null {
  const userInfo = getUserInfoFromCookie();
  return userInfo?.userId || null;
}

/**
 * Get the user role if available
 */
export function getUserRole(): string | null {
  const userInfo = getUserInfoFromCookie();
  return userInfo?.role || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getUserInfoFromCookie();
}

/**
 * Check if user has admin permissions
 */
export function isAdmin(): boolean {
  const role = getUserRole();
  return role === 'ADMIN';
}

/**
 * Check if user has specialist permissions
 */
export function isSpecialist(): boolean {
  const role = getUserRole();
  return role === 'SPECIALIST' || role === 'ADMIN';
}

// ==== DATABASE SERVICES ====

/**
 * User service - common user operations
 */
export const userService = {
  /**
   * Find user by email or phone number
   */
  async findByEmailOrPhone(email?: string, phoneNumber?: string) {
    if (!email && !phoneNumber) return null;
    
    const query: any = {};
    if (email) query.email = email;
    if (phoneNumber) query.phoneNumber = phoneNumber;
    
    return prisma.user.findFirst({ where: query });
  },
  
  /**
   * Find user by ID
   */
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  
  /**
   * Create new user
   */
  async create(data: any) {
    return prisma.user.create({ data });
  },
  
  /**
   * Update user
   */
  async update(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data
    });
  },
  
  /**
   * Change user role
   */
  async changeRole(id: string, role: string) {
    return prisma.user.update({
      where: { id },
      data: { 
        role: role as 'CLIENT' | 'SPECIALIST' | 'ADMIN'
      }
    });
  },
  
  /**
   * Get all users (admin only)
   */
  async getAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phoneNumber: true,
        role: true,
        blocked: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
};

/**
 * Component service - common component operations
 */
export const componentService = {
  /**
   * Get all components
   */
  async getAll() {
    return prisma.component.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
  },
  
  /**
   * Get available components for configurator
   */
  async getAvailable() {
    return prisma.component.findMany({
      where: {
        availabilityStatus: {
          in: ['pieejams', 'pasūtāms'] 
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  },
  
  /**
   * Find component by ID
   */
  async findById(id: string) {
    return prisma.component.findUnique({
      where: { id }
    });
  },
  
  /**
   * Create new component (admin only)
   */
  async create(data: any, addedById: string) {
    return prisma.component.create({
      data: {
        ...data,
        addedById
      }
    });
  },
  
  /**
   * Update component (admin only)
   */
  async update(id: string, data: any) {
    return prisma.component.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  },
  
  /**
   * Delete component (admin only)
   */
  async delete(id: string) {
    const configsWithComponent = await prisma.configuration.findMany({
      where: {
        components: {
          some: {
            id: id
          }
        }
      }
    });
    
    if (configsWithComponent.length > 0) {
      throw new Error('Cannot delete component as it is used in existing configurations');
    }
    
    return prisma.component.delete({
      where: { id }
    });
  }
};

/**
 * Configuration service - common configuration operations
 */
export const configurationService = {
  /**
   * Get user's configurations
   */
  async getUserConfigurations(userId: string) {
    return prisma.configuration.findMany({
      where: {
        userId
      },
      include: {
        components: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  },
  
  /**
   * Get public configurations (approved)
   */
  async getPublicConfigurations() {
    return prisma.configuration.findMany({
      where: {
        isPublic: true,
        status: 'approved'
      },
      include: {
        components: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  },
  
  /**
   * Get configuration by ID
   */
  async findById(id: string, userId?: string) {
    const query: any = { id };
    if (userId) query.userId = userId;
    
    return prisma.configuration.findUnique({
      where: query,
      include: {
        components: true
      }
    });
  },
  
  /**
   * Create new configuration
   */
  async create(data: any, userId: string) {
    const { name, components, status = 'draft', isPublic = false } = data;

    const componentDetails = await Promise.all(
      components.map((componentId: string) => prisma.component.findUnique({
        where: { id: componentId }
      }))
    );
    
    const validComponents = componentDetails.filter(c => c !== null);
    
    if (validComponents.length === 0) {
      throw new Error('No valid components provided');
    }

    const totalPrice = validComponents.reduce(
      (sum, component) => sum + Number(component!.price), 
      0
    );

    const configStatus = isPublic ? 'awaiting_approval' : status;
    
    return prisma.configuration.create({
      data: {
        name,
        userId,
        status: configStatus,
        isPublic,
        totalPrice,
        components: {
          connect: validComponents.map(component => ({ id: component!.id }))
        }
      },
      include: {
        components: true
      }
    });
  },
  
  /**
   * Update configuration
   */
  async update(id: string, data: any, userId: string) {
    const { name, components, status } = data;

    const existingConfig = await prisma.configuration.findUnique({
      where: {
        id,
        userId
      }
    });
    
    if (!existingConfig) {
      throw new Error('Configuration not found');
    }
    
    const updateData: any = {};
    
    if (name) {
      updateData.name = name;
    }
    
    if (status) {
      updateData.status = status;
    }
    
    if (components && components.length > 0) {
      const componentDetails = await Promise.all(
        components.map((componentId: string) => prisma.component.findUnique({
          where: { id: componentId }
        }))
      );
      
      const validComponents = componentDetails.filter(c => c !== null);
      
      if (validComponents.length > 0) {
        const totalPrice = validComponents.reduce(
          (sum, component) => sum + Number(component!.price), 
          0
        );
        
        updateData.totalPrice = totalPrice;
   
        return prisma.configuration.update({
          where: { id },
          data: {
            ...updateData,
            components: {
              set: [],
              connect: validComponents.map(component => ({ id: component!.id }))
            }
          },
          include: {
            components: true
          }
        });
      }
    }

    return prisma.configuration.update({
      where: { id },
      data: updateData,
      include: {
        components: true
      }
    });
  },
  
  /**
   * Delete configuration
   */
  async delete(id: string, userId: string) {
    const config = await prisma.configuration.findUnique({
      where: {
        id,
        userId
      }
    });
    
    if (!config) {
      throw new Error('Configuration not found');
    }

    const orders = await prisma.order.findMany({
      where: { configurationId: id }
    });
    
    if (orders.length > 0) {
      throw new Error('Cannot delete configuration as it is used in existing orders');
    }
    
    return prisma.configuration.delete({
      where: { id }
    });
  },
  
  /**
   * Approve configuration (admin/specialist only)
   */
  async approve(id: string, approverId: string) {
    return prisma.configuration.update({
      where: { id },
      data: {
        status: 'approved',
        approvedById: approverId,
        approvedAt: new Date()
      }
    });
  },
  
  /**
   * Reject configuration (admin/specialist only)
   */
  async reject(id: string) {
    return prisma.configuration.update({
      where: { id },
      data: {
        status: 'rejected',
        isPublic: false
      }
    });
  },
  
  /**
   * Get pending configurations (admin/specialist only)
   */
  async getPendingConfigurations() {
    return prisma.configuration.findMany({
      where: {
        status: 'awaiting_approval',
        isPublic: true,
        approvedById: null
      },
      include: {
        components: true,
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            role: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
};

/**
 * Order service - common order operations
 */
export const orderService = {
  /**
   * Get all orders for a user
   */
  async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: {
        configuration: {
          userId
        }
      },
      include: {
        configuration: {
          include: {
            components: true
          }
        },
        statusChanges: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },
  
  /**
   * Create new order
   */
  async create(configurationId: string, userId: string) {
    const configuration = await prisma.configuration.findUnique({
      where: {
        id: configurationId,
        userId
      },
      include: {
        components: true
      }
    });
    
    if (!configuration) {
      throw new Error('Configuration not found');
    }

    const orderNumber = `ORD-${Math.floor(Math.random() * 10000)}-${Date.now().toString().slice(-4)}`;
 
    return prisma.order.create({
      data: {
        orderNumber,
        configurationId,
        totalAmount: configuration.totalPrice,
        status: 'new'
      },
      include: {
        configuration: {
          include: {
            components: true
          }
        }
      }
    });
  },
  
  /**
   * Update order status
   */
  async updateStatus(id: string, newStatus: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id }
    });
    
    if (!order) {
      throw new Error('Order not found');
    }

    return prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: newStatus }
      }),
      prisma.statusChange.create({
        data: {
          orderId: id,
          oldStatus: order.status,
          newStatus,
          changedById: userId
        }
      })
    ]);
  }
};

/**
 * Service order service - repair service operations
 */
export const serviceOrderService = {
  /**
   * Get user's service orders
   */
  async getUserServiceOrders(userId: string) {
    return prisma.serviceOrder.findMany({
      where: { userId },
      include: {
        serviceComponents: {
          include: {
            component: true
          }
        },
        statusUpdates: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },
  
  /**
   * Create service order
   */
  async create(data: any, userId: string) {
    const { problemDescription, deviceType, cost } = data;
    
    return prisma.serviceOrder.create({
      data: {
        userId,
        problemDescription,
        deviceType,
        cost,
        status: 'new'
      }
    });
  },
  
  /**
   * Update service order status
   */
  async updateStatus(id: string, newStatus: string, updatedById: string) {
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id }
    });
    
    if (!serviceOrder) {
      throw new Error('Service order not found');
    }

    return prisma.$transaction([
      prisma.serviceOrder.update({
        where: { id },
        data: { status: newStatus }
      }),
      prisma.statusUpdate.create({
        data: {
          serviceOrderId: id,
          oldStatus: serviceOrder.status,
          newStatus,
          updatedById
        }
      })
    ]);
  }
};

export default prisma;

export { prismaService };