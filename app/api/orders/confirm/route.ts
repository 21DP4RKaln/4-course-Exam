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

    // Send order receipt email - but don't fail if email fails
    let emailSent = false;
    let emailError = null;
    try {
      const orderLocale = order?.locale || 'en';
      emailSent = await sendOrderReceipt(orderId, orderLocale);
      console.log(
        `✅ Order receipt email sent for order: ${orderId}, result: ${emailSent}`
      );
    } catch (error) {
      emailError =
        error instanceof Error ? error.message : 'Unknown email error';
      console.error('❌ Error sending order receipt email:', error);

      // Log failed email for manual processing
      console.log('🔄 MANUAL EMAIL NEEDED:', {
        orderId,
        email: order.shippingEmail,
        customerName: order.shippingName,
        error: emailError,
        timestamp: new Date().toISOString(),
      });
    }

    // Always return success for order confirmation, regardless of email status
    console.log(
      `📋 Order confirmed: ${orderId}, email sent: ${emailSent}, email error: ${emailError || 'none'}`
    );

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Order confirmed and email sent successfully'
        : 'Order confirmed successfully - email will be processed separately',
      emailSent,
      emailError: emailSent ? null : emailError,
      order: {
        id: order.id,
        status: order.status,
        shippingEmail: order.shippingEmail,
        shippingName: order.shippingName,
      },
      // Provide user-friendly message in Latvian
      userMessage: emailSent
        ? 'Pasūtījums apstiprināts un e-pasts nosūtīts!'
        : 'Pasūtījums apstiprināts! E-pasta apstiprinājums tiks nosūtīts drīzumā.',
      // Additional info for troubleshooting
      emailStatus: emailSent ? 'sent' : 'failed',
      emailErrorMessage: emailError,
    });
  } catch (error) {
    console.error('❌ Error confirming order:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
