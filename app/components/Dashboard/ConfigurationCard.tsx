'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  Cpu,
  MemoryStick,
  HardDrive,
  Zap,
  Monitor,
  ShoppingCart,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/app/contexts/CartContext';
import type { UserConfiguration } from '@/lib/services/dashboardService';

interface ConfigurationCardProps {
  configuration: UserConfiguration;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
  locale: string;
  onEdit?: (configId: string) => void;
  onOrder?: (configId: string) => void;
}

export default function ConfigurationCard({
  configuration,
  getStatusColor,
  formatDate,
  locale,
  onEdit,
  onOrder,
}: ConfigurationCardProps) {
  const t = useTranslations();
  const router = useRouter();
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const caseComponent = configuration.components?.find(
    comp =>
      comp.category?.toLowerCase() === 'case' ||
      comp.category?.toLowerCase() === 'cases' ||
      comp.name?.toLowerCase().includes('case')
  );

  const cpu = configuration.components?.find(
    comp =>
      comp.category?.toLowerCase() === 'cpu' ||
      comp.category?.toLowerCase() === 'processor'
  );
  const gpu = configuration.components?.find(
    comp =>
      comp.category?.toLowerCase() === 'gpu' ||
      comp.category?.toLowerCase() === 'graphics'
  );
  const ram = configuration.components?.find(
    comp =>
      comp.category?.toLowerCase() === 'ram' ||
      comp.category?.toLowerCase() === 'memory'
  );
  const storage = configuration.components?.find(
    comp =>
      comp.category?.toLowerCase() === 'storage' ||
      comp.category?.toLowerCase() === 'ssd' ||
      comp.category?.toLowerCase() === 'hdd'
  );
  const getImageUrl = () => {
    if (caseComponent?.imageUrl && !imageError) {
      return caseComponent.imageUrl;
    }

    return '/images/build-pc.png';
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(configuration.id);
    } else {
      router.push(`/${locale}/configurator?load=${configuration.id}`);
    }
  };

  const handleAddToCart = () => {
    // Convert configuration to cart item
    addItem({
      id: configuration.id,
      type: 'configuration',
      name: configuration.name,
      price: configuration.totalPrice,
      imageUrl: getImageUrl(),
    });

    // Dispatch a custom event to update cart count in header
    const cartUpdateEvent = new CustomEvent('cartUpdated');
    window.dispatchEvent(cartUpdateEvent);
  };

  return (
    <motion.div
      className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden group hover:shadow-xl hover:border-blue-300 dark:hover:border-red-600 transition-all duration-300"
      whileHover={{ scale: 1.02, y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Section */}
      <div className="relative h-56 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 overflow-hidden">
        <img
          src={getImageUrl()}
          alt={configuration.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(configuration.status)}`}
          >
            {configuration.status}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Configuration Name */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-1">
            {configuration.name}
          </h3>
          <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
            <Clock size={12} className="mr-1" />
            {formatDate(configuration.createdAt)}
          </div>
        </div>
        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          {cpu && (
            <div className="flex items-center text-neutral-600 dark:text-neutral-400">
              <Cpu size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">{cpu.name}</span>
            </div>
          )}
          {gpu && (
            <div className="flex items-center text-neutral-600 dark:text-neutral-400">
              <Monitor size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">{gpu.name}</span>
            </div>
          )}
          {ram && (
            <div className="flex items-center text-neutral-600 dark:text-neutral-400">
              <MemoryStick size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">{ram.name}</span>
            </div>
          )}
          {storage && (
            <div className="flex items-center text-neutral-600 dark:text-neutral-400">
              <HardDrive size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">{storage.name}</span>
            </div>
          )}
        </div>
        {/* Performance Indicator */}
        {(cpu || gpu) && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              <span className="flex items-center">
                <Zap size={12} className="mr-1" />
                {t('configurator.performance')}
              </span>
              <span>85%</span>
            </div>
            <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                style={{ width: '85%' }}
              ></div>
            </div>
          </div>
        )}{' '}
        {/* Price and Actions */}
        <div className="space-y-3">
          <div className="text-xl font-bold text-neutral-900 dark:text-white">
            €{configuration.totalPrice.toFixed(2)}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors font-medium"
            >
              {t('common.edit')}
            </button>

            <button
              onClick={handleAddToCart}
              className="flex-1 px-3 py-2 text-sm bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700 transition-colors flex items-center justify-center font-medium"
            >
              <ShoppingCart size={14} className="mr-1.5" />
              {t('buttons.addToCart')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
