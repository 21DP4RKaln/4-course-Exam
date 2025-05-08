import { ReactNode } from 'react';
import { StaffSidebar } from '@/app/components/Staff/Layout/StaffSidebar';
import { StaffHeader } from '@/app/components/Staff/Layout/StaffHeader';

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <StaffSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}