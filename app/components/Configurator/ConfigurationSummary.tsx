'use client'

import { useTranslations } from 'next-intl'
import { Save, Send } from 'lucide-react'

interface ConfigurationSummaryProps {
  totalPrice: number
  onSave: () => void
  onSubmit: () => void
  loading: boolean
}

export default function ConfigurationSummary({
  totalPrice,
  onSave,
  onSubmit,
  loading
}: ConfigurationSummaryProps) {
  const t = useTranslations()
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('configurator.totalPrice')}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            €{totalPrice.toFixed(2)}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <button
            onClick={onSave}
            disabled={loading}
            className="btn-outline flex items-center justify-center"
          >
            <Save size={18} className="mr-2" />
            {t('configurator.saveDraft')}
          </button>
          
          <button
            onClick={onSubmit}
            disabled={loading}
            className="btn-primary flex items-center justify-center"
          >
            <Send size={18} className="mr-2" />
            {t('configurator.submitConfig')}
          </button>
        </div>
      </div>
      
      {/* Display notification about review process */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-md">
        Submitting your configuration will send it for review by our specialists,
        who will check component compatibility and suggest optimizations if needed.
      </div>
    </div>
  )
}