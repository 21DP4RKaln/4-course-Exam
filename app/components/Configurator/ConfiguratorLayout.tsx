'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';

interface ConfiguratorLayoutProps {
  children: React.ReactNode;
}

const ConfiguratorLayout: React.FC<ConfiguratorLayoutProps> = ({
  children,
}) => {
  const { theme } = useTheme();
  return (
    <div
      className={`min-h-screen ${
        theme === 'dark'
          ? 'bg-stone-950 text-white'
          : 'bg-neutral-100 text-neutral-900'
      } transition-colors duration-200 overflow-x-hidden`}
    >
      <div className="h-full w-full overflow-x-hidden">{children}</div>
    </div>
  );
};

export default ConfiguratorLayout;
