'use client'

import CategoryPage from '@/app/components/CategoryPage/CategoryPage'

interface ComponentCategoryPageProps {
  params: { slug: string }
}

export default async function ComponentCategoryPage({ params }: ComponentCategoryPageProps) {
  return <CategoryPage params={Promise.resolve(params)} type="component" />
}