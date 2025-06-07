'use client';

import { MapPin, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import AddressInput from '@/app/components/ui/AddressInput';
import { AddressFormProps } from './types';

export default function AddressForm({
  data,
  error,
  onChange,
}: AddressFormProps) {
  const profileT = useTranslations('dashboard.profileSection');

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <p className="text-sm text-blue-600 dark:text-red-300 flex items-center">
          <Globe size={16} className="mr-2" />
          {profileT('addressHelp')}
        </p>
      </div>

      <div>
        <AddressInput values={data} onChange={onChange} errors={{}} />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </motion.div>
  );
}
