// app/components/ui/index.ts - Export all UI components for consistent imports
export * from './Button';
export * from './Modal';
export * from './Toaster';
export * from './Loaders';
export * from './Form';
export * from './DataDisplay';
export * from './LanguageSwitcher';

// app/components/ui/Modal.tsx - Unified modal component with variants
import React, { ReactNode, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  title?: string;
  maxWidth?: string;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

/**
 * Base modal component with customizable content
 */
export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  maxWidth = 'max-w-lg',
  closeOnEscape = true,
  closeOnOutsideClick = true
}: ModalProps) {
  useEffect(() => {
    // Handle ESC key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        <Link 
          href={href} 
          className={buttonClasses}
          {...props}
          ref={ref as any}
        >
          {isLoading ? (
            <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : null}
          {children}
        </Link>
      );
    }
    
    return (
      <Comp
        className={buttonClasses}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </Comp>
    );
  }
);

/**
 * Loading button variant with automatic loading state
 */
export function LoadingButton({ 
  children, 
  isLoading, 
  loadingText = "Loading...",
  ...props 
}: ButtonProps & { loadingText?: string }) {
  return (
    <Button
      disabled={isLoading}
      isLoading={isLoading}
      {...props}
    >
      {isLoading ? loadingText : children}
    </Button>
  );
}

/**
 * IconButton component for buttons with just an icon
 */
export function IconButton({ 
  icon, 
  label,
  ...props 
}: ButtonProps & { icon: React.ReactNode; label: string }) {
  return (
    <Button
      size="icon"
      aria-label={label}
      {...props}
    >
      {icon}
    </Button>
  );
}onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Disable body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEscape]);
  
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        className={`bg-[#1E1E1E] rounded-lg p-6 w-full ${maxWidth} relative mx-4 my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        
        {title && (
          <h2 id="modal-title" className="text-2xl font-bold text-white mb-4">{title}</h2>
        )}
        
        {children}
      </div>
    </div>
  );
}

/**
 * Contact modal for customer support
 */
export function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations('contactModal');
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={t('title')}
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        <p className="text-gray-300">
          {t('description.first')}
        </p>
        <p className="text-gray-300">
          {t('description.second')}
        </p>

        {/* Contact options */}
        <div>
          <h3 className="text-lg text-white mb-2">{t('callOrRequest')}</h3>
          <a 
            href="tel:+37120699800" 
            className="text-xl text-white font-bold hover:text-lime-400"
          >
            +371 20699800
          </a>
        </div>

        {/* Messaging */}
        <div>
          <h3 className="text-lg text-white mb-2">{t('writeMessage')}</h3>
          <div className="flex gap-4">
            <a 
              href="https://t.me/ivaprolv" 
              className="px-4 py-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700"
            >
              Telegram
            </a>
            <a 
              href="https://wa.me/37120699800" 
              className="px-4 py-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700"
            >
              WhatsApp
            </a>
          </div>
        </div>
        
        {/* Email */}
        <div>
          <h3 className="text-lg text-white mb-2">{t('writeEmail')}</h3>
          <div className="flex gap-4">
            <a 
              href="mailto: ivaprolv@outlook.com" 
              className="px-4 py-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700"
            >
              ivaprolv@outlook.com
            </a>
          </div>
        </div>

        <p className="text-gray-400 text-sm">
          {t('workHours')}
        </p>
      </div>
    </Modal>
  );
}

/**
 * Footer contact form modal
 */
export function FooterContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations('footer');
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={t('contact.title')}
      maxWidth="max-w-md"
    >
      <form className="mt-4">
        <div className="grid grid-cols-1 gap-4">
          <input 
            type="text" 
            placeholder={t('contact.name')} 
            className="w-full px-4 py-2 border border-gray-700 bg-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-red-600" 
          />
          <input 
            type="email" 
            placeholder={t('contact.email')} 
            className="w-full px-4 py-2 border border-gray-700 bg-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-red-600" 
          />
          <textarea 
            placeholder={t('contact.message')} 
            className="w-full px-4 py-2 border border-gray-700 bg-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-red-600" 
            rows={4}
          />
          <button 
            type="submit" 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('contact.send')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Confirm dialog modal
 */
export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText,
  cancelText
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}) {
  const t = useTranslations('common');
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        <p className="text-gray-300">
          {message}
        </p>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            {cancelText || t('cancel')}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A]"
          >
            {confirmText || t('confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// app/components/ui/Button.tsx - Unified button components
import React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-[#E63946] text-white hover:bg-[#FF4D5A]',
        secondary: 'bg-gray-700 text-white hover:bg-gray-600',
        destructive: 'bg-red-700 text-white hover:bg-red-600',
        ghost: 'bg-transparent text-white hover:bg-white/10',
        outline: 'border border-gray-700 text-white hover:bg-white/10',
      },
      size: {
        sm: 'h-9 px-3 py-1 text-xs',
        md: 'h-10 py-2 px-4',
        lg: 'h-12 px-6 py-3 text-lg',
        icon: 'h-10 w-10 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  href?: string;
  external?: boolean;
}

/**
 * Button component that can render as a button, link, or other element
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    asChild = false, 
    isLoading = false, 
    href, 
    external = false,
    children, 
    ...props 
  }, ref) => {
    const Comp = asChild ? React.Fragment : 'button';
    const buttonClasses = buttonVariants({ variant, size, fullWidth, className });
    
    if (href) {
      if (external) {
        return (
          <a 
            href={href} 
            className={buttonClasses}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {isLoading ? (
              <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {children}
          </a>
        );
      }
      
      return (