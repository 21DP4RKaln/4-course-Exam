'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Camera, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { analyzePasswordStrength } from '@/lib/passwordStrength'
import styled from 'styled-components'

export default function SpecialistAccountPage() {
  const t = useTranslations()
  const { user, updateProfile } = useAuth()
  const { theme } = useTheme()
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [passwordAnalysis, setPasswordAnalysis] = useState(analyzePasswordStrength(''))
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user?.profileImageUrl || null)
  const [deleteImage, setDeleteImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }))
      setProfileImagePreview(user.profileImageUrl || null)
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Analizē paroles stiprumu, kad tiek mainīta jaunā parole
    if (name === 'newPassword') {
      setPasswordAnalysis(analyzePasswordStrength(value))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      setProfileImagePreview(URL.createObjectURL(file))
      setDeleteImage(false)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleDeleteImage = () => {
    setProfileImage(null)
    setProfileImagePreview(null)
    setDeleteImage(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      if (activeTab === 'profile') {
        // Update profile information
        const profileData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        }
        
        await updateProfile(profileData, profileImage, deleteImage)
        setSuccess(t('account.profileUpdateSuccess') || 'Profile updated successfully')
      } else {
        // Validate password fields
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error(t('account.passwordsDoNotMatch') || 'Passwords do not match')
        }
        
        // Pārbaudīt vai parole ir pietiekami stipra
        if (!passwordAnalysis.isValid) {
          throw new Error(t('account.passwordTooWeak') || 'Password is too weak. It must meet at least 3 requirements.')
        }
          
        // Update password - only send the new password
        await updateProfile({
          password: formData.newPassword
        })
        
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        
        setSuccess(t('account.passwordUpdateSuccess') || 'Password updated successfully')
      }
    } catch (error: any) {
      setError(error.message || t('account.updateError') || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }
  
  const getStrengthText = (strength: number) => {
    if (strength <= 2) return 'Vāja';
    if (strength <= 3) return 'Vidēja';
    if (strength <= 4) return 'Laba';
    return 'Stipra';
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <motion.h1 
          className="text-2xl font-bold text-neutral-900 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('account.settings') || 'Account Settings'}
        </motion.h1>
        <motion.p 
          className="text-neutral-600 dark:text-neutral-400 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t('account.settingsDescription') || 'Manage your account information and credentials'}
        </motion.p>
      </div>
      
      {/* Tab Navigation */}
      <motion.div 
        className="flex border-b border-neutral-200 dark:border-neutral-700 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <TabButton
          isActive={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
          $theme={theme}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <User className="mr-2" size={18} />
          <span>{t('account.profile') || 'Profile'}</span>
        </TabButton>
        <TabButton
          isActive={activeTab === 'password'}
          onClick={() => setActiveTab('password')}
          $theme={theme}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Lock className="mr-2" size={18} />
          <span>{t('account.password') || 'Password'}</span>
        </TabButton>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AlertTriangle className="text-red-500 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle className="text-green-500 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-green-700 dark:text-green-400">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.div 
              key="profile-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-stone-950 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">{t('account.personalInfo') || 'Personal Information'}</h2>
                
                {/* Profile Image */}
                <div className="flex flex-col md:flex-row md:items-center mb-6">
                  <div className="flex-shrink-0 md:w-1/4">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block md:text-right md:mr-8 mb-2 md:mb-0">
                      {t('account.profileImage') || 'Profile Image'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="relative">
                        <motion.div 
                          className="w-24 h-24 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center relative"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {profileImagePreview ? (
                            <Image 
                              src={profileImagePreview} 
                              alt="Profile" 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            <User size={50} className="text-neutral-400 dark:text-neutral-500" />
                          )}
                          
                          <motion.div 
                            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center transition-all duration-300"
                            whileHover={{ opacity: 1 }}
                            initial={{ opacity: 0 }}
                          >
                            <button 
                              type="button"
                              onClick={triggerFileInput}
                              className="text-transparent hover:text-white focus:text-white"
                            >
                              <Camera size={30} />
                            </button>
                          </motion.div>
                        </motion.div>
                        
                        {profileImagePreview && (
                          <motion.button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                            onClick={handleDeleteImage}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          className="text-sm font-medium text-primary dark:text-red-500 hover:underline focus:outline-none"
                        >
                          {profileImagePreview ? (t('account.changeImage') || 'Change Image') : (t('account.uploadImage') || 'Upload Image')}
                        </button>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {t('account.imageRequirements') || 'JPG or PNG. Max size 2MB.'}
                        </p>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/jpeg, image/png"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <FormField>
                    <Label htmlFor="firstName">{t('account.firstName') || 'First Name'}</Label>
                    <InputWrapper $theme={theme}>
                      <div className="input-icon">
                        <User size={16} />
                      </div>
                      <motion.input 
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder={t('account.firstNamePlaceholder') || 'Enter your first name'}
                      />
                    </InputWrapper>
                  </FormField>
                  
                  <FormField>
                    <Label htmlFor="lastName">{t('account.lastName') || 'Last Name'}</Label>
                    <InputWrapper $theme={theme}>
                      <div className="input-icon">
                        <User size={16} />
                      </div>
                      <motion.input 
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder={t('account.lastNamePlaceholder') || 'Enter your last name'}
                      />
                    </InputWrapper>
                  </FormField>
                </div>
                
                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField>
                    <Label htmlFor="email">{t('account.email') || 'Email'}</Label>
                    <InputWrapper $theme={theme}>
                      <div className="input-icon">
                        <Mail size={16} />
                      </div>
                      <motion.input 
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder={t('account.emailPlaceholder') || 'Enter your email'}
                      />
                    </InputWrapper>
                  </FormField>
                  
                  <FormField>
                    <Label htmlFor="phone">{t('account.phone') || 'Phone'}</Label>
                    <InputWrapper $theme={theme}>
                      <div className="input-icon">
                        <Phone size={16} />
                      </div>
                      <motion.input 
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder={t('account.phonePlaceholder') || 'Enter your phone number'}
                      />
                    </InputWrapper>
                  </FormField>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="password-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-stone-950 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 mb-6"
            >
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">{t('account.changePassword') || 'Change Password'}</h2>
              
              <div className="space-y-6">
                <FormField>
                  <Label htmlFor="currentPassword">{t('account.currentPassword') || 'Current Password'}</Label>
                  <InputWrapper $theme={theme}>
                    <div className="input-icon">
                      <Lock size={16} />
                    </div>
                    <motion.input 
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      type={showPassword.current ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder={t('account.currentPasswordPlaceholder') || 'Enter your current password'}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                      className="password-toggle"
                    >
                      {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </InputWrapper>
                </FormField>
                
                <FormField>
                  <Label htmlFor="newPassword">{t('account.newPassword') || 'New Password'}</Label>
                  <InputWrapper $theme={theme}>
                    <div className="input-icon">
                      <Lock size={16} />
                    </div>
                    <motion.input 
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      type={showPassword.new ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder={t('account.newPasswordPlaceholder') || 'Enter new password'}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                      className="password-toggle"
                    >
                      {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </InputWrapper>
                  
                  {formData.newPassword && (
                    <div className="space-y-3 mt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {t('account.passwordStrength') || 'Paroles stiprums'}
                          </span>
                          <span className={`text-xs font-bold ${
                            passwordAnalysis.score <= 2 ? 'text-red-500' : 
                            passwordAnalysis.score <= 3 ? 'text-yellow-500' : 
                            passwordAnalysis.score <= 4 ? 'text-blue-500' : 
                            'text-green-500'
                          }`}>
                            {getStrengthText(passwordAnalysis.score)}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                                level <= passwordAnalysis.score
                                  ? passwordAnalysis.score <= 2
                                    ? 'bg-red-500'
                                    : passwordAnalysis.score <= 3
                                    ? 'bg-yellow-500'
                                    : passwordAnalysis.score <= 4
                                    ? 'bg-blue-500'
                                    : 'bg-green-500'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('account.passwordRequirements') || 'Prasības:'}</p>
                        <div className="grid grid-cols-2 gap-1">
                          <div className={`flex items-center space-x-1 text-xs ${
                            passwordAnalysis.requirements.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              passwordAnalysis.requirements.minLength ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`} />
                            <span>8+ {t('account.characters') || 'rakstzīmes'}</span>
                          </div>
                          <div className={`flex items-center space-x-1 text-xs ${
                            passwordAnalysis.requirements.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              passwordAnalysis.requirements.hasLowercase ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`} />
                            <span>{t('account.lowercase') || 'Mazais burts'}</span>
                          </div>
                          <div className={`flex items-center space-x-1 text-xs ${
                            passwordAnalysis.requirements.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              passwordAnalysis.requirements.hasUppercase ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`} />
                            <span>{t('account.uppercase') || 'Lielais burts'}</span>
                          </div>
                          <div className={`flex items-center space-x-1 text-xs ${
                            passwordAnalysis.requirements.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              passwordAnalysis.requirements.hasNumber ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`} />
                            <span>{t('account.number') || 'Cipars'}</span>
                          </div>
                          <div className={`flex items-center space-x-1 text-xs ${
                            passwordAnalysis.requirements.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              passwordAnalysis.requirements.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`} />
                            <span>{t('account.special') || 'Speciālā zīme'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {t('account.passwordRequirementsShort') || 'Parolei jāatbilst vismaz 3 drošības prasībām'}
                  </p>
                </FormField>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          className="flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            type="submit"
            className="px-6 py-2 bg-primary dark:bg-red-500 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                <span>{t('common.saving') || 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                <span>{t('common.save') || 'Save Changes'}</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </div>
  )
}

// Styled Components
const TabButton = styled(motion.button)<{ isActive: boolean, $theme: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  font-weight: 500;
  color: ${props => props.isActive 
    ? (props.$theme === 'dark' ? '#ffffff' : '#000000') 
    : (props.$theme === 'dark' ? '#9ca3af' : '#6b7280')};
  border-bottom: 2px solid ${props => props.isActive 
    ? (props.$theme === 'dark' ? '#ef4444' : '#0066CC') 
    : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
    background-color: ${props => props.$theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 102, 204, 0.1)'};
  }
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: inherit;
`;

const InputWrapper = styled.div<{ $theme: string }>`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  transition: all 0.2s ease;
  overflow: hidden;
  
  html.dark & {
    background-color: #1c1917;
    border-color: #404040;
  }
  
  &:focus-within {
    box-shadow: 0 0 0 2px ${props => props.$theme === 'dark' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 102, 204, 0.4)'};
    border-color: ${props => props.$theme === 'dark' ? '#ef4444' : '#0066CC'};
  }

  .input-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 0.75rem;
    color: #9ca3af;
    
    html.dark & {
      color: #d1d5db;
    }
  }

  .input-field {
    flex: 1;
    padding: 0.625rem 0.75rem;
    color: inherit;
    background: transparent;
    outline: none;
    border: none;
    width: 100%;
  }
  
  .password-toggle {
    padding: 0 0.75rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    transition: color 0.2s ease;
    
    &:hover {
      color: ${props => props.$theme === 'dark' ? '#ef4444' : '#0066CC'};
    }
    
    html.dark & {
      color: #d1d5db;
      
      &:hover {
        color: #ef4444;
      }
    }
  }
`;
