import { useTranslations } from 'next-intl'
import HeroSection from '@/app/components/Home/HeroSection'
import FeaturedConfigurations from '@/app/components/Home/FeaturedConfigurations'
import ServicesSection from '@/app/components/Home/ServicesSection'

export default function HomePage() {
  const t = useTranslations()
  
  return (
    <div className="space-y-12">
      <h1>{t('home.welcome')}</h1>
      <HeroSection />
      <FeaturedConfigurations />
      <ServicesSection />
    </div>
  )
}