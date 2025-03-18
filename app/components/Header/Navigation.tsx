'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import LanguageSwitcher from '../ui/LanguageSwitcher';

export default function Navigation() {
  const t = useTranslations('nav');
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale || 'en';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        cache: 'no-store', 
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      
      if (data.authenticated) {
        const profileResponse = await fetch('/api/profile', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserRole(profileData.role);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    checkAuth();
  }, [pathname]);
  
  return (
    <nav className="bg-gradient-to-r from-[#E63946] via-[#f8c4c8]/30 to-[#1a1b26] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <span className="text-white text-xl font-semibold">{t('apiroq')}</span>
          </Link>

          {/* Navigation links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Datori dropdown */}
            <div className="relative group">
              <button className="text-gray-300 hover:text-white flex items-center gap-1">
                {t('computers')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute left-0 mt-2 w-[600px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden -translate-x-1/4">
                  <div className="grid grid-cols-2">
                    <Link href={`/${locale}/gatavie-datori`} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{t('ready_configs')}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {t('ready_configs_desc')}
                          </p>
                        </div>
                      </div>
                    </Link>
                    
                    <Link href={`/${locale}/konfigurators`} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{t('configurator')}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {t('configurator_desc')}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link href={`/${locale}/peripherals`} className="text-gray-300 hover:text-white">
              {t('peripherals')}
            </Link>
            <Link href={`/${locale}/help`} className="text-gray-300 hover:text-white">
              {t('help')}
            </Link>
            <Link href={`/${locale}/about`} className="text-gray-300 hover:text-white">
              {t('about')}
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <button className="text-gray-300 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
            
            {/* Conditional rendering based on authentication status */}
            {!loading && (
              isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link 
                    href={
                      userRole === 'ADMIN' 
                        ? `/${locale}/admin-dashboard` 
                        : userRole === 'SPECIALIST'
                          ? `/${locale}/specialist-dashboard`
                          : `/${locale}/dashboard`
                    }
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link 
                    href={`/${locale}/login`}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {t('login')}
                  </Link>
                  <Link 
                    href={`/${locale}/register`}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-[#E63946] text-white hover:bg-[#FF4D5A] transition-colors duration-200"
                  >
                    {t('register')}
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}