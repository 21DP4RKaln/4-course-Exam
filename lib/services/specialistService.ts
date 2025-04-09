import { prisma } from '@/lib/prismaService'

export interface PendingConfiguration {
    id: string;
    name: string;
    userId: string;
    userName: string;
    email: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    components: {
      id: string;
      category: string;
      name: string;
      price: number;
    }[];
  }
  
  /**
   * Get all pending configurations requiring specialist review
   */
  export async function getPendingConfigurations(): Promise<PendingConfiguration[]> {
    try {
      const configurations = await prisma.configuration.findMany({
        where: {
          status: 'SUBMITTED',
          isTemplate: false
        },
        include: {
          user: true,
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
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      return configurations.map(config => ({
        id: config.id,
        name: config.name,
        userId: config.userId || '',
        userName: config.user?.name || 'Anonymous',
        email: config.user?.email || '',
        status: config.status,
        totalPrice: config.totalPrice,
        createdAt: config.createdAt.toISOString(),
        components: config.components.map(item => ({
          id: item.component.id,
          category: item.component.category.name,
          name: item.component.name,
          price: item.component.price
        }))
      }));
    } catch (error) {
      console.error('Error fetching pending configurations:', error);
      return [];
    }
  }
  
  /**
   * Review a configuration (approve or reject)
   */
  export async function reviewConfiguration(
    configId: string, 
    action: 'APPROVED' | 'REJECTED', 
    comment?: string
  ): Promise<boolean> {
    try {
      const existingConfiguration = await prisma.configuration.findUnique({
        where: {
          id: configId
        }
      });

      if (!existingConfiguration) {
        throw new Error(`Configuration with ID ${configId} not found`);
      }

      const updatedDescription = comment 
        ? (existingConfiguration.description || '') + `\n\nReview comment: ${comment}` 
        : existingConfiguration.description;

      const configuration = await prisma.configuration.update({
        where: {
          id: configId
        },
        data: {
          status: action,
          description: updatedDescription
        }
      });
  
      return !!configuration;
    } catch (error) {
      console.error(`Error reviewing configuration ${configId}:`, error);
      return false;
    }
  }
  

  
  export interface OrderDetails {
    userId: string;
    configurationId?: string;
    totalAmount: number;
    shippingAddress: string;
    paymentMethod: string;
    items?: { id: string; type: string; quantity: number; price: number; name: string }[];
  }
  
  /**
   * Creates a new order
   */
  export async function createOrder(orderDetails: OrderDetails): Promise<string | null> {
    try {
      const order = await prisma.order.create({
        data: {
          userId: orderDetails.userId,
          configurationId: orderDetails.configurationId,
          totalAmount: orderDetails.totalAmount,
          shippingAddress: orderDetails.shippingAddress,
          paymentMethod: orderDetails.paymentMethod,
          status: 'PENDING'
        }
      });

      if (orderDetails.configurationId) {
        await prisma.configuration.update({
          where: {
            id: orderDetails.configurationId
          },
          data: {
            status: 'APPROVED' 
          }
        });
      }
  
      return order.id;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }