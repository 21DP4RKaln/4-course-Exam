'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function LoginPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const segments = pathname.split('/');
  const locale = segments[1]; 

  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  interface FormData {
    identifier: string;
    password: string;
  }

  interface ErrorResponse {
    message?: string;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const isEmail = formData.identifier.includes('@');
      
      const loginData = {
        password: formData.password,
        ...(isEmail ? { email: formData.identifier } : { phoneNumber: formData.identifier })
      };
      
      console.log("Sending login request with data:", { 
        identifier: formData.identifier, 
        passwordLength: formData.password.length,
        isEmail 
      });
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
        cache: 'no-store',
        credentials: 'include'
      });

      console.log("Login response status:", res.status);
      
      if (res.ok) {
        console.log("Login successful, redirecting to dashboard");
        
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
      } else {
        const data: ErrorResponse = await res.json();
        console.error("Login error response:", data);
        setError(data.message || t('auth.loginFailed'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#1E1E1E] rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            {t('auth.login')}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center text-sm p-2 bg-red-100/10 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="identifier" className="sr-only">
                {t('auth.email_or_phone')}
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-[#2A2A2A] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
                placeholder={t('auth.email_or_phone')}
                value={formData.identifier}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-[#2A2A2A] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
                placeholder={t('auth.password')}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#E63946] hover:bg-[#FF4D5A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E63946] transition-colors duration-200 disabled:opacity-70"
            >
              {isLoading ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <Link 
              href={`/${locale}/register`}
              className="font-medium text-[#E63946] hover:text-[#FF4D5A]"
            >
              {t('auth.noAccount')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}