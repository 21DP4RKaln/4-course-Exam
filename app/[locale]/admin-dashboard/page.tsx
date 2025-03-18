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

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  blocked: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'lv';
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
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
        
        // Redirect based on user role if they're on the wrong dashboard
        if (data.role === 'SPECIALIST') {
          router.push(`/${locale}/specialist-dashboard`);
          return;
        } else if (data.role === 'CLIENT') {
          router.push(`/${locale}/dashboard`);
          return;
        }
        
        setUserData(data);
      } catch (error) {
        console.error('Profile data fetch error:', error);
        setError(t('errors.fetchFailed'));
      }
    };
    
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(t('errors.fetchUsersFailed'));
        }
        
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Users fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    fetchUsers();
  }, [router, t, locale]);

  const handleToggleBlock = async (userId: string, currentlyBlocked: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ blocked: !currentlyBlocked })
      });
      
      if (!response.ok) {
        throw new Error(t('errors.updateFailed'));
      }
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, blocked: !currentlyBlocked } : user
      ));
    } catch (error) {
      console.error('Toggle block error:', error);
      alert(t('errors.updateFailed'));
    }
  };
  
  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/change-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        throw new Error(t('errors.updateFailed'));
      }
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Change role error:', error);
      alert(t('errors.updateFailed'));
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
              <p className="text-gray-400">{t('adminPanel')}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('quickMenu')}</h2>
            
            <div className="space-y-4">
              <Link 
                href={`/${locale}/manage-users`}
                className="block w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t('manageUsers')}
              </Link>
              
              <Link 
                href={`/${locale}/manage-components`}
                className="block w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t('manageComponents')}
              </Link>
              
              <Link 
                href={`/${locale}/specialist-dashboard`}
                className="block w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t('specialistPanel')}
              </Link>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">{t('userManagement')}</h2>
              <Link
                href={`/${locale}/manage-users/new`}
                className="px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
              >
                {t('createUser')}
              </Link>
            </div>
            
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                    <tr>
                      <th className="px-6 py-3">{t('name')}</th>
                      <th className="px-6 py-3">{t('email')}</th>
                      <th className="px-6 py-3">{t('role')}</th>
                      <th className="px-6 py-3">{t('status')}</th>
                      <th className="px-6 py-3">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="bg-[#1E1E1E] border-b border-gray-700">
                        <td className="px-6 py-4">
                          {user.name} {user.surname}
                        </td>
                        <td className="px-6 py-4">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            className="bg-gray-800 text-white text-sm rounded-lg p-2"
                          >
                            <option value="CLIENT">{t('roles.client')}</option>
                            <option value="SPECIALIST">{t('roles.specialist')}</option>
                            <option value="ADMIN">{t('roles.admin')}</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${user.blocked ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                            {user.blocked ? t('blocked') : t('active')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleBlock(user.id, user.blocked)}
                              className={`px-3 py-1 text-xs rounded ${user.blocked ? 'bg-green-700 hover:bg-green-800' : 'bg-red-700 hover:bg-red-800'} text-white`}
                            >
                              {user.blocked ? t('unblock') : t('block')}
                            </button>
                            <Link
                              href={`/${locale}/manage-users/${user.id}`}
                              className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                            >
                              {t('edit')}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">{t('noUsers')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}