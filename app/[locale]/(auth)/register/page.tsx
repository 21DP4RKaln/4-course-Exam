'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function Register() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }

  interface Errors {
    [key: string]: string;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevFormData: FormData) => ({
      ...prevFormData,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors((prevErrors: Errors) => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
      const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('name_required');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('email_invalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('password_required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('password_length');
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwords_not_match');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  interface RegisterResponse {
    message?: string;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });
      
      const data: RegisterResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || t('registration_failed'));
      }
      
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }, 100);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError(t('registration_failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Pārējais kods paliek nemainīgs */}
    </div>
  );
}