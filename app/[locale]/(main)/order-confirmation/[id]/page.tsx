'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  Mail,
} from 'lucide-react';
import Loading from '@/app/components/ui/Loading';
import {
  useLoading,
  LoadingSpinner,
  FullPageLoading,
  ButtonLoading,
} from '@/app/hooks/useLoading';
import { useCart } from '@/app/contexts/CartContext';

export default function OrderConfirmationPage() {
  // Inicializē tulkošanas un navigācijas hooks
  const t = useTranslations('orderConfirmation');
  const pathname = usePathname();
  const params = useParams();
  const locale = pathname.split('/')[1];
  const orderId = params.id as string;
  const { clearCart } = useCart();

  // State mainīgie pasūtījuma datu un ielādes pārvaldībai
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // useEffect hook pasūtījuma datu ielādei no API
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Izpilda API pieprasījumu, lai iegūtu pasūtījuma datus
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);

          clearCart();
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, clearCart]);

  // Function to manually send order confirmation email
  const sendConfirmationEmail = async () => {
    setEmailSending(true);
    try {
      const response = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();

      if (result.success) {
        setEmailSent(true);
        setOrder((prev: any) => ({ ...prev, status: 'PROCESSING' }));
        alert('E-pasts nosūtīts veiksmīgi!');
      } else {
        alert('Kļūda nosūtot e-pastu: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Kļūda nosūtot e-pastu');
    } finally {
      setEmailSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    );
  }

  // Rāda kļūdas ziņojumu, ja pasūtījums nav atrasts
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          {t('notFoundTitle')}
        </h1>
        {/* Poga atgriešanai uz dashboard */}
        <Link
          href={`/${locale}/dashboard`}
          className="px-6 py-3 bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700 inline-flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t('backToDashboard')}
        </Link>
      </div>
    );
  }

  // Galvenā pasūtījuma apstiprinājuma lapa
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-stone-950 shadow-md rounded-lg p-8 text-center">
        {/* Veiksmīgā pasūtījuma ikona */}
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
        </div>

        {/* Galvenais virsraksts */}
        <h1 className="mt-6 text-3xl font-bold text-neutral-900 dark:text-white">
          {t('successTitle')}
        </h1>

        {/* Apstiprinājuma ziņojums */}
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          {t('successMessage')}
        </p>

        {/* Pasūtījuma numura displejs */}
        <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-md inline-block">
          <p className="text-neutral-600 dark:text-neutral-400">
            {t('orderNumberLabel')}
          </p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">
            #{orderId}
          </p>
        </div>

        {/* Nākamo soļu informācijas sekcija */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* E-pasta apstiprinājuma informācija */}
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-red-900/30">
              <Mail className="h-6 w-6 text-blue-600 dark:text-red-400" />
            </div>
            <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">
              {t('confirmationEmailTitle')}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('confirmationEmailSubtitle')}
            </p>
          </div>

          {/* Pasūtījuma apstrādes informācija */}
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-red-900/30">
              <Package className="h-6 w-6 text-blue-600 dark:text-red-400" />
            </div>
            <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">
              {t('processingTitle')}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('processingSubtitle')}
            </p>
          </div>

          {/* Piegādes informācija */}
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-red-900/30">
              <Truck className="h-6 w-6 text-blue-600 dark:text-red-400" />
            </div>
            <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">
              {t('shippingTitle')}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('shippingSubtitle')}
            </p>
          </div>
        </div>

        {/* Darbību pogas */}
        <div className="mt-8 space-x-4">
          {/* Poga e-pasta nosūtīšanai, ja pasūtījums ir PENDING */}
          {order?.status === 'PENDING' && (
            <button
              onClick={sendConfirmationEmail}
              disabled={emailSending}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 inline-block mb-4"
            >
              {emailSending ? 'Nosūta...' : 'Nosūtīt apstiprinājuma e-pastu'}
            </button>
          )}

          {/* Status indikators */}
          {order?.status === 'PROCESSING' && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md inline-block">
              ✅ Pasūtījums apstrādāts un e-pasts nosūtīts
            </div>
          )}

          {emailSent && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md inline-block">
              📧 E-pasts tikko nosūtīts!
            </div>
          )}

          {/* Poga pasūtījuma detaļu skatīšanai */}
          <Link
            href={`/${locale}/orders/${orderId}`}
            className="px-6 py-3 bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700 inline-block"
          >
            {t('viewOrderDetails')}
          </Link>

          {/* Poga turpināt iepirkšanos */}
          <Link
            href={`/${locale}`}
            className="px-6 py-3 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 inline-block"
          >
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
