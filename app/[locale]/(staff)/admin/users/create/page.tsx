'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PhoneInput from '@/app/components/ui/PhoneInput';
import { analyzePasswordStrength } from '@/lib/passwordStrength';

const userSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(password => {
        const analysis = analyzePasswordStrength(password);
        return analysis.isValid;
      }, 'Password must have at least 3 of the following: lowercase letter, uppercase letter, number, or special character'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    role: z.enum(['USER', 'SPECIALIST', 'ADMIN']),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type UserFormData = z.infer<typeof userSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  const [loading, setLoading] = useState(false);
  const [passwordAnalysis, setPasswordAnalysis] = useState(
    analyzePasswordStrength('')
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  // Atjauno paroles stipruma analīzi, kad mainās parole
  const password = watch('password');
  useEffect(() => {
    setPasswordAnalysis(analyzePasswordStrength(password || ''));
  }, [password]);

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role,
        }),
      });

      if (response.ok) {
        router.push(`/${locale}/admin/users`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Create User
        </h1>
      </div>

      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                {...register('firstName')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                {...register('lastName')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Phone (optional)
              </label>
              <PhoneInput
                value={watch('phone') || ''}
                onChange={value => setValue('phone', value)}
                error={errors.phone?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}

              {watch('password') && (
                <div className="mt-2 space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Password Strength
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          passwordAnalysis.score <= 2
                            ? 'text-red-500'
                            : passwordAnalysis.score <= 3
                              ? 'text-yellow-500'
                              : passwordAnalysis.score <= 4
                                ? 'text-blue-500'
                                : 'text-green-500'
                        }`}
                      >
                        {passwordAnalysis.score <= 2
                          ? 'Weak'
                          : passwordAnalysis.score <= 3
                            ? 'Fair'
                            : passwordAnalysis.score <= 4
                              ? 'Good'
                              : 'Strong'}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(level => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordAnalysis.score
                              ? passwordAnalysis.score <= 2
                                ? 'bg-red-500'
                                : passwordAnalysis.score <= 3
                                  ? 'bg-yellow-500'
                                  : passwordAnalysis.score <= 4
                                    ? 'bg-blue-500'
                                    : 'bg-green-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Requirements:
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      <div
                        className={`flex items-center space-x-1 text-xs ${
                          passwordAnalysis.requirements.minLength
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            passwordAnalysis.requirements.minLength
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                        <span>8+ characters</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 text-xs ${
                          passwordAnalysis.requirements.hasLowercase
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            passwordAnalysis.requirements.hasLowercase
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                        <span>Lowercase letter</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 text-xs ${
                          passwordAnalysis.requirements.hasUppercase
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            passwordAnalysis.requirements.hasUppercase
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                        <span>Uppercase letter</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 text-xs ${
                          passwordAnalysis.requirements.hasNumber
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            passwordAnalysis.requirements.hasNumber
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                        <span>Number</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 text-xs ${
                          passwordAnalysis.requirements.hasSpecialChar
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            passwordAnalysis.requirements.hasSpecialChar
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Role
              </label>
              <select
                {...register('role')}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              >
                <option value="USER">User</option>
                <option value="SPECIALIST">Specialist</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
