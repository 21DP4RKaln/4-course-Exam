
'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Gauge } from 'lucide-react'

interface CompatibilityCheckerProps {
  totalPowerConsumption: number;
  compatibilityIssues: string[];
}

const CompatibilityChecker: React.FC<CompatibilityCheckerProps> = ({
  totalPowerConsumption,
  compatibilityIssues
}) => {
  const t = useTranslations()
  
  return (
    <div className="flex flex-col items-end">
      {/* Power consumption indicator */}
      {totalPowerConsumption > 0 && (
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
          <Gauge size={18} className="text-gray-600 dark:text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
            {t('configurator.compatibility.estimatedPower')}: {totalPowerConsumption}W
          </span>
        </div>
      )}
    </div>
  )
}

export default CompatibilityChecker