'use client'

import { useState } from 'react'
import { X, Monitor, Package, DollarSign, Calendar, User, CheckCircle, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Configuration {
  id: string
  name: string
  userId: string
  userName?: string
  userEmail?: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  totalPrice: number
  createdAt: string
  description?: string
  isTemplate: boolean
  isPublic: boolean
  components: Array<{
    id: string
    name: string
    category: string
    price: number
    quantity: number
  }>
}

interface ConfigDetailsProps {
  configuration: Configuration
  onClose: () => void
}

export function ConfigDetails({ configuration, onClose }: ConfigDetailsProps) {
  const t = useTranslations()
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'history'>('overview')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
          {t('admin.charts.draft')}
        </span>
      case 'SUBMITTED':
        return <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full text-sm">
          {t('admin.charts.pendingReview')}
        </span>
      case 'APPROVED':
        return <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm">
          {t('admin.charts.approved')}
        </span>
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm">
          {t('admin.charts.rejected')}
        </span>
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="text-primary" size={24} />
            <div>
              <h2 className="text-xl font-semibold dark:text-white">{configuration.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.charts.configurationDetail')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {t('admin.charts.overview')}
            </button>
            <button
              onClick={() => setActiveTab('components')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'components'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {t('admin.charts.components')} ({configuration.components.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'history'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {t('admin.charts.history')}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.charts.status')}</h3>
                    <div className="mt-1">{getStatusBadge(configuration.status)}</div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.charts.totalPrice')}</h3>
                    <div className="mt-1 text-2xl font-bold dark:text-white">€{configuration.totalPrice.toFixed(2)}</div>
                  </div>
                  
                  {configuration.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.charts.description')}</h3>
                      <p className="mt-1 text-gray-900 dark:text-white">{configuration.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.charts.createdBy')}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <div className="text-gray-900 dark:text-white">{configuration.userName || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{configuration.userEmail}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.charts.createdOn')}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {new Date(configuration.createdAt).toLocaleDateString()} at {new Date(configuration.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.charts.visibility')}</h3>
                    <div className="mt-1 flex gap-4">
                      {configuration.isTemplate && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm">
                          {t('admin.charts.template')}
                        </span>
                      )}
                      {configuration.isPublic && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-sm">
                          {t('admin.charts.public')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Component Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('admin.charts.componentSummary')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(
                    configuration.components.reduce((acc, component) => {
                      acc[component.category] = (acc[component.category] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([category, count]) => (
                    <div key={category} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{category}</div>
                      <div className="text-xl font-semibold dark:text-white">{count} item{count > 1 ? 's' : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'components' && (
            <div className="space-y-4">
              {configuration.components.map((component) => (
                <div key={component.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Package className="text-gray-400" size={20} />
                    <div>
                      <div className="font-medium dark:text-white">{component.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{component.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Qty: {component.quantity}
                    </div>
                    <div className="font-medium dark:text-white">
                      €{(component.price * component.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 pt-4 border-t dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold dark:text-white">{t('admin.charts.total')}</div>
                  <div className="text-2xl font-bold dark:text-white">€{configuration.totalPrice.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                {t('admin.charts.historyText')}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {t('admin.charts.close')}
          </button>
        </div>
      </div>
    </div>
  )
}