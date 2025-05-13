'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Trophy,
  ThumbsUp,
  Wrench,
  Monitor,
  CheckCircle,
  Star,
  Circle,
  ChevronRight,
  User
} from 'lucide-react'

interface TeamMember {
  name: string;
  position: string;
  bio: string;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
}

interface Stat {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface Review {
  name: string;
  rating: number;
  comment: string;
  date: string;
  profileImage?: string | null;
}
interface GoogleReviewsData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export default function AboutUs() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1]

  const [stats, setStats] = useState<Stat[]>([])
  const [googleReviewsData, setGoogleReviewsData] = useState<GoogleReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const teamMembers: TeamMember[] = Array.isArray(t.raw('about.team')) 
    ? t.raw('about.team') as TeamMember[]
    : [];

  const milestones: Milestone[] = Array.isArray(t.raw('about.milestones'))
    ? t.raw('about.milestones') as Milestone[]
    : [];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        const response = await fetch('/api/stats/about')
        if (!response.ok) {
          throw new Error('Failed to fetch statistics')
        }
        
        const data = await response.json()

        const mappedStats: Stat[] = [
          {
            icon: <Monitor size={24} className="text-brand-blue-600 dark:text-brand-red-500" />,
            label: t('about.statComputers'),
            value: `${data.computersBuilt}`
          },
          {
            icon: <Users size={24} className="text-brand-blue-600 dark:text-brand-red-500" />,
            label: t('about.statCustomers'),
            value: `${data.customers}`
          },
          {
            icon: <CheckCircle size={24} className="text-brand-blue-600 dark:text-brand-red-500" />,
            label: t('about.statOrders'),
            value: `${data.completedOrders}`
          },
          {
            icon: <Trophy size={24} className="text-brand-blue-600 dark:text-brand-red-500" />,
            label: t('about.statExperience'),
            value: `${data.yearsInBusiness}`
          }
        ];
        
        setStats(mappedStats)
   
        const googleReviewsResponse = await fetch('/api/reviews/google')
        if (!googleReviewsResponse.ok) {
          throw new Error('Failed to fetch Google reviews data')
        }
        
        const googleReviewsData = await googleReviewsResponse.json()
        setGoogleReviewsData(googleReviewsData)
        
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again later.')

        const fallbackStats: Stat[] = [
          {
            icon: <Monitor size={24} className="text-brand-blue-600 dark:text-brand-red-500" />,
            label: t('about.statComputers'),
            value: '1,000+'
          },
          {
            icon: <Users size={24} className="text-brand-blue-600 dark:text-brand-red-500" />,
            label: t('about.statCustomers'),
            value: '2,500+'
          },
          {
            icon: <CheckCircle size={24} className="text-brand-blue-600 dark:text-brand-red-500" />,
            label: t('about.statOrders'),
            value: '3,000+'
          },
          {
            icon: <Trophy size={24} className="text-brand-blue-600 dark:text-brand-red-500" />,
            label: t('about.statExperience'),
            value: '5+'
          }
        ];
        
        setStats(fallbackStats)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [t])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero section */}
      <div className="mb-16">
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
          {t('about.subtitle')}
        </p>
      </div>
      
      {/* Our story */}
      <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('about.ourStory')}
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>{t('about.storyParagraph1')}</p>
            <p>{t('about.storyParagraph2')}</p>
            <p>{t('about.storyParagraph3')}</p>
          </div>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 flex items-center justify-center">
          <div className="relative w-full h-full overflow-hidden rounded-lg">
            <Image 
              src="/images/office.png"
              alt="Dark PC" 
              fill 
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Core values */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {t('about.coreValues')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-brand-blue-50 dark:bg-brand-red-900/30 rounded-full flex items-center justify-center text-brand-blue-600 dark:text-brand-red-500 mx-auto mb-4">
              <Trophy size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('about.qualityTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('about.qualityText')}
            </p>
          </div>
          
          <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-brand-blue-50 dark:bg-brand-red-900/30 rounded-full flex items-center justify-center text-brand-blue-600 dark:text-brand-red-500 mx-auto mb-4">
              <Wrench size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('about.expertiseTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('about.expertiseText')}
            </p>
          </div>
          
          <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-brand-blue-50 dark:bg-brand-red-900/30 rounded-full flex items-center justify-center text-brand-blue-600 dark:text-brand-red-500 mx-auto mb-4">
              <ThumbsUp size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('about.satisfactionTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('about.satisfactionText')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="mb-16 bg-gray-50 dark:bg-neutral-900 rounded-lg py-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {t('about.byTheNumbers')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto px-4">
          {loading ? (
            <div className="col-span-4 flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue-500 dark:border-brand-red-500"></div>
            </div>
          ) : (
            stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  {stat.icon}
                </div>
                <p className="text-3xl md:text-4xl font-bold text-brand-blue-600 dark:text-brand-red-500 mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Google Business Reviews */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('about.customerReviews')}
          </h2>
          
          {googleReviewsData && (
            <div className="flex items-center">
              <div className="text-yellow-400 dark:text-yellow-500 flex items-center mr-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    fill="currentColor" 
                    size={24} 
                    opacity={i < Math.floor(googleReviewsData.averageRating) ? 1 : 0.5}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{googleReviewsData.averageRating.toFixed(1)}/5</span>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : googleReviewsData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {googleReviewsData.reviews.map((review, index) => (
              <div key={index} className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-3">
                  {review.profileImage ? (
                    <img 
                      src={review.profileImage} 
                      alt={review.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                  ) : (
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full mr-3">
                      <User className="text-yellow-700 dark:text-yellow-400" size={20} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{review.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.date).toLocaleDateString(locale === 'lv' ? 'lv-LV' : (locale === 'ru' ? 'ru-RU' : 'en-US'), {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex text-yellow-400 dark:text-yellow-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} fill="currentColor" size={16} opacity={i < review.rating ? 1 : 0.5} />
                  ))}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">{t('about.NoReviews')}</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <a 
            href="https://business.google.com/reviews" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-brand-blue-600 dark:text-brand-red-500 font-medium"
          >
            {t('about.viewAllReviews')} <ChevronRight size={16} className="ml-1" />
          </a>
        </div>
      </div>
      
      {/* Milestones */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {t('about.journey')}
        </h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-brand-blue-200 dark:bg-brand-red-900/30 transform -translate-x-1/2"></div>
          
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative flex items-center justify-center">
                <div className={`flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                  {/* Year */}
                  <div className={`w-28 text-center ${index % 2 === 0 ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'}`}>
                    <span className="text-2xl font-bold text-brand-blue-600 dark:text-brand-red-500">
                      {milestone.year}
                    </span>
                  </div>
                  
                  {/* Circle on the timeline */}
                  <div className="relative z-10">
                    <div className="w-10 h-10 bg-brand-blue-100 dark:bg-brand-red-900/30 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                      <div className="w-4 h-4 bg-brand-blue-600 dark:bg-brand-red-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className={`md:w-96 p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-md ${index % 2 === 0 ? 'md:mr-10' : 'md:ml-10'}`}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Contact section */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('about.visitStore')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <MapPin size={20} className="text-brand-blue-600 dark:text-brand-red-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t('about.storeAddress')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('contact.address')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock size={20} className="text-brand-blue-600 dark:text-brand-red-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t('about.openingHours')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('contact.workingHours')}<br />
                  {t('contact.weekends')}<br />
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone size={20} className="text-brand-blue-600 dark:text-brand-red-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t('about.phone')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('contact.phone')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail size={20} className="text-brand-blue-600 dark:text-brand-red-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t('about.email')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('contact.email')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 md:h-auto flex items-center justify-center relative w-full overflow-hidden">
          <iframe
            className="absolute top-0 left-0 w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            src="https://maps.google.com/maps?q=Kri%C5%A1j%C4%81%C5%86a+Valdem%C4%81ra+iela+1C%2C+Centra+rajons%2C+R%C4%ABga%2C+LV-1010&z=15&output=embed"
          ></iframe>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-brand-blue-600 dark:bg-brand-red-600 text-white rounded-lg p-8 text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">
          {t('about.ctaTitle')}
        </h2>
        <p className="mb-6 max-w-2xl mx-auto">
          {t('about.ctaText')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            href={`/${locale}/configurator`}
            className="px-6 py-3 bg-white text-brand-blue-600 dark:text-brand-red-600 font-semibold rounded-md hover:bg-gray-100"
          >
            {t('about.startBuilding')}
          </Link>
          <Link
            href={`/${locale}/shop/ready-made`}
            className="px-6 py-3 bg-transparent border border-white text-white font-semibold rounded-md hover:bg-brand-blue-700 dark:hover:bg-brand-red-700"
          >
            {t('about.browseReadyMade')}
          </Link>
        </div>
      </div>
    </div>
  )
}