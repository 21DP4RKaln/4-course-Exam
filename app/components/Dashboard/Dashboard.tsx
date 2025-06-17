'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/contexts/AuthContext';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import ProfileSection from './ProfileSection';
import LoadingSkeleton from './LoadingSkeleton';
import { AnimatePresence, motion } from 'framer-motion';

type CountryCode = 'LV' | 'LT' | 'EE';

interface AddressData {
  street: string;
  city: string;
  postalCode: string;
  country: CountryCode;
}

interface FormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  address?: AddressData;
  profileImage?: File | null;
  deleteProfileImage?: boolean;
}

interface UpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingCountry?: CountryCode;
}

export default function ProfileTab() {
  const { user, loading, updateProfile } = useAuth();
  const t = useTranslations('dashboard');
  const validationT = useTranslations('dashboard.validation');

  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpdateProfile = async (formData: FormData) => {
    setError('');
    setSuccessMessage('');
    setIsUploading(true);

    try {
      const {
        password,
        confirmPassword,
        address,
        profileImage,
        deleteProfileImage,
        ...basicData
      } = formData;
      const updateData: UpdateData = { ...basicData };

      if (!updateData.email && !updateData.phone) {
        throw new Error(validationT('emailOrPhone'));
      }

      if (
        updateData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)
      ) {
        throw new Error(validationT('emailInvalid'));
      }

      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          throw new Error(validationT('passwordMismatch'));
        }
        if (password && password.length < 8) {
          throw new Error(validationT('passwordLength'));
        }
        updateData.password = password;
      }

      if (address) {
        updateData.shippingAddress = address.street;
        updateData.shippingCity = address.city;
        updateData.shippingPostalCode = address.postalCode;
        updateData.shippingCountry = address.country;

        if (address.postalCode) {
          const postalCodePatterns: Record<CountryCode, RegExp> = {
            LV: /^LV-\d{4}$/,
            LT: /^LT-\d{5}$/,
            EE: /^\d{5}$/,
          };

          if (!postalCodePatterns[address.country].test(address.postalCode)) {
            throw new Error(validationT('invalidPostalCode'));
          }
        }
      }

      console.log('Updating profile with image:', profileImage?.name);
      const result = await updateProfile(
        updateData,
        profileImage,
        deleteProfileImage
      );
      console.log('Profile update result:', result);

      setSuccessMessage(t('updateSuccess'));

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || validationT('profileError'));
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="p-4">
      <AnimatePresence mode="wait">
        {/* Success message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 mb-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md flex items-start"
          >
            <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <p>{successMessage}</p>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 mb-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start"
          >
            <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Missing contact info alert */}
        {!user?.email && !user?.phone && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 mb-4 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md flex items-start"
          >
            <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{t('complete')}</p>
              <p className="text-sm mt-1">
                {t('completeMessage', {
                  field: !user?.email
                    ? t('email')
                    : '' +
                        (!user?.email && !user?.phone ? ' and ' : '') +
                        !user?.phone
                      ? t('phone')
                      : '',
                })}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {user && (
        <ProfileSection
          user={{
            ...user,
            shippingCountry:
              user.shippingCountry === 'LV' ||
              user.shippingCountry === 'LT' ||
              user.shippingCountry === 'EE'
                ? user.shippingCountry
                : undefined,
          }}
          onUpdate={handleUpdateProfile}
          loading={loading || isUploading}
        />
      )}
    </div>
  );
}
