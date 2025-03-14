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
  configurations?: Configuration[];
}

interface Component {
  id: string;
  category: string;
  name: string;
  manufacturer: string;
  price: number;
}

interface Configuration {
  id: string;
  name: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  components: Component[];
}

export default function Dashboard() {
  const t = useTranslations('dashboard');
  const configT = useTranslations('configurator');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

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
        setUserData(data);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError(t('errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };
    
    const fetchConfigurations = async () => {
      try {
        const response = await fetch('/api/configurations', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            return;
          }
          throw new Error(t('errors.fetchConfigsFailed'));
        }
        
        const data = await response.json();
        setConfigurations(data);
      } catch (error) {
        console.error('Configurations fetch error:', error);
      }
    };
    
    fetchUserData();
    fetchConfigurations();
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
      
      await fetch('/api/auth/check', { 
        method: 'GET',
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

  const handleDeleteConfiguration = async (configId: string) => {
    if (confirm(t('confirmDelete'))) {
      try {
        setDeleteLoading(configId);
        
        const response = await fetch(`/api/configurations/${configId}`, {
          method: 'DELETE',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(t('errors.deleteConfigFailed'));
        }
        
        setConfigurations(prev => prev.filter(config => config.id !== configId));
      } catch (error) {
        console.error('Configuration deletion error:', error);
        alert(t('errors.deleteConfigFailed'));
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const getCategoryTranslation = (category: string) => {
    try {
      const categoryKey = category.toLowerCase().replace(/\s+/g, '');
      return configT(`categories.${categoryKey}`);
    } catch (e) {
      return category;
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">{t('myComputers')}</h2>
              <Link 
                href={`/${locale}/configurator`}
                className="px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
              >
                {t('newConfiguration')}
              </Link>
            </div>
            
            {configurations.length > 0 ? (
              <div className="space-y-4">
                {configurations.map((config) => (
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
                        {t('created')} {new Date(config.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        {t('components')}: {config.components.length}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {config.components.slice(0, 6).map((component) => (
                        <div 
                          key={component.id} 
                          className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300"
                        >
                          {getCategoryTranslation(component.category)}: {component.name.length > 20 ? component.name.substring(0, 20) + '...' : component.name}
                        </div>
                      ))}
                      {config.components.length > 6 && (
                        <div className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">
                          +{config.components.length - 6} {t('more')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/${locale}/configurator/${config.id}`}
                        className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                      >
                        {t('edit')}
                      </Link>
                      <button
                        onClick={() => handleDeleteConfiguration(config.id)}
                        disabled={deleteLoading === config.id}
                        className="px-3 py-1 bg-red-700 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading === config.id ? t('deleting') : t('delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">{t('noComputers')}</p>
                <Link 
                  href={`/${locale}/configurator`}
                  className="inline-block text-[#E63946] hover:text-[#FF4D5A]"
                >
                  {t('createComputer')}
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('welcomeMessage')}</h2>
            <p className="text-gray-300 mb-4">
              {t('accountCreated')} {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : ''}
            </p>
            
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-medium text-white mb-2">{t('accountSettings')}</h3>
              <Link 
                href={`/${locale}/profile`}
                className="text-[#E63946] hover:text-[#FF4D5A]"
              >
                {t('editProfile')}
              </Link>
            </div>
          </div>
          
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('statistics')}</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">{t('totalConfigurations')}</span>
                <span className="text-white font-medium">{configurations.length}</span>
              </div>
              
              {configurations.length > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('averagePrice')}</span>
                    <span className="text-white font-medium">
                      €{(configurations.reduce((sum, config) => sum + config.totalPrice, 0) / configurations.length).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('maxPrice')}</span>
                    <span className="text-white font-medium">
                      €{Math.max(...configurations.map(config => config.totalPrice)).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}