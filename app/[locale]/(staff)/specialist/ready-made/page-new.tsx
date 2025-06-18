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
  Computer,
  Eye,
  Edit,
  Plus,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ReadyMadePC {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  isPublic: boolean;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  components: Array<{
    id: string;
    componentId: string;
    quantity: number;
    component: {
      id: string;
      name: string;
      price: number;
      category: string;
    };
  }>;
  totalComponents: number;
  estimatedPrice: number;
}

interface ReadyMadePCResponse {
  configurations: ReadyMadePC[];
  categories: string[];
  total: number;
}

export default function ReadyMadePCsPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [data, setData] = useState<ReadyMadePCResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showPublicOnly, setShowPublicOnly] = useState(false);

  useEffect(() => {
    fetchReadyMadePCs();
  }, [selectedCategory, selectedStatus, showPublicOnly]);

  const fetchReadyMadePCs = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      if (showPublicOnly) params.append('isPublic', 'true');

      const response = await fetch(
        `/api/specialist/products/ready-made?${params}`
      );
      if (response.ok) {
        const responseData = await response.json();
        setData(responseData);
      } else {
        console.error('Failed to fetch ready-made PCs:', response.status);
      }
    } catch (error) {
      console.error('Error fetching ready-made PCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPCs =
    data?.configurations.filter(pc => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          pc.name.toLowerCase().includes(query) ||
          pc.description.toLowerCase().includes(query) ||
          pc.category.toLowerCase().includes(query)
        );
      }
      return true;
    }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'SUBMITTED':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
    }
  };

  const getVisibilityBadge = (isPublic: boolean) => {
    return isPublic ? (
      <Badge variant="outline" className="border-green-500 text-green-600">
        <Users className="h-3 w-3 mr-1" />
        Public
      </Badge>
    ) : (
      <Badge variant="outline">Private</Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">
          Loading ready-made PCs...
        </span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Ready-Made PC Configurations
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage pre-built PC configurations for customers
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New PC
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Configurations
            </CardTitle>
            <Computer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredPCs.filter(pc => pc.status === 'APPROVED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filteredPCs.filter(pc => pc.isPublic).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-orange-600" />
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
              placeholder="Search configurations..."
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
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <Button
          variant={showPublicOnly ? 'default' : 'outline'}
          onClick={() => setShowPublicOnly(!showPublicOnly)}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Public Only
        </Button>
      </div>

      {/* PC Configurations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPCs.map(pc => (
          <Card key={pc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{pc.name}</CardTitle>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {pc.category}
                  </p>
                </div>
                <Computer className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {pc.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">
                    €{pc.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-neutral-500">
                    Est: €{pc.estimatedPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(pc.status)}
                  {getVisibilityBadge(pc.isPublic)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-500">Components:</span>
                    <span className="ml-1 font-medium">
                      {pc.totalComponents}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Created:</span>
                    <span className="ml-1 font-medium">
                      {new Date(pc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {pc.user && (
                  <div className="text-sm">
                    <span className="text-neutral-500">Creator:</span>
                    <span className="ml-1">{pc.user.name}</span>
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

      {filteredPCs.length === 0 && !loading && (
        <div className="text-center py-12">
          <Computer className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            No configurations found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  );
}
