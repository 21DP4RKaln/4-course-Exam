'use client'

import CategoryPage from '@/app/components/CategoryPage/CategoryPage'

interface ComponentCategoryPageProps {
  params: { slug: string }
}

export default function ComponentCategoryPage({ params }: ComponentCategoryPageProps) {
  return <CategoryPage params={params} type="component" />
}