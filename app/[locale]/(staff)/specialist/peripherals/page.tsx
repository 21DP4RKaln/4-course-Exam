'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Peripheral {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
}

export default function PeripheralsPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [peripherals, setPeripherals] = useState<Peripheral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchPeripherals();
  }, []);

  const fetchPeripherals = async () => {
    try {
      const response = await fetch('/api/specialist/products/peripherals');
      if (response.ok) {
        const data = await response.json();
        setPeripherals(data);
      }
    } catch (error) {
      console.error('Error fetching peripherals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPeripherals = peripherals.filter(peripheral => {
    if (selectedCategory && peripheral.category !== selectedCategory)
      return false;
    if (
      searchQuery &&
      !peripheral.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Peripherals Inventory
        </h1>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search peripherals..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 dark:bg-neutral-800 dark:border-neutral-700"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="keyboard">Keyboards</option>
          <option value="mouse">Mice</option>
          <option value="monitor">Monitors</option>
          <option value="headset">Headsets</option>
          <option value="controller">Controllers</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-neutral-50 dark:bg-neutral-800">
                  <th className="px-6 py-3 text-left">Peripheral</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">SKU</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-center">Stock</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeripherals.map(peripheral => (
                  <tr key={peripheral.id} className="border-b">
                    <td className="px-6 py-4">{peripheral.name}</td>
                    <td className="px-6 py-4 capitalize">
                      {peripheral.category}
                    </td>
                    <td className="px-6 py-4">{peripheral.sku}</td>
                    <td className="px-6 py-4 text-right">
                      €{peripheral.price}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          peripheral.stock > 10
                            ? 'bg-green-100 text-green-800'
                            : peripheral.stock > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {peripheral.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/${locale}/peripherals/${peripheral.id}`}
                        target="_blank"
                      >
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
