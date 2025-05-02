'use client'

import UniversalProductPage from '@/app/components/Products/UniversalProductPage'

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  console.log("ProductDetailPage params:", params);
  return <UniversalProductPage />
}