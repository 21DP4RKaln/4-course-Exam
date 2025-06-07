import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prismaService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && session.metadata?.orderId) {
      const forwardedFor = request.headers.get('x-forwarded-for');
      const clientIp = forwardedFor
        ? forwardedFor.split(',')[0]
        : request.headers.get('x-real-ip');

      const order = await prisma.order.update({
        where: { id: session.metadata.orderId },
        data: {
          status: 'PROCESSING',
          updatedAt: new Date(),
        },
      });

      // Skip audit log creation to avoid database dependency issues
      console.log(
        `Session verified for order: ${order.id}, skipping audit log`
      );
    }

    return NextResponse.json({
      status: session.payment_status,
      orderId: session.metadata?.orderId,
    });
  } catch (error: any) {
    console.error('Error verifying session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
