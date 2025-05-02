'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

// Create context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'light',
  toggleTheme: () => {},
  setTheme: () => {}
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as Theme | null
      if (storedTheme) {
        setTheme(storedTheme)
      } else {
        setTheme('system')
      }
      setMounted(true)
    }
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    
    if (theme === 'system') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setResolvedTheme(systemPreference)

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      setResolvedTheme(theme)
    }
  }, [theme, mounted])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    
    const root = document.documentElement
    
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [resolvedTheme, mounted])

  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'system') {
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
        localStorage.setItem('theme', newTheme)
        return newTheme
      }

      const newTheme = prevTheme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', newTheme)
      return newTheme
    })
  }

  const handleSetTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme)
    setTheme(newTheme)
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        resolvedTheme, 
        toggleTheme,
        setTheme: handleSetTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  return context;
}