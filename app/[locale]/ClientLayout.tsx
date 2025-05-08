'use client'

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { FullPageLoading } from '@/app/hooks/useLoading';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return (
    <>
      {loading && <FullPageLoading />}
      {children}
    </>
  );
}