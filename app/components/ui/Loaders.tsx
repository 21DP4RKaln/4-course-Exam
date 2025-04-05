'use client';

import React from 'react';

type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton';
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  fullScreen?: boolean;
  text?: string;
  className?: string;
  color?: string;
}

/**
 * Unified loading indicator component with multiple variants
 */
export function Loading({
  variant = 'spinner',
  size = 'md',
  fullScreen = false,
  text,
  className = '',
  color = '#E63946'
}: LoadingProps) {
  // Size mappings
  const sizeMap = {
    sm: { height: 'h-6', width: 'w-6', border: 'border-2', text: 'text-sm' },
    md: { height: 'h-8', width: 'w-8', border: 'border-2', text: 'text-base' },
    lg: { height: 'h-12', width: 'w-12', border: 'border-t-2 border-b-2', text: 'text-lg' },
    xl: { height: 'h-16', width: 'w-16', border: 'border-[3px]', text: 'text-xl' },
  };

  // Container classes based on fullScreen prop
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex justify-center items-center bg-black/50 z-50'
    : 'flex justify-center items-center';

  // Render appropriate loading indicator based on variant
  const renderIndicator = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div 
            className={`${sizeMap[size].height} ${sizeMap[size].width} animate-spin rounded-full ${sizeMap[size].border}`}
            style={{ 
              borderTopColor: color,
              borderBottomColor: color,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent'
            }}
          />
        );
      
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeMap[size].height} ${sizeMap[size].width} rounded-full`}
                style={{ 
                  backgroundColor: color,
                  animation: `dotPulse 1.5s infinite ease-in-out ${i * 0.2}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div 
            className={`${sizeMap[size].height} ${sizeMap[size].width} rounded-full animate-pulse`}
            style={{ backgroundColor: color }}
          />
        );
      
      case 'skeleton':
        return (
          <div className="space-y-2 w-full">
            <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded animate-pulse w-5/6"></div>
          </div>
        );
      
      default:
        return (
          <div 
            className={`${sizeMap[size].height} ${sizeMap[size].width} animate-spin rounded-full ${sizeMap[size].border}`}
            style={{ 
              borderTopColor: color,
              borderBottomColor: color,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent'
            }}
          />
        );
    }
  };

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center">
        {renderIndicator()}
        {text && (
          <p className={`mt-4 text-white ${sizeMap[size].text}`}>
            {text}
          </p>
        )}
      </div>
      
      {/* Add styles for dot animation */}
      {variant === 'dots' && (
        <style jsx global>{`
          @keyframes dotPulse {
            0%, 80%, 100% { transform: scale(0); opacity: 0; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      )}
    </div>
  );
}

/**
 * Simple spinner for quick loading states
 */
export function Spinner() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1A1A1A]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
    </div>
  );
}

/**
 * Page loader with app branding
 */
export function PageLoader() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#1A1A1A]">
      <div className="mb-4 text-2xl font-bold text-white">IvaPro</div>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
    </div>
  );
}