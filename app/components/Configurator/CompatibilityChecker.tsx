'use client'

import React from 'react'
import { Gauge } from 'lucide-react'

interface CompatibilityCheckerProps {
  totalPowerConsumption: number;
  compatibilityIssues: string[];
}

const CompatibilityChecker: React.FC<CompatibilityCheckerProps> = ({
  totalPowerConsumption,
  compatibilityIssues
}) => {
  return (
    <div className="flex flex-col items-end">
      {/* Power consumption indicator */}
      {totalPowerConsumption > 0 && (
        <div className="flex items-center bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">
          <Gauge size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
            Est. Power: {totalPowerConsumption}W
          </span>
        </div>
      )}
      
      {/* The component could be expanded to show compatibility status too */}
    </div>
  )
}

export default CompatibilityChecker