/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        brand: {
          red: {
            DEFAULT: '#dc2626',
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626', 
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            950: '#450a0a',
          },
          blue: {
            DEFAULT: '#0066CC', 
            50: '#eef6ff',
            100: '#d9eaff',
            200: '#bddcff',
            300: '#90c7ff',
            400: '#5dadff',
            500: '#3b8def',
            600: '#0066CC', 
            700: '#0054b3',
            800: '#004594',
            900: '#003b7a',
            950: '#00254d',
          },
        },
        // Light mode colors
        light: {
          background: '#ffffff',
          surface: '#f9fafb',
          card: '#ffffff',
          border: '#e5e7eb',
          text: {
            primary: '#111827',
            secondary: '#4b5563',
            tertiary: '#6b7280',
          },
          accent: '#f3f4f6',
        },
        // Dark mode colors
        dark: {
          background: '#0a0a0a', 
          surface: '#141414',
          card: '#1c1c1e', 
          border: '#2d2d2d',
          text: {
            primary: '#f9fafb',
            secondary: '#9ca3af',
            tertiary: '#6b7280',
          },
          accent: '#202020',
        },
      },
      textColor: {
        foreground: 'var(--foreground)',
        background: 'var(--background)',
      },
      backgroundColor: {
        foreground: 'var(--foreground)',
        background: 'var(--background)',
      },
      borderColor: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'hard': '0 12px 40px rgba(0, 0, 0, 0.18)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'red-to-black': 'linear-gradient(to right, #dc2626, #0a0a0a)',
        'blue-to-white': 'linear-gradient(to right, #0066CC, #ffffff)',
        'neutral-gradient': 'linear-gradient(to right, #64748b, #94a3b8)',
      },
      opacity: {
        '80': '0.8'
      }
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  safelist: [
    'hover:bg-secondary',
    'hover:bg-primary',
    'hover:bg-destructive',
    'hover:bg-opacity-80',
    'hover:bg-secondary/80',
    'hover:bg-primary/80',
    'hover:bg-destructive/80'
  ]
}