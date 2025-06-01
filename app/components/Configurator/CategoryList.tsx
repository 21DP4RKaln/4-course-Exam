'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Cpu, Monitor, HardDrive, Server, Zap, Fan, Box, CircuitBoard, Package, Wrench } from 'lucide-react'
import Image from 'next/image'
import classNames from 'classnames'
import Link from 'next/link'
import { useTheme } from '@/app/contexts/ThemeContext'
import styled from 'styled-components'

interface Category {
  id: string
  name: string
  slug: string
  iconName?: string
}

interface Props {
  categories: Category[]
  activeCategory: string
  selectedComponents: Record<string, any>
  onSetActiveCategory: (category: string) => void
}

const CategoryList: React.FC<Props> = ({
  categories,
  activeCategory,
  selectedComponents,
  onSetActiveCategory
}) => {
  const t = useTranslations()
  const { theme } = useTheme()
  const { useLocale } = require('next-intl');
  const locale = useLocale();
  const displayCategories = categories.filter(category => {
    if (['networking', 'sound-cards', 'optical', 'network'].includes(category.slug)) {
      return false;
    }
    if (category.slug === 'services') {
      const svc = selectedComponents.services;
      return Array.isArray(svc) ? svc.length > 0 : false;
    }
    return true;
  })
  
  const getCategoryIcon = (categoryId: string) => {
    const iconColor = theme === 'dark' ? 'text-brand-red-400' : 'text-brand-blue-600'
    switch (categoryId) {
      case 'cpu':
        return <Cpu size={24} className={iconColor} />
      case 'gpu':
        return <Monitor size={24} className={iconColor} />
      case 'ram':
        return <HardDrive size={24} className={iconColor} />
      case 'motherboard':
        return <Server size={24} className={iconColor} />
      case 'psu':
        return <Zap size={24} className={iconColor} />
      case 'cooling':
        return <Fan size={24} className={iconColor} />
      case 'case':
        return <Box size={24} className={iconColor} />
      case 'storage':
        return <HardDrive size={24} className={iconColor} />
      case 'services':
        return <Wrench size={24} className={iconColor} />
      default:
        return <Package size={24} className={iconColor} />
    }
  }

  const buttonBaseClasses = classNames(
    'flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
    theme === 'dark'
      ? 'hover:bg-stone-900 focus:bg-stone-900'
      : 'hover:bg-neutral-100 focus:bg-neutral-100',
    'focus:outline-none focus-visible:ring-2',
    theme === 'dark'
      ? 'focus-visible:ring-brand-red-500/50'
      : 'focus-visible:ring-brand-blue-500/50'
  )

  const buttonClasses = (isActive: boolean) => classNames(
    buttonBaseClasses,
    isActive 
      ? theme === 'dark'
        ? 'bg-stone-900 text-white'
        : 'bg-neutral-100 text-neutral-900'
      : theme === 'dark'
        ? 'text-neutral-400 hover:text-white'
        : 'text-neutral-600 hover:text-neutral-900'
  )
  
  return (
    <aside className={`flex flex-col h-full min-w-[220px] w-[240px] max-w-[260px] overflow-hidden relative
      ${theme === 'dark' 
        ? 'bg-stone-950 border-neutral-800' 
        : 'bg-white border-neutral-200'
      } border transition-colors duration-200`}
    >      {/* Logo */}
    <LogoWrapper $theme={theme}>
        <Link href={`/${locale}`} className="logo-link">
          <div className="logo-container"> 
            <Image 
              src={theme === 'dark' ? "/images/logo-dark.png" : "/images/logo-light.png"}
              alt="IvaPro" 
              width={90}
              height={28}
              className="logo-image"
              priority
            />
          </div>
        </Link>
      </LogoWrapper>
      <nav className="flex flex-col gap-1 flex-1 px-2 py-8">
        {displayCategories.map(category => {
          const isActive = activeCategory === category.id;
          const isSelected = !!selectedComponents[category.id];
          return (
            <button
              key={category.id}
              onClick={() => onSetActiveCategory(category.id)}
              className={buttonClasses(isActive)}
            >
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all mr-3
                ${isActive 
                  ? theme === 'dark'
                    ? 'bg-stone-800 shadow-[0_0_12px_2px_rgba(239,68,68,0.2)]'
                    : 'bg-neutral-200 shadow-[0_0_12px_2px_rgba(0,102,204,0.2)]'
                  : theme === 'dark'
                    ? 'bg-stone-900'
                    : 'bg-neutral-100'
                }
              `}>
                {getCategoryIcon(category.id)}
              </span>
              <span className="text-sm font-medium tracking-wide">{category.name}</span>
              {isSelected && (
                <span className={`ml-auto text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm 
                  ${theme === 'dark'
                    ? 'bg-brand-red-500 text-white border-stone-800'
                    : 'bg-brand-blue-500 text-white border-white'
                  } border`}
                >
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

const LogoWrapper = styled.div<{ $theme: string }>`
  .logo-link {
    display: inline-block;
    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    transform-origin: center;
  }

  .logo-link:hover {
    transform: scale(1.05);
  }

  .logo-link:active {
    transform: scale(0.95);
    transition: all 0.1s cubic-bezier(0.4, 0.0, 0.2, 1);
  }

  .logo-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .logo-link:hover .logo-container {
    background-color: ${props => props.$theme === 'dark' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(0, 102, 204, 0.1)'};
    box-shadow: 0 4px 20px ${props => props.$theme === 'dark' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(0, 102, 204, 0.3)'};
  }

  .logo-image {
    transition: all 0.3s ease;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  }

  .logo-link:hover .logo-image {
    filter: drop-shadow(0 4px 12px ${props => props.$theme === 'dark' ? 'rgba(220, 38, 38, 0.4)' : 'rgba(0, 102, 204, 0.4)'});
  }

  .logo-link:active .logo-image {
    filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.3));
  }
`;

export default CategoryList
