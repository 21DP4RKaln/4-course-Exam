'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Configuration {
  id: string;
  name: string;
  totalPrice: number;
  status: string;
  isPublic: boolean;
  userId: string;
  user: {
    name: string;
    surname: string;
  };
}

export default function SpecialistDashboard() {
  const t = useTranslations('specialist');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [pendingConfigs, setPendingConfigs] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            router.push(`/${locale}/login`);
            return;
          }
          throw new Error(t('errors.fetchFailed'));
        }
        
        const data = await response.json();
        
        if (!['SPECIALIST', 'ADMIN'].includes(data.role)) {
          router.push(`/${locale}/dashboard`);
          return;
        }
        
        setUserData(data);
      } catch (error) {
        console.error('Profile data fetch error:', error);
        setError(t('errors.fetchFailed'));
      }
    };
    
    const fetchPendingConfigurations = async () => {
      try {
        const response = await fetch('/api/specialist/pending-configs', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(t('errors.fetchPendingFailed'));
        }
        
        const data = await response.json();
        setPendingConfigs(data);
      } catch (error) {
        console.error('Pending configurations fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    fetchPendingConfigurations();
  }, [router, t, locale]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      router.push(`/${locale}/login`);
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="mt-4 px-4 py-2 bg-[#E63946] text-white rounded-md"
        >
          {t('backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-[#E63946] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {userData?.name ? userData.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('welcomeMessage')}, {userData?.name || ''}</h1>
              <p className="text-gray-400">{t('specialistPanel')}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link 
              href={`/${locale}/profile`}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              {t('profile')}
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('pendingConfigurations')}</h2>
            
            {pendingConfigs.length > 0 ? (
              <div className="space-y-4">
                {pendingConfigs.map((config) => (
                  <div 
                    key={config.id} 
                    className="bg-[#1E1E1E] p-4 rounded-lg"
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="text-lg font-medium text-white">{config.name}</h3>
                      <span className="text-white font-semibold">€{config.totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-400">
                        {t('createdBy')}: {config.user.name} {config.user.surname}
                      </p>
                      <p className="text-sm text-gray-400">
                        {t('status')}: {config.status}
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/${locale}/approve-configs/${config.id}`}
                        className="px-3 py-1 bg-[#E63946] text-white text-sm rounded hover:bg-[#FF4D5A] transition-colors"
                      >
                        {t('review')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">{t('noPendingConfigurations')}</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('quickMenu')}</h2>
            
            <div className="space-y-4">
              <Link 
                href={`/${locale}/service-orders`}
                className="block w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t('serviceOrders')}
              </Link>
              
              <Link 
                href={`/${locale}/approve-configs`}
                className="block w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t('approveConfigurations')}
              </Link>
            </div>
          </div>
          
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('statistics')}</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">{t('pendingReviews')}</span>
                <span className="text-white font-medium">{pendingConfigs.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">{t('approvedConfigurations')}</span>
                <span className="text-white font-medium">23</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">{t('activeServiceOrders')}</span>
                <span className="text-white font-medium">7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}