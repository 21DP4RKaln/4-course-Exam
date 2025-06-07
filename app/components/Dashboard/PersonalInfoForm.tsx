'use client';

import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { PersonalInfoFormProps } from './types';

export default function PersonalInfoForm({
  data,
  errors,
  onChange,
}: PersonalInfoFormProps) {
  const profileT = useTranslations('dashboard.profileSection');

  return (
    <motion.div
      className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div>
        <label className="block text-sm font-medium text-neutral-950 dark:text-neutral-300 mb-1">
          {profileT('firstName')}
        </label>{' '}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User size={18} className="text-neutral-400" />
          </div>
          <input
            type="text"
            value={data.firstName || ''}
            onChange={e => onChange({ firstName: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 focus:border-transparent transition-colors"
            placeholder={profileT('firstNamePlaceholder')}
          />
        </div>
        {errors?.firstName && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.firstName}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-950 dark:text-neutral-300 mb-1">
          {profileT('lastName')}
        </label>{' '}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User size={18} className="text-neutral-400" />
          </div>
          <input
            type="text"
            value={data.lastName || ''}
            onChange={e => onChange({ lastName: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 focus:border-transparent transition-colors"
            placeholder={profileT('lastNamePlaceholder')}
          />
        </div>
        {errors?.lastName && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.lastName}
          </p>
        )}
      </div>
    </motion.div>
  );
}
