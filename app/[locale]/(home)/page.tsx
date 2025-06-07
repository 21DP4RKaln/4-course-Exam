'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('@/app/components/Home/HeroSection'), {
  ssr: true,
});
const FeaturedConfigurations = dynamic(
  () => import('@/app/components/Home/FeaturedConfigurations'),
  { ssr: true }
);
const ServicesSection = dynamic(
  () => import('@/app/components/Home/ServicesSection'),
  { ssr: true }
);

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="space-y-8 md:space-y-12">
      <HeroSection />
      <FeaturedConfigurations />
      <ServicesSection />
    </div>
  );
}
