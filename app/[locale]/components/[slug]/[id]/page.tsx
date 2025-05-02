'use client'

import ProductDetail from '@/app/components/Shop/ProductDetail'

interface ComponentDetailPageProps {
  params: { 
    slug: string;
    id: string;
  }
}

export default function ComponentDetailPage({ params }: ComponentDetailPageProps) {
  return <ProductDetail params={params} type="component" />
}