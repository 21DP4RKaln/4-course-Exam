import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching order details for: ${orderId}`);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: `Order not found: ${orderId}` },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        shippingEmail: order.shippingEmail,
        shippingName: order.shippingName,
        totalAmount: order.totalAmount,
        shippingCost: order.shippingCost,
        discount: order.discount,
        createdAt: order.createdAt,
        userId: order.userId,
        user: order.user
          ? {
              id: order.user.id,
              firstName: order.user.firstName,
              lastName: order.user.lastName,
              email: order.user.email,
            }
          : null,
        orderItemsCount: order.orderItems.length,
        orderItems: order.orderItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          productType: item.productType,
        })),
      },
    });
  } catch (error: any) {
    console.error('Order details error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
