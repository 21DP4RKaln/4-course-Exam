'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface VerificationCodeInputProps {
  onCodeComplete: (code: string) => void;
  onResendCode: () => void;
  isLoading?: boolean;
  error?: string;
  contact: string;
  type: 'email' | 'phone';
}

export default function VerificationCodeInput({
  onCodeComplete,
  onResendCode,
  isLoading = false,
  error,
  contact,
  type,
}: VerificationCodeInputProps) {
  const t = useTranslations('auth.resetPassword.step2');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(900);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      if (
        newCode.every(digit => digit !== '') &&
        newCode.join('').length === 6
      ) {
        onCodeComplete(newCode.join(''));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      onCodeComplete(pastedData);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskContact = (contact: string, type: 'email' | 'phone') => {
    if (type === 'email') {
      const [localPart, domain] = contact.split('@');
      const maskedLocal =
        localPart.charAt(0) +
        '*'.repeat(localPart.length - 2) +
        localPart.charAt(localPart.length - 1);
      return `${maskedLocal}@${domain}`;
    } else {
      const masked = contact.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2');
      return masked;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {' '}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('subtitle', { contact: maskContact(contact, type) })}
        </p>
      </div>
      <div className="flex justify-center space-x-3">
        {code.map((digit, index) => (
          <Input
            key={index}
            ref={el => {
              if (el) {
                inputRefs.current[index] = el;
              }
            }}
            type="text"
            value={digit}
            onChange={e => handleInputChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="w-12 h-12 text-center text-xl font-bold border-2 focus:border-blue-500"
            maxLength={1}
            disabled={isLoading}
          />
        ))}
      </div>
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {error}
        </div>
      )}
      <div className="text-center space-y-3">
        {' '}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Code expires in:{' '}
          <span className="font-medium text-red-500">
            {formatTime(timeLeft)}
          </span>
        </p>
        <Button
          type="button"
          variant="ghost"
          onClick={onResendCode}
          disabled={isLoading || timeLeft > 840}
          className="text-blue-600 hover:text-blue-700"
        >
          {timeLeft > 840
            ? t('resendIn', { seconds: 900 - timeLeft })
            : t('resendCode')}
        </Button>
      </div>
    </div>
  );
}
