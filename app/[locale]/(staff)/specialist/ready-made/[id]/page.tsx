'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Edit, ShoppingCart, Eye, Trash2 } from 'lucide-react';
import AnimatedButton from '@/app/components/ui/animated-button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Loading from '@/app/components/ui/Loading';

interface PCDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  price: number;
  isPublic: boolean;
  isTemplate: boolean;
  viewCount: number;
  createdAt: string;
  components: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }[];
}

export default function ReadyMadePCDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [pc, setPC] = useState<PCDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    fetchPCDetails();
  }, [params.id]);

  const fetchPCDetails = async () => {
    try {
      const response = await fetch(
        `/api/specialist/products/ready-made/${params.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setPC(data);
      }
    } catch (error) {
      console.error('Error fetching PC details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this PC configuration?'))
      return;

    try {
      const response = await fetch(
        `/api/specialist/products/ready-made/${params.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        router.push(`/${locale}/specialist/ready-made`);
      }
    } catch (error) {
      console.error('Error deleting PC:', error);
    }
  };

  const handlePublish = async () => {
    try {
      const response = await fetch(
        `/api/specialist/products/ready-made/${params.id}/publish`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        await fetchPCDetails();
        alert('PC configuration published successfully!');
      }
    } catch (error) {
      console.error('Error publishing PC:', error);
      alert('Failed to publish PC configuration');
    }
  };

  if (loading || !pc) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {' '}
        <AnimatedButton
          onClick={() => router.back()}
          title={t('common.back')}
          direction="left"
          className="text-neutral-600 dark:text-neutral-400"
        />
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{pc.name}</CardTitle>
              <div className="flex gap-2">
                <Badge
                  className={
                    pc.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800'
                      : pc.status === 'APPROVED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-neutral-100 text-neutral-800'
                  }
                >
                  {t(`shop.status.${pc.status.toLowerCase()}`)}
                </Badge>
                <Badge
                  className={
                    pc.isPublic
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {pc.isPublic
                    ? t('shop.visibility.public')
                    : t('shop.visibility.private')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <h4 className="font-medium mb-2">{t('common.description')}</h4>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {pc.description || t('common.noDescription')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">
                    {t('shop.table.category')}
                  </h4>
                  <p className="capitalize">
                    {t(`shop.filters.${pc.category.toLowerCase()}`)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">
                    {t('common.createdDate')}
                  </h4>
                  <p>{new Date(pc.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">{t('shop.table.price')}</h4>
                  <p className="text-lg font-semibold">€{pc.price}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">{t('shop.table.views')}</h4>
                  <p>{pc.viewCount}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">{t('shop.components')}</h4>
                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-neutral-50 dark:bg-neutral-800">
                        <th className="px-4 py-2 text-left">
                          {t('shop.table.component')}
                        </th>
                        <th className="px-4 py-2 text-left">
                          {t('shop.table.category')}
                        </th>
                        <th className="px-4 py-2 text-center">
                          {t('shop.table.quantity')}
                        </th>
                        <th className="px-4 py-2 text-right">
                          {t('shop.table.price')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pc.components.map(component => (
                        <tr key={component.id} className="border-b">
                          <td className="px-4 py-2">{component.name}</td>
                          <td className="px-4 py-2">{component.category}</td>
                          <td className="px-4 py-2 text-center">
                            {component.quantity}
                          </td>
                          <td className="px-4 py-2 text-right">
                            €{component.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-neutral-50 dark:bg-neutral-800">
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-right font-medium"
                        >
                          {t('shop.table.total')}:
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">
                          €{pc.price}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                {pc.status === 'APPROVED' && !pc.isPublic && (
                  <Button onClick={handlePublish}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t('shop.actions.publishToShop')}
                  </Button>
                )}
                <Link
                  href={`/${locale}/specialist/configurations/${pc.id}/edit`}
                >
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    {t('common.edit')}
                  </Button>
                </Link>
                <Link href={`/${locale}/shop/product/${pc.id}`} target="_blank">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    {t('shop.actions.viewInShop')}
                  </Button>
                </Link>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
