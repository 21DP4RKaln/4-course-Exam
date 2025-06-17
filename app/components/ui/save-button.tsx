'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

interface SaveButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({
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
            ? 'bg-green-900/20 text-green-400 border border-green-800 hover:bg-green-900/30'
            : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
      } ${className}`}
      title={t('configurator.actions.exportPDF')}
    >
      <Download size={16} />
    </button>
  );
};

export default SaveButton;
