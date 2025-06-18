'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import {
  Search,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Filter,
  Keyboard,
  Mouse,
  Headphones,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Peripheral {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sku: string;
  subType: string;
  category: {
    id: string;
    name: string;
    description: string;
    slug: string;
  };
  specifications: Record<string, string>;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
}

interface PeripheralsResponse {
  peripherals: Peripheral[];
  categories: Category[];
  total: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export default function PeripheralsPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [data, setData] = useState<PeripheralsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    fetchPeripherals();
  }, [selectedCategory, showLowStock]);

  const fetchPeripherals = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (showLowStock) params.append('lowStock', 'true');

      const response = await fetch(
        `/api/specialist/products/peripherals?${params}`
      );
      if (response.ok) {
        const responseData = await response.json();
        setData(responseData);
      } else {
        console.error('Failed to fetch peripherals:', response.status);
      }
    } catch (error) {
      console.error('Error fetching peripherals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPeripherals =
    data?.peripherals.filter(peripheral => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          peripheral.name.toLowerCase().includes(query) ||
          peripheral.description.toLowerCase().includes(query) ||
          peripheral.sku.toLowerCase().includes(query) ||
          peripheral.category.name.toLowerCase().includes(query)
        );
      }
      return true;
    }) || [];

  const getStockBadge = (peripheral: Peripheral) => {
    switch (peripheral.stockStatus) {
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'low_stock':
        return (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-600"
          >
            Low Stock
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            In Stock
          </Badge>
        );
    }
  };

  const getStockIcon = (stockStatus: string) => {
    switch (stockStatus) {
      case 'out_of_stock':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('keyboard')) return <Keyboard className="h-4 w-4" />;
    if (name.includes('mouse')) return <Mouse className="h-4 w-4" />;
    if (name.includes('monitor')) return <Monitor className="h-4 w-4" />;
    if (name.includes('headphone') || name.includes('audio'))
      return <Headphones className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">
          Loading peripherals...
        </span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Peripheral Inventory
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage and monitor peripheral inventory levels
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Peripherals
            </CardTitle>
            <Monitor className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data?.lowStockCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data?.outOfStockCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.categories.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search peripherals..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {data?.categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <Button
          variant={showLowStock ? 'default' : 'outline'}
          onClick={() => setShowLowStock(!showLowStock)}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Low Stock Only
        </Button>
      </div>

      {/* Peripherals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeripherals.map(peripheral => (
          <Card
            key={peripheral.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {getCategoryIcon(peripheral.category.name)}
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">
                      {peripheral.name}
                    </CardTitle>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {peripheral.category.name}
                    </p>
                  </div>
                </div>
                {getStockIcon(peripheral.stockStatus)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {peripheral.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">
                    €{peripheral.price.toFixed(2)}
                  </span>
                  {getStockBadge(peripheral)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-500">Stock:</span>
                    <span className="ml-1 font-medium">
                      {peripheral.quantity}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500">SKU:</span>
                    <span className="ml-1 font-medium">{peripheral.sku}</span>
                  </div>
                </div>

                {peripheral.subType && (
                  <div className="text-sm">
                    <span className="text-neutral-500">Type:</span>
                    <span className="ml-1">{peripheral.subType}</span>
                  </div>
                )}

                {/* Key Specifications */}
                {Object.keys(peripheral.specifications).length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Key Specs:
                    </p>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {Object.entries(peripheral.specifications)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-neutral-500">{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPeripherals.length === 0 && !loading && (
        <div className="text-center py-12">
          <Monitor className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            No peripherals found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  );
}
