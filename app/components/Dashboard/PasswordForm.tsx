'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { PasswordFormProps } from './types';

export default function PasswordForm({
  data,
  error,
  onChange,
}: PasswordFormProps) {
  const profileT = useTranslations('dashboard.profileSection');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <p className="text-sm text-blue-600 dark:text-red-300 flex items-center mb-4">
        <Shield size={16} className="mr-2" />
        {profileT('passwordHelp')}
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-950 dark:text-neutral-300 mb-1">
            {profileT('newPassword')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-neutral-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={data.password || ''}
              onChange={e => onChange({ password: e.target.value })}
              className={`w-full pl-10 pr-10 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 focus:border-transparent transition-colors ${
                error ? 'border-red-500' : ''
              }`}
              placeholder={profileT('passwordPlaceholder')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff
                  size={18}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                />
              ) : (
                <Eye
                  size={18}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-950 dark:text-neutral-300 mb-1">
            {profileT('confirmPassword')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-neutral-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={data.confirmPassword || ''}
              onChange={e => onChange({ confirmPassword: e.target.value })}
              className={`w-full pl-10 pr-10 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 focus:border-transparent transition-colors ${
                error ? 'border-red-500' : ''
              }`}
              placeholder={profileT('confirmPlaceholder')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff
                  size={18}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                />
              ) : (
                <Eye
                  size={18}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </motion.div>
  );
}
