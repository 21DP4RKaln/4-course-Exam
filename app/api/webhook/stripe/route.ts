import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prismaService'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (!orderId) {
          throw new Error('No orderId found in session metadata')
        }        await prisma.order.update({
          where: { id: orderId },
          data: { 
            status: 'PROCESSING',
            updatedAt: new Date()
          }
        })

        try {         
          const order = await prisma.order.findUnique({
            where: { id: orderId }
          });
            const { sendOrderReceipt } = require('@/lib/orderEmail');
          const orderLocale = order?.locale || 'en';
          sendOrderReceipt(orderId, orderLocale).catch((err: Error) => {
            console.error('Error sending order receipt email from Stripe webhook:', err);
          });
        } catch (emailError) {
          console.error('Error importing or calling sendOrderReceipt:', emailError);
        }

        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            entityType: 'ORDER',
            entityId: orderId,
            details: JSON.stringify({
              event: event.type,
              sessionId: session.id,
              amount: session.amount_total,
              clearCart: true, 
              emailSent: true  
            }),
            ipAddress: clientIp || '',
            userAgent: request.headers.get('user-agent') || '',
            user: { connect: { id: "system" } }
          }
        })
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { 
              status: 'CANCELLED',
              updatedAt: new Date()
            }
          })

          await prisma.auditLog.create({
            data: {
              action: 'UPDATE',
              entityType: 'ORDER',
              entityId: orderId,
              details: JSON.stringify({
                event: event.type,
                sessionId: session.id
              }),
              ipAddress: clientIp || '',
              userAgent: request.headers.get('user-agent') || '',
              user: { connect: { id: "system" } }
            }
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata?.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { 
              status: 'CANCELLED',
              updatedAt: new Date()
            }
          })

          await prisma.auditLog.create({
            data: {
              action: 'UPDATE',
              entityType: 'ORDER',
              entityId: orderId,
              details: JSON.stringify({
                event: event.type,
                paymentIntentId: paymentIntent.id,
                error: paymentIntent.last_payment_error?.message
              }),
              ipAddress: clientIp || '',
              userAgent: request.headers.get('user-agent') || '',
              user: { connect: { id: "system" } }
            }
          })
        }        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId

        if (!orderId) {
          console.error('No orderId found in payment intent metadata')
          return NextResponse.json(
            { error: 'No orderId found in payment intent metadata' },
            { status: 400 }
          )
        }

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PROCESSING' }
        })

        try {
          // Get order to retrieve locale
          const order = await prisma.order.findUnique({
            where: { id: orderId }
          });
            const { sendOrderReceipt } = require('@/lib/orderEmail');
          const orderLocale = order?.locale || 'en';
          sendOrderReceipt(orderId, orderLocale).catch((err: Error) => {
            console.error('Error sending order receipt email from payment intent:', err);
          });
        } catch (emailError) {
          console.error('Error importing or calling sendOrderReceipt:', emailError);
        }

        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            entityType: 'ORDER',
            entityId: orderId,
            details: JSON.stringify({
              event: 'payment_intent.succeeded',
              amount: paymentIntent.amount,
              paymentIntentId: paymentIntent.id,
              emailSent: true  
            }),
            ipAddress: clientIp || '',
            userAgent: request.headers.get('user-agent') || '',
            user: { connect: { id: "system" } } 
          }
        })

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}