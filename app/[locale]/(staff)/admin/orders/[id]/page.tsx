'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import {
  ArrowLeft,
  Package,
  User,
  CreditCard,
  MapPin,
  Calendar,
  Edit,
  Printer,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
} from 'lucide-react';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

type OrderItem = {
  id: string;
  productId: string;
  productType: string;
  name: string;
  quantity: number;
  price: number;
};

type OrderDetails = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export default function AdminOrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const { user } = useAuth();
  const { theme } = useTheme();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push(`/${locale}/dashboard`);
      return;
    }
    fetchOrderDetails();
  }, [user, params.id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${params.id}`);
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };
  const updateOrderStatus = async (newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Order status updated:', result.message);

        // If status changed to PROCESSING, show a notification about approval email
        if (newStatus === 'PROCESSING') {
          console.log(
            'Order moved to processing - approval email will be sent'
          );
        }

        fetchOrderDetails();
      } else {
        const error = await response.json();
        console.error('Error updating order status:', error);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-neutral-100 text-stone-950 dark:bg-neutral-700 dark:text-neutral-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PROCESSING':
        return <Truck className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const downloadInvoice = () => {
    // Implement PDF generation
    console.log('Downloading invoice...');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark:text-neutral-400">
          Order not found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link
            href={`/${locale}/admin/orders`}
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Order #{order.id.slice(0, 8)}
          </h1>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
          >
            {getStatusIcon(order.status)}
            <span className="ml-1">{order.status}</span>
          </span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={printInvoice}
            className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-stone-950 hover:bg-neutral-50 dark:hover:bg-neutral-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button
            onClick={downloadInvoice}
            className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-stone-950 hover:bg-neutral-50 dark:hover:bg-neutral-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
          <Link
            href={`/${locale}/admin/orders/${order.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-stone-950 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                Order Items
              </h3>
            </div>
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-stone-950 divide-y divide-neutral-200 dark:divide-neutral-700">
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {item.productType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900 dark:text-white">
                        {item.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900 dark:text-white">
                        €{item.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        €{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-neutral-50 dark:bg-neutral-700">
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-right text-sm font-medium text-neutral-900 dark:text-white"
                  >
                    Total:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-neutral-900 dark:text-white">
                    €{order.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Shipping Address */}
          <div className="bg-white dark:bg-stone-950 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Shipping Address
              </h3>
            </div>
            <div className="px-6 py-4">
              <pre className="text-sm text-neutral-900 dark:text-white whitespace-pre-wrap">
                {order.shippingAddress}
              </pre>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-stone-950 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer
              </h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Name
                </p>
                <p className="text-sm text-neutral-900 dark:text-white">
                  {order.userName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Email
                </p>
                <p className="text-sm text-neutral-900 dark:text-white">
                  {order.userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-stone-950 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment
              </h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Method
                </p>
                <p className="text-sm text-neutral-900 dark:text-white">
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Amount
                </p>
                <p className="text-sm text-neutral-900 dark:text-white">
                  €{order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white dark:bg-stone-950 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Timeline
              </h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Created
                </p>
                <p className="text-sm text-neutral-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Last Updated
                </p>
                <p className="text-sm text-neutral-900 dark:text-white">
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-white dark:bg-stone-950 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                Update Status
              </h3>
            </div>
            <div className="px-6 py-4">
              <select
                value={order.status}
                onChange={e => updateOrderStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
