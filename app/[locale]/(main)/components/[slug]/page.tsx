import CategoryPage from '@/app/components/CategoryPage/CategoryPage';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <CategoryPage
      params={Promise.resolve({ category: slug })}
      type="component"
    />
  );
}
