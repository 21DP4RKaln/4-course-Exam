'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id?: string;
  name?: string;
  email: string;
  createdAt?: string;
  configurations?: Configuration[];
}

interface Configuration {
  id: string;
  name: string;
  createdAt: string;
  status: 'ordered' | 'saved' | 'draft';
  totalPrice?: number;
}

interface FormDataType {
  name: string;
  email: string;
}

export default function Profile() {
  const t = useTranslations();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'configurations'>('info');
  const [user, setUser] = useState<User | null>(null);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    email: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Neizdevās iegūt profila datus');
        }
        
        const userData: User = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || ''
        });
        
        if (userData.configurations) {
          setConfigurations(userData.configurations);
        } else {
          const configResponse = await fetch('/api/configurations');
          if (configResponse.ok) {
            const configData: Configuration[] = await configResponse.json();
            setConfigurations(configData);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Profila ielādes kļūda:', error);
        setError('Neizdevās ielādēt profila datus');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Izlogošanās kļūda:', error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Neizdevās atjaunināt profilu');
      }
      
      const updatedUser: User = await response.json();
      setUser(updatedUser);
      setEditMode(false);
    } catch (error) {
      console.error('Profila atjaunināšanas kļūda:', error);
      setError('Neizdevās atjaunināt profila datus');
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
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-[#E63946] text-white rounded-md"
        >
          {t('auth.backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profila augšdaļa */}
      <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-[#E63946] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name || t('profile.unnamed')}</h1>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
          >
            {t('profile.logout')}
          </button>
        </div>
      </div>

      {/* Tabi */}
      <div className="mb-6">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-[#E63946] text-[#E63946]'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
              }`}
            >
              {t('profile.personal_info')}
            </button>
            <button
              onClick={() => setActiveTab('configurations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'configurations'
                  ? 'border-[#E63946] text-[#E63946]'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
              }`}
            >
              {t('profile.my_configurations')}
            </button>
          </nav>
        </div>
      </div>

      {/* Taba saturs */}
      <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
        {activeTab === 'info' ? (
          <div className="space-y-4">
            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('profile.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full rounded-md border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('profile.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full rounded-md border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
                  >
                    {t('profile.save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || ''
                      });
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    {t('profile.cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    {t('profile.name')}
                  </label>
                  <div className="mt-1 text-lg text-white">{user?.name || t('profile.notProvided')}</div>
                </div>
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-400">
                    {t('profile.email')}
                  </label>
                  <div className="mt-1 text-lg text-white">{user?.email}</div>
                </div>
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-400">
                    {t('profile.joined')}
                  </label>
                  <div className="mt-1 text-gray-300">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('profile.unknown')}
                  </div>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-6 px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
                >
                  {t('profile.edit')}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {configurations.length > 0 ? (
              configurations.map((config) => (
                <div
                  key={config.id}
                  className="border border-gray-700 rounded-lg p-4 hover:shadow-md transition bg-[#1E1E1E]"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-white">{config.name}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(config.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      config.status === 'ordered' 
                        ? 'bg-green-900 text-green-100' 
                        : config.status === 'saved'
                          ? 'bg-blue-900 text-blue-100'
                          : 'bg-gray-700 text-gray-100'
                    }`}>
                      {t(`profile.status.${config.status}`)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-300">
                      {t('profile.totalPrice')}: €{config.totalPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => router.push(`/configuration/${config.id}`)}
                      className="px-3 py-1 bg-[#E63946] text-white text-sm rounded"
                    >
                      {t('profile.view')}
                    </button>
                    <button
                      onClick={() => router.push(`/configuration/${config.id}/edit`)}
                      className="px-3 py-1 bg-gray-700 text-white text-sm rounded"
                    >
                      {t('profile.edit')}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">{t('profile.noConfigurations')}</p>
                <button
                  onClick={() => router.push('/configurator')}
                  className="px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
                >
                  {t('profile.createConfiguration')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}