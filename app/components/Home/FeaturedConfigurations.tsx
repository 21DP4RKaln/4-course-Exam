'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Heart, ChevronRight } from 'lucide-react'

const mockConfigurations = [
  {
    id: '1',
    name: 'Gaming Beast',
    description: 'High-end gaming PC with RTX 4080, i9 processor',
    price: 2499,
    imageUrl: null,
  },
  {
    id: '2',
    name: 'Creator Workstation',
    description: 'Optimized for video editing and 3D rendering',
    price: 3299,
    imageUrl: null,
  },
  {
    id: '3',
    name: 'Office Workhorse',
    description: 'Perfect for productivity and business applications',
    price: 999,
    imageUrl: null,
  },
  {
    id: '4',
    name: 'Budget Gaming',
    description: 'Affordable gaming solution with great performance',
    price: 899,
    imageUrl: null,
  },
]

export default function FeaturedConfigurations() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Popular Configurations
        </h2>
        <Link
          href={`/${locale}/shop/ready-made`}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockConfigurations.map((config) => (
          <div 
            key={config.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Placeholder for image */}
            <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">
                PC Image
              </span>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {config.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {config.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  €{config.price}
                </span>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                    <Heart size={20} />
                  </button>
                  <button className="p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}