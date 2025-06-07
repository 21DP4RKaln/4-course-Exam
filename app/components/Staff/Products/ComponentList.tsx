'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { DataTable, Column } from '../Common/DataTable';
import { ProductActions } from './ProductActions';
import { StatusBadge } from '../Common/StatusBadge';
import { SearchBar } from '../Common/SearchBar';
import { useTranslations } from 'next-intl';
import { Package, AlertCircle } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

interface Component {
  id: string;
  name: string;
  category: {
    name: string;
  };
  price: number;
  stock: number;
  sku: string;
  imageUrl?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export function ComponentList() {
  const t = useTranslations();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff/products/components');

      if (!response.ok) {
        throw new Error('Failed to fetch components');
      }

      const data = await response.json();
      setComponents(data);
    } catch (error) {
      console.error('Error fetching components:', error);
      setError('Failed to load components');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number): Component['status'] => {
    if (stock === 0) return 'OUT_OF_STOCK';
    if (stock < 10) return 'LOW_STOCK';
    return 'IN_STOCK';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this component?')) return;

    try {
      const response = await fetch(`/api/staff/products/components/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete component');
      }

      setComponents(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting component:', error);
      alert('Failed to delete component');
    }
  };

  const filteredComponents = components.filter(
    component =>
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.category.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      component.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  type ColumnKey = keyof Component | 'category.name';

  const columns: Column<Component>[] = [
    {
      key: 'imageUrl' as keyof Component,
      label: 'Image',
      render: (value: string) =>
        value ? (
          <img
            src={value?.trim()}
            alt="Component"
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center">
            <Package size={20} className="text-neutral-400" />
          </div>
        ),
    },
    {
      key: 'name' as keyof Component,
      label: 'Name',
      sortable: true,
    },
    {
      key: 'category' as keyof Component,
      label: 'Category',
      sortable: true,
      render: (value: Component['category']) => value.name,
    },
    {
      key: 'sku' as keyof Component,
      label: 'SKU',
      sortable: true,
    },
    {
      key: 'price' as keyof Component,
      label: 'Price',
      sortable: true,
      render: (value: number) => `€${value.toFixed(2)}`,
    },
    {
      key: 'stock' as keyof Component,
      label: 'Stock',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <span>{value}</span>
          <StatusBadge
            status={getStockStatus(value)}
            variant={
              getStockStatus(value) === 'IN_STOCK'
                ? 'success'
                : getStockStatus(value) === 'LOW_STOCK'
                  ? 'warning'
                  : 'danger'
            }
          />
        </div>
      ),
    },
    {
      key: 'id' as keyof Component,
      label: 'Actions',
      render: (value: string, row: Component) => (
        <ProductActions
          id={value}
          type="component"
          onDelete={() => handleDelete(value)}
          canEdit={isAdmin}
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
          Components Inventory
        </h2>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search components..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredComponents}
        emptyMessage="No components found"
      />
    </div>
  );
}
