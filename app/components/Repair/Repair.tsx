'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  Wrench,
  HardDrive,
  Cpu,
  Monitor,
  Calendar,
  Clock,
  Zap,
  CheckCircle,
  ChevronRight,
  Shield
} from 'lucide-react'

// Mock repair services
const repairServices = [
  {
    id: 'diagnostics',
    name: 'PC Diagnostics & Troubleshooting',
    icon: <Wrench size={24} />,
    description: 'Complete computer diagnostics to identify hardware and software issues.',
    price: 29.99,
    timeEstimate: '1-2 hours',
  },
  {
    id: 'hardware-replacement',
    name: 'Hardware Replacement',
    icon: <Cpu size={24} />,
    description: 'Professional replacement of damaged or failing hardware components.',
    price: 49.99,
    timeEstimate: '1-3 hours',
  },
  {
    id: 'data-recovery',
    name: 'Data Recovery',
    icon: <HardDrive size={24} />,
    description: 'Recovery of lost, deleted, or corrupted data from storage devices.',
    price: 79.99,
    timeEstimate: '1-3 days',
  },
  {
    id: 'virus-removal',
    name: 'Virus & Malware Removal',
    icon: <Shield size={24} />,
    description: 'Removal of viruses, malware, and other threats from your computer.',
    price: 59.99,
    timeEstimate: '2-4 hours',
  },
  {
    id: 'screen-repair',
    name: 'Monitor & Screen Repair',
    icon: <Monitor size={24} />,
    description: 'Repair of cracked, broken, or malfunctioning displays.',
    price: 89.99,
    timeEstimate: '1-2 days',
  },
  {
    id: 'performance-optimization',
    name: 'Performance Optimization',
    icon: <Zap size={24} />,
    description: 'Speed up your computer by optimizing software and hardware settings.',
    price: 39.99,
    timeEstimate: '2-3 hours',
  },
]

// Mock benefits
const benefits = [
  {
    icon: <CheckCircle size={20} />,
    title: 'Certified Technicians',
    description: 'Our repairs are performed by certified professionals with years of experience.',
  },
  {
    icon: <Shield size={20} />,
    title: 'Warranty on Repairs',
    description: 'All our repair services come with a warranty for your peace of mind.',
  },
  {
    icon: <Clock size={20} />,
    title: 'Quick Turnaround',
    description: 'We aim to complete most repairs within 24-48 hours.',
  },
  {
    icon: <Zap size={20} />,
    title: 'Transparent Pricing',
    description: 'No hidden fees. You\'ll always know the full price before we start.',
  },
]

export default function RepairsPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [issue, setIssue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    alert('Your repair request has been submitted! We will contact you shortly.')
    
    // Reset form
    setName('')
    setEmail('')
    setPhone('')
    setIssue('')
    setIsSubmitting(false)
  }
  
  const handleBookRepair = (serviceId: string) => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(`${pathname}?service=${serviceId}`)}`)
      return
    }
    
    router.push(`/${locale}/repairs/book?service=${serviceId}`)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Computer Repair Services
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Professional repair services for your PC, laptop, and peripherals. Fast, reliable, and affordable.
        </p>
      </div>
      
      {/* Hero section */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 mb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Expert Computer Repair
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Having issues with your computer? Our team of certified technicians can help! 
              We offer a wide range of repair services for all types of computers, from basic 
              troubleshooting to complex hardware repairs.
            </p>
            <div className="flex items-center text-red-600 dark:text-red-400 font-medium">
              <Calendar size={20} className="mr-2" />
              Same-day appointments available
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Request a Repair
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="issue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Describe the Issue
                  </label>
                  <textarea
                    id="issue"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    required
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Repair services */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Our Repair Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repairServices.map((service) => (
            <div key={service.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                {service.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {service.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {service.description}
              </p>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock size={16} className="mr-1" />
                  {service.timeEstimate}
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Starting at €{service.price.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => handleBookRepair(service.id)}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Book This Service
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Benefits section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Why Choose Our Repair Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* FAQ section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                How long do repairs usually take?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Most repairs are completed within 24-48 hours, depending on the issue and availability of parts. 
                We'll provide an estimated timeline when you bring in your device.
              </p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer a warranty on repairs?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Yes, all our repairs come with a 90-day warranty on parts and labor. 
                If the same issue occurs within this period, we'll fix it at no additional cost.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What if you can't fix my computer?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If we're unable to fix your computer, you'll only be charged for the diagnostic fee. 
                We'll provide recommendations for your next steps, which might include replacement options.
              </p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do I need to make an appointment?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                While walk-ins are welcome, we recommend making an appointment to ensure faster service. 
                You can book online or call us to schedule a convenient time.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-red-600 text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Get Your Device Fixed?
        </h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Don't let computer problems slow you down. Our expert technicians are ready to help you get your device running smoothly again.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => router.push(`/${locale}/repairs/book`)}
            className="px-6 py-3 bg-white text-red-600 font-semibold rounded-md hover:bg-gray-100"
          >
            Book a Repair
          </button>
          <button
            onClick={() => {
              const contactForm = document.getElementById('contact-form')
              if (contactForm) {
                contactForm.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="px-6 py-3 bg-transparent border border-white text-white font-semibold rounded-md hover:bg-red-700"
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  )
}