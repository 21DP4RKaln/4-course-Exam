import CategoryPage from '@/app/components/CategoryPage/CategoryPage'

export default function Page({ params }: { params: { slug: string } }) {
  return <CategoryPage params={Promise.resolve({ category: params.slug })} type="component" />
}
