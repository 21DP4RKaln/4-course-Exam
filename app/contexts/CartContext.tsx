import React, { createContext, useContext, useReducer, useEffect } from 'react';

/**
 * Cart item interface for type safety
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'ready' | 'custom';
  quantity: number;
}

/**
 * Cart context interface
 */
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'INITIALIZE'; payload: CartItem[] };

const STORAGE_KEY = 'ivapro_cart';

const initialState: { items: CartItem[] } = {
  items: []
};

const CartContext = createContext<CartContextType | undefined>(undefined);

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
 * Cart provider component
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      if (savedCart) {
        dispatch({ type: 'INITIALIZE', payload: JSON.parse(savedCart) });
      }
    } catch (e) {
      console.error('Failed to parse saved cart', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (state.items.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.items]);

  const cartContextValue = React.useMemo(() => {
    const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    return {
      items: state.items,
      addItem: (item: Omit<CartItem, 'quantity'>) => 
        dispatch({ type: 'ADD_ITEM', payload: item }),
      removeItem: (id: string) => 
        dispatch({ type: 'REMOVE_ITEM', payload: { id } }),
      updateQuantity: (id: string, quantity: number) => 
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
      clearCart: () => 
        dispatch({ type: 'CLEAR_CART' }),
      totalItems,
      totalPrice
    };
  }, [state.items]);
  
  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Custom hook to use the cart context
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}