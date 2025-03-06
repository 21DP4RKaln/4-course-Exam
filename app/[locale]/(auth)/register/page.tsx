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
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  interface FormData {
    name: string;
    email: string;
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors: Errors) => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
      const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('name_required');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('email_invalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('password_required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('password_length');
    }
    
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });
      
      const data: RegisterResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || t('registration_failed'));
      }
      
      // Registration successful - redirect to dashboard instead of login
      router.push(`/${locale}/dashboard`);
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
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {t('create_account')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          {t('already_have_account')}{' '}
          <Link href={`/${locale}/login`} className="font-medium text-[#E63946] hover:text-[#FF4D5A]">
            {t('login_instead')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1E1E1E] py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {generalError && (
            <div className="mb-4 bg-red-500/20 border-l-4 border-red-500 p-4 text-red-300">
              <p>{generalError}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                {t('name')}
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.name ? 'border-red-500' : 'border-gray-700'
                  } rounded-md shadow-sm bg-[#2A2A2A] placeholder-gray-400 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                {t('email')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-700'
                  } rounded-md shadow-sm bg-[#2A2A2A] placeholder-gray-400 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

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
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-700'
                  } rounded-md shadow-sm bg-[#2A2A2A] placeholder-gray-400 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            </div>

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
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                  } rounded-md shadow-sm bg-[#2A2A2A] placeholder-gray-400 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-[#E63946] focus:ring-[#E63946] border-gray-700 rounded bg-[#2A2A2A]"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                {t('agree_terms')}
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#E63946] hover:bg-[#FF4D5A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-800 disabled:opacity-70"
              >
                {isLoading ? t('registering') : t('register')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}