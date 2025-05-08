'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { useCart } from '@/app/contexts/CartContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { 
  Sun,
  Moon,
  ShoppingCart, 
  User, 
  LogOut, 
  ChevronDown,
  Monitor,
  Cpu,
  Wrench,
  Keyboard,
  Info
} from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import MobileMenu from './MobileMenu'
import styled from 'styled-components'

export default function Header() {
  const t = useTranslations()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const [pcDropdownOpen, setPcDropdownOpen] = useState(false)
  const pcDropdownRef = useRef<HTMLDivElement>(null)
 
  const locale = pathname.split('/')[1]

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return `/${locale}/dashboard`
    
    switch (user.role) {
      case 'ADMIN':
        return `/${locale}/admin`
      case 'SPECIALIST':
        return `/${locale}/specialist`
      default:
        return `/${locale}/dashboard`
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (pcDropdownRef.current && !pcDropdownRef.current.contains(event.target as Node)) {
        setPcDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 dark:bg-dark-background/80 backdrop-blur-md shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <span className={`text-xl font-bold transition-colors ${
              theme === 'dark' 
                ? 'text-white' 
                : isScrolled ? 'text-brand-blue-600' : 'text-brand-blue-600'
            }`}>
              {t('common.appName')}
            </span>
          </Link>

          {/* Main navigation (hidden on mobile) */}
          <nav className="hidden md:flex items-center space-x-3">
            {/* PC Dropdown */}
            <PCDropdownWrapper ref={pcDropdownRef}>
              <StyledButtonWrapper $theme={theme}>
                <button
                  className={`nav-button ${
                    pathname.includes('/configurator') || pathname.includes('/shop/ready-made')
                      ? 'active' 
                      : ''
                  }`}
                  onClick={() => setPcDropdownOpen(!pcDropdownOpen)}
                  aria-expanded={pcDropdownOpen}
                >
                  <Monitor size={16} />
                  <span>PC</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${pcDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </StyledButtonWrapper>
              
              {pcDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-dark-card rounded-xl shadow-medium dark:shadow-hard overflow-hidden z-50 border border-gray-100 dark:border-gray-800">
                  <div className="py-1">
                    <Link
                      href={`/${locale}/configurator`}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setPcDropdownOpen(false)}
                    >
                      <Cpu size={18} className={`mr-3 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                      {t('nav.configurator')}
                    </Link>
                    <Link
                      href={`/${locale}/shop/ready-made`}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setPcDropdownOpen(false)}
                    >
                      <Monitor size={18} className={`mr-3 ${theme === 'dark' ? 'text-brand-red-500' : 'text-brand-blue-500'}`} />
                      {t('nav.readyMade')}
                    </Link>
                  </div>
                </div>
              )}
            </PCDropdownWrapper>
            
            {/* Components button */}
            <StyledButtonWrapper $theme={theme}>
              <Link 
                href={`/${locale}/components`}
                className={`nav-button ${pathname.includes('/components') ? 'active' : ''}`}
              >
                <Cpu size={16} />
                <span>{t('nav.components')}</span>
              </Link>
            </StyledButtonWrapper>
            
            {/* Peripherals button */}
            <StyledButtonWrapper $theme={theme}>
              <Link 
                href={`/${locale}/peripherals`}
                className={`nav-button ${pathname.includes('/peripherals') ? 'active' : ''}`}
              >
                <Keyboard size={16} />
                <span>{t('nav.peripherals')}</span>
              </Link>
            </StyledButtonWrapper>
            
            {/* Repairs button */}
            <StyledButtonWrapper $theme={theme}>
              <Link 
                href={`/${locale}/repairs`}
                className={`nav-button ${pathname.includes('/repairs') ? 'active' : ''}`}
              >
                <Wrench size={16} />
                <span>{t('nav.repairs')}</span>
              </Link>
            </StyledButtonWrapper>
            
            {/* About button */}
            <StyledButtonWrapper $theme={theme}>
              <Link 
                href={`/${locale}/about`}
                className={`nav-button ${pathname.includes('/about') ? 'active' : ''}`}
              >
                <Info size={16} />
                <span>{t('nav.about')}</span>
              </Link>
            </StyledButtonWrapper>
          </nav>

          {/* Controls and buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <LanguageSwitcher />
            
            {/* Theme switch */}
            <ThemeSwitchWrapper $theme={theme}>
              <div className="switch">
                <input 
                  id="theme-toggle" 
                  type="checkbox" 
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
                <label className="toggle" htmlFor="theme-toggle">
                  <div className="icon sun-icon">
                    <Sun size={12} />
                  </div>
                  <div className="icon moon-icon">
                    <Moon size={12} />
                  </div>
                  <i />
                </label>
              </div>
            </ThemeSwitchWrapper>

            {/* Cart */}
            <Link 
              href={`/${locale}/cart`}
              className={`relative rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                isScrolled || theme !== 'dark'
                  ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full text-white ${
                  theme === 'dark' ? 'bg-brand-red-600' : 'bg-brand-blue-600'
                }`}>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="relative flex items-center space-x-4">
                <Link 
                  href={getDashboardLink()}
                  className={`flex items-center space-x-2 ${
                    isScrolled || theme !== 'dark'
                      ? 'text-gray-800 dark:text-gray-200' 
                      : 'text-white'
                  } hover:text-brand-blue-500 dark:hover:text-brand-red-400 transition-colors`}
                >
                  <User size={18} />
                  <span className="hidden lg:inline text-sm font-medium">{user?.name || user?.email}</span>
                </Link>
                <button 
                  onClick={() => logout()}
                  className={`rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                    isScrolled || theme !== 'dark'
                      ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800' 
                      : 'text-white hover:bg-white/10'
                  }`}
                  aria-label={t('nav.logout')}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <LoginButtonWrapper $theme={theme}>
                  <Link href={`/${locale}/auth`} className="user-profile">
                    <div className="user-profile-inner">
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g>
                          <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z" />
                        </g>
                      </svg>
                      <p>{t('nav.login')}</p>
                    </div>
                  </Link>
                </LoginButtonWrapper>
                
                <RegisterButtonWrapper $theme={theme}>
                  <Link href={`/${locale}/auth?form=register`} className="styled-button">
                    {t('nav.register')}
                    <div className="inner-button">
                      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" className="icon">
                        <defs>
                          <linearGradient y2="100%" x2="100%" y1="0%" x1="0%" id="iconGradient">
                            <stop style={{stopColor: '#FFFFFF', stopOpacity: 1}} offset="0%" />
                            <stop style={{stopColor: '#AAAAAA', stopOpacity: 1}} offset="100%" />
                          </linearGradient>
                        </defs>
                        <path fill="url(#iconGradient)" d="M4 15a1 1 0 0 0 1 1h19.586l-4.292 4.292a1 1 0 0 0 1.414 1.414l6-6a.99.99 0 0 0 .292-.702V15c0-.13-.026-.26-.078-.382a.99.99 0 0 0-.216-.324l-6-6a1 1 0 0 0-1.414 1.414L24.586 14H5a1 1 0 0 0-1 1z" />
                      </svg>
                    </div>
                  </Link>
                </RegisterButtonWrapper>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center space-x-4">
            <Link 
              href={`/${locale}/cart`}
              className="relative p-2"
            >
              <ShoppingCart size={20} className={`${
                isScrolled || theme !== 'dark' ? 'text-gray-800 dark:text-gray-200' : 'text-white'
              }`} />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white rounded-full ${
                  theme === 'dark' ? 'bg-brand-red-600' : 'bg-brand-blue-600'
                }`}>
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* Animated Hamburger Menu Button */}
            <HamburgerWrapper $theme={theme} $isScrolled={isScrolled as boolean}>
              <label className="hamburger">
                <input 
                  type="checkbox" 
                  checked={mobileMenuOpen}
                  onChange={() => setMobileMenuOpen(!mobileMenuOpen)}
                />
                <svg viewBox="0 0 32 32">
                  <path 
                    className="line line-top-bottom" 
                    d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22" 
                  />
                  <path className="line" d="M7 16 27 16" />
                </svg>
              </label>
            </HamburgerWrapper>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        dashboardLink={getDashboardLink()}
      />
    </header>
  )
}

const StyledButtonWrapper = styled.div<{ $theme: string }>`
  .nav-button {
    align-items: center;
    appearance: none;
    background-color: #fcfcfd;
    border-radius: 4px;
    border-width: 0;
      #d6d6e7 0 -3px 0 inset;
    box-sizing: border-box;
    color: #36395a;
    cursor: pointer;
    display: inline-flex;
    height: 40px;
    justify-content: center;
    line-height: 1;
    list-style: none;
    overflow: hidden;
    padding-left: 16px;
    padding-right: 16px;
    position: relative;
    text-align: left;
    text-decoration: none;
    transition: box-shadow 0.15s, transform 0.15s;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    white-space: nowrap;
    will-change: box-shadow, transform;
    font-size: 14px;
    font-weight: 500;
    gap: 6px;
  }

  .nav-button:focus {
    box-shadow: #d6d6e7 0 0 0 1.5px inset,
      rgba(45, 35, 66, 0.4) 0 2px 4px,
      rgba(45, 35, 66, 0.3) 0 7px 13px -3px,
      #d6d6e7 0 -3px 0 inset;
  }

  .nav-button:hover {
    box-shadow: rgba(45, 35, 66, 0.3) 0 4px 8px,
      rgba(45, 35, 66, 0.2) 0 7px 13px -3px,
      #d6d6e7 0 -3px 0 inset;
    transform: translateY(-2px);
  }

  .nav-button:active {
    box-shadow: #d6d6e7 0 3px 7px inset;
    transform: translateY(2px);
  }

  /* Dark mode adjustments */
  .dark & .nav-button {
    background-color: #000;
    color: #f9fafb;
  }

  .dark & .nav-button:focus {
    box-shadow: #333333 0 0 0 1.5px inset,
      rgba(255, 255, 255, 0.2) 0 2px 4px,
      rgba(255, 255, 255, 0.15) 0 7px 13px -3px,
      #333333 0 -3px 0 inset;
  }

  .dark & .nav-button:hover {
    box-shadow: rgba(255, 255, 255, 0.15) 0 4px 8px,
      rgba(255, 255, 255, 0.1) 0 7px 13px -3px,
      #333333 0 -3px 0 inset;
  }

  .dark & .nav-button:active {
    box-shadow: #333333 0 3px 7px inset;
  }

  /* Active state for current page */
  .nav-button.active {
    background-color: ${props => props.$theme === 'dark' ? '#dc2626' : '#0066CC'};
    color: white;
    box-shadow: none;
  }

  .nav-button.active:hover {
    background-color: ${props => props.$theme === 'dark' ? '#b91c1c' : '#0054b3'};
    transform: none;
  }
`;

const PCDropdownWrapper = styled.div`
  position: relative;
`;

const ThemeSwitchWrapper = styled.div<{ $theme: string }>`
  .switch {
    position: relative;
    width: 50px;
    height: 24px;
    box-sizing: border-box;
    padding: 2px;
    background: ${props => props.$theme === 'dark' ? '#2d2d2d' : '#e5e7eb'};
    border-radius: 12px;
    box-shadow:
      inset 0 1px 1px 1px rgba(0, 0, 0, 0.2),
      0 1px 0 0 rgba(255, 255, 255, 0.1);
  }
  
  .switch input[type="checkbox"] {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
  
  .switch input[type="checkbox"] + label {
    position: relative;
    display: block;
    left: 0;
    width: 20px;
    height: 20px;
    background: ${props => props.$theme === 'dark' ? '#000000' : '#ffffff'};
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease-in-out;
  }
  
  .switch input[type="checkbox"] + label:before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    box-shadow:
      0 0 3px 1px ${props => props.$theme === 'dark' ? 'rgba(0, 102, 204, 0.7)' : 'rgba(220, 38, 38, 0.7)'},
      0 0 8px 2px ${props => props.$theme === 'dark' ? 'rgba(0, 102, 204, 0.4)' : 'rgba(220, 38, 38, 0.4)'};
    transition: all 0.3s ease-in-out;
  }
  
  /* Icons */
  .switch input[type="checkbox"] + label .icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.3s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .switch input[type="checkbox"] + label .sun-icon {
    opacity: ${props => props.$theme === 'dark' ? '0' : '1'};
    transform: translate(-50%, -50%) ${props => props.$theme === 'dark' ? 'scale(0.7) rotate(45deg)' : 'scale(1) rotate(0deg)'};
    color: #facc15;
  }
  
  .switch input[type="checkbox"] + label .moon-icon {
    opacity: ${props => props.$theme === 'dark' ? '1' : '0'};
    transform: translate(-50%, -50%) ${props => props.$theme === 'dark' ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(-45deg)'};
    color: #60a5fa;
  }
  
  .switch input[type="checkbox"]:checked + label {
    left: calc(100% - 22px);
  }
`;

interface HamburgerWrapperProps {
  $theme: string;
  $isScrolled: boolean;
}

const HamburgerWrapper = styled.div<HamburgerWrapperProps>`
  .hamburger {
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .hamburger input {
    display: none;
  }
  
  .hamburger svg {
    /* The size of the SVG defines the overall size */
    height: 2em;
    width: 2em;
    /* Define the transition for transforming the SVG */
    transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .line {
    fill: none;
    stroke: ${props => props.$isScrolled || props.$theme !== 'dark' ? (props.$theme === 'dark' ? '#e5e7eb' : '#1f2937') : '#ffffff'};
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 3;
    /* Define the transition for transforming the Stroke */
    transition: stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1),
                stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .line-top-bottom {
    stroke-dasharray: 12 63;
  }
  
  .hamburger input:checked + svg {
    transform: rotate(-45deg);
  }
  
  .hamburger input:checked + svg .line-top-bottom {
    stroke-dasharray: 20 300;
    stroke-dashoffset: -32.42;
  }
`;

const LoginButtonWrapper = styled.div<{ $theme: string }>`
  .user-profile {
    width: 90px;
    height: 36px;
    border-radius: 10px;
    cursor: pointer;
    transition: 0.3s ease;
    background: linear-gradient(
      to bottom right,
      ${props => props.$theme === 'dark' ? '#dc2626' : '#0066cc'} 0%,
      ${props => props.$theme === 'dark' ? 'rgba(220, 38, 38, 0)' : 'rgba(0, 102, 204, 0)'} 30%
    );
    background-color: ${props => props.$theme === 'dark' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(0, 102, 204, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }
  
  .user-profile:hover,
  .user-profile:focus {
    background-color: ${props => props.$theme === 'dark' ? 'rgba(220, 38, 38, 0.7)' : 'rgba(0, 102, 204, 0.7)'};
    box-shadow: 0 0 10px ${props => props.$theme === 'dark' ? 'rgba(220, 38, 38, 0.5)' : 'rgba(0, 102, 204, 0.5)'};
    outline: none;
  }
  
  .user-profile-inner {
    width: 86px;  
    height: 32px; 
    border-radius: 8px; 
    background-color: ${props => props.$theme === 'dark' ? '#1a1a1a' : '#ffffff'};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: ${props => props.$theme === 'dark' ? '#fff' : '#000'};
    font-weight: 600;
    font-size: 13px;
  }
  
  .user-profile-inner svg {
    width: 18px;
    height: 18px;
    fill: ${props => props.$theme === 'dark' ? '#fff' : '#000'};
  }
`;

const RegisterButtonWrapper = styled.div<{ $theme: string }>`
  .styled-button {
    position: relative;
    padding: 0.45rem 1.2rem;
    font-size: 13px;
    font-weight: bold;
    color: #ffffff;
    background: ${props => props.$theme === 'dark' 
      ? 'linear-gradient(to bottom, #dc2626, #991b1b)'
      : 'linear-gradient(to bottom, #0066cc, #0052a3)'
    };
    border-radius: 9999px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 5px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${props => props.$theme === 'dark' ? '#b91c1c' : '#0054a8'};
    text-decoration: none;
    height: 36px;
  }
  
  .styled-button::before {
    content: "";
    position: absolute;
    top: -2px;
    right: -1px;
    bottom: -1px;
    left: -1px;
    background: ${props => props.$theme === 'dark'
      ? 'linear-gradient(to bottom, #ef4444, #dc2626)'
      : 'linear-gradient(to bottom, #3b82f6, #0066cc)'
    };
    z-index: -1;
    border-radius: 9999px;
    transition: all 0.2s ease;
    opacity: 1;
  }
  
  .styled-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.3);
  }
  
  .styled-button:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .styled-button .inner-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$theme === 'dark'
      ? 'linear-gradient(to bottom, #dc2626, #991b1b)'
      : 'linear-gradient(to bottom, #0066cc, #0052a3)'
    };
    width: 26px;
    height: 26px;
    margin-left: 8px;
    border-radius: 50%;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
    border: 1px solid ${props => props.$theme === 'dark' ? '#b91c1c' : '#0054a8'};
    transition: all 0.2s ease;
  }
  
  .styled-button .inner-button::before {
    content: "";
    position: absolute;
    top: -2px;
    right: -1px;
    bottom: -1px;
    left: -1px;
    background: ${props => props.$theme === 'dark'
      ? 'linear-gradient(to bottom, #ef4444, #dc2626)'
      : 'linear-gradient(to bottom, #3b82f6, #0066cc)'
    };
    z-index: -1;
    border-radius: 9999px;
    transition: all 0.2s ease;
    opacity: 1;
  }
  
  .styled-button .inner-button .icon {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    transition: all 0.4s ease-in-out;
  }
`;