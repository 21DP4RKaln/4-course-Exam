import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

// Define user types for better type safety
export interface User {
  id: string;
  name: string;
  surname: string;
  email?: string | null;
  phoneNumber?: string | null;
  role: 'CLIENT' | 'SPECIALIST' | 'ADMIN';
  profilePicture?: string | null;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{
    success: boolean;
    message?: string;
  }>;
  register: (userData: RegisterData) => Promise<{
    success: boolean;
    message?: string;
  }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// Register data interface
interface RegisterData {
  name: string;
  surname: string;
  email?: string;
  phoneNumber?: string;
  password: string;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider component to manage authentication state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // First check if the user is authenticated
        const authCheckResponse = await fetch('/api/auth/check', {
          method: 'GET',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        const authData = await authCheckResponse.json();
        
        if (!authData.authenticated) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // If authenticated, fetch the user profile
        const profileResponse = await fetch('/api/profile', {
          method: 'GET',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  /**
   * Login function
   */
  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const isEmail = identifier.includes('@');
      
      const loginData = {
        password,
        ...(isEmail ? { email: identifier } : { phoneNumber: identifier })
      };
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
        cache: 'no-store',
        credentials: 'include'
      });
      
      if (!res.ok) {
        const error = await res.json();
        return { success: false, message: error.message || 'Login failed' };
      }
      
      const data = await res.json();
      setUser(data.user);
      
      // Force a revalidation of the authentication state
      await fetch('/api/auth/check', { 
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'An error occurred during login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registration function
   */
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          surname: userData.surname,
          email: userData.email || null,
          phoneNumber: userData.phoneNumber || null,
          password: userData.password
        }),
        credentials: 'include'
      });
      
      if (!res.ok) {
        const error = await res.json();
        return { success: false, message: error.message || 'Registration failed' };
      }
      
      const data = await res.json();
      setUser(data.user);
      
      await fetch('/api/auth/check', { 
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'An error occurred during registration' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      setUser(null);
      router.push(`/${locale}/login`);
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Update user data in context
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        register, 
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Auth context hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}