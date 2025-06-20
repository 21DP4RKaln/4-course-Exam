'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const componentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  discountPrice: z
    .number()
    .min(0, 'Discount price must be positive')
    .nullable()
    .optional(),
  discountExpiresAt: z.string().nullable().optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  sku: z.string().min(1, 'SKU is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

type ComponentFormData = z.infer<typeof componentSchema>;

export default function EditComponentPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  console.log('Component Edit Page params:', params);
  console.log('Locale from pathname:', locale);
  console.log('Full pathname:', pathname);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [fetchingComponent, setFetchingComponent] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComponentFormData>({
    resolver: zodResolver(componentSchema),
  });

  // Pārbaudīt derīgu ID
  useEffect(() => {
    if (!params.id || params.id === 'undefined') {
      console.error('Invalid component ID:', params.id);
      router.push(`/${locale}/admin/components`);
      return;
    }
  }, [params.id, locale, router]);

  useEffect(() => {
    fetchComponent();
    fetchCategories();
  }, [params.id]);

  const fetchComponent = async () => {
    try {
      console.log('Fetching component with ID:', params.id);
      const response = await fetch(`/api/admin/components/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched component data:', data);
        reset({
          name: data.name,
          description: data.description || '',
          categoryId: data.categoryId,
          price: data.price,
          discountPrice: data.discountPrice || null,
          discountExpiresAt: data.discountExpiresAt
            ? new Date(data.discountExpiresAt).toISOString().split('T')[0]
            : null,
          stock: data.stock,
          sku: data.sku,
          imageUrl: data.imageUrl || '',
        });
      } else {
        console.error('Failed to fetch component, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching component:', error);
    } finally {
      setFetchingComponent(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const onSubmit = async (data: ComponentFormData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/components/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push(`/${locale}/admin/components`);
      }
    } catch (error) {
      console.error('Error updating component:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingComponent) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Edit Component
        </h1>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Same form fields as create page */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Name
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                SKU
              </label>
              <input
                type="text"
                {...register('sku')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.sku.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Price (€)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Discount Price (€)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('discountPrice', { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
              {errors.discountPrice && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.discountPrice.message}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Leave empty for no discount
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Discount Valid Until
              </label>
              <input
                type="date"
                {...register('discountExpiresAt')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
              {errors.discountExpiresAt && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.discountExpiresAt.message}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Leave empty for no expiration
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Stock
              </label>
              <input
                type="number"
                {...register('stock', { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.stock.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Category
              </label>
              <select
                {...register('categoryId')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Image URL
              </label>
              <input
                type="text"
                {...register('imageUrl')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
              {errors.imageUrl && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.imageUrl.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                {...register('description')}
                className="w-full px-3 py-2 border rounded-lg resize-none dark:bg-neutral-700 dark:border-neutral-600"
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
