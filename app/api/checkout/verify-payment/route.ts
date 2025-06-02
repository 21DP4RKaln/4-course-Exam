import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prismaService'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent')

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    if (paymentIntent.status === 'succeeded' && paymentIntent.metadata?.orderId) {
      await prisma.order.update({
        where: { id: paymentIntent.metadata.orderId },
        data: { 
          status: 'PROCESSING',
          updatedAt: new Date()
        }
      })
    }
    
    return NextResponse.json({
      status: paymentIntent.status,
      orderId: paymentIntent.metadata?.orderId
    })
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
