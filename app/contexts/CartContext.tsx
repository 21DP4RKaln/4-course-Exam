import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

// Create context with undefined default
const CartContext = createContext<CartContextType | undefined>(undefined);

// Storage key for cart items
const STORAGE_KEY = 'ivapro_cart';

/**
 * Cart provider component
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(STORAGE_KEY);
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (e) {
        console.error('Failed to parse saved cart', e);
        // Reset to empty cart if parsing fails
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadCart();
  }, []);
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isInitialized]);
  
  /**
   * Add an item to the cart
   */
  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      
      if (existingItem) {
        return prevItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  }, []);
  
  /**
   * Remove an item from the cart
   */
  const removeItem = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);
  
  /**
   * Update an item's quantity
   */
  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);
  
  /**
   * Clear the cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);
  
  // Calculate cart totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );
  
  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart,
        totalItems,
        totalPrice
      }}
    >
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