import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prismaService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    console.log('Webhook received:', {
      hasSignature: !!signature,
      bodyLength: body.length,
      timestamp: new Date().toISOString(),
    });

    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor
      ? forwardedFor.split(',')[0]
      : request.headers.get('x-real-ip');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('Webhook event verified:', event.type);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.error('No orderId found in session metadata');
          return NextResponse.json(
            { error: 'No orderId found in session metadata' },
            { status: 400 }
          );
        }
        console.log(
          `Processing checkout.session.completed for order: ${orderId}`
        );

        // Update order status to PROCESSING
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PROCESSING',
            updatedAt: new Date(),
          },
        });

        console.log(`Order ${orderId} status updated to PROCESSING`);

        // Send order receipt email
        try {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              orderItems: true,
              user: true,
            },
          });

          if (order) {
            const { sendOrderReceipt } = require('@/lib/orderEmail');
            const orderLocale = order?.locale || 'en';
            await sendOrderReceipt(orderId, orderLocale);
            console.log(`Order receipt email sent for order: ${orderId}`);
          }
        } catch (emailError) {
          console.error('Error sending order receipt email:', emailError);
        } // Create audit log
        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            entityType: 'ORDER',
            entityId: orderId,
            details: JSON.stringify({
              event: event.type,
              sessionId: session.id,
              amount: session.amount_total,
              status: 'PROCESSING',
              clearCart: true,
              emailSent: true,
            }),
            ipAddress: clientIp || '',
            userAgent: request.headers.get('user-agent') || '',
            user: { connect: { id: 'system' } },
          },
        });

        console.log(`Audit log created for order: ${orderId}`);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'CANCELLED',
              updatedAt: new Date(),
            },
          });

          await prisma.auditLog.create({
            data: {
              action: 'UPDATE',
              entityType: 'ORDER',
              entityId: orderId,
              details: JSON.stringify({
                event: event.type,
                sessionId: session.id,
              }),
              ipAddress: clientIp || '',
              userAgent: request.headers.get('user-agent') || '',
              user: { connect: { id: 'system' } },
            },
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'CANCELLED',
              updatedAt: new Date(),
            },
          });

          await prisma.auditLog.create({
            data: {
              action: 'UPDATE',
              entityType: 'ORDER',
              entityId: orderId,
              details: JSON.stringify({
                event: event.type,
                paymentIntentId: paymentIntent.id,
                error: paymentIntent.last_payment_error?.message,
              }),
              ipAddress: clientIp || '',
              userAgent: request.headers.get('user-agent') || '',
              user: { connect: { id: 'system' } },
            },
          });
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (!orderId) {
          console.error('No orderId found in payment intent metadata');
          return NextResponse.json(
            { error: 'No orderId found in payment intent metadata' },
            { status: 400 }
          );
        }

        console.log(
          `Processing payment_intent.succeeded for order: ${orderId}`
        );

        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PROCESSING',
            updatedAt: new Date(),
          },
        });

        console.log(
          `Order ${orderId} status updated to PROCESSING via payment intent`
        );

        // Send order receipt email
        try {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              orderItems: true,
              user: true,
            },
          });

          if (order) {
            const { sendOrderReceipt } = require('@/lib/orderEmail');
            const orderLocale = order?.locale || 'en';
            await sendOrderReceipt(orderId, orderLocale);
            console.log(
              `Order receipt email sent for payment intent: ${orderId}`
            );
          }
        } catch (emailError) {
          console.error(
            'Error sending order receipt email from payment intent:',
            emailError
          );
        } // Create audit log
        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            entityType: 'ORDER',
            entityId: orderId,
            details: JSON.stringify({
              event: 'payment_intent.succeeded',
              amount: paymentIntent.amount,
              paymentIntentId: paymentIntent.id,
              status: 'PROCESSING',
              emailSent: true,
            }),
            ipAddress: clientIp || '',
            userAgent: request.headers.get('user-agent') || '',
            user: { connect: { id: 'system' } },
          },
        });

        console.log(`Payment intent audit log created for order: ${orderId}`);
        break;
      }
    }
    console.log(`Webhook processed successfully: ${event.type}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
