'use client'

import { motion } from 'framer-motion'
import { Clock, Cpu, MemoryStick, HardDrive, Zap, Monitor, Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { UserConfiguration } from '@/lib/services/dashboardService'

interface ConfigurationCardProps {
  configuration: UserConfiguration
  getStatusColor: (status: string) => string
  formatDate: (date: string) => string
  locale: string
  onEdit?: (configId: string) => void
  onOrder?: (configId: string) => void
}

export default function ConfigurationCard({
  configuration,
  getStatusColor,
  formatDate,
  locale,
  onEdit,
  onOrder
}: ConfigurationCardProps) {
  const t = useTranslations()
  const router = useRouter()
  const [imageError, setImageError] = useState(false)

  const caseComponent = configuration.components?.find(comp => 
    comp.category?.toLowerCase() === 'case' || 
    comp.category?.toLowerCase() === 'cases' ||
    comp.name?.toLowerCase().includes('case')
  )

  const cpu = configuration.components?.find(comp => 
    comp.category?.toLowerCase() === 'cpu' || 
    comp.category?.toLowerCase() === 'processor'
  )
  const gpu = configuration.components?.find(comp => 
    comp.category?.toLowerCase() === 'gpu' || 
    comp.category?.toLowerCase() === 'graphics'
  )
  const ram = configuration.components?.find(comp => 
    comp.category?.toLowerCase() === 'ram' || 
    comp.category?.toLowerCase() === 'memory'
  )
  const storage = configuration.components?.find(comp => 
    comp.category?.toLowerCase() === 'storage' ||
    comp.category?.toLowerCase() === 'ssd' ||
    comp.category?.toLowerCase() === 'hdd'
  )
  const getImageUrl = () => {
    if (caseComponent?.imageUrl && !imageError) {
      return caseComponent.imageUrl
    }
    
    return '/products/case/corsair-7000d-airflow.jpg'
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(configuration.id)
    } else {
      router.push(`/${locale}/configurator?edit=${configuration.id}`)
    }
  }

  const handleOrder = () => {
    if (onOrder) {
      onOrder(configuration.id)
    } else if (configuration.status === 'APPROVED') {
      router.push(`/${locale}/shop/product/${configuration.id}`)
    }
  }

  return (
    <motion.div
      className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden group hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 overflow-hidden">
        <img
          src={getImageUrl()}
          alt={configuration.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(configuration.status)}`}>
            {configuration.status}
          </span>
        </div>

        {/* Heart Icon for Wishlist */}
        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-neutral-800 transition-colors">
          <Heart size={16} className="text-neutral-600 dark:text-neutral-400 hover:text-red-500" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Configuration Name and Description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1 line-clamp-1">
            {configuration.name}
          </h3>
          {configuration.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {configuration.description}
            </p>
          )}
          <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            <Clock size={12} className="mr-1" />
            {formatDate(configuration.createdAt)}
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          {cpu && (
            <div className="flex items-center text-neutral-600 dark:text-neutral-400">
              <Cpu size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">{cpu.name}</span>
            </div>
          )}
          {gpu && (
            <div className="flex items-center text-neutral-600 dark:text-neutral-400">
              <Monitor size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">{gpu.name}</span>
            </div>
          )}
          {ram && (
            <div className="flex items-center text-neutral-600 dark:text-neutral-400">
              <MemoryStick size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">{ram.name}</span>
            </div>
          )}
          {storage && (
            <div className="flex items-center text-neutral-600 dark:text-neutral-400">
              <HardDrive size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">{storage.name}</span>
            </div>
          )}
        </div>

        {/* Performance Indicator */}
        {(cpu || gpu) && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              <span className="flex items-center">
                <Zap size={12} className="mr-1" />
                {t('configurator.performance')}
              </span>
              <span>85%</span>
            </div>
            <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-neutral-900 dark:text-white">
            €{configuration.totalPrice.toFixed(2)}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="px-3 py-1.5 text-xs border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              {t('common.edit')}
            </button>
            
            {configuration.status === 'APPROVED' && (
              <button
                onClick={handleOrder}
                className="px-3 py-1.5 text-xs bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700 transition-colors"
              >
                {t('common.view')}
              </button>
            )}
              {configuration.status === 'DRAFT' && (
              <button
                onClick={() => router.push(`/${locale}/configurator?load=${configuration.id}`)}
                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {t('dashboard.configurationCard.continueBuilding')}
              </button>
            )}
          </div>
        </div>        {/* Component Count */}
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
            {configuration.components?.length || 0} {t('dashboard.configurationCard.components')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
