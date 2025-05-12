'use client'

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Loading from '@/app/components/ui/Loading';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use a client-side only effect to avoid suspense issues
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 500);
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [pathname, searchParams]);

  return (
    <>
      {loading && <Loading size="large" fullScreen={true} />}
      {children}
    </>
  );
}