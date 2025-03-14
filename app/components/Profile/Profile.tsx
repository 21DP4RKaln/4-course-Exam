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
  createdAt: string;
}

interface FormData {
  name: string;
  email: string;
}

export default function Profile() {
  const t = useTranslations('profile');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
        setFormData({
          name: data.name || '',
          email: data.email || ''
        });
      } catch (error) {
        console.error('Profile data fetch error:', error);
        setError(t('errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [router, t, locale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(t('errors.updateFailed'));
      }
      
      const updatedUser = await response.json();
      setUserData(updatedUser);
      setEditMode(false);
      setUpdateSuccess(true);
      
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setError(t('errors.updateFailed'));
    }
  };

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
      {/* Profile header */}
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
              href={`/${locale}/dashboard`}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              {t('dashboard')}
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

      {/* Profile content */}
      <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">{t('profileSettings')}</h2>
        
        {updateSuccess && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            {t('updateSuccess')}
          </div>
        )}
        
        {editMode ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                {t('name')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              />
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
              >
                {t('saveChanges')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    name: userData?.name || '',
                    email: userData?.email || ''
                  });
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400">{t('name')}</h3>
              <p className="mt-1 text-lg text-white">{userData?.name || t('notProvided')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400">{t('email')}</h3>
              <p className="mt-1 text-lg text-white">{userData?.email}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400">{t('joined')}</h3>
              <p className="mt-1 text-gray-300">
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : t('unknown')}
              </p>
            </div>
            
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
            >
              {t('editProfile')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}