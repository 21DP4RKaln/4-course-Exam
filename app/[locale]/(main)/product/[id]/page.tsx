'use client'

import UniversalProductPage from '@/app/components/Products/UniversalProductPage'

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  console.log("ProductDetailPage params:", params);
  if (!params || !params.id) {
    console.error("Missing or invalid product ID in params");
    return <div>Product ID is missing</div>;
  }
  return <UniversalProductPage productId={params.id} />
}