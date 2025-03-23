'use client';

import { useCart } from '../../contexts/CartContext';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const t = useTranslations('cart');
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleCheckout = () => {
    if (isAuthenticated) {
      router.push(`/${locale}/checkout`);
    } else {
      router.push(`/${locale}/login?redirect=checkout`);
    }
  };
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-8">{t('title')}</h1>
          <div className="bg-[#2A2A2A] rounded-lg p-12 text-center">
            <h2 className="text-xl text-white mb-6">{t('emptyCart')}</h2>
            <Link 
              href={`/${locale}/ready-configs`}
              className="px-6 py-3 bg-[#E63946] text-white rounded-lg hover:bg-[#FF4D5A] transition-colors inline-block"
            >
              {t('browsePCs')}
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
            <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">{t('items')}</h2>
                <button 
                  onClick={clearCart}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  {t('clearCart')}
                </button>
              </div>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {item.type === 'ready' ? t('readyPC') : t('customPC')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-l-md"
                        >
                          -
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center bg-gray-700 text-white">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-r-md"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right w-20">
                        <p className="text-white font-medium">€{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-white mb-4">{t('summary')}</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-400">
                  <span>{t('subtotal')}</span>
                  <span className="text-white">€{totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-400">
                  <span>{t('shipping')}</span>
                  <span className="text-white">{t('free')}</span>
                </div>
                
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-medium text-white">{t('total')}</span>
                    <span className="font-bold text-[#E63946]">€{totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    className="w-full mt-6 py-3 bg-[#E63946] text-white font-medium rounded-lg hover:bg-[#FF4D5A] transition-colors"
                  >
                    {t('checkout')}
                  </button>
                  
                  <div className="mt-4 text-sm text-gray-400 text-center">
                    {!isAuthenticated && (
                      <p>{t('loginPrompt')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}