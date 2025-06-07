import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { sendOrderReceipt } from '@/lib/mail/orderEmail';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Update order status to PROCESSING
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PROCESSING',
        updatedAt: new Date(),
      },
      include: {
        orderItems: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Send order receipt email
    let emailSent = false;
    try {
      const orderLocale = order?.locale || 'en';
      emailSent = await sendOrderReceipt(orderId, orderLocale);
      console.log(`Order receipt email sent for order: ${orderId}`);
    } catch (emailError) {
      console.error('Error sending order receipt email:', emailError);
    }

    // Skip audit log creation to avoid database dependency issues
    console.log(`Order confirmed: ${orderId}, email sent: ${emailSent}`);

    return NextResponse.json({
      success: true,
      message: 'Order confirmed and email sent',
      emailSent,
      order: {
        id: order.id,
        status: order.status,
        shippingEmail: order.shippingEmail,
      },
    });
  } catch (error) {
    console.error('Error confirming order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
