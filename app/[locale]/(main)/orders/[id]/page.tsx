'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/contexts/AuthContext';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import Loading from '@/app/components/ui/Loading';
import AnimatedButton from '@/app/components/ui/animated-button';

/**
 * Pasūtījuma detalizētās informācijas lapa
 * Rāda konkrēta pasūtījuma pilnu informāciju, tostarp produktus, cenas un statusu
 */
export default function OrderDetailsPage() {
  // Iegūst pasūtījuma ID no URL parametriem
  const params = useParams();
  const orderId = params.id as string;

  const router = useRouter();
  const t = useTranslations('order');
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();
  const locale = pathname.split('/')[1];

  // Komponentes lokālie stāvokļi
  const [showDetails, setShowDetails] = useState(false);
  const [order, setOrder] = useState<any>(null);

  // Pārbauda autentifikāciju un novirza uz pieteikšanās lapu, ja nepieciešams
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(
        `/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`
      );
    }
  }, [isAuthenticated, loading, router, locale, pathname]);

  // Iegūst pasūtījuma datus no API
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();

          // Uzstāda noklusējuma vērtības, ja trūkst datu
          if (data.discount === null || data.discount === undefined) {
            data.discount = 0;
          }

          if (data.shippingCost === null || data.shippingCost === undefined) {
            data.shippingCost = 10;
          }

          setOrder(data);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setOrder(null);
      }
    };

    if (isAuthenticated && !loading) {
      fetchOrderData();
    }
  }, [orderId, isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-8">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            {t('notFoundTitle')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            {t('notFoundMessage')}
          </p>
          <Link
            href={`/${locale}/dashboard?tab=orders`}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            {t('backToOrders')}
          </Link>
        </div>
      </div>
    );
  }

  /**
   * Formatē datumu atbilstoši Lielbritānijas standartam
   * @param dateString - datuma virkne ISO formātā
   * @returns formatēts datums
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  /**
   * Atgriež atbilstošo ikonu pasūtījuma statusam
   * @param status - pasūtījuma statuss
   * @returns React ikona elements
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'PROCESSING':
        return <Clock className="h-8 w-8 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-8 w-8 text-amber-500" />;
      case 'CANCELLED':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Package className="h-8 w-8 text-neutral-500" />;
    }
  };

  /**
   * Atgriež CSS klases pasūtījuma statusa krāsošanai
   * @param status - pasūtījuma statuss
   * @returns CSS klašu virkne
   */
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'PROCESSING':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-neutral-100 text-stone-950 dark:bg-neutral-900/30 dark:text-neutral-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Navigācijas poga atpakaļ uz dashboard */}
      <div className="mb-6 flex justify-start">
        <AnimatedButton
          href={`/${locale}/dashboard?tab=orders`}
          title={t('backToDashboard')}
          direction="left"
          className="text-neutral-600 dark:text-neutral-400"
        />
      </div>

      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md overflow-hidden">
        {/* Pasūtījuma galvenes informācija */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {t('title', { orderId: orderId.substring(0, 8) })}
            </h1>
            <div
              className={`px-4 py-2 rounded-md inline-flex items-center ${getStatusClass(order.status)}`}
            >
              {getStatusIcon(order.status)}
              <span className="ml-2 font-medium">{order.status}</span>
            </div>
          </div>

          {/* Pasūtījuma pamatinformācijas režģis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('orderDate')}
              </p>
              <p className="font-medium text-neutral-900 dark:text-white">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('totalAmount')}
              </p>
              <p className="font-medium text-neutral-900 dark:text-white">
                €{order.totalAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('paymentMethod')}
              </p>
              <p className="font-medium text-neutral-900 dark:text-white">
                {order.paymentMethod || 'Card'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('shippingAddress')}
              </p>
              <p className="font-medium text-neutral-900 dark:text-white truncate">
                {order.shippingAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Pasūtījuma produktu saraksts */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">
            {t('orderItems')}
          </h2>

          <div className="space-y-4">
            {/* Parasti pasūtījuma produkti */}
            {order.orderItems &&
              order.orderItems.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center border-b pb-4 border-neutral-200 dark:border-neutral-800"
                >
                  <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-md flex items-center justify-center mr-4">
                    {item.productType === 'COMPONENT' ? (
                      <Package className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
                    ) : (
                      <div className="w-8 h-8 text-neutral-500 dark:text-neutral-400">
                        {item.productType.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {item.productType.charAt(0) +
                        item.productType.slice(1).toLowerCase()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Qty: {item.quantity} × €{item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

            {/* Konfigurācijas komponenti, ja tādi ir */}
            {order.configuration &&
              order.configuration.components &&
              order.configuration.components.length > 0 && (
                <>
                  <div className="pt-2 pb-3">
                    <h3 className="font-medium text-neutral-900 dark:text-white">
                      {t('configuration')}: {order.configuration.name}
                    </h3>
                  </div>

                  {order.configuration.components.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center border-b pb-4 border-neutral-200 dark:border-neutral-800"
                    >
                      <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-md flex items-center justify-center mr-4">
                        <Package className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900 dark:text-white">
                          {item.component.name}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {t('component')}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-neutral-900 dark:text-white">
                          €{(item.component.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Qty: {item.quantity} × €
                          {item.component.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
          </div>

          {/* Pasūtījuma kopsummas aprēķini */}
          <div className="mt-8 text-right">
            <div className="space-y-2">
              {/* Aprēķina starpsummu no pasūtījuma pozīcijām */}
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t('subtotal')}:
                </span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  €
                  {(
                    (order.orderItems
                      ? order.orderItems.reduce(
                          (sum: number, item: any) =>
                            sum + item.price * item.quantity,
                          0
                        )
                      : 0) +
                    (order.configuration && order.configuration.components
                      ? order.configuration.components.reduce(
                          (sum: number, item: any) =>
                            sum + item.component.price * item.quantity,
                          0
                        )
                      : 0)
                  ).toFixed(2)}
                </span>
              </div>

              {/* Atlaižu aprēķins un attēlošana */}
              {(() => {
                const calculatedSubtotal =
                  (order.orderItems
                    ? order.orderItems.reduce(
                        (sum: number, item: any) =>
                          sum + item.price * item.quantity,
                        0
                      )
                    : 0) +
                  (order.configuration && order.configuration.components
                    ? order.configuration.components.reduce(
                        (sum: number, item: any) =>
                          sum + item.component.price * item.quantity,
                        0
                      )
                    : 0);

                const shippingCost =
                  order.shippingCost !== undefined &&
                  order.shippingCost !== null
                    ? order.shippingCost
                    : 10;

                let actualDiscount = order.discount;

                // Aprēķina atlaidi, ja tā nav norādīta, bet kopējā summa neatbilst
                if (
                  (!actualDiscount || actualDiscount === 0) &&
                  calculatedSubtotal + shippingCost - order.totalAmount > 0.01
                ) {
                  actualDiscount = parseFloat(
                    (
                      calculatedSubtotal +
                      shippingCost -
                      order.totalAmount
                    ).toFixed(2)
                  );
                }

                return actualDiscount && actualDiscount > 0 ? (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {t('discount')}:
                    </span>
                    <span>-€{actualDiscount.toFixed(2)}</span>
                  </div>
                ) : null;
              })()}

              {/* Piegādes izmaksas */}
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t('shipping')}:
                </span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  €
                  {order.shippingCost !== undefined &&
                  order.shippingCost !== null
                    ? order.shippingCost.toFixed(2)
                    : '10.00'}
                </span>
              </div>

              {/* Kopējā summa */}
              <div className="flex justify-between text-lg font-semibold border-t pt-2 border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-900 dark:text-white">
                  {t('totalLabel')}:{' '}
                </span>
                <span className="text-neutral-900 dark:text-white">
                  €{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
