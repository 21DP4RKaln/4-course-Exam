'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, Upload, 
  Image, AlertTriangle, Check 
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export default function RegisterPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const { register: registerUser, loading } = useAuth()
  const locale = pathname.split('/')[1]
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Contact method state (email, phone, or both)
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | 'both'>('email')

  // Create dynamic schema based on selected contact method
  const getValidationSchema = () => {
    const baseSchema: Record<string, z.ZodTypeAny> = {
      firstName: z.string().min(2, 'First name must be at least 2 characters'),
      lastName: z.string().min(2, 'Last name must be at least 2 characters'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
    }

    // Add validation based on selected contact method
    if (contactMethod === 'email' || contactMethod === 'both') {
      baseSchema.email = z.string().email('Invalid email address')
    } else {
      baseSchema.email = z.string().optional()
    }

    if (contactMethod === 'phone' || contactMethod === 'both') {
      baseSchema.phone = z.string().min(6, 'Phone number must be at least 6 characters')
    } else {
      baseSchema.phone = z.string().optional()
    }

    return z.object(baseSchema).refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    })
  }

  // Validation schema
  const registerSchema = getValidationSchema()
  type RegisterFormData = z.infer<typeof registerSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  })

  // Update form validation when contact method changes
  useEffect(() => {
    // Reset the form with new validation schema
    if (contactMethod === 'email') {
      setValue('phone', '')
    } else if (contactMethod === 'phone') {
      setValue('email', '')
    }
  }, [contactMethod, setValue])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      
      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      
      await registerUser(
        data.email || '', 
        data.password, 
        `${data.firstName} ${data.lastName}`,
        data.phone || '', 
        profileImage
      )
      
      // Registration successful - redirect happens in the Auth context
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          {t('auth.registerTitle')}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm flex items-start">
            <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Profile Image Selection (Optional) */}
        <div className="mb-6 flex flex-col items-center">
          <div 
            onClick={handleImageClick}
            className="relative w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden mb-2"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
            ) : (
              <Upload size={24} className="text-gray-400" />
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            (Optional) Add profile picture
          </p>
        </div>

        {/* Contact Method Selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Register using:
          </p>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setContactMethod('email')}
              className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
                contactMethod === 'email'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Mail size={18} className="mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setContactMethod('phone')}
              className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
                contactMethod === 'phone'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Phone size={18} className="mr-2" />
              Phone
            </button>
            <button
              type="button"
              onClick={() => setContactMethod('both')}
              className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
                contactMethod === 'both'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Mail size={16} className="mr-1" />
              <span className="mx-1">+</span>
              <Phone size={16} className="ml-1" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  className="form-input pl-10"
                  placeholder="John"
                />
              </div>
              {errors.firstName && (
                <p className="form-error">{errors.firstName?.message?.toString()}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  className="form-input pl-10"
                  placeholder="Doe"
                />
              </div>
              {errors.lastName && (
                <p className="form-error">{errors.lastName.message?.toString()}</p>
              )}
            </div>
          </div>

          {/* Email Address - shown if email or both selected */}
          {(contactMethod === 'email' || contactMethod === 'both') && (
            <div>
              <label htmlFor="email" className="form-label">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="form-input pl-10"
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="form-error">{errors.email?.message?.toString()}</p>
              )}
            </div>
          )}

          {/* Phone Number - shown if phone or both selected */}
          {(contactMethod === 'phone' || contactMethod === 'both') && (
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="form-input pl-10"
                  placeholder="+371 12345678"
                />
              </div>
              {errors.phone && (
                <p className="form-error">{errors.phone?.message?.toString()}</p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="form-label">
              {t('auth.password')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="form-input pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <Eye size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="form-error">{errors.password?.message?.toString()}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="form-input pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <Eye size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword?.message?.toString()}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Processing...</span>
              </div>
            ) : (
              t('auth.signUp')
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('auth.hasAccount')}{' '}
            <Link href={`/${locale}/auth/login`} className="text-red-600 dark:text-red-400 hover:underline">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}