'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { DataTable, Column } from '../Common/DataTable';
import { ProductActions } from './ProductActions';
import { StatusBadge } from '../Common/StatusBadge';
import { SearchBar } from '../Common/SearchBar';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Monitor, AlertCircle, Plus } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

interface ReadyMadePC {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  viewCount: number;
  createdAt: string;
  isPublic: boolean;
  imageUrl?: string;
}

export function ReadyMadeList() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [pcs, setPCs] = useState<ReadyMadePC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  useEffect(() => {
    fetchReadyMadePCs();
  }, []);

  const fetchReadyMadePCs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff/products/ready-made');

      if (!response.ok) {
        throw new Error('Failed to fetch ready-made PCs');
      }

      const data = await response.json();
      setPCs(data);
    } catch (error) {
      console.error('Error fetching ready-made PCs:', error);
      setError('Failed to load ready-made PCs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PC configuration?'))
      return;

    try {
      const response = await fetch(`/api/staff/products/ready-made/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete PC');
      }

      setPCs(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting PC:', error);
      alert('Failed to delete PC');
    }
  };

  const handleCreateNew = () => {
    router.push(`/${locale}/${user?.role.toLowerCase()}/configurations/create`);
  };

  const filteredPCs = pcs.filter(
    pc =>
      pc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<ReadyMadePC>[] = [
    {
      key: 'imageUrl' as keyof ReadyMadePC,
      label: 'Image',
      render: (value: string) =>
        value ? (
          <img
            src={value}
            alt="PC"
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center">
            <Monitor size={20} className="text-neutral-400" />
          </div>
        ),
    },
    {
      key: 'name' as keyof ReadyMadePC,
      label: 'Name',
    },
    {
      key: 'category' as keyof ReadyMadePC,
      label: 'Category',
      render: (value: string) => <span className="capitalize">{value}</span>,
    },
    {
      key: 'price' as keyof ReadyMadePC,
      label: 'Price',
      render: (value: number) => `€${value.toFixed(2)}`,
    },
    {
      key: 'status' as keyof ReadyMadePC,
      label: 'Status',
      render: (value: ReadyMadePC['status']) => <StatusBadge status={value} />,
    },
    {
      key: 'viewCount' as keyof ReadyMadePC,
      label: 'Views',
    },
    {
      key: 'isPublic' as keyof ReadyMadePC,
      label: 'Visibility',
      render: (value: boolean) => (
        <StatusBadge status={value ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      key: 'id' as keyof ReadyMadePC,
      label: 'Actions',
      render: (value: string, row: ReadyMadePC) => (
        <ProductActions
          id={value}
          type="ready-made"
          onDelete={() => handleDelete(value)}
          canEdit={true}
          canDelete={isAdmin}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Ready-Made PCs
        </h2>
        <div className="flex items-center space-x-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search PCs..."
          />
          <button
            onClick={handleCreateNew}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create New</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPCs}
        emptyMessage="No ready-made PCs found"
      />
    </div>
  );
}
