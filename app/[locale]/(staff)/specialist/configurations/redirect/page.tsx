'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ConfigurationsRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  useEffect(() => {
    router.push(`/${locale}/specialist/repairs`);
  }, [router, locale]);

  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
