'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { 
  Eye, EyeOff, Mail, Lock, Phone, AlertTriangle, 
  User, Loader,
} from 'lucide-react'
import AnimatedButton from '@/app/components/ui/animated-button'
import styled from 'styled-components'
import Image from 'next/image'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
  </svg>
)

const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-apple" viewBox="0 0 16 16">
    <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282"/>
    <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282"/>
  </svg>
)

export default function AuthPage() {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { login, register, loading } = useAuth()
  const { theme } = useTheme()
  const locale = pathname.split('/')[1]
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [container, setContainer] = useState<HTMLElement | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  // Move useEffects to the top level
  useEffect(() => {
    const containerElement = document.getElementById('container')
    setContainer(containerElement)
  }, [])

  useEffect(() => {
    if (container) {
      if (isSignUp) {
        container.classList.add('right-panel-active')
      } else {
        container.classList.remove('right-panel-active')
      }
    }
  }, [isSignUp, container])

  useEffect(() => {
    if (searchParams.get('form') === 'register') {
      setIsSignUp(true)
    }
    const formParam = searchParams.get('form')
    if (formParam === 'login' || formParam === 'signin') {
      setIsSignUp(false)
    } else if (formParam === 'register' || formParam === 'signup') {
      setIsSignUp(true)
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'email' && value && !value.includes('@')) {
      const numericValue = value.replace(/\D/g, '')
      if (numericValue) {
        setFormData(prev => ({
          ...prev,
          phone: value,
          email: ''
        }))
        return
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const toggleForm = () => {
    setIsSignUp(!isSignUp)
    setError(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    )
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const { email, phone, password } = formData
      
      if ((!email && !phone) || !password) {
        throw new Error('Please enter email or phone and password')
      }
    
      const identifier = email || phone
      
      console.log('Attempting login with:', { identifier })
      
      await login(identifier, password)
    } catch (error: any) {
      console.error('Login submission error:', error)
      setError(error.message || 'Invalid credentials')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const { firstName, lastName, email, phone, password, confirmPassword } = formData
      
      if (!firstName || !lastName || !password) {
        throw new Error('Please fill in all required fields')
      }
     
      if (!email && !phone) {
        throw new Error('Please provide either email or phone number')
      }
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }
      
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      await register(email || '', password, `${firstName} ${lastName}`, phone || '')
      // Removed router.push - AuthContext now handles redirection
    } catch (error: any) {
      setError(error.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    alert(`${provider} login not implemented yet`)
  }

  return (
    <PageWrapper theme={theme}>
      {/* Full page background image */}
      <BackgroundImage>
        <Image 
          src={theme === 'dark' ? '/images/bg.png' : '/images/bg.png'}
          alt="Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <BackgroundOverlay theme={theme} />
      </BackgroundImage>

      <div className="absolute top-0 left-0 right-0 p-6 z-10">        <Link href={`/${locale}`}>
          <AnimatedButton 
            title={t('buttons.back')}
            direction="left"
            className="text-gray-200" 
          />
        </Link>
      </div>

      <Container className={isSignUp ? 'right-panel-active' : ''} id="container" theme={theme}>
        {/* Sign Up Form */}
        <SignUpContainer className="sign-up-container">
          <Form onSubmit={handleRegisterSubmit} theme={theme}>
            <Title theme={theme}>Create Account</Title>
            
            {/* Social Login Buttons */}
            <SocialContainer>
              <SocialButton onClick={() => handleSocialLogin('Google')} theme={theme}>
                <GoogleIcon />
              </SocialButton>
              <SocialButton onClick={() => handleSocialLogin('Apple')} theme={theme}>
                <AppleIcon />
              </SocialButton>
              <SocialButton onClick={() => handleSocialLogin('LinkedIn')} theme={theme}>
                <LinkedInIcon />
              </SocialButton>
            </SocialContainer>

            {error && isSignUp && (
              <ErrorMessage theme={theme}>
                <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </ErrorMessage>
            )}

            <FormGrid>
              <InputGroup>
                <StyledInput>
                  <input 
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="First Name"
                    autoComplete="off"
                  />
                </StyledInput>
              </InputGroup>
              
              <InputGroup>
                <StyledInput>
                  <input 
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Last Name"
                    autoComplete="off"
                  />
                </StyledInput>
              </InputGroup>
              
              <InputGroup $fullWidth>
                <StyledInput>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Email (optional if phone provided)"
                    autoComplete="off"
                  />
                </StyledInput>
              </InputGroup>
              
              <InputGroup $fullWidth>
                <StyledInput>
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Phone (optional if email provided)"
                    autoComplete="off"
                  />
                </StyledInput>
              </InputGroup>
              
              <InputGroup $fullWidth>
                <PasswordWrapper>
                  <StyledInput>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Password"
                      autoComplete="off"
                    />
                  </StyledInput>
                  <PasswordToggle onClick={() => setShowPassword(!showPassword)} theme={theme}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </PasswordToggle>
                </PasswordWrapper>
              </InputGroup>
              
              <InputGroup $fullWidth>
                <PasswordWrapper>
                  <StyledInput>
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Confirm Password"
                      autoComplete="off"
                    />
                  </StyledInput>
                  <PasswordToggle onClick={() => setShowConfirmPassword(!showConfirmPassword)} theme={theme}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </PasswordToggle>
                </PasswordWrapper>
              </InputGroup>
            </FormGrid>
            
            <StyledButton>
              <button type="submit" className="Btn-Container" disabled={isSubmitting}>
                <span className="text">{isSubmitting ? 'Processing...' : 'Sign Up'}</span>
                <span className="icon-Container">
                  <svg width={16} height={19} viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="1.61321" cy="1.61321" r="1.5" fill="white" />
                    <circle cx="5.73583" cy="1.61321" r="1.5" fill="white" />
                    <circle cx="5.73583" cy="5.5566" r="1.5" fill="white" />
                    <circle cx="9.85851" cy="5.5566" r="1.5" fill="white" />
                    <circle cx="9.85851" cy="9.5" r="1.5" fill="white" />
                    <circle cx="13.9811" cy="9.5" r="1.5" fill="white" />
                    <circle cx="5.73583" cy="13.4434" r="1.5" fill="white" />
                    <circle cx="9.85851" cy="13.4434" r="1.5" fill="white" />
                    <circle cx="1.61321" cy="17.3868" r="1.5" fill="white" />
                    <circle cx="5.73583" cy="17.3868" r="1.5" fill="white" />
                  </svg>
                </span>
              </button>
            </StyledButton>
          </Form>
        </SignUpContainer>

        {/* Sign In Form */}
        <SignInContainer className="sign-in-container">
          <Form onSubmit={handleLoginSubmit} theme={theme}>
            <Title theme={theme}>Login</Title>
            
            {/* Social Login Buttons */}
            <SocialContainer>
              <SocialButton onClick={() => handleSocialLogin('Google')} theme={theme}>
                <GoogleIcon />
              </SocialButton>
              <SocialButton onClick={() => handleSocialLogin('Apple')} theme={theme}>
                <AppleIcon />
              </SocialButton>
              <SocialButton onClick={() => handleSocialLogin('LinkedIn')} theme={theme}>
                <LinkedInIcon />
              </SocialButton>
            </SocialContainer>

            {error && !isSignUp && (
              <ErrorMessage theme={theme}>
                <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </ErrorMessage>
            )}
            
            <StyledInput>
              <input 
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input"
                placeholder="Email or Phone"
                autoComplete="off"
              />
            </StyledInput>
            
            <PasswordWrapper>
              <StyledInput>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Password"
                  autoComplete="off"
                />
              </StyledInput>
              <PasswordToggle onClick={() => setShowPassword(!showPassword)} theme={theme}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </PasswordToggle>
            </PasswordWrapper>
            
            <StyledLink href={`/${locale}/auth/forgot-password`} theme={theme}>
              Forgot your password?
            </StyledLink>
            
            <StyledButton>
              <button type="submit" className="Btn-Container" disabled={isSubmitting}>
                <span className="text">{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                <span className="icon-Container">
                  <svg width={16} height={19} viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="1.61321" cy="1.61321" r="1.5" fill="white" />
                    <circle cx="5.73583" cy="1.61321" r="1.5" fill="white" />
                    <circle cx="5.73583" cy="5.5566" r="1.5" fill="white" />
                    <circle cx="9.85851" cy="5.5566" r="1.5" fill="white" />
                    <circle cx="9.85851" cy="9.5" r="1.5" fill="white" />
                    <circle cx="13.9811" cy="9.5" r="1.5" fill="white" />
                    <circle cx="5.73583" cy="13.4434" r="1.5" fill="white" />
                    <circle cx="9.85851" cy="13.4434" r="1.5" fill="white" />
                    <circle cx="1.61321" cy="17.3868" r="1.5" fill="white" />
                    <circle cx="5.73583" cy="17.3868" r="1.5" fill="white" />
                  </svg>
                </span>
              </button>
            </StyledButton>
          </Form>
        </SignInContainer>

        {/* Overlay */}
        <OverlayContainer className="overlay-container">
          <Overlay className="overlay" theme={theme}>
            <OverlayPanel className="overlay-panel overlay-left">
              <Title theme="light">Do you have profile?</Title>
              <Paragraph>Then login to your profile with email or phone</Paragraph>
              <AnimatedButtonWrapper>
                <button className="animated-button ghost" onClick={toggleForm}>
                  <span>Login</span>
                  <span />
                </button>
              </AnimatedButtonWrapper>
            </OverlayPanel>
            <OverlayPanel className="overlay-panel overlay-right">
              <Title theme="light">First time?</Title>
              <Paragraph>Then press here for create new profile</Paragraph>
              <AnimatedButtonWrapper>
                <button className="animated-button ghost" onClick={toggleForm}>
                  <span>Register</span>
                  <span />
                </button>
              </AnimatedButtonWrapper>
            </OverlayPanel>
          </Overlay>
        </OverlayContainer>
      </Container>
    </PageWrapper>
  )
}

{/* Styled Components */} 
export const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`

export const BackgroundImage = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
`

export const BackgroundOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${props => props.theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.3)'};
`

export const Container = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#1c1c1e' : '#fff'};
  border-radius: 10px;
  box-shadow: 0 14px 28px ${props => props.theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.25)'}, 
      0 10px 10px ${props => props.theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.22)'};
  position: relative;
  overflow: hidden;
  width: 900px;
  max-width: 95%;
  min-height: 650px;
  z-index: 1;

  &.right-panel-active .sign-in-container {
    transform: translateX(100%);
  }

  &.right-panel-active .sign-up-container {
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
    animation: show 0.6s;
  }

  @keyframes show {
    0%, 49.99% {
      opacity: 0;
      z-index: 1;
    }
    
    50%, 100% {
      opacity: 1;
      z-index: 5;
    }
  }

  &.right-panel-active .overlay-container {
    transform: translateX(-100%);
  }

  &.right-panel-active .overlay {
    transform: translateX(50%);
  }

  .overlay-left {
    transform: translateX(-20%);
  }

  .overlay-right {
    transform: translateX(0);
  }

  &.right-panel-active .overlay-left {
    transform: translateX(0);
  }

  &.right-panel-active .overlay-right {
    transform: translateX(20%);
  }

  @media (max-width: 768px) {
    width: 100%;
    min-height: 100vh;
  }
`

export const FormContainer = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
`

export const SignInContainer = styled(FormContainer)`
  left: 0;
  width: 50%;
  z-index: 2;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`

export const SignUpContainer = styled(FormContainer)`
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`

export const Form = styled.form`
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#FFFFFF'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 30px 50px;
  height: 100%;
  text-align: center;

  @media (max-width: 768px) {
    padding: 20px;
  }
`

export const Title = styled.h1`
  font-weight: bold;
  margin: 0 0 20px 0;
  color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
`

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  margin-bottom: 15px;
`

export const InputGroup = styled.div<{ $fullWidth?: boolean }>`
  grid-column: ${props => props.$fullWidth ? '1 / -1' : 'span 1'};
`

export const PasswordWrapper = styled.div`
  position: relative;
  width: 100%;
`

export const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#666'};
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  &:hover {
    color: ${props => props.theme === 'dark' ? '#fff' : '#333'};
  }
`

export const SocialContainer = styled.div`
  margin: 20px 0;
  display: flex;
  gap: 15px;
`

export const SocialButton = styled.button`
  border: 1px solid ${props => props.theme === 'dark' ? '#555' : '#DDDDDD'};
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
  height: 40px;
  width: 40px;
  background: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.theme === 'dark' ? '#fff' : '#333'};

  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#333' : '#f0f0f0'};
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`

export const Paragraph = styled.p`
  font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
  color: #ffffff;
`

export const Span = styled.span`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? '#999' : '#333'};
`

export const StyledLink = styled(Link)`
  color: ${props => props.theme === 'dark' ? '#999' : '#333'};
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;

  &:hover {
    color: ${props => props.theme === 'dark' ? '#ffffff' : '#dc2626'};
  }
`

export const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;

  @media (max-width: 768px) {
    display: none;
  }
`

export const Overlay = styled.div`
  background: ${props => props.theme === 'dark' ? 
    'linear-gradient(to right, #dc2626, #ef4444)' : 
    'linear-gradient(to right, #0066CC, #3b82f6)'};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #FFFFFF;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
`

export const OverlayPanel = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;

  &.overlay-left {
    transform: translateX(-20%);
  }

  &.overlay-right {
    right: 0;
    transform: translateX(0);
  }

  .right-panel-active & {
    &.overlay-left {
      transform: translateX(0);
    }

    &.overlay-right {
      transform: translateX(20%);
    }
  }
`

export const ErrorMessage = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: ${props => props.theme === 'dark' ? 'rgba(127, 29, 29, 0.3)' : '#fee2e2'};
  color: ${props => props.theme === 'dark' ? '#f87171' : '#b91c1c'};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  display: flex;
  align-items: flex-start;
  width: 100%;
`

export const StyledInput = styled.div`
  margin-bottom: 15px;
  width: 100%;

  .input {
    border: none;
    outline: none;
    border-radius: 15px;
    padding: 1em;
    background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : '#f3f4f6'};
    box-shadow: inset 2px 5px 10px rgba(0,0,0,0.3);
    transition: 300ms ease-in-out;
    width: 100%;
    font-size: 14px;
    color: ${props => props.theme === 'dark' ? '#fff' : '#000'};
  }

  .input:focus {
    background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#ffffff'};
    transform: scale(1.02);
    box-shadow: ${props => props.theme === 'dark' ? 
      '13px 13px 100px rgba(239, 68, 68, 0.2), -13px -13px 100px rgba(0, 0, 0, 0.5)' : 
      '13px 13px 100px rgba(0, 102, 204, 0.1), -13px -13px 100px #ffffff'};
  }

  .input::placeholder {
    color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  }
`

export const StyledButton = styled.div`
  margin-top: 20px;

  .Btn-Container {
    display: flex;
    width: 170px;
    height: fit-content;
    background: radial-gradient(
        65.28% 65.28% at 50% 100%,
        rgba(223, 113, 255, 0.8) 0%,
        rgba(223, 113, 255, 0) 100%
      ),
      linear-gradient(121deg, #d40b11, #5e44c7, #179aeb);border-radius: 40px;
    box-shadow: ${props => props.theme === 'dark' ? '0px 5px 10px rgba(239, 68, 68, 0.3)' : '0px 5px 10px rgba(0, 102, 204, 0.3)'};
    justify-content: space-between;
    align-items: center;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .Btn-Container:hover {
    background: radial-gradient(
        65.28% 65.28% at 50% 100%,
        rgba(223, 113, 255, 0.8) 0%,
        rgba(223, 113, 255, 0) 100%
      ),
      linear-gradient(121deg, #d40b11, #5e44c7, #179aeb);
    transform: translateY(-2px);
  }

  .icon-Container {
    width: 45px;
    height: 45px;
    background-color: ${props => props.theme === 'dark' ? '#4a4848' : '#4a4848'};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 3px solid ${props => props.theme === 'dark' ? '#000000' : '#000000'};
  }

  .text {
    width: calc(170px - 45px);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.1em;
    letter-spacing: 1.2px;
    font-weight: 500;
  }

  .icon-Container svg {
    transition-duration: 1.5s;
  }

  .Btn-Container:hover .icon-Container svg {
    transition-duration: 1.5s;
    animation: arrow 1s linear infinite;
  }

  @keyframes arrow {
    0% {
      opacity: 0;
      margin-left: 0px;
    }
    100% {
      opacity: 1;
      margin-left: 10px;
    }
  }
`

export const AnimatedButtonWrapper = styled.div`
  .animated-button {
    position: relative;
    display: inline-block;
    padding: 12px 24px;
    border: none;
    font-size: 16px;
    background-color: inherit;
    border-radius: 100px;
    font-weight: 600;
    color: #ffffff40;
    box-shadow: 0 0 0 2px #ffffff20;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.6s cubic-bezier(0.23, 1, 0.320, 1);
  }

  .animated-button span:last-child {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background-color: #ffffff;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.320, 1);
  }

  .animated-button span:first-child {
    position: relative;
    z-index: 1;
  }

  .animated-button:hover {
    box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }

  .animated-button:active {
    scale: 0.95;
  }

  .animated-button:hover span:last-child {
    width: 150px;
    height: 150px;
    opacity: 1;
  }

  .animated-button.ghost {
    background-color: transparent;
    border-color: #FFFFFF;
  }
`