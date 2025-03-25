'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Component {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  price: number;
}

interface Configuration {
  id: string;
  name: string;
  totalPrice: number;
  components: Component[];
  isPublic: boolean;
  status: string;
  createdAt: string;
}

export default function SpecialistReadyConfigManagement() {
  const t = useTranslations('readyConfigs');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/specialist/ready-configs', {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push(`/${locale}/login`);
          return;
        }
        throw new Error(t('errors.fetchFailed'));
      }
      
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error('Configurations fetch error:', error);
      setError(t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <div className="flex space-x-4">
          <Link
            href={`/${locale}/specialist-dashboard`}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            {t('back')}
          </Link>
          <Link
            href={`/${locale}/specialist/ready-configs/new`}
            className="px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
          >
            {t('addConfig')}
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configs.length > 0 ? (
          configs.map((config) => (
            <div 
              key={config.id} 
              className="bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">{config.name}</h2>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-2xl font-bold text-[#E63946]">€{config.totalPrice.toFixed(2)}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    config.status === 'approved' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {config.status === 'approved' ? t('statusApproved') : t('statusPending')}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">{t('components')}</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {config.components.map((component) => (
                    <div 
                      key={component.id} 
                      className="text-sm flex justify-between"
                    >
                      <span className="text-white">{component.name}</span>
                      <span className="text-gray-400">€{component.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    {t('createdAt')}: {new Date(config.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Link
                    href={`/${locale}/specialist/ready-configs/${config.id}`}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white text-center rounded-md hover:bg-gray-600 transition-colors"
                  >
                    {t('edit')}
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-3 bg-[#2A2A2A] rounded-lg p-8 text-center">
            <p className="text-gray-400">{t('noConfigs')}</p>
            <Link 
              href={`/${locale}/specialist/ready-configs/new`}
              className="inline-block mt-4 text-[#E63946] hover:text-[#FF4D5A]"
            >
              {t('addConfig')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}