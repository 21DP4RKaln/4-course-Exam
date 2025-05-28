'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import './stripe-form.css'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripePaymentFormProps {
  clientSecret: string
  returnUrl: string
  onSuccess: () => void
  onError: (error: Error) => void
  billingDetails?: {
    name?: string
    email?: string
  }
}

function PaymentForm({ clientSecret, returnUrl, onSuccess, onError, billingDetails }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      console.error('Stripe.js has not loaded yet. Please try again later.');
      setError('Payment system not available. Please try again later.');
      return;
    }

    setIsProcessing(true)
    setError(null)

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: billingDetails,
          },
        },
        redirect: 'if_required',
      })

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed');
      } else if (
        result.paymentIntent &&
        (result.paymentIntent.status === 'succeeded' || result.paymentIntent.status === 'processing')
      ) {
        onSuccess();
      } else if (result.paymentIntent && result.paymentIntent.next_action) {
        console.log('Redirecting for additional authentication...');
      } else {
        throw new Error('Payment not completed. Please try again.');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An unexpected error occurred');
      onError(err instanceof Error ? err : new Error(err.message || 'Payment failed'));
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 stripe-form">
      <PaymentElement 
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          defaultValues: {
            billingDetails
          }
        }}
      />
      
      {error && (
        <div className="text-red-600 dark:text-red-400 flex items-center">
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <Loader2 size={18} className="animate-spin mr-2" />
            {t('checkout.processing')}
          </div>
        ) : (
          t('checkout.payNow')
        )}
      </button>
    </form>
  )
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  // The Elements provider is now handled by the parent component,
  // so we just return the PaymentForm directly
  return <PaymentForm {...props} />;
}
