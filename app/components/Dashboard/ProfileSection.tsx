'use client'

import { useState, useEffect } from 'react'
import { User, Save, X, Mail, MapPin, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import type { FormData, UserProfile, Address as AddressData } from './types'

const ProfileImageUpload = dynamic(() => import('./ProfileImageUpload'), {
  ssr: false
})
const PersonalInfoForm = dynamic(() => import('./PersonalInfoForm'), {
  ssr: false
})
const ContactInfoForm = dynamic(() => import('./ContactInfoForm'), {
  ssr: false
}) 
const AddressForm = dynamic(() => import('./AddressForm'), {
  ssr: false
})
const PasswordForm = dynamic(() => import('./PasswordForm'), {
  ssr: false
})

interface ProfileSectionProps {
  user: UserProfile
  onUpdate: (data: FormData) => Promise<void>
  loading: boolean
}

export default function ProfileSection({ user, onUpdate, loading }: ProfileSectionProps) {
  const t = useTranslations('dashboard')
  const profileT = useTranslations('dashboard.profileSection')
  const actionsT = useTranslations('dashboard.formActions')
  const validationT = useTranslations('dashboard.validation')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: '',
    address: {
      street: user?.shippingAddress || '',
      city: user?.shippingCity || '',
      postalCode: user?.shippingPostalCode || '',
      country: user?.shippingCountry || 'LV'
    },
    deleteProfileImage: false
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.shippingAddress || '',
          city: user.shippingCity || '',
          postalCode: user.shippingPostalCode || '',
          country: user.shippingCountry || 'LV'
        }
      }))
    }
  }, [user])

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.email && !formData.phone) {
      errors.email = validationT('emailOrPhone')
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = validationT('emailInvalid')
    }

    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        errors.password = validationT('passwordMismatch')
      } else if (formData.password && formData.password.length < 8) {
        errors.password = validationT('passwordLength')
      }
    }

    if (formData.address.postalCode) {
      const postalCodePatterns: Record<'LV' | 'LT' | 'EE', RegExp> = {
        LV: /^LV-\d{4}$/,
        LT: /^LT-\d{5}$/,
        EE: /^\d{5}$/
      }

      if (!postalCodePatterns[formData.address.country].test(formData.address.postalCode)) {
        errors.address = validationT('invalidPostalCode')
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onUpdate(formData)
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleReset = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
      confirmPassword: '',
      address: {
        street: user?.shippingAddress || '',
        city: user?.shippingCity || '',
        postalCode: user?.shippingPostalCode || '',
        country: user?.shippingCountry || 'LV'
      },
      deleteProfileImage: false
    });
    setFormErrors({});
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Form Navigation Menu */}
      <motion.div
        className="hidden md:block bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-blue-200 dark:border-red-900/30 p-4 mb-6 sticky top-4 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >        <h3 className="text-sm font-medium text-blue-900 dark:text-red-300 mb-3 uppercase tracking-wide">
          {t('quickActions')}
        </h3>
        <div className="flex overflow-x-auto gap-3">
          <a href="#personal-info" className="px-4 py-2.5 bg-blue-50 dark:bg-red-900/10 text-blue-700 dark:text-red-400 rounded-lg text-sm whitespace-nowrap hover:bg-blue-100 dark:hover:bg-red-900/20 transition-colors flex items-center">
            <User size={16} className="mr-2" />
            {profileT('sectionTitlePersonal')}
          </a>
          <a href="#contact-info" className="px-4 py-2.5 bg-blue-50 dark:bg-red-900/10 text-blue-700 dark:text-red-400 rounded-lg text-sm whitespace-nowrap hover:bg-blue-100 dark:hover:bg-red-900/20 transition-colors flex items-center">
            <Mail size={16} className="mr-2" />
            {profileT('sectionTitleContact')}
          </a>
          <a href="#address-info" className="px-4 py-2.5 bg-blue-50 dark:bg-red-900/10 text-blue-700 dark:text-red-400 rounded-lg text-sm whitespace-nowrap hover:bg-blue-100 dark:hover:bg-red-900/20 transition-colors flex items-center">
            <MapPin size={16} className="mr-2" />
            {profileT('sectionTitleAddress')}
          </a>
          <a href="#security-info" className="px-4 py-2.5 bg-blue-50 dark:bg-red-900/10 text-blue-700 dark:text-red-400 rounded-lg text-sm whitespace-nowrap hover:bg-blue-100 dark:hover:bg-red-900/20 transition-colors flex items-center">
            <Lock size={16} className="mr-2" />
            {profileT('sectionTitleSecurity')}
          </a>
        </div>
      </motion.div>
      
      <motion.form 
        onSubmit={handleSubmit}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-blue-200 dark:border-red-900/30 p-8 space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >        <div className="mb-8 border border-blue-200 dark:border-red-900/20 rounded-xl shadow-sm overflow-hidden">
          <ProfileImageUpload 
            currentImage={user?.profileImageUrl}
            onChange={(file: File) => setFormData(prev => ({ ...prev, profileImage: file, deleteProfileImage: false }))}
            onDelete={() => setFormData(prev => ({ ...prev, profileImage: null, deleteProfileImage: true }))}
          />
        </div>

        <div className="grid gap-8">
          {/* Personal Information Section */}
          <div id="personal-info" className="p-6 border border-blue-200 dark:border-red-900/20 rounded-xl bg-blue-50/30 dark:bg-red-950/10 shadow-sm transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-red-800/30">            <h2 className="text-lg font-semibold text-blue-800 dark:text-red-400 mb-5 flex items-center">
              <div className="p-2 mr-3 rounded-md bg-blue-100 dark:bg-red-900/30">
                <User size={20} className="text-blue-700 dark:text-red-400" />
              </div>
              {profileT('sectionTitlePersonal')}
            </h2>
            
            <PersonalInfoForm
              data={formData}
              errors={formErrors}
              onChange={(data: Partial<FormData>) => {
                setFormData(prev => ({ ...prev, ...data }))
                if (formErrors.firstName || formErrors.lastName) {
                  setFormErrors(prev => ({
                    ...prev,
                    firstName: undefined,
                    lastName: undefined
                  }))
                }
              }}
            />
          </div>

          {/* Contact Information Section */}
          <div id="contact-info" className="p-6 border border-blue-200 dark:border-red-900/20 rounded-xl bg-blue-50/30 dark:bg-red-950/10 shadow-sm transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-red-800/30">            <h2 className="text-lg font-semibold text-blue-800 dark:text-red-400 mb-5 flex items-center">
              <div className="p-2 mr-3 rounded-md bg-blue-100 dark:bg-red-900/30">
                <Mail size={20} className="text-blue-700 dark:text-red-400" />
              </div>
              {profileT('sectionTitleContact')}
            </h2>

            <ContactInfoForm 
              data={formData}
              errors={formErrors}
              onChange={(data) => {
                setFormData(prev => ({ ...prev, ...data }))
                if (formErrors.email || formErrors.phone) {
                  setFormErrors(prev => ({
                    ...prev,
                    email: undefined,
                    phone: undefined
                  }))
                }
              }}
            />
          </div>

          {/* Address Section */}
          <div id="address-info" className="p-6 border border-blue-200 dark:border-red-900/20 rounded-xl bg-blue-50/30 dark:bg-red-950/10 shadow-sm transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-red-800/30">            <h2 className="text-lg font-semibold text-blue-800 dark:text-red-400 mb-5 flex items-center">
              <div className="p-2 mr-3 rounded-md bg-blue-100 dark:bg-red-900/30">
                <MapPin size={20} className="text-blue-700 dark:text-red-400" />
              </div>
              {profileT('sectionTitleAddress')}
            </h2>

            <AddressForm
              data={formData.address}
              error={formErrors.address}
              onChange={(address: AddressData) => {
                setFormData(prev => ({ ...prev, address }))
                if (formErrors.address) {
                  setFormErrors(prev => ({
                    ...prev,
                    address: undefined
                  }))
                }
              }}
            />
          </div>

          {/* Security Section */}
          <div id="security-info" className="p-6 border border-blue-200 dark:border-red-900/20 rounded-xl bg-blue-50/30 dark:bg-red-950/10 shadow-sm transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-red-800/30">            <h2 className="text-lg font-semibold text-blue-800 dark:text-red-400 mb-5 flex items-center">
              <div className="p-2 mr-3 rounded-md bg-blue-100 dark:bg-red-900/30">
                <Lock size={20} className="text-blue-700 dark:text-red-400" />
              </div>
              {profileT('sectionTitleSecurity')}
            </h2>

            <PasswordForm
              data={formData}
              error={formErrors.password}
              onChange={(data: Partial<FormData>) => {
                setFormData(prev => ({ ...prev, ...data }))
                if (formErrors.password) {
                  setFormErrors(prev => ({
                    ...prev,
                    password: undefined
                  }))
                }
              }}
            />
          </div>
        </div>

        <motion.div
          className="flex justify-end gap-4 pt-6 mt-4 border-t border-blue-200 dark:border-red-900/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            type="button"
            className="px-5 py-2.5 rounded-lg border border-blue-300 dark:border-red-500/30 text-blue-700 dark:text-red-400 hover:bg-blue-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors disabled:opacity-70 text-sm font-medium shadow-sm"
            onClick={handleReset}
            disabled={isSubmitting}
          >            <X size={16} />
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 dark:bg-red-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-red-700 flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
            ) : (
              <Save size={16} />
            )}
            Update Profile
          </button>
        </motion.div>
      </motion.form>
    </div>
  )
}
