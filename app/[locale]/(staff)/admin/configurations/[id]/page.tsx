'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ConfigDetails } from '@/app/components/Staff/Configurations/ConfigDetails';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Configuration {
  id: string;
  name: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  totalPrice: number;
  createdAt: string;
  description?: string;
  isTemplate: boolean;
  isPublic: boolean;
  components: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
}

interface PageProps {
  params: {
    id: string;
  };
}

const AdminConfigurationDetailsPage = ({ params }: PageProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [configuration, setConfiguration] = useState<Configuration | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/unauthorized');
      return;
    }
    fetchConfigurationDetails();
  }, [user, params.id]);

  const fetchConfigurationDetails = async () => {
    try {
      const response = await fetch(`/api/admin/configurations/${params.id}`);
      const data = await response.json();
      setConfiguration(data);
    } catch (error) {
      console.error('Error fetching configuration details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!configuration) {
    return <div>Configuration not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Configuration Details</h1>
      </div>

      <ConfigDetails
        configuration={configuration}
        onClose={() => router.back()}
      />
    </div>
  );
};

export default AdminConfigurationDetailsPage;
