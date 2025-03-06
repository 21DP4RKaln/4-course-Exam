'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function Dashboard() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push(`/${locale}/login`);
            return;
          }
          throw new Error(t('errors.fetchFailed'));
        }
        
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError(t('errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [router, t, locale]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push(`/${locale}/login`);
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
              <h1 className="text-2xl font-bold text-white">{userData?.name || t('unnamed')}</h1>
              <p className="text-gray-400">{userData?.email}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link 
              href={`/${locale}/profile`}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              {t('editProfile')}
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

      <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">{t('welcomeMessage')}</h2>
        <p className="text-gray-300 mb-4">{t('accountCreated')} {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : ''}</p>
        
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1E1E1E] p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">{t('myComputers')}</h3>
              <p className="text-gray-400">{t('noComputers')}</p>
              <Link 
                href={`/${locale}/configurator`}
                className="mt-2 inline-block text-[#E63946] hover:text-[#FF4D5A]"
              >
                {t('createComputer')}
              </Link>
            </div>
            
            <div className="bg-[#1E1E1E] p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">{t('accountSettings')}</h3>
              <Link 
                href={`/${locale}/profile`}
                className="mt-2 inline-block text-[#E63946] hover:text-[#FF4D5A]"
              >
                {t('editProfile')}
              </Link>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">{t('recentActivity')}</h3>
            <p className="text-gray-400">{t('noActivity')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}