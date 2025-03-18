'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function Register() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [preferredContact, setPreferredContact] = useState<'email' | 'phone' | 'both'>('email');

  interface FormData {
    name: string;
    surname: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }

  interface Errors {
    [key: string]: string;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevFormData: FormData) => ({
      ...prevFormData,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors((prevErrors: Errors) => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const handleContactMethodChange = (method: 'email' | 'phone' | 'both') => {
    setPreferredContact(method);
    setErrors((prevErrors) => ({
      ...prevErrors,
      email: '',
      phoneNumber: ''
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = t('name_required');
    }
    
    // Validate surname
    if (!formData.surname.trim()) {
      newErrors.surname = t('surname_required');
    }
    
    // Validate email or phone based on selected contact method
    if (preferredContact === 'email' || preferredContact === 'both') {
      if (!formData.email.trim()) {
        newErrors.email = t('email_required');
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = t('email_invalid');
      }
    }
    
    if (preferredContact === 'phone' || preferredContact === 'both') {
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = t('phone_required');
      } else if (!/^\+?[0-9]{8,15}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = t('phone_invalid');
      }
    }
    
    // If both contact methods are empty
    if (
      preferredContact === 'both' && 
      !formData.email.trim() && 
      !formData.phoneNumber.trim()
    ) {
      newErrors.email = t('email_or_phone_required');
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = t('password_required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('password_length');
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwords_not_match');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  interface RegisterResponse {
    message?: string;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          email: preferredContact === 'phone' ? null : formData.email,
          phoneNumber: preferredContact === 'email' ? null : formData.phoneNumber, 
          password: formData.password
        }),
        credentials: 'include'
      });
      
      const data: RegisterResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || t('registration_failed'));
      }
      
      await fetch('/api/auth/check', { 
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }, 100);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError(t('registration_failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1E1E1E] py-8 px-4 shadow rounded-lg sm:px-10">
          <h2 className="text-center text-3xl font-bold text-white mb-6">
            {t('create_account')}
          </h2>
          
          {generalError && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
              {generalError}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                {t('name')}
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 bg-[#2A2A2A] text-white focus:outline-none focus:ring-[#E63946] focus:border-[#E63946]"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                )}
              </div>
            </div>
            
            {/* Surname field */}
            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-300">
                {t('surname')}
              </label>
              <div className="mt-1">
                <input
                  id="surname"
                  name="surname"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.surname}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 bg-[#2A2A2A] text-white focus:outline-none focus:ring-[#E63946] focus:border-[#E63946]"
                />
                {errors.surname && (
                  <p className="mt-2 text-sm text-red-400">{errors.surname}</p>
                )}
              </div>
            </div>

            {/* Contact Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('contact_method')}
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleContactMethodChange('email')}
                  className={`flex-1 py-2 rounded-md ${
                    preferredContact === 'email'
                      ? 'bg-[#E63946] text-white'
                      : 'bg-[#2A2A2A] text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {t('email_only')}
                </button>
                <button
                  type="button"
                  onClick={() => handleContactMethodChange('phone')}
                  className={`flex-1 py-2 rounded-md ${
                    preferredContact === 'phone'
                      ? 'bg-[#E63946] text-white'
                      : 'bg-[#2A2A2A] text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {t('phone_only')}
                </button>
                <button
                  type="button"
                  onClick={() => handleContactMethodChange('both')}
                  className={`flex-1 py-2 rounded-md ${
                    preferredContact === 'both'
                      ? 'bg-[#E63946] text-white'
                      : 'bg-[#2A2A2A] text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {t('both')}
                </button>
              </div>
            </div>
            
            {/* Email field */}
            {(preferredContact === 'email' || preferredContact === 'both') && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  {t('email')} {preferredContact === 'both' ? `(${t('optional')})` : ''}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required={preferredContact === 'email'}
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 bg-[#2A2A2A] text-white focus:outline-none focus:ring-[#E63946] focus:border-[#E63946]"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Phone number field */}
            {(preferredContact === 'phone' || preferredContact === 'both') && (
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
                  {t('phone_number')} {preferredContact === 'both' ? `(${t('optional')})` : ''}
                </label>
                <div className="mt-1">
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    required={preferredContact === 'phone'}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+371 12345678"
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 bg-[#2A2A2A] text-white focus:outline-none focus:ring-[#E63946] focus:border-[#E63946]"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-red-400">{errors.phoneNumber}</p>
                  )}
                </div>
                {preferredContact === 'both' && (
                  <p className="mt-1 text-xs text-gray-500">{t('email_or_phone_required_hint')}</p>
                )}
              </div>
            )}
            
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                {t('password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 bg-[#2A2A2A] text-white focus:outline-none focus:ring-[#E63946] focus:border-[#E63946]"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                )}
              </div>
            </div>
            
            {/* Confirm password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                {t('confirm_password')}
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 bg-[#2A2A2A] text-white focus:outline-none focus:ring-[#E63946] focus:border-[#E63946]"
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#E63946] hover:bg-[#FF4D5A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E63946] disabled:opacity-50"
              >
                {isLoading ? t('registering') : t('register')}
              </button>
            </div>
          </form>
          
          {/* Login link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1E1E1E] text-gray-400">
                  {t('already_have_account')}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                href={`/${locale}/login`}
                className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-[#2A2A2A] hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E63946]"
              >
                {t('login_instead')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}