// app/contexts/AppProviders.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { ToastProvider } from '../components/ui/Toaster';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { isAuthenticated, hasRequiredRole } from '@/lib/auth';

interface AppProvidersProps {
  children: ReactNode;
  messages: any;
  locale: string;
}

/**
 * Vienots nodrošinātāju komponents, kas ietver lietotni ar visiem nepieciešamajiem konteksta nodrošinātājiem
 * Vienkāršo nodrošinātāju koku un nodrošina konsekventu nodrošinātāju secību
 */
export function AppProviders({ children, messages, locale }: AppProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NextIntlClientProvider 
      messages={messages} 
      locale={locale}
      timeZone="Europe/Riga"
      now={new Date()}
    >
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            {mounted ? children : null}
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

/**
 * Aizsargātu maršrutu komponents
 * Izmanto, lai aizsargātu maršrutus, kas prasa autentifikāciju vai konkrētas lomas
 */
export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale || 'en';
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);

      const authenticated = isAuthenticated();
      
      if (!authenticated) {
        router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (requiredRoles.length > 0) {
        const hasPermission = hasRequiredRole(requiredRoles);
        
        if (!hasPermission) {
         
          router.push(`/${locale}/dashboard`);
          return;
        }
      }
      
      setIsAuthorized(true);
      setIsChecking(false);
    };
    
    checkAuth();
  }, [router, pathname, locale, requiredRoles]);
  
  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
      </div>
    );
  }
  
  return isAuthorized ? <>{children}</> : null;
}

/**
 * Eksportēt atsevišķu kontekstu āķus izmantošanai komponentos
 */
export { useAuth } from './AuthContext';
export { useCart } from './CartContext';
export { useToast } from '../components/ui/Toaster';