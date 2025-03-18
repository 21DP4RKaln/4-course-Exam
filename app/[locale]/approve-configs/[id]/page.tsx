'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Component {
  id: string;
  category: string;
  name: string;
  manufacturer: string;
  price: number;
  specifications: string;
}

interface Configuration {
  id: string;
  name: string;
  totalPrice: number;
  status: string;
  isPublic: boolean;
  createdAt: string;
  components: Component[];
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
}

export default function ApproveConfiguration() {
  const t = useTranslations('specialist');
  const configT = useTranslations('configurator');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'lv';
  const configId = params.id as string;
  
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        const response = await fetch(`/api/specialist/configurations/${configId}`, {
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
          throw new Error(t('errors.fetchConfigFailed'));
        }
        
        const data = await response.json();
        setConfiguration(data);
      } catch (error) {
        console.error('Configuration fetch error:', error);
        setError(t('errors.fetchConfigFailed'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfiguration();
  }, [router, t, locale, configId]);

  const handleApprove = async () => {
    setApproving(true);
    
    try {
      const response = await fetch(`/api/specialist/configurations/${configId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(t('errors.approveFailed'));
      }
      
      router.push(`/${locale}/specialist-dashboard`);
    } catch (error) {
      console.error('Configuration approval error:', error);
      setError(t('errors.approveFailed'));
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setApproving(true);
    
    try {
      const response = await fetch(`/api/specialist/configurations/${configId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(t('errors.rejectFailed'));
      }
      
      router.push(`/${locale}/specialist-dashboard`);
    } catch (error) {
      console.error('Configuration rejection error:', error);
      setError(t('errors.rejectFailed'));
      setApproving(false);
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
          onClick={() => router.push(`/${locale}/specialist-dashboard`)}
          className="mt-4 px-4 py-2 bg-[#E63946] text-white rounded-md"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  if (!configuration) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
          {t('configNotFound')}
        </div>
        <button
          onClick={() => router.push(`/${locale}/specialist-dashboard`)}
          className="mt-4 px-4 py-2 bg-[#E63946] text-white rounded-md"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">{t('reviewConfiguration')}</h1>
        <Link
          href={`/${locale}/specialist-dashboard`}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          {t('back')}
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">{configuration.name}</h2>
              <span className="text-white font-bold text-xl">€{configuration.totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-400">
                {t('createdBy')}: {configuration.user.name} {configuration.user.surname}
              </p>
              <p className="text-gray-400">
                {t('status')}: {configuration.status}
              </p>
              <p className="text-gray-400">
                {t('createdAt')}: {new Date(configuration.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <h3 className="text-lg font-medium text-white mb-3">{t('components')}</h3>
            <div className="space-y-4">
              {configuration.components.map((component) => (
                <div 
                  key={component.id} 
                  className="bg-[#1E1E1E] p-4 rounded-lg"
                >
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium text-white">{component.name}</h4>
                    <span className="text-white">€{component.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <p className="text-sm text-gray-400">
                      {configT('categories.' + component.category.toLowerCase().replace(/\s+/g, ''))}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t('manufacturer')}: {component.manufacturer}
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p>{component.specifications}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('approvalOptions')}</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleApprove}
                disabled={approving}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approving ? t('processing') : t('approveConfiguration')}
              </button>
              
              <button
                onClick={handleReject}
                disabled={approving}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('rejectConfiguration')}
              </button>
            </div>
            
            <div className="mt-6 bg-gray-800 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">{t('approvalInfo')}</h3>
              <p className="text-gray-400 text-sm">
                {t('approvalDescription')}
              </p>
            </div>
          </div>
          
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('customerInfo')}</h2>
            
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-400">{t('name')}:</span>
                <span className="text-white">{configuration.user.name} {configuration.user.surname}</span>
              </p>
              
              <p className="flex justify-between">
                <span className="text-gray-400">{t('email')}:</span>
                <span className="text-white">{configuration.user.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}