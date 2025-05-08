'use client'

import React from 'react'
import Loading from '@/app/components/ui/Loading'

interface UseLoadingOptions {
  size?: 'small' | 'medium' | 'large'
  text?: string
  fullScreen?: boolean
  className?: string
}

export function useLoading(loading: boolean, options: UseLoadingOptions = {}) {
  const {
    size = 'medium',
    text = '',
    fullScreen = false,
    className = ''
  } = options

  const loadingComponent = React.useMemo(() => {
    if (loading) {
      return (
        <Loading
          size={size}
          text={text}
          fullScreen={fullScreen}
          className={className}
        />
      )
    }
    return null
  }, [loading, size, text, fullScreen, className])

  return loadingComponent
}

export function LoadingSpinner({ size = 'small', className = '' }: { size?: 'small' | 'medium' | 'large', className?: string }) {
  return <Loading size={size} className={className} />
}

export function FullPageLoading({ text = 'Loading...' }: { text?: string }) {
  return <Loading size="large" text={text} fullScreen />
}

export function ButtonLoading({ size = 'small', className = '' }: { size?: 'small' | 'medium' | 'large', className?: string }) {
  return <Loading size={size} className={`inline-flex ${className}`} />
}