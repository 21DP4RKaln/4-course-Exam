'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { RotateCcw } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

interface ResetButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const ResetButton: React.FC<ResetButtonProps> = ({
  onClick,
  disabled = false,
  className = '',
}) => {
  const t = useTranslations();
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
        disabled
          ? theme === 'dark'
            ? 'bg-neutral-800/50 text-neutral-500 border border-neutral-700 cursor-not-allowed'
            : 'bg-neutral-100 text-neutral-500 border border-neutral-300 cursor-not-allowed'
          : theme === 'dark'
            ? 'bg-red-900/20 text-red-400 border border-red-800 hover:bg-red-900/30'
            : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
      } ${className}`}
      title={t('configurator.actions.reset')}
    >
      <RotateCcw size={16} />
    </button>
  );
};

export default ResetButton;
