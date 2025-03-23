'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface UserData {
  id: string;
  name: string;
  surname: string;
  email: string | null;
  phoneNumber: string | null;
  profilePicture: string | null;
  role: string;
  createdAt: string;
}

interface FormData {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
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
    surname: '',
    email: '',
    phoneNumber: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [pictureError, setPictureError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          surname: data.surname || '', 
          email: data.email || '',
          phoneNumber: data.phoneNumber || ''
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

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      errors.name = t('name_required');
    }
    
    if (!formData.surname.trim()) {
      errors.surname = t('surname_required');
    }
    
    if (!formData.email.trim() && !formData.phoneNumber.trim()) {
      errors.email = t('email_or_phone_required');
    }
    
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('email_invalid');
    }
    
    if (formData.phoneNumber.trim() && !/^\+?[0-9]{8,15}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = t('phone_invalid');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    if (!file.type.startsWith('image/')) {
      setPictureError(t('pictureTypeError'));
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setPictureError(t('pictureSizeError'));
      return;
    }
    
    setPictureError('');
    setUploadingPicture(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await fetch('/api/profile/upload-picture', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(t('pictureUploadError'));
      }
      
      const data = await response.json();
      setUserData(prevData => prevData ? { ...prevData, profilePicture: data.user.profilePicture } : null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      setPictureError(t('pictureUploadError'));
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          email: formData.email || null,
          phoneNumber: formData.phoneNumber || null
        })
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
    } finally {
      setIsSubmitting(false);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderProfilePicture = () => {
  if (userData?.profilePicture) {
    return (
      <div className="relative w-24 h-24 md:w-28 md:h-28">
        <img 
          src={userData.profilePicture} 
          alt={`${userData.name}'s profile picture`}
          className="rounded-full object-cover w-full h-full"
        />
        <button 
          onClick={triggerFileInput}
          className="absolute bottom-0 right-0 bg-[#E63946] text-white p-1 rounded-full"
          title={t('changePicture')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    );
  }

    return (
      <div className="relative">
        <div className="w-24 h-24 md:w-28 md:h-28 bg-[#E63946] rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {userData?.name ? userData.name.charAt(0).toUpperCase() : '?'}
        </div>
        <button 
          onClick={triggerFileInput}
          className="absolute bottom-0 right-0 bg-[#E63946] text-white p-1 rounded-full"
          title={t('addPicture')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    );
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
            {renderProfilePicture()}
            <div>
              <h1 className="text-2xl font-bold text-white">{userData?.name} {userData?.surname}</h1>
              <p className="text-gray-400">
                {userData?.email || userData?.phoneNumber || t('contactNotProvided')}
              </p>
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
        
        {/* Hidden file input for profile picture upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleProfilePictureChange}
          accept="image/*"
          className="hidden"
        />
        
        {pictureError && (
          <div className="mt-3 text-red-400 text-sm">
            {pictureError}
          </div>
        )}
        
        {uploadingPicture && (
          <div className="mt-3 text-green-400 text-sm">
            {t('uploadingPicture')}
          </div>
        )}
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
            {/* Name field */}
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
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-400">{formErrors.name}</p>
              )}
            </div>
            
            {/* Surname field */}
            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-300 mb-1">
                {t('surname')}
              </label>
              <input
                id="surname"
                name="surname"
                type="text"
                value={formData.surname}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              />
              {formErrors.surname && (
                <p className="mt-1 text-sm text-red-400">{formErrors.surname}</p>
              )}
            </div>
            
            {/* Email field */}
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
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
              )}
            </div>
            
            {/* Phone number field */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-1">
                {t('phoneNumber')}
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              />
              {formErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-400">{formErrors.phoneNumber}</p>
              )}
            </div>
            
            <p className="text-sm text-gray-400">
              {t('contactRequirement')}
            </p>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? t('saving') : t('saveChanges')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    name: userData?.name || '',
                    surname: userData?.surname || '',
                    email: userData?.email || '',
                    phoneNumber: userData?.phoneNumber || ''
                  });
                  setFormErrors({});
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
              <h3 className="text-sm font-medium text-gray-400">{t('surname')}</h3>
              <p className="mt-1 text-lg text-white">{userData?.surname || t('notProvided')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400">{t('email')}</h3>
              <p className="mt-1 text-lg text-white">{userData?.email || t('notProvided')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400">{t('phoneNumber')}</h3>
              <p className="mt-1 text-lg text-white">{userData?.phoneNumber || t('notProvided')}</p>
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