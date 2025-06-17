'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { RotateCcw } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

interface ResetButtonProps {
  selectedCount: number;
  onResetConfiguration: () => void;
}

const ResetButton: React.FC<ResetButtonProps> = ({
  selectedCount,
  onResetConfiguration,
}) => {
  const t = useTranslations();
  const { theme } = useTheme();

  if (selectedCount === 0) {
    return <div></div>;
  }

  return (
    <button
      onClick={onResetConfiguration}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
        theme === 'dark'
          ? 'bg-red-900/20 text-red-400 border border-red-800 hover:bg-red-900/30'
          : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
      }`}
      title={t('configurator.actions.reset')}
    >
      <RotateCcw size={16} />
    </button>
  );
};

export default ResetButton;
