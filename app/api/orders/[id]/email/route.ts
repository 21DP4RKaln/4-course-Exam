import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/authMiddleware';
import {
  createServerErrorResponse,
  createBadRequestResponse,
  createNotFoundResponse,
} from '@/lib/apiErrors';
import { prisma } from '@/lib/prismaService';
import { sendOrderReceipt } from '@/lib/mail/orderEmail';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { role: true },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SPECIALIST')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: orderId } = params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return createNotFoundResponse(`Order with ID ${orderId} not found`);
    }

    const emailSent = await sendOrderReceipt(orderId);

    if (!emailSent) {
      return createServerErrorResponse(
        'Failed to send order confirmation email'
      );
    }

    await prisma.auditLog.create({
      data: {
        action: 'EMAIL_SENT',
        entityType: 'ORDER',
        entityId: orderId,
        details: JSON.stringify({
          type: 'order_confirmation',
          recipient: order.shippingEmail,
          sentAt: new Date(),
          sentBy: authResult.userId,
        }),
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          '',
        userAgent: request.headers.get('user-agent') || '',
        userId: authResult.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Order confirmation email sent successfully',
    });
  } catch (error) {
    console.error('Error sending order email:', error);
    return createServerErrorResponse('Failed to send order email');
  }
}
