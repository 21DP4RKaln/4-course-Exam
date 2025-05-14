'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  User,
  Mail,
  Phone,
  Save,
  X,
  Lock,
  Upload,
  Image,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  MapPin
} from 'lucide-react'
import PhoneInput from '@/app/components/ui/PhoneInput'
import AddressInput from '@/app/components/ui/AddressInput'

type CountryCode = 'LV' | 'LT' | 'EE';

interface AddressState {
  street: string;
  city: string;
  postalCode: string;
  country: CountryCode;
}

interface AddressErrors {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export default function ProfileTab() {
  const t = useTranslations('dashboard');
  const profileT = useTranslations('dashboard.profileSection');
  const validationT = useTranslations('dashboard.validation');
  const imageT = useTranslations('dashboard.profileImage');
  const actionsT = useTranslations('dashboard.formActions');
  const { user, updateProfile, loading } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [address, setAddress] = useState<{
    street: string;
    city: string;
    postalCode: string;
    country: 'LV' | 'LT' | 'EE';
  }>({
    street: '',
    city: '',
    postalCode: '',
    country: 'LV'
  });

  const [addressErrors, setAddressErrors] = useState<{
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  }>({});

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress({
        street: user.shippingAddress || '',
        city: user.shippingCity || '',
        postalCode: user.shippingPostalCode || '',
        country: (user.shippingCountry as 'LV' | 'LT' | 'EE') || 'LV'
      });
      
      if (user.profileImageUrl) {
        setImagePreview(user.profileImageUrl);
      }
    }
  }, [user]);

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
     
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
    const validateForm = () => {
    setError('');
    setSuccessMessage('');
    setAddressErrors({});
 
    if (!email && !phone) {
      setError(validationT('emailOrPhone'));
      return false;
    }
   
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(validationT('emailInvalid'));
      return false;
    }
   
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setError(validationT('passwordMismatch'));
        return false;
      }
      
      if (password.length < 8) {
        setError(validationT('passwordLength'));
        return false;
      }
    }

    // Validate postal code format based on country if provided
    if (address.postalCode) {
      const postalCodePatterns = {
        LV: /^LV-\d{4}$/,
        LT: /^LT-\d{5}$/,
        EE: /^\d{5}$/
      };

      if (!postalCodePatterns[address.country].test(address.postalCode)) {
        setAddressErrors(prev => ({
          ...prev,
          postalCode: validationT('invalidPostalCode')
        }));
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updateData: any = {};

      if (firstName !== user?.firstName) updateData.firstName = firstName;
      if (lastName !== user?.lastName) updateData.lastName = lastName;
      if (email !== user?.email) updateData.email = email;
      if (phone !== user?.phone) updateData.phone = phone;
      if (password) updateData.password = password;
      if (address.street !== user?.shippingAddress) updateData.shippingAddress = address.street;
      if (address.city !== user?.shippingCity) updateData.shippingCity = address.city;
      if (address.postalCode !== user?.shippingPostalCode) updateData.shippingPostalCode = address.postalCode;
      if (address.country !== user?.shippingCountry) updateData.shippingCountry = address.country;
   
      await updateProfile(updateData, profileImage);
      setSuccessMessage(t('updateSuccess'));
      setPassword('');
      setConfirmPassword('');
   
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || validationT('profileError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const missingContactInfo = (!user?.email && !user?.phone)
  
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
        <User size={20} className="mr-2" />
        {t('profileInfo')}
      </h2>
      
      {/* Alert for missing contact information */}
      {missingContactInfo && (
        <div className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md flex items-start mb-4">
          <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{t('complete')}</p>
            <p className="text-sm mt-1">
              {t('completeMessage', { field: !user?.email ? t('email') : '' + (!user?.email && !user?.phone ? ' and ' : '') + !user?.phone ? t('phone') : '' })}
            </p>
          </div>
        </div>
      )}
      
      {/* Success message */}
      {successMessage && (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md flex items-start">
          <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start">
          <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <div 
            onClick={handleImageClick}
            className="relative w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden mb-2"
          >
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt={imageT('altText')} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <Image size={32} className="text-gray-400" />
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
            {imageT('changeText')}
          </p>
        </div>
        
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">
              {profileT('firstName')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input 
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="form-input pl-10"
                placeholder={profileT('firstNamePlaceholder')}
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">
              {profileT('lastName')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input 
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="form-input pl-10"
                placeholder={profileT('lastNamePlaceholder')}
              />
            </div>
          </div>
        </div>
          
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">
              {profileT('emailAddress')} {!phone && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input pl-10"
                placeholder={profileT('emailPlaceholder')}
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">
              {profileT('phoneNumber')} {!email && <span className="text-red-500">*</span>}
            </label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              placeholder={profileT('phonePlaceholder')}
            />
          </div>
        </div>
        
        {!email && !phone && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
            {validationT('pleaseProvide')}
          </p>
        )}
        
        {/* Shipping Address Section */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <MapPin size={20} className="mr-2" />
            {profileT('shippingAddress')}
          </h3>

          <AddressInput
            values={address}
            onChange={setAddress}
            errors={addressErrors}
          />
        </div>

        {/* Password Change Section */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {profileT('changePassword')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                {profileT('newPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-10"
                  placeholder={profileT('passwordPlaceholder')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={handlePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <Eye size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="form-label">
                {profileT('confirmPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input pl-10"
                  placeholder={profileT('passwordPlaceholder')}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
            onClick={() => {
              setFirstName(user?.firstName || '')
              setLastName(user?.lastName || '')
              setEmail(user?.email || '')
              setPhone(user?.phone || '')
              setPassword('')
              setConfirmPassword('')
              setProfileImage(null)
              setImagePreview(user?.profileImageUrl || null)
              setError('')
            }}
          >
            <X size={18} className="mr-2" />
            {actionsT('cancel')}
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-brand-red-600 text-white rounded-md hover:bg-brand-red-700 flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <Save size={18} className="mr-2" />
            )}
            {actionsT('updateProfile')}
          </button>
        </div>
      </form>
    </div>
  )
}