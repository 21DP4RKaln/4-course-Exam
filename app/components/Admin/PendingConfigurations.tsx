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
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: string;
  };
  isPublic: boolean;
  status: string;
  createdAt: string;
}

export default function PendingConfigurations() {
  const t = useTranslations('pendingConfigs');
  const configT = useTranslations('configurator');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingConfigurations();
  }, []);

  const fetchPendingConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pending-configs', {
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
      console.error('Pending configurations fetch error:', error);
      setError(t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (confirm(t('confirmApprove'))) {
      try {
        setActionLoading(id);
        const response = await fetch(`/api/admin/pending-configs/${id}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(t('errors.approveFailed'));
        }
        
        setConfigs(prev => prev.filter(config => config.id !== id));
      } catch (error) {
        console.error('Configuration approval error:', error);
        alert(t('errors.approveFailed'));
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleReject = async (id: string) => {
    if (confirm(t('confirmReject'))) {
      try {
        setActionLoading(id);
        const response = await fetch(`/api/admin/pending-configs/${id}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason: 'Rejected by admin' }) 
        });
        
        if (!response.ok) {
          throw new Error(t('errors.rejectFailed'));
        }
        
        setConfigs(prev => prev.filter(config => config.id !== id));
      } catch (error) {
        console.error('Configuration rejection error:', error);
        alert(t('errors.rejectFailed'));
      } finally {
        setActionLoading(null);
      }
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
        <Link
          href={`/${locale}/admin-dashboard`}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          {t('back')}
        </Link>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
      
      {configs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.map((config) => (
            <div 
              key={config.id} 
              className="bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">{config.name}</h2>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-2xl font-bold text-[#E63946]">€{config.totalPrice.toFixed(2)}</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-900 text-yellow-300">
                    {t('statusPending')}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">{t('creator')}</h3>
                <div className="bg-[#1E1E1E] p-3 rounded-lg mb-4">
                  <p className="text-white">
                    {config.user.name} {config.user.surname}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {config.user.email} | {config.user.role === 'SPECIALIST' ? t('specialist') : t('user')}
                  </p>
                </div>
                
                <h3 className="text-sm font-medium text-gray-400 mb-2">{t('components')}</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
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
                
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-4">
                    {t('createdAt')}: {new Date(config.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleApprove(config.id)}
                      disabled={actionLoading === config.id}
                      className="flex-1 px-3 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === config.id ? t('processing') : t('approve')}
                    </button>
                    <button
                      onClick={() => handleReject(config.id)}
                      disabled={actionLoading === config.id}
                      className="flex-1 px-3 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('reject')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#2A2A2A] rounded-lg p-8 text-center">
          <p className="text-gray-400">{t('noConfigs')}</p>
        </div>
      )}
    </div>
  );
}