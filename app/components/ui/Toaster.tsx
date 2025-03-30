'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-500/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-500/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500/20';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-500/20';
    }
  };

  return (
    <div className={`flex items-center p-4 mb-4 rounded-lg border ${getBackgroundColor()} shadow-md backdrop-blur-sm`}>
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="text-sm font-normal text-gray-800 dark:text-gray-200 mr-2">
        {toast.message}
      </div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
}

export default function ToasterWithProvider({ children }: { children?: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  );
}