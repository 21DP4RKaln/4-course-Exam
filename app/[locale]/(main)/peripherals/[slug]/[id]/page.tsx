import UniversalProductPage from '@/app/components/Products/UniversalProductPage'

interface PeripheralDetailPageProps {
  params: { slug: string; id: string }
}

export default function PeripheralDetailPage({ params }: PeripheralDetailPageProps) {
  return <UniversalProductPage productId={params.id} />
}
