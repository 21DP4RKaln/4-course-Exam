'use client'

import { Mail, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import PhoneInput from '@/app/components/ui/PhoneInput'
import { ContactInfoFormProps } from './types'

export default function ContactInfoForm({ data, errors = {}, onChange }: ContactInfoFormProps) {
  const profileT = useTranslations('dashboard.profileSection')

  const emailRequired = !data.phone
  const phoneRequired = !data.email

  return (
    <motion.div 
      className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div>
        <label className="block text-sm font-medium text-neutral-950 dark:text-neutral-300 mb-1">
          {profileT('emailAddress')} {emailRequired && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail size={18} className="text-neutral-400" />
          </div>
          <input 
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange({ email: e.target.value })}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 focus:border-transparent transition-colors ${
              errors?.email ? 'border-red-500' : ''
            }`}
            placeholder={profileT('emailPlaceholder')}
          />
        </div>
        {errors?.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-950 dark:text-neutral-300 mb-1">
          {profileT('phoneNumber')} {phoneRequired && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <PhoneInput
            value={data.phone || ''}
            onChange={(value) => onChange({ phone: value })}
            placeholder={profileT('phonePlaceholder')}
            error={errors?.phone}
            className="pl-4"
          />
        </div>
      </div>
    </motion.div>
  )
}
