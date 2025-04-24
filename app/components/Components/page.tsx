'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Cpu, 
  Monitor, 
  HardDrive, 
  Zap, 
  Server, 
  Layers, 
  Fan,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react'

// Mock component categories with icon mapping
const componentCategories = [
  { id: 'cpu', name: 'CPUs', icon: <Cpu size={24} />, count: 24, description: 'Central Processing Units from Intel and AMD' },
  { id: 'motherboard', name: 'Motherboards', icon: <Server size={24} />, count: 18, description: 'ATX, Micro-ATX and Mini-ITX motherboards' },
  { id: 'gpu', name: 'Graphics Cards', icon: <Monitor size={24} />, count: 15, description: 'NVIDIA and AMD graphics cards' },
  { id: 'ram', name: 'Memory (RAM)', icon: <HardDrive size={24} />, count: 20, description: 'DDR4 and DDR5 memory modules' },
  { id: 'storage', name: 'Storage', icon: <HardDrive size={24} />, count: 22, description: 'SSDs, M.2 drives, and HDDs' },
  { id: 'psu', name: 'Power Supplies', icon: <Zap size={24} />, count: 16, description: 'Power supply units from 500W to 1300W' },
  { id: 'case', name: 'Cases', icon: <Layers size={24} />, count: 14, description: 'PC cases and chassis' },
  { id: 'cooling', name: 'Cooling', icon: <Fan size={24} />, count: 19, description: 'Air and liquid cooling solutions' },
]

export default function ComponentsPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter categories based on search query
  const filteredCategories = componentCategories.filter(category => 
    searchQuery === '' || 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Computer Components
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Browse our extensive selection of high-quality computer components for your custom PC build.
        </p>
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
            placeholder="Search component categories..."
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>
      
      {/* Component categories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Link
            key={category.id}
            href={`/${locale}/components/${category.id}`}
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
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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
      
      {/* Featured brands section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Featured Brands
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {/* Brand logos would go here */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-center">
              <span className="text-gray-400">Brand Logo</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Information section */}
      <div className="mt-16 bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Quality Components for Every Build
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          At IvaPro, we offer only high-quality, tested components from trusted manufacturers. 
          Whether you're building a high-end gaming PC, a workstation for content creation, 
          or a budget-friendly office computer, we have the components you need.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          All components come with manufacturer warranty and our expert team is available 
          to help you with compatibility questions and technical support.
        </p>
      </div>
    </div>
  )
}