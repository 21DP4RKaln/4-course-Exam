import UniversalProductPage from '@/app/components/Products/UniversalProductPage'

export default function Page({ params }: { params: { slug: string; id: string } }) {
  return <UniversalProductPage productId={params.id} />
}
