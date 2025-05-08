'use client'

import ProductDetail from '@/app/components/Shop/ProductDetail'

interface PeripheralDetailPageProps {
  params: { 
    slug: string;
    id: string;
  }
}

export default function PeripheralDetailPage({ params }: PeripheralDetailPageProps) {
  return <ProductDetail params={params} type="peripheral" />
}