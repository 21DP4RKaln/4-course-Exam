import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createServerErrorResponse } from '@/lib/apiErrors'

// Don't initialize Stripe during build time
// Instead, initialize it lazily when the API route is actually called
let stripe: Stripe | null = null;

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe only when this function is called at runtime
    if (!stripe) {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
      if (!stripeSecretKey) {
        console.error('Missing Stripe Secret Key in environment variables');
        return createServerErrorResponse('Payment service configuration error');
      }
      stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-04-30.basil',
      });
    }

    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    const { amount, currency = 'eur' } = await request.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Stripe payment intent error:', error)
    return createServerErrorResponse('Failed to create payment intent')
  }
}