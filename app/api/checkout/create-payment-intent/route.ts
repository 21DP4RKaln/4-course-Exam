import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createServerErrorResponse } from '@/lib/apiErrors'

// Initialize Stripe with fallback handling for missing API key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    // Verify Stripe is properly initialized
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing Stripe Secret Key in environment variables');
      return createServerErrorResponse('Payment service configuration error');
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