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
  const [codeTimeLeft, setCodeTimeLeft] = useState(900); // 15 minūtes koda derības termiņam
  const [resendTimeLeft, setResendTimeLeft] = useState(30); // 30 sekundes pirms atkārtotas nosūtīšanas iespējas
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Taimeris koda derības termiņam (skaitīšana uz leju no 15 minūtēm)
    if (codeTimeLeft > 0) {
      const codeTimer = setTimeout(
        () => setCodeTimeLeft(codeTimeLeft - 1),
        1000
      );
      return () => clearTimeout(codeTimer);
    }
  }, [codeTimeLeft]);

  useEffect(() => {
    // Taimeris atkārtotas nosūtīšanas pogai (skaitīšana uz leju no 30 sekundēm)
    if (resendTimeLeft > 0) {
      const resendTimer = setTimeout(
        () => setResendTimeLeft(resendTimeLeft - 1),
        1000
      );
      return () => clearTimeout(resendTimer);
    }
  }, [resendTimeLeft]);

  // Atiestatīt atkārtotas nosūtīšanas taimeri, kad tiek izsaukta onResendCode funkcija
  const handleResendCode = () => {
    setResendTimeLeft(30); // Atiestatīt uz 30 sekundēm
    onResendCode();
  };

  const handleInputChange = (index: number, value: string) => {
    // Atļaut tikai ciparus un ne vairāk kā 1 rakstzīmi
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Pāriet uz nākamo ievades lauku, ja ir ievadīts cipars
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Pārbaudīt, vai viss kods ir ievadīts
      if (
        newCode.every(digit => digit !== '') &&
        newCode.join('').length === 6
      ) {
        onCodeComplete(newCode.join(''));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace taustiņš - pāriet uz iepriekšējo lauku
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    // Iegūt tikai ciparus no ielīmētā teksta
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      onCodeComplete(pastedData);
    }
  };

  const formatTime = (seconds: number) => {
    // Formatēt laiku MM:SS formātā
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskContact = (contact: string, type: 'email' | 'phone') => {
    // Maskēt kontakta informāciju drošības nolūkos
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
      {/* Virsraksts un apraksts */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('subtitle', { contact: maskContact(contact, type) })}
        </p>
      </div>

      {/* Koda ievades lauki */}
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

      {/* Kļūdas ziņojums */}
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Informācija par koda derības laiku un atkārtotas nosūtīšanas poga */}
      <div className="text-center space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Code expires in:{' '}
          <span className="font-medium text-red-500">
            {formatTime(codeTimeLeft)}
          </span>
        </p>
        <Button
          type="button"
          variant="ghost"
          onClick={handleResendCode}
          disabled={isLoading || resendTimeLeft > 0}
          className="text-blue-600 hover:text-blue-700"
        >
          {resendTimeLeft > 0
            ? t('resendIn', { seconds: resendTimeLeft })
            : t('resendCode')}
        </Button>
      </div>
    </div>
  );
}
