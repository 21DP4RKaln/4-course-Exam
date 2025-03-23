'use client';

import { useEffect, useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  id: string;
  name: string;
  surname: string;
  email: string | null;
  phoneNumber: string | null;
}

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Form state
  const [shippingAddress, setShippingAddress] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push(`/${locale}/login?redirect=checkout`);
            return;
          }
          throw new Error(t('errors.fetchFailed'));
        }
        
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Profile data fetch error:', error);
        setError(t('errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [router, t, locale]);
  
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingAddress.trim()) {
      alert(t('errors.addressRequired'));
      return;
    }
    
    if (items.length === 0) {
      alert(t('errors.emptyCart'));
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      setOrderPlaced(true);
      clearCart();
      setIsSubmitting(false);
    }, 1500);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1A1A1A]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
          <Link
            href={`/${locale}/cart`}
            className="mt-4 inline-block px-4 py-2 bg-[#E63946] text-white rounded-md"
          >
            {t('backToCart')}
          </Link>
        </div>
      </div>
    );
  }
  
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-[#2A2A2A] rounded-lg p-8 text-center">
            <svg className="w-20 h-20 text-green-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <h1 className="text-2xl font-bold text-white mb-4">{t('orderSuccess')}</h1>
            <p className="text-gray-400 mb-6">{t('orderSuccessMessage')}</p>
            <Link
              href={`/${locale}`}
              className="inline-block px-6 py-3 bg-[#E63946] text-white rounded-lg"
            >
              {t('backToHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#1A1A1A] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">{t('title')}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">{t('personalInfo')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    {t('name')}
                  </label>
                  <p className="text-white text-lg">{userData?.name} {userData?.surname}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    {t('contact')}
                  </label>
                  <p className="text-white text-lg">{userData?.email || userData?.phoneNumber}</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handlePlaceOrder}>
              <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">{t('shippingInfo')}</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-400 mb-1">
                      {t('shippingAddress')}
                    </label>
                    <textarea
                      id="shippingAddress"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      rows={3}
                      required
                      className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                      placeholder={t('shippingAddressPlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-400 mb-1">
                      {t('additionalInfo')}
                    </label>
                    <textarea
                      id="additionalInfo"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                      placeholder={t('additionalInfoPlaceholder')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">{t('payment')}</h2>
                
                <div className="space-y-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <label className="flex items-center text-white">
                      <input
                        type="radio"
                        name="payment"
                        value="cashOnDelivery"
                        checked
                        readOnly
                        className="mr-2"
                      />
                      {t('cashOnDelivery')}
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full mt-6 py-3 bg-[#E63946] text-white font-medium rounded-lg hover:bg-[#FF4D5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('processing') : t('placeOrder')}
                </button>
              </div>
            </form>
          </div>
          
          <div>
            <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-white mb-4">{t('orderSummary')}</h2>
              
              <div className="space-y-4 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex-1">
                      <p className="text-white">{item.name}</p>
                      <p className="text-gray-400 text-sm">x{item.quantity}</p>
                    </div>
                    <p className="text-white">€{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between text-gray-400">
                  <span>{t('subtotal')}</span>
                  <span className="text-white">€{totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-400">
                  <span>{t('shipping')}</span>
                  <span className="text-white">{t('free')}</span>
                </div>
                
                <div className="flex justify-between text-lg mt-4">
                  <span className="font-medium text-white">{t('total')}</span>
                  <span className="font-bold text-[#E63946]">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <Link
                href={`/${locale}/cart`}
                className="block text-center text-[#E63946] mt-6 hover:underline"
              >
                {t('editCart')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}