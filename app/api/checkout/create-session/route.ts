import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prismaService'
import { ProductType } from '@prisma/client'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
})

interface ShippingAddress {
  address: string
  city: string
  postalCode: string
  country: string
  email: string
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  type: ProductType
  images?: string[]
}

interface CheckoutBody {
  items: OrderItem[]
  total: number
  shipping: {
    method: string
    rate: number
    address: ShippingAddress
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: token.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body: CheckoutBody = await request.json()
    const { items, total, shipping } = body

    // Transform order items to Stripe format
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          images: item.images ? [item.images[0]] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe accepts amounts in cents
      },
      quantity: item.quantity,
    }))

    // Add shipping costs if applicable
    if (shipping.rate > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Shipping (${shipping.method})`,
            images: [],
          },
          unit_amount: Math.round(shipping.rate * 100),
        },
        quantity: 1,
      })
    }

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      shipping_address_collection: {
        allowed_countries: ['LV', 'LT', 'EE'],
      },
      customer_email: shipping.address.email,
      metadata: {
        orderId: '', // Will be filled after order creation
        userId: user.id,
      },
    })

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: total,
        status: 'PENDING',
        shippingAddress: `${shipping.address.address}, ${shipping.address.city}, ${shipping.address.country}, ${shipping.address.postalCode}`,
        paymentMethod: 'CARD',
        orderItems: {
          create: items.map((item) => ({
            productId: item.id,
            productType: item.type,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
          }))
        }
      }
    })

    // Update Stripe session metadata with order ID
    await stripe.checkout.sessions.update(stripeSession.id, {
      metadata: {
        ...stripeSession.metadata,
        orderId: order.id,
      },
    })

    return NextResponse.json({
      sessionUrl: stripeSession.url,
      sessionId: stripeSession.id,
    })
  } catch (error: any) {
    console.error('Stripe session creation error:', error)
    return NextResponse.json(
      { error: error.message }, 
      { status: 400 }
    )
  }
}
