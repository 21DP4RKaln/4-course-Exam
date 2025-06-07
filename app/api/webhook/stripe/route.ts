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

          if (order && order.shippingEmail) {
            const { sendOrderReceipt } = require('@/lib/orderEmail');
            const orderLocale = order?.locale || 'en';
            const emailSent = await sendOrderReceipt(orderId, orderLocale);
            console.log(
              `Order receipt email sent for order: ${orderId}, result: ${emailSent}`
            );
          } else {
            console.log(`No shipping email found for order: ${orderId}`);
          }
        } catch (emailError) {
          console.error('Error sending order receipt email:', emailError);
          if (
            typeof emailError === 'object' &&
            emailError !== null &&
            'stack' in emailError
          ) {
            console.error(
              'Email error stack:',
              (emailError as { stack?: unknown }).stack
            );
          }
        }

        // Skip audit log creation to avoid database dependency issues with system user
        console.log(
          `Webhook processed for order: ${orderId}, skipping audit log`
        );
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

          console.log(`Order ${orderId} cancelled due to session expiry`);
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

          console.log(`Order ${orderId} cancelled due to payment failure`);
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
        }

        console.log(`Payment intent processed for order: ${orderId}`);
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
