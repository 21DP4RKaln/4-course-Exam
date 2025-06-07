import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import {
  sendOrderReceipt,
  sendOrderApprovalReceipt,
} from '@/lib/mail/orderEmail';
import { authenticate } from '@/lib/middleware/authMiddleware';
import {
  createUnauthorizedResponse,
  createServerErrorResponse,
  createBadRequestResponse,
} from '@/lib/apiErrors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const authResult = await authenticate(request);
    if (authResult instanceof Response) {
      return authResult;
    } // Check if user is admin or specialist
    if (authResult.role !== 'ADMIN' && authResult.role !== 'SPECIALIST') {
      return createUnauthorizedResponse('Insufficient permissions');
    }

    const { emailType } = await request.json();

    if (!emailType || !['confirmation', 'approval'].includes(emailType)) {
      return createBadRequestResponse(
        'Valid emailType required (confirmation or approval)'
      );
    }

    // Get the order to check if it exists and get locale
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return createBadRequestResponse('Order not found');
    }

    const orderLocale = order?.locale || 'en';

    try {
      if (emailType === 'confirmation') {
        await sendOrderReceipt(params.id, orderLocale);
      } else if (emailType === 'approval') {
        await sendOrderApprovalReceipt(params.id, orderLocale);
      }

      // Log the manual email sending action
      await prisma.auditLog.create({
        data: {
          action: 'EMAIL_SENT',
          entityType: 'ORDER',
          entityId: params.id,
          details: JSON.stringify({
            emailType,
            locale: orderLocale,
            sentBy: authResult.email,
            manual: true,
          }),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || '',
          user: { connect: { id: authResult.userId } },
        },
      });

      return NextResponse.json({
        success: true,
        message: `${emailType} email sent successfully`,
        locale: orderLocale,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return createServerErrorResponse('Failed to send email');
    }
  } catch (error) {
    console.error('Error in send email API:', error);
    return createServerErrorResponse('Internal server error');
  }
}
