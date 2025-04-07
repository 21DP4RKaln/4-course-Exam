// app/contexts/AppProviders.tsx
import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { ToastProvider } from '../components/ui/Toaster';
import { NextIntlClientProvider } from 'next-intl';

interface AppProvidersProps {
  children: ReactNode;
  messages: any;
  locale: string;
}

/**
 * Unified provider component that wraps the app with all necessary context providers
 * Simplifies the provider tree and ensures consistent provider order
 */
export function AppProviders({ children, messages, locale }: AppProvidersProps) {
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
            {children}
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

/**
 * Custom hook to check if a user is authenticated
 * Combines the functionality of useAuth with route protection logic
 */
export function useAuthentication() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale || 'en';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute(pathname)) {
      router.push(`/${locale}/login?redirect=${pathname}`);
    }
  }, [isAuthenticated, isLoading, pathname, router, locale]);

  return { isAuthenticated, user, isLoading };
}

/**
 * Custom hook to check if a user has required role permissions
 * Combines role-based permissions with route protection
 */
export function useAuthorization(requiredRoles: string[] = []) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale || 'en';

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        // Redirect to dashboard if user doesn't have required role
        router.push(`/${locale}/dashboard`);
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, router, pathname, locale]);

  return { 
    user, 
    isAuthorized: isAuthenticated && user && 
      (requiredRoles.length === 0 || requiredRoles.includes(user.role)),
    isLoading
  };
}

/**
 * Check if a route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/login',
    '/register',
    '/',
    '/about',
    '/help',
    '/ready-configs',
    '/configurator'
  ];
  
  // Extract path without locale
  const segments = pathname.split('/');
  const pathWithoutLocale = segments.length > 1 ? 
    '/' + segments.slice(2).join('/') : pathname;
  
  return publicRoutes.some(route => pathWithoutLocale === route || pathWithoutLocale === '/');
}

// Re-export individual context hooks for use in components
export { useAuth } from './AuthContext';
export { useCart } from './CartContext';
export { useToast } from '../components/ui/Toaster';