'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function LoginPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const segments = pathname.split('/');
  const locale = segments[1]; 

  const [formData, setFormData] = useState({
    email: '',
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
    email: string;
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        cache: 'no-store',
        credentials: 'include'
      });

      if (res.ok) {
        router.push(`/${locale}/profile`);
      } else {
        const data: ErrorResponse = await res.json();
        setError(data.message || 'Check-in failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
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
            <div className="text-red-500 text-center text-sm">
              {error}
            </div>
          )}
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-[#2A2A2A] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
                placeholder={t('auth.email')}
                value={formData.email}
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
              {isLoading ? 'In the process...' : t('auth.login')}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <Link 
              href={`/${locale}/auth/register`}
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