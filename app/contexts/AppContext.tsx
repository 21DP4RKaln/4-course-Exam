import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';

// ==== LIETOTĀJA TIPU DEFINĒŠANA ====
export interface User {
  id: string;
  name: string;
  surname: string;
  email?: string | null;
  phoneNumber?: string | null;
  role: 'CLIENT' | 'SPECIALIST' | 'ADMIN';
  profilePicture?: string | null;
}

// ==== GROZA IERAKSTA TIPU DEFINĒŠANA ====
export interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'ready' | 'custom';
  quantity: number;
}

// ==== REĢISTRĀCIJAS DATU INTERFEISS ====
interface RegisterData {
  name: string;
  surname: string;
  email?: string;
  phoneNumber?: string;
  password: string;
}

// ==== APLIKĀCIJAS KONTEKSTA TIPS ====
interface AppContextType {
  // Auth konteksts
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

  cart: {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
  };
}

// ==== GROZA DARBĪBU TIPI ====
type CartAction = 
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'INITIALIZE'; payload: CartItem[] };

// ==== KONTEKSTA KONFIGURĀCIJAS KONSTANTES ====
const CART_STORAGE_KEY = 'ivapro_cart';
const INITIAL_CART_STATE: { items: CartItem[] } = { items: [] };

// Izveidojam kontekstu
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Groza reducer funkcija stāvokļa pārvaldībai
 */
function cartReducer(state: { items: CartItem[] }, action: CartAction): { items: CartItem[] } {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      
      if (existingItemIndex !== -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return { items: updatedItems };
      } else {
        return { 
          items: [...state.items, { ...action.payload, quantity: 1 }] 
        };
      }
    }
    
    case 'REMOVE_ITEM':
      return { 
        items: state.items.filter(item => item.id !== action.payload.id) 
      };
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return { 
          items: state.items.filter(item => item.id !== action.payload.id) 
        };
      }
      
      return { 
        items: state.items.map(item => 
          item.id === action.payload.id 
            ? { ...item, quantity: action.payload.quantity }
            : item
        ) 
      };
    }
    
    case 'CLEAR_CART':
      return { items: [] };
    
    case 'INITIALIZE':
      return { items: action.payload };
    
    default:
      return state;
  }
}

/**
 * Apvienotais aplikācijas konteksta Provider
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // ==== AUTENTIFIKĀCIJAS STĀVOKLIS ====
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale || 'en';

  // ==== GROZA STĀVOKLIS ====
  const [cartState, dispatchCart] = React.useReducer(cartReducer, INITIAL_CART_STATE);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {

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

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        dispatchCart({ type: 'INITIALIZE', payload: JSON.parse(savedCart) });
      }
    } catch (e) {
      console.error('Failed to parse saved cart', e);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (cartState.items.length > 0 || localStorage.getItem(CART_STORAGE_KEY)) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState.items));
    }
  }, [cartState.items]);

  /**
   * Autentifikācija
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
   * Reģistrācija
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
   * Izrakstīšanās
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
   * Lietotāja datu atjaunināšana kontekstā
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };
 
  const totalItems = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartState.items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );

  const contextValue: AppContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,

    cart: {
      items: cartState.items,
      addItem: (item: Omit<CartItem, 'quantity'>) => 
        dispatchCart({ type: 'ADD_ITEM', payload: item }),
      removeItem: (id: string) => 
        dispatchCart({ type: 'REMOVE_ITEM', payload: { id } }),
      updateQuantity: (id: string, quantity: number) => 
        dispatchCart({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
      clearCart: () => 
        dispatchCart({ type: 'CLEAR_CART' }),
      totalItems,
      totalPrice
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Āķis aplikācijas konteksta piekļūšanai
 */
export function useApp() {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
}

/**
 * Āķis tikai autentifikācijas stāvokļa piekļūšanai
 */
export function useAuth() {
  const context = useApp();
  
  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    login: context.login,
    register: context.register,
    logout: context.logout,
    updateUser: context.updateUser
  };
}

/**
 * Āķis tikai groza piekļūšanai
 */
export function useCart() {
  const context = useApp();
  return context.cart;
}

/**
 * Komponente aizsargātu maršrutu izveidei
 */
export function ProtectedRoute({ children, requiredRoles = [] }: { children: ReactNode; requiredRoles?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { isAuthenticated, isLoading, user } = useAuth();
  const locale = params.locale || 'en';
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
        router.push(`/${locale}/dashboard`);
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRoles, router, pathname, locale]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : null;
}