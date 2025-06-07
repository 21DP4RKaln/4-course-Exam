'use client';

import { motion } from 'framer-motion';
import { Clock, Cpu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { UserConfiguration } from '@/lib/services/dashboardService';
import ConfigurationCard from './ConfigurationCard';

interface ConfigurationsTabProps {
  configurations: UserConfiguration[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
  locale: string;
}

export default function ConfigurationsTab({
  configurations,
  loading,
  error,
  onRetry,
  getStatusColor,
  formatDate,
  locale,
}: ConfigurationsTabProps) {
  const t = useTranslations();
  const router = useRouter();

  if (loading) {
    return (
      <motion.div
        className="flex justify-center items-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mr-3"></div>
        <span className="text-neutral-600 dark:text-neutral-400">
          Loading configurations...
        </span>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-red-600 dark:text-red-400">{error}</p>{' '}
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  if (configurations.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-neutral-600 dark:text-neutral-400">
          {t('dashboard.noConfigurations')}
        </p>{' '}
        <button
          onClick={() => router.push(`/${locale}/configurator`)}
          className="mt-4 px-4 py-2 bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700"
        >
          {t('nav.configurator')}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-neutral-950 dark:text-white flex items-center">
          <Cpu className="mr-2" size={24} />
          {t('dashboard.myConfigurations')}
        </h2>
        <button
          onClick={() => router.push(`/${locale}/configurator`)}
          className="px-4 py-2 bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700 text-sm flex items-center"
        >
          <Cpu className="mr-2" size={16} />+ New Configuration
        </button>
      </div>{' '}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configurations.map(config => (
          <ConfigurationCard
            key={config.id}
            configuration={config}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            locale={locale}
            onEdit={configId =>
              router.push(`/${locale}/configurator?edit=${configId}`)
            }
            onOrder={configId =>
              router.push(`/${locale}/shop/product/${configId}`)
            }
          />
        ))}
      </div>
    </motion.div>
  );
}
