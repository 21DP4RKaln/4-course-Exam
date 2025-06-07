'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Mail, Check, AlertCircle, ArrowLeft, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '@/app/components/ui/animated-button';
import VerificationCodeInput from '@/app/components/Auth/VerificationCodeInput';
import NewPasswordForm from '@/app/components/Auth/NewPasswordForm';

const createSchema = (inputType: 'email' | 'phone') => {
  if (inputType === 'email') {
    return z.object({
      contact: z.string().email('Invalid email address'),
    });
  } else {
    return z.object({
      contact: z
        .string()
        .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number')
        .min(8, 'Phone number must be at least 8 digits'),
    });
  }
};

type ForgotPasswordFormData = {
  contact: string;
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      type: 'spring',
      stiffness: 100,
    },
  },
};

const toggleVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

export default function ForgotPasswordPage() {
  const t = useTranslations('resetPassword');
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [step, setStep] = useState<
    'contact' | 'verify' | 'password' | 'success'
  >('contact');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputType, setInputType] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const schema = createSchema(inputType);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(schema),
  });

  const currentValue = watch('contact') || '';

  const toggleInputType = () => {
    setInputType(prev => (prev === 'email' ? 'phone' : 'email'));
    setValue('contact', '');
    setError('');
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: data.contact,
          type: inputType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send verification code');
      }

      setContact(data.contact);
      setResetToken(result.token);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeVerification = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact,
          code,
          type: inputType,
          token: resetToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Invalid verification code');
      }

      setVerificationCode(code);
      setStep('password');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid verification code'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (newPassword: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact,
          code: verificationCode,
          type: inputType,
          token: resetToken,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact,
          type: inputType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend verification code');
      }

      setResetToken(result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="bg-white dark:bg-stone-950 shadow-xl rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800"
          variants={successVariants}
        >
          <div className="text-center">
            <motion.div
              className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
            >
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <motion.h1
              className="text-2xl font-bold text-neutral-900 dark:text-white mb-3"
              variants={itemVariants}
            >
              {t('step4.title')}
            </motion.h1>

            <motion.p
              className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed"
              variants={itemVariants}
            >
              {t('step4.message')}
            </motion.p>

            <motion.div variants={itemVariants}>
              <motion.div
                whileHover={{ x: -5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <AnimatedButton
                  href={`/${locale}/auth/login`}
                  title={t('step4.backToLogin')}
                  direction="left"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 dark:from-red-600 dark:to-red-700 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (step === 'verify') {
    return (
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Back Button */}
        <motion.div className="mb-8" variants={itemVariants}>
          <motion.button
            onClick={() => setStep('contact')}
            className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            whileHover={{ x: -5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </motion.button>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-stone-950 shadow-xl rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800"
          variants={itemVariants}
        >
          <VerificationCodeInput
            onCodeComplete={handleCodeVerification}
            onResendCode={handleResendCode}
            isLoading={isLoading}
            error={error}
            contact={contact}
            type={inputType}
          />
        </motion.div>
      </motion.div>
    );
  }

  if (step === 'password') {
    return (
      <motion.div
        className="max-w-md mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Back Button */}
        <motion.div className="mb-8" variants={itemVariants}>
          <motion.button
            onClick={() => setStep('verify')}
            className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            whileHover={{ x: -5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </motion.button>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-stone-950 shadow-xl rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800"
          variants={itemVariants}
        >
          <NewPasswordForm
            onSubmit={handlePasswordReset}
            isLoading={isLoading}
            error={error}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-md mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Back to Login Button */}
      <motion.div className="mb-8" variants={itemVariants}>
        <motion.div
          whileHover={{ x: -5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <AnimatedButton
            href={`/${locale}/auth/login`}
            title={t('step4.backToLogin')}
            direction="left"
            className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          />
        </motion.div>
      </motion.div>

      {/* Main Form Card */}
      <motion.div
        className="bg-white dark:bg-stone-950 shadow-xl rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800"
        variants={itemVariants}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div
            className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-red-900/30 dark:to-red-800/30 mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
            key={inputType}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={inputType}
                initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {inputType === 'email' ? (
                  <Mail className="h-8 w-8 text-blue-600 dark:text-red-400" />
                ) : (
                  <Phone className="h-8 w-8 text-blue-600 dark:text-red-400" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
            {t('step1.title')}
          </h1>

          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {t('step1.subtitle')}
          </p>
        </motion.div>

        {/* Input Type Toggle */}
        <motion.div
          className="flex justify-center mb-6"
          variants={itemVariants}
        >
          <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg flex">
            <motion.button
              type="button"
              onClick={toggleInputType}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                inputType === 'email'
                  ? 'bg-white dark:bg-stone-950 text-blue-600 dark:text-red-400 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('useEmail')}
            </motion.button>
            <motion.button
              type="button"
              onClick={toggleInputType}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                inputType === 'phone'
                  ? 'bg-white dark:bg-stone-950 text-blue-600 dark:text-red-400 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('usePhone')}
            </motion.button>
          </div>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle
                className="text-red-500 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5"
                size={18}
              />
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.form onSubmit={handleSubmit(onSubmit)} variants={itemVariants}>
          <div className="space-y-6">
            {/* Dynamic Input Field */}
            <AnimatePresence mode="wait">
              <motion.div
                key={inputType}
                variants={toggleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  {inputType === 'email' ? t('emailLabel') : t('phoneLabel')}
                </label>

                <div className="relative">
                  <motion.input
                    type={inputType === 'email' ? 'email' : 'tel'}
                    id="contact"
                    {...register('contact')}
                    className={`block w-full px-4 py-3 pl-12 border ${
                      errors.contact
                        ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
                        : 'border-neutral-300 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-red-500 focus:ring-blue-500 dark:focus:ring-red-500'
                    } rounded-xl shadow-sm placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 bg-white dark:bg-stone-950 text-neutral-900 dark:text-white transition-all`}
                    placeholder={
                      inputType === 'email'
                        ? t('emailPlaceholder')
                        : t('phonePlaceholder')
                    }
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  />

                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={inputType}
                        initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {inputType === 'email' ? (
                          <Mail
                            className={`h-5 w-5 ${
                              errors.contact
                                ? 'text-red-400'
                                : 'text-neutral-400 dark:text-neutral-500'
                            }`}
                          />
                        ) : (
                          <Phone
                            className={`h-5 w-5 ${
                              errors.contact
                                ? 'text-red-400'
                                : 'text-neutral-400 dark:text-neutral-500'
                            }`}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <AnimatePresence>
                  {errors.contact && (
                    <motion.p
                      className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contact.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 dark:from-red-600 dark:to-red-700 hover:from-blue-700 hover:to-blue-800 dark:hover:from-red-700 dark:hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                isLoading ? 'cursor-wait' : ''
              }`}
              variants={itemVariants}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    className="flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />{' '}
                    {t('step1.sending')}
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {t('step1.sendCode')}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
