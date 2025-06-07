import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { authenticate } from '@/lib/middleware/authMiddleware';
import { sendOrderApprovalReceipt } from '@/lib/mail/orderEmail';
import {
  createUnauthorizedResponse,
  createServerErrorResponse,
  createBadRequestResponse,
  createNotFoundResponse,
} from '@/lib/apiErrors';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    // Check if user is admin or specialist
    if (authResult.role !== 'ADMIN' && authResult.role !== 'SPECIALIST') {
      return createUnauthorizedResponse('Insufficient permissions');
    }
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return createNotFoundResponse('Order not found');
    }

    // Transform the order data for admin view
    const transformedOrder = {
      id: order.id,
      userId: order.userId,
      userName: order.user?.name || order.shippingName || 'Guest',
      userEmail: order.user?.email || order.shippingEmail || 'N/A',
      status: order.status,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        productType: item.productType,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    return createServerErrorResponse('Failed to fetch order');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    // Check if user is admin or specialist
    if (authResult.role !== 'ADMIN' && authResult.role !== 'SPECIALIST') {
      return createUnauthorizedResponse('Insufficient permissions');
    }

    const body = await request.json();
    const validationResult = updateOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return createBadRequestResponse(
        'Invalid order data',
        validationResult.error.format()
      );
    }

    const { status } = validationResult.data;

    // Get the current order to check previous status
    const currentOrder = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!currentOrder) {
      return createNotFoundResponse('Order not found');
    }

    const previousStatus = currentOrder.status;

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    // If status changed to PROCESSING, send approval email
    if (status === 'PROCESSING' && previousStatus !== 'PROCESSING') {
      try {
        const orderLocale = currentOrder?.locale || 'en';
        await sendOrderApprovalReceipt(params.id, orderLocale);
        console.log(`Order approval email sent for order ${params.id}`);
      } catch (emailError) {
        console.error('Error sending order approval email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    // Log the status change
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'ORDER',
        entityId: params.id,
        details: JSON.stringify({
          previousStatus,
          newStatus: status,
          updatedBy: authResult.email,
          timestamp: new Date(),
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || '',
        user: { connect: { id: authResult.userId } },
      },
    });

    return NextResponse.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      updatedAt: updatedOrder.updatedAt.toISOString(),
      message: 'Order status updated successfully',
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return createServerErrorResponse('Failed to update order status');
  }
}
