'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function RegisterRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  useEffect(() => {
    router.push(`/${locale}/auth?form=register`);
  }, [router, locale]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      <span className="ml-3">Redirecting...</span>
    </div>
  );
}
