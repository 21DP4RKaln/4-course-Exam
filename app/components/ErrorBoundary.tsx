'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorMessage } from './ui/Messages';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Kļūdu robežas komponents, kas ķer kļūdas komponenta kokā
 * un parāda rezerves saskarni kļūdas gadījumā.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorMessage 
          message={this.state.error?.message || 'Kaut kas nogāja greizi'} 
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Apvienots kļūdu apstrādes komponents, ko var izmantot dažādās vietās
 */
export function ErrorHandler({ 
  children, 
  error, 
  resetError 
}: { 
  children: ReactNode; 
  error?: Error | null;
  resetError?: () => void;
}) {
  if (error) {
    return (
      <ErrorMessage 
        message={error.message || 'Kaut kas nogāja greizi'} 
        onRetry={resetError}
      />
    );
  }
  
  return <>{children}</>;
}

/**
 * Vienots 404 kļūdas apstrādātājs
 */
export function NotFoundHandler() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A1A1A]">
      <div className="max-w-md w-full p-8 bg-[#1E1E1E] rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-400 mb-6">Lapa nav atrasta</p>
        <a 
          href="/"
          className="inline-block px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
        >
          Atpakaļ
        </a>
      </div>
    </div>
  );
}

/**
 * Vispārīgā kļūdas lapa
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="lv">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-[#1A1A1A]">
          <div className="max-w-md w-full p-8 bg-[#1E1E1E] rounded-lg shadow-lg text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Kļūda</h1>
            <p className="text-gray-400 mb-6">{error?.message || 'Kaut kas nogāja greizi'}</p>
            <button
              onClick={reset}
              className="inline-block px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
            >
              Mēģināt vēlreiz
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}