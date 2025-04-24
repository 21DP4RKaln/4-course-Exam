'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Keyboard, 
  Mouse, 
  Monitor, 
  Headphones, 
  Speaker, 
  Printer,
  Mic,
  Camera,
  Search,
  ChevronRight,
  Star
} from 'lucide-react'

// Mock peripheral categories
const peripheralCategories = [
  { id: 'keyboards', name: 'Keyboards', icon: <Keyboard size={24} />, count: 28, description: 'Mechanical, membrane, and wireless keyboards for gaming and office work' },
  { id: 'mice', name: 'Mice', icon: <Mouse size={24} />, count: 35, description: 'Gaming mice, office mice, and wireless options' },
  { id: 'monitors', name: 'Monitors', icon: <Monitor size={24} />, count: 42, description: 'Gaming, ultrawide, and professional monitors with 4K and high refresh rates' },
  { id: 'headsets', name: 'Headsets & Headphones', icon: <Headphones size={24} />, count: 31, description: 'Gaming headsets, audiophile headphones, and wireless options' },
  { id: 'speakers', name: 'Speakers', icon: <Speaker size={24} />, count: 18, description: 'Desktop speakers, surround sound systems, and soundbars' },
  { id: 'microphones', name: 'Microphones', icon: <Mic size={24} />, count: 14, description: 'Streaming microphones, podcast setups, and communication devices' },
  { id: 'webcams', name: 'Webcams', icon: <Camera size={24} />, count: 12, description: 'HD and 4K webcams for streaming and video conferencing' },
  { id: 'printers', name: 'Printers', icon: <Printer size={24} />, count: 16, description: 'Inkjet and laser printers for home and office use' },
]

// Mock featured products
const featuredProducts = [
  { id: '1', name: 'Logitech G Pro X Mechanical Keyboard', category: 'keyboards', price: 129.99, rating: 4.8, image: null },
  { id: '2', name: 'Razer DeathAdder V3 Pro Gaming Mouse', category: 'mice', price: 149.99, rating: 4.9, image: null },
  { id: '3', name: 'ASUS ROG Swift 27" Gaming Monitor', category: 'monitors', price: 699.99, rating: 4.7, image: null },
  { id: '4', name: 'HyperX Cloud Alpha Wireless Headset', category: 'headsets', price: 199.99, rating: 4.6, image: null },
]

export default function PeripheralsPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter categories based on search query
  const filteredCategories = peripheralCategories.filter(category => 
    searchQuery === '' || 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Computer Peripherals
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Enhance your computing experience with our selection of high-quality peripherals and accessories.
        </p>
      </div>
      
      {/* Featured products section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product image placeholder */}
              <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">Product Image</span>
              </div>
              
              <div className="p-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {peripheralCategories.find(c => c.id === product.category)?.name}
                </span>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-1 mb-2">
                  {product.name}
                </h3>
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        size={14} 
                        className={i < Math.floor(product.rating) 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-gray-300 dark:text-gray-600"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {product.rating}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">
                    €{product.price.toFixed(2)}
                  </span>
                  <Link
                    href={`/${locale}/peripherals/${product.category}/${product.id}`}
                    className="text-red-600 dark:text-red-400 text-sm font-medium hover:underline"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Search bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search peripheral categories..."
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>
      
      {/* Peripheral categories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCategories.map((category) => (
          <Link
            key={category.id}
            href={`/${locale}/peripherals/${category.id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mr-4">
                {category.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category.count} products
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {category.description}
            </p>
            <div className="flex justify-end">
              <span className="text-red-600 dark:text-red-400 font-medium flex items-center">
                View all
                <ChevronRight size={16} className="ml-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Information section */}
      <div className="mt-16 bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Premium Peripherals for Every Setup
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Enhance your computing experience with our premium selection of keyboards, mice, monitors, 
          headsets, and other peripherals. We carry products from top brands like Logitech, Razer, 
          SteelSeries, Corsair, and more.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Whether you're a hardcore gamer looking for competitive gear, a creative professional 
          who needs precision and reliability, or a home user who wants quality products that last, 
          we have options to suit your needs and budget.
        </p>
      </div>
    </div>
  )
}