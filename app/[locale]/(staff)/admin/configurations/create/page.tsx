'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AnimatedButton from '@/app/components/ui/animated-button';
import { ConfigEditForm } from '@/app/components/Staff/Configurations/ConfigEditForm';

export default function AdminCreateConfigurationPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (user?.role !== 'ADMIN') {
    router.push('/unauthorized');
    return null;
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/admin/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/admin/configurations');
      }
    } catch (error) {
      console.error('Error creating configuration:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <AnimatedButton
          onClick={() => router.back()}
          title="Back"
          direction="left"
          className="inline-block"
        />
        <h1 className="text-2xl font-bold">Create Configuration</h1>
      </div>

      <div className="bg-white dark:bg-stone-950 rounded-lg shadow p-6">
        <ConfigEditForm onSave={handleSubmit} />
      </div>
    </div>
  );
}
