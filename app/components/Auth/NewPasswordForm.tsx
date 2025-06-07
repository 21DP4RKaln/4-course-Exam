'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import {
  analyzePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthTextColor,
} from '@/lib/passwordStrength';

interface NewPasswordFormProps {
  onSubmit: (password: string) => void;
  isLoading?: boolean;
  error?: string;
}

export default function NewPasswordForm({
  onSubmit,
  isLoading = false,
  error,
}: NewPasswordFormProps) {
  const t = useTranslations('auth.resetPassword.step3');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validatePassword = (pwd: string) => {
    const analysis = analyzePasswordStrength(pwd);
    if (!analysis.isValid) {
      return t('passwordRequirements');
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setValidationError(passwordValidation);
      return;
    }
    if (password !== confirmPassword) {
      setValidationError(t('passwordMismatch'));
      return;
    }

    setValidationError('');
    onSubmit(password);
  };
  const getStrengthText = (strength: number) => {
    if (strength <= 2) return t('passwordStrength.weak');
    if (strength <= 3) return t('passwordStrength.fair');
    if (strength <= 4) return t('passwordStrength.good');
    return t('passwordStrength.strong');
  };

  const passwordAnalysis = analyzePasswordStrength(password);
  const strength = passwordAnalysis.score;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {' '}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {' '}
        <div className="space-y-2">
          <Label htmlFor="password">{t('newPasswordLabel')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('newPasswordPlaceholder')}
              className="pr-10"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {password && (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Password Strength
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      strength <= 2
                        ? 'text-red-500'
                        : strength <= 3
                          ? 'text-yellow-500'
                          : strength <= 4
                            ? 'text-blue-500'
                            : 'text-green-500'
                    }`}
                  >
                    {getStrengthText(strength)}
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        level <= strength
                          ? strength <= 2
                            ? 'bg-red-500'
                            : strength <= 3
                              ? 'bg-yellow-500'
                              : strength <= 4
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>{' '}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder={t('confirmPasswordPlaceholder')}
              className="pr-10"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        {(validationError || error) && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {validationError || error}
          </div>
        )}{' '}
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('passwordRequirements')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`flex items-center space-x-2 text-xs ${
                passwordAnalysis.requirements.minLength
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  passwordAnalysis.requirements.minLength
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              <span>8+ characters</span>
            </div>
            <div
              className={`flex items-center space-x-2 text-xs ${
                passwordAnalysis.requirements.hasLowercase
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  passwordAnalysis.requirements.hasLowercase
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              <span>Lowercase letter</span>
            </div>
            <div
              className={`flex items-center space-x-2 text-xs ${
                passwordAnalysis.requirements.hasUppercase
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  passwordAnalysis.requirements.hasUppercase
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              <span>Uppercase letter</span>
            </div>
            <div
              className={`flex items-center space-x-2 text-xs ${
                passwordAnalysis.requirements.hasNumber
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  passwordAnalysis.requirements.hasNumber
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              <span>Number</span>
            </div>
            <div
              className={`flex items-center space-x-2 text-xs ${
                passwordAnalysis.requirements.hasSpecialChar
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  passwordAnalysis.requirements.hasSpecialChar
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              <span>Special character</span>
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !password || !confirmPassword || strength < 3}
        >
          {isLoading ? t('resetting') : t('resetPassword')}
        </Button>
      </form>
    </div>
  );
}
