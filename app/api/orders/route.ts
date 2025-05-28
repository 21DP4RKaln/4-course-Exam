import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/authMiddleware'
import { prisma } from '@/lib/prismaService'
import { createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { z } from 'zod'
import { OrderStatus, ProductType } from '@prisma/client'
import Stripe from 'stripe'

const createOrderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number()
  })),
  shippingAddress: z.object({
    fullName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string()
  }),
  paymentMethod: z.enum(['card', 'cash']),
  shippingMethod: z.string(),
  promoCode: z.string().optional(),
  subtotal: z.number(),
  discount: z.number(),
  shippingCost: z.number(),
  taxAmount: z.number(),
  total: z.number()
})

export async function POST(request: NextRequest) {
  try {
    // Try to authenticate, but proceed with guest checkout if not authenticated
    const authResult = await authenticate(request);
    const userData = authResult instanceof Response ? null : authResult;
    const isGuest = !userData;

    // Validate request body
    const body = await request.json();
    const validationResult = createOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return createBadRequestResponse('Invalid order data', validationResult.error.format());
    }

    const {
      items,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      promoCode,
      subtotal,
      discount,
      shippingCost,
      taxAmount,
      total,
    } = validationResult.data;

    // Verify that items exist and are in stock
    for (const item of items) {
      if (item.type.toUpperCase() === 'COMPONENT' || item.type.toUpperCase() === 'PERIPHERAL') {
        const component = await prisma.component.findUnique({
          where: { id: item.id }
        });
        
        if (!component) {
          return createBadRequestResponse(`Product with ID ${item.id} not found`);
        }

        if (component.stock < item.quantity) {
          return createBadRequestResponse(`Insufficient stock for ${item.name}`);
        }
      } else if (item.type.toUpperCase() === 'CONFIGURATION') {
        const config = await prisma.configuration.findUnique({
          where: { id: item.id }
        });

        if (!config) {
          return createBadRequestResponse(`Configuration with ID ${item.id} not found`);
        }
      }
    }

    // Create order with proper types
    const order = await prisma.order.create({
      data: {
        totalAmount: total,
        status: OrderStatus.PENDING,
        shippingAddress: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.country}, ${shippingAddress.postalCode}`,
        shippingEmail: shippingAddress.email,
        shippingPhone: shippingAddress.phone,
        shippingName: shippingAddress.fullName,
        paymentMethod: paymentMethod.toUpperCase(),
        shippingMethod: shippingMethod.toUpperCase(),
        isGuestOrder: isGuest,
        userId: userData?.userId || null,
        orderItems: {
          create: items.map((item) => ({
            productId: item.id,
            productType: item.type.toUpperCase() as ProductType,
            quantity: item.quantity,
            price: item.price,
            name: item.name
          }))
        }
      }
    });

    // Update stock for components and peripherals
    for (const item of items) {
      if (item.type.toUpperCase() === 'COMPONENT' || item.type.toUpperCase() === 'PERIPHERAL') {
        await prisma.component.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }
    }    // For all orders, return the order ID
    return NextResponse.json({ 
      id: order.id,
      paymentMethod: 'cash'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return createServerErrorResponse('Failed to create order');
  }
}

/**
 * GET - Get all orders for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    // Parse pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    // Fetch orders with pagination
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: { userId: authResult.userId },
        include: { 
          orderItems: true 
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({
        where: { userId: authResult.userId }
      })
    ]);
    
    // Format the response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      items: order.orderItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        productType: item.productType
      }))
    }));
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return createServerErrorResponse('Failed to fetch orders');
  }
}

/**
 * PATCH - Update an order (cancel it)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    
    // Validate request body
    const body = await request.json();
    if (!body.id) {
      return createBadRequestResponse('Order ID is required');
    }
    
    if (!body.action) {
      return createBadRequestResponse('Action is required');
    }
    
    if (body.action !== 'cancel') {
      return createBadRequestResponse('Invalid action. Only "cancel" is supported');
    }
    
    // Check if the order exists and belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: body.id,
        userId: authResult.userId
      },
      include: {
        orderItems: true
      }
    });
    
    if (!order) {
      return createBadRequestResponse('Order not found or does not belong to the user');
    }
    
    // Check if the order can be cancelled (only PENDING orders can be cancelled)
    if (order.status !== 'PENDING') {
      return createBadRequestResponse('Only pending orders can be cancelled');
    }
    
    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });
      
      // Restore stock for component items
      for (const item of order.orderItems) {
        if (item.productType === 'COMPONENT' || item.productType === 'PERIPHERAL') {
          await tx.component.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
        }
      }
      
      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: authResult.userId,
          action: 'CANCEL',
          entityType: 'ORDER',
          entityId: order.id,
          details: JSON.stringify({
            reason: body.reason || 'User cancelled',
            previousStatus: order.status
          }),
          ipAddress: request.headers.get('x-forwarded-for') || '',
          userAgent: request.headers.get('user-agent') || ''
        }
      });
    });
    
    return NextResponse.json({
      id: order.id,
      status: 'CANCELLED',
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return createServerErrorResponse('Failed to update order');
  }
}