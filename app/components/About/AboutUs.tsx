'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
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
  CheckCircle
} from 'lucide-react'

// Mock team members
const teamMembers = [
  {
    name: 'Jānis Bērziņš',
    position: 'Founder & CEO',
    bio: 'Computer engineer with over 15 years of experience in building custom PCs and managing tech businesses.',
    image: null,
  },
  {
    name: 'Anna Liepiņa',
    position: 'Technical Director',
    bio: 'Hardware specialist with extensive knowledge of component compatibility and PC optimization.',
    image: null,
  },
  {
    name: 'Mārtiņš Ozols',
    position: 'Lead PC Builder',
    bio: 'Master craftsman with attention to detail and passion for creating perfectly optimized builds.',
    image: null,
  },
  {
    name: 'Laura Kalna',
    position: 'Customer Support Manager',
    bio: 'Dedicated to providing exceptional customer experiences and technical support.',
    image: null,
  },
]

// Mock milestones
const milestones = [
  { year: 2018, title: 'Founded in Riga', description: 'IvaPro was established as a small custom PC building shop.' },
  { year: 2020, title: 'Online Store Launch', description: 'Expanded to e-commerce with our configurator tool.' },
  { year: 2022, title: 'Service Center Opening', description: 'Opened our dedicated repair and service center.' },
  { year: 2024, title: 'Expanded to Baltic Region', description: 'Started operations in Lithuania and Estonia.' },
]

// Mock stats
const stats = [
  { label: 'Customers Served', value: '5,000+' },
  { label: 'PCs Built', value: '3,800+' },
  { label: 'Years in Business', value: '6' },
  { label: 'Satisfaction Rate', value: '98%' },
]

export default function AboutPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero section */}
      <div className="mb-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          About IvaPro
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
          We're passionate about building the perfect PC for every customer's needs.
          From gaming rigs to professional workstations, we deliver quality, performance, and reliability.
        </p>
      </div>
      
      {/* Our story */}
      <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Our Story
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              IvaPro started in 2018 as a small custom PC building shop in Riga, Latvia. 
              Founded by Jānis Bērziņš, a computer engineer with a passion for building 
              high-performance systems, our company began with a simple mission: to create 
              custom PCs that perfectly match each customer's needs and preferences.
            </p>
            <p>
              What started as a one-person operation quickly grew as word spread about our 
              attention to detail, quality components, and excellent customer service. 
              By 2020, we had expanded to e-commerce with our online configurator tool, 
              allowing customers to design their dream PCs from anywhere.
            </p>
            <p>
              In 2022, we opened our dedicated repair and service center, adding technical 
              support and repair services to our offerings. Today, IvaPro is a trusted name 
              in the Baltic region, known for building reliable, high-performance computers 
              and providing exceptional customer support.
            </p>
          </div>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Company Image</span>
        </div>
      </div>
      
      {/* Core values */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Our Core Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4">
              <Trophy size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Quality
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We never compromise on component quality. Every PC we build uses carefully 
              selected parts from trusted manufacturers, ensuring reliability and performance.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4">
              <Wrench size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Expertise
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our team consists of certified technicians and experienced builders who stay 
              up-to-date with the latest technologies and best practices in PC building.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4">
              <ThumbsUp size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Customer Satisfaction
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your satisfaction is our top priority. We're committed to providing excellent 
              service before, during, and after your purchase with comprehensive support.
            </p>
          </div>
        </div>
      </div>
      
      {/* Milestones */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Our Journey
        </h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-red-200 dark:bg-red-900/30 transform -translate-x-1/2"></div>
          
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative flex items-center justify-center">
                <div className={`flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                  {/* Year */}
                  <div className={`w-28 text-center ${index % 2 === 0 ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'}`}>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {milestone.year}
                    </span>
                  </div>
                  
                  {/* Circle on the timeline */}
                  <div className="relative z-10">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                      <div className="w-4 h-4 bg-red-600 dark:bg-red-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className={`md:w-96 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md ${index % 2 === 0 ? 'md:mr-10' : 'md:ml-10'}`}>
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
      
      {/* Stats */}
      <div className="mb-16 bg-gray-50 dark:bg-gray-900 rounded-lg py-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          IvaPro by the Numbers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto px-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                {stat.value}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Team */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">
                  Profile Photo
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-red-600 dark:text-red-400 text-sm mb-3">
                  {member.position}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Contact section */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Visit Our Store
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <MapPin size={20} className="text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Store Address</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Brīvības iela 151, Riga, LV-1012, Latvia
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock size={20} className="text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Opening Hours</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Monday - Friday: 10:00 - 19:00<br />
                  Saturday: 10:00 - 16:00<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone size={20} className="text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Phone</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  +371 12345678
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail size={20} className="text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Email</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  info@ivapro.com
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 md:h-auto flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Map Location</span>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-red-600 text-white rounded-lg p-8 text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Build Your Dream PC?
        </h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Whether you want a custom-built PC or need help choosing the right components, our team is here to help you every step of the way.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            href={`/${locale}/configurator`}
            className="px-6 py-3 bg-white text-red-600 font-semibold rounded-md hover:bg-gray-100"
          >
            Start Building
          </Link>
          <Link
            href={`/${locale}/shop/ready-made`}
            className="px-6 py-3 bg-transparent border border-white text-white font-semibold rounded-md hover:bg-red-700"
          >
            Browse Ready-Made PCs
          </Link>
        </div>
      </div>
    </div>
  )
}