'use client'

import UniversalProductPage from '@/app/components/Products/UniversalProductPage'
import { useTranslations } from 'next-intl'

/**
 * Produkta detalizētās informācijas lapa
 * Rāda konkrēta produkta pilnu informāciju, izmantojot universālo produkta komponenti
 */
export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations('common')
  console.log("ProductDetailPage params:", params);
  
  if (!params || !params.id) {
    console.error("Missing or invalid product ID in params");
    return <div>{t('productIdMissing')}</div>
  }
  
  return <UniversalProductPage productId={params.id} />
}