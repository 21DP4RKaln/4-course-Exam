'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

export function StaffFooter() {
  const t = useTranslations()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="h-12 bg-white dark:bg-stone-950 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        © {currentYear} IvaPro. {t('footer.allRightsReserved')}.
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
        <span>{t('staff.version')} 1.0.0</span>
        <span>•</span>
        <a 
          href="#" 
          className="hover:text-primary dark:hover:text-red-500 transition-colors"
        >
          {t('staff.documentation')}
        </a>
        <span>•</span>
        <a 
          href="#" 
          className="hover:text-primary dark:hover:text-red-500 transition-colors"
        >
          {t('staff.support')}
        </a>
      </div>
    </footer>
  )
}