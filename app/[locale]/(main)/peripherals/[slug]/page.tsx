'use client'

import CategoryPage from '@/app/components/CategoryPage/CategoryPage'

interface PeripheralCategoryPageProps {
  params: { slug: string }
}

export default function PeripheralCategoryPage({ params }: PeripheralCategoryPageProps) {
  return <CategoryPage params={Promise.resolve(params)} type="peripheral" />
}