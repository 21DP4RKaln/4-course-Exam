'use client'

import UniversalProductPage from '@/app/components/Products/UniversalProductPage'

export default async function ShopProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  console.log("ShopProductPage params:", resolvedParams);
  if (!resolvedParams || !resolvedParams.id) {
    console.error("Missing or invalid product ID in params");
    return <div>Product ID is missing</div>;
  }
  return <UniversalProductPage productId={resolvedParams.id} />
}