'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
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
  User,
  Cpu
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const hoverScale = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 }
  }
};

export default function AboutUs() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1]

  // References for scroll animations
  const storyRef = useRef(null)
  const valuesRef = useRef(null)
  const statsRef = useRef(null)
  const reviewsRef = useRef(null)
  const milestonesRef = useRef(null)
  const contactRef = useRef(null)
  const ctaRef = useRef(null)

  // Check if elements are in view
  const storyInView = useInView(storyRef, { once: true, amount: 0.3 })
  const valuesInView = useInView(valuesRef, { once: true, amount: 0.3 })
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 })
  const reviewsInView = useInView(reviewsRef, { once: true, amount: 0.3 })
  const milestonesInView = useInView(milestonesRef, { once: true, amount: 0.3 })
  const contactInView = useInView(contactRef, { once: true, amount: 0.3 })
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 })

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
        
        // Fetch stats and reviews in parallel to improve performance
        const [statsResponse, googleReviewsResponse] = await Promise.allSettled([
          fetch('/api/stats/about', { 
            next: { revalidate: 3600 } // Cache for 1 hour
          }),
          fetch('/api/reviews/google', { 
            next: { revalidate: 3600 } // Cache for 1 hour
          })
        ])
        
        // Process stats data
        if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
          try {
            const data = await statsResponse.value.json()
            
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
          } catch (e) {
            console.error('Error parsing stats data:', e)
            // Will use fallback stats
          }
        }
        
        // Process reviews data
        if (googleReviewsResponse.status === 'fulfilled' && googleReviewsResponse.value.ok) {          try {
            const googleReviewsData = await googleReviewsResponse.value.json()
            console.log('Reviews data received:', googleReviewsData)
            
            // Make sure each review has required fields
            if (googleReviewsData && googleReviewsData.reviews) {
              // Add a default comment if it's missing
              googleReviewsData.reviews = googleReviewsData.reviews.map((review: Review) => ({
                ...review,
                comment: review.comment || 'Great service and excellent products!'
              }))
            }
            
            setGoogleReviewsData(googleReviewsData)
          } catch (e) {
            console.error('Error parsing reviews data:', e)
            // Will use fallback reviews
          }
        }
        
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
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
      </motion.div>
      
      {/* Our story */}
      <motion.div 
        ref={storyRef}
        className="grid md:grid-cols-2 gap-12 mb-16 items-center"
        variants={fadeInUp}
        initial="hidden"
        animate={storyInView ? "visible" : "hidden"}
      >
        <motion.div variants={fadeInUp}>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
            {t('about.ourStory')}
          </h2>
          <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
            <p>{t('about.storyParagraph1')}</p>
            <p>{t('about.storyParagraph2')}</p>
            <p>{t('about.storyParagraph3')}</p>
          </div>
        </motion.div>
        <motion.div 
          className="bg-neutral-200 dark:bg-neutral-700 rounded-lg h-96 flex items-center justify-center"
          variants={fadeInUp}
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <div className="relative w-full h-full overflow-hidden rounded-lg">
            <Image 
              src="/images/office.png"
              alt="Dark PC" 
              fill 
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </motion.div>
      
      {/* Core values */}
      <motion.div 
        ref={valuesRef}
        className="mb-16"
        variants={staggerContainer}
        initial="hidden"
        animate={valuesInView ? "visible" : "hidden"}
      >
        <motion.h2 
          variants={fadeInUp}
          className="text-2xl font-bold text-neutral-900 dark:text-white mb-8 text-center"
        >
          {t('about.coreValues')}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 text-center"
            variants={fadeInUp}
            whileHover={hoverScale.hover}
          >
            <div className="w-16 h-16 bg-brand-blue-50 dark:bg-brand-red-900/30 rounded-full flex items-center justify-center text-brand-blue-600 dark:text-brand-red-500 mx-auto mb-4">
              <Trophy size={32} />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
              {t('about.qualityTitle')}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {t('about.qualityText')}
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 text-center"
            variants={fadeInUp}
            whileHover={hoverScale.hover}
          >
            <div className="w-16 h-16 bg-brand-blue-50 dark:bg-brand-red-900/30 rounded-full flex items-center justify-center text-brand-blue-600 dark:text-brand-red-500 mx-auto mb-4">
              <Wrench size={32} />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
              {t('about.expertiseTitle')}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {t('about.expertiseText')}
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 text-center"
            variants={fadeInUp}
            whileHover={hoverScale.hover}
          >
            <div className="w-16 h-16 bg-brand-blue-50 dark:bg-brand-red-900/30 rounded-full flex items-center justify-center text-brand-blue-600 dark:text-brand-red-500 mx-auto mb-4">
              <ThumbsUp size={32} />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
              {t('about.satisfactionTitle')}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {t('about.satisfactionText')}
            </p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Stats */}
      <motion.div 
        ref={statsRef}
        className="mb-16 bg-neutral-50 dark:bg-neutral-900 rounded-lg py-10"
        variants={fadeInUp}
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
      >
        <motion.h2 
          variants={fadeInUp}
          className="text-2xl font-bold text-neutral-900 dark:text-white mb-8 text-center"
        >
          {t('about.byTheNumbers')}
        </motion.h2>
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto px-4"
          variants={staggerContainer}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
        >
          {loading ? (
            <div className="col-span-4 flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue-500 dark:border-brand-red-500"></div>
            </div>
          ) : (
            stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="flex justify-center mb-3">
                  {stat.icon}
                </div>
                <motion.p 
                  className="text-3xl md:text-4xl font-bold text-brand-blue-600 dark:text-brand-red-500 mb-2"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {stat.label}
                </p>
              </motion.div>
            ))
          )}
        </motion.div>
      </motion.div>
      
      {/* Google Business Reviews */}
      <motion.div 
        ref={reviewsRef}
        className="mb-16"
        variants={fadeInUp}
        initial="hidden"
        animate={reviewsInView ? "visible" : "hidden"}
      >
        <div className="flex items-center justify-between mb-6">
          <motion.h2 
            variants={fadeInUp}
            className="text-2xl font-bold text-neutral-900 dark:text-white"
          >
            {t('about.customerReviews')}
          </motion.h2>
          
          {googleReviewsData && (
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
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
            </motion.div>
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
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate={reviewsInView ? "visible" : "hidden"}
          >
            {googleReviewsData.reviews.map((review, index) => (
              <motion.div 
                key={index} 
                className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6"
                variants={fadeInUp}
                whileHover={hoverScale.hover}
              >
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
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  "{review.comment || 'Great service and excellent products!'}"
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate={reviewsInView ? "visible" : "hidden"}
          >
            {[1, 2, 3].map((_, index) => (
              <motion.div 
                key={index} 
                className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6"
                variants={fadeInUp}
                whileHover={hoverScale.hover}
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full mr-3">
                    <User className="text-yellow-700 dark:text-yellow-400" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t('about.customerName')}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date().toLocaleDateString(locale === 'lv' ? 'lv-LV' : (locale === 'ru' ? 'ru-RU' : 'en-US'), {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex text-yellow-400 dark:text-yellow-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} fill="currentColor" size={16} opacity={1} />
                  ))}
                </div>
                
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  "{t('about.defaultReview')}"
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        <motion.div 
          className="mt-4 text-center"
          variants={fadeInUp}
        >
          <motion.a 
            href="https://business.google.com/reviews" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-brand-blue-600 dark:text-brand-red-500 font-medium"
            whileHover={{ scale: 1.05, x: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {t('about.viewAllReviews')} <ChevronRight size={16} className="ml-1" />
          </motion.a>
        </motion.div>
      </motion.div>
      
      {/* Milestones */}
      <motion.div 
        ref={milestonesRef}
        className="mb-16"
        variants={fadeInUp}
        initial="hidden"
        animate={milestonesInView ? "visible" : "hidden"}
      >
        <motion.h2 
          variants={fadeInUp}
          className="text-2xl font-bold text-neutral-900 dark:text-white mb-8 text-center"
        >
          {t('about.journey')}
        </motion.h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-brand-blue-200 dark:bg-brand-red-900/30 transform -translate-x-1/2"></div>
          
          <motion.div 
            className="space-y-12"
            variants={staggerContainer}
            initial="hidden"
            animate={milestonesInView ? "visible" : "hidden"}
          >
            {milestones.map((milestone, index) => (
              <motion.div 
                key={index} 
                className="relative flex items-center justify-center"
                variants={fadeInUp}
              >
                <motion.div 
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                  animate={milestonesInView ? { opacity: 1, x: 0 } : { opacity: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                  {/* Year */}
                  <div className={`w-28 text-center ${index % 2 === 0 ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'}`}>
                    <span className="text-2xl font-bold text-brand-blue-600 dark:text-brand-red-500">
                      {milestone.year}
                    </span>
                  </div>
                  
                  {/* Circle on the timeline */}
                  <motion.div 
                    className="relative z-10"
                    initial={{ scale: 0 }}
                    animate={milestonesInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.3 }}
                  >
                    <div className="w-10 h-10 bg-brand-blue-100 dark:bg-brand-red-900/30 rounded-full border-4 border-white dark:border-neutral-900 flex items-center justify-center">
                      <div className="w-4 h-4 bg-brand-blue-600 dark:bg-brand-red-500 rounded-full"></div>
                    </div>
                  </motion.div>
                  
                  {/* Content */}
                  <motion.div 
                    className={`md:w-96 p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-md ${index % 2 === 0 ? 'md:mr-10' : 'md:ml-10'}`}
                    whileHover={hoverScale.hover}
                  >
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {milestone.description}
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
      
      {/* Contact section */}
      <motion.div 
        ref={contactRef}
        className="grid md:grid-cols-2 gap-8 mb-16"
        variants={fadeInUp}
        initial="hidden"
        animate={contactInView ? "visible" : "hidden"}
      >
        <motion.div variants={fadeInUp}>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
            {t('about.visitStore')}
          </h2>
          <motion.div 
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            animate={contactInView ? "visible" : "hidden"}
          >
            <motion.div 
              className="flex items-start"
              variants={fadeInUp}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
            >
              <MapPin size={20} className="text-brand-blue-600 dark:text-brand-red-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white mb-1">{t('about.storeAddress')}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {t('contact.address')}
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start"
              variants={fadeInUp}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
            >
              <Clock size={20} className="text-brand-blue-600 dark:text-brand-red-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white mb-1">{t('about.openingHours')}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {t('contact.workingHours')}<br />
                  {t('contact.weekends')}<br />
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start"
              variants={fadeInUp}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
            >
              <Phone size={20} className="text-brand-blue-600 dark:text-brand-red-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white mb-1">{t('about.phone')}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {t('contact.phone')}
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start"
              variants={fadeInUp}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
            >
              <Mail size={20} className="text-brand-blue-600 dark:text-brand-red-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white mb-1">{t('about.email')}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {t('contact.email')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="bg-neutral-200 dark:bg-neutral-700 rounded-lg h-64 md:h-auto flex items-center justify-center relative w-full overflow-hidden"
          variants={fadeInUp}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={contactInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <iframe
            className="absolute top-0 left-0 w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            src="https://maps.google.com/maps?q=Kri%C5%A1j%C4%81%C5%86a+Valdem%C4%81ra+iela+1C%2C+Centra+rajons%2C+R%C4%ABga%2C+LV-1010&z=15&output=embed"
          ></iframe>
        </motion.div>
      </motion.div>
        {/* CTA section */}      <motion.div 
        ref={ctaRef}
        className="mt-12 bg-gradient-to-r from-blue-900/30 to-neutral-900 dark:from-red-900/30 dark:to-neutral-900 rounded-lg border border-blue-700/50 dark:border-neutral-800 shadow-lg p-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7 }}
        whileHover={{ scale: 1.02, boxShadow: "0px 10px 25px rgba(0,0,0,0.2)" }}
      >
        <motion.h2 
          className="text-2xl font-bold text-white mb-4"
          initial={{ y: -10, opacity: 0 }}
          animate={ctaInView ? { y: 0, opacity: 1 } : { y: -10, opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {t('components.needCompletePc')}
        </motion.h2>
        <motion.p 
          className="text-neutral-300 mb-6 max-w-2xl mx-auto"
          initial={{ y: 10, opacity: 0 }}
          animate={ctaInView ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {t('components.preConfiguredDesc')}
        </motion.p>
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={ctaInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>              <Link
                  href={`/${locale}/configurator`}
                  className="px-6 py-3 bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700 border border-blue-500 dark:border-red-500"
                >
                  <Cpu size={18} className="inline-block mr-2" />
                  {t('components.buildYourOwnPc')}
                </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={`/${locale}/shop/ready-made`}
              className="px-6 py-3 bg-white text-neutral-900 rounded-md hover:bg-neutral-100 border border-neutral-300"
            >
              <Monitor size={18} className="inline-block mr-2" />
              {t('components.readyMadePcs')}
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}