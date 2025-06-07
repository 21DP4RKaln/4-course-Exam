import { NextRequest, NextResponse } from 'next/server';
import { sendOrderReceipt } from '@/lib/mail/orderEmail';

export async function POST(request: NextRequest) {
  try {
    const { orderId, locale = 'lv' } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    console.log(
      `Testing email send for order: ${orderId} with locale: ${locale}`
    ); // Add detailed logging
    console.log('Starting email send process...');

    let emailSent = false;
    let emailError = null;

    try {
      emailSent = await sendOrderReceipt(orderId, locale);
    } catch (error: any) {
      emailError = error;
      console.error('Error in sendOrderReceipt:', error);
    }

    console.log('Email send result:', emailSent);

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent ? 'Email sent successfully' : 'Email sending failed',
      orderId,
      locale,
      timestamp: new Date().toISOString(),
      emailError: emailError
        ? {
            message: emailError.message,
            stack: emailError.stack,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Test email error:', error);
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
