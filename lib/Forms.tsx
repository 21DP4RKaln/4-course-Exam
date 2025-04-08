'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time' | 'url';


interface InputProps {
  id: string;
  name: string;
  type?: InputType;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface TextAreaProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

interface SelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

interface CheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

interface RadioProps {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  icon?: ReactNode;
}

interface FormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
}


export function Input({
  id,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  required = false,
  autoComplete,
  disabled = false,
  className = '',
  min,
  max,
  step
}: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`w-full rounded-md border ${
          error ? 'border-red-500' : 'border-gray-700'
        } bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946] ${className} ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function TextArea({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  required = false,
  disabled = false,
  className = '',
  rows = 3
}: TextAreaProps) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`w-full rounded-md border ${
          error ? 'border-red-500' : 'border-gray-700'
        } bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946] ${className} ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function Select({
  id,
  name,
  value,
  onChange,
  onBlur,
  label,
  error,
  required = false,
  disabled = false,
  className = '',
  options
}: SelectProps) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        className={`w-full rounded-md border ${
          error ? 'border-red-500' : 'border-gray-700'
        } bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946] ${className} ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function Checkbox({
  id,
  name,
  checked,
  onChange,
  label,
  error,
  disabled = false,
  className = ''
}: CheckboxProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`h-4 w-4 text-[#E63946] focus:ring-[#E63946] border-gray-700 rounded bg-[#1E1E1E] ${className} ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        />
        {label && (
          <label htmlFor={id} className="ml-2 text-sm text-gray-300">
            {label}
          </label>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function Radio({
  id,
  name,
  value,
  checked,
  onChange,
  label,
  error,
  disabled = false,
  className = ''
}: RadioProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center">
        <input
          id={id}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`h-4 w-4 text-[#E63946] focus:ring-[#E63946] border-gray-700 bg-[#1E1E1E] ${className} ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        />
        {label && (
          <label htmlFor={id} className="ml-2 text-sm text-gray-300">
            {label}
          </label>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function Button({
  type = 'button',
  onClick,
  children,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  icon
}: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#E63946] hover:bg-[#FF4D5A] text-white';
      case 'secondary':
        return 'bg-gray-700 hover:bg-gray-600 text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'outline':
        return 'bg-transparent border border-gray-700 hover:bg-gray-800 text-white';
      default:
        return 'bg-[#E63946] hover:bg-[#FF4D5A] text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm';
      case 'md':
        return 'px-4 py-2';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${getVariantClasses()} 
        ${getSizeClasses()} 
        ${fullWidth ? 'w-full' : ''} 
        rounded-md font-medium transition-colors duration-200 
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
        flex items-center justify-center
      `}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

export function Form({ onSubmit, children, className = '' }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
    </form>
  );
}

export function FormGroup({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mb-6 ${className}`}>{children}</div>;
}

export function FormRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>{children}</div>;
}

export function FormLabel({ htmlFor, children, required = false }: { htmlFor: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-1">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export function FormError({ message }: { message: string }) {
  return <p className="mt-1 text-sm text-red-400">{message}</p>;
}

export function FormSection({ title, description, children, className = '' }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`mb-8 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-gray-400 mb-4 text-sm">{description}</p>}
      <div className="bg-[#1E1E1E] rounded-lg p-6">{children}</div>
    </div>
  );
}

export function useFormValidation(initialValues: Record<string, any>, validationRules: Record<string, any>) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const t = useTranslations();

  const validate = (name: string, value: any) => {
    const rules = validationRules[name];
    if (!rules) return '';

    if (rules.required && !value) {
      return t('validation.required') || 'This field is required';
    }

    if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
      return t('validation.email') || 'Invalid email address';
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      return (t('validation.minLength') || 'Minimum length is {length} characters').replace('{length}', rules.minLength);
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return (t('validation.maxLength') || 'Maximum length is {length} characters').replace('{length}', rules.maxLength);
    }

    if (rules.min && value && Number(value) < rules.min) {
      return (t('validation.min') || 'Minimum value is {min}').replace('{min}', rules.min);
    }

    if (rules.max && value && Number(value) > rules.max) {
      return (t('validation.max') || 'Maximum value is {max}').replace('{max}', rules.max);
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.message || t('validation.pattern') || 'Invalid format';
    }

    if (rules.matches && value && values[rules.matches] !== value) {
      return rules.message || t('validation.matches') || 'Values do not match';
    }

    if (rules.custom && !rules.custom(value, values)) {
      return rules.message || t('validation.invalid') || 'Invalid value';
    }

    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setValues({
      ...values,
      [name]: newValue
    });

    if (touched[name]) {
      const error = validate(name, newValue);
      setErrors({
        ...errors,
        [name]: error
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setTouched({
      ...touched,
      [name]: true
    });

    const error = validate(name, fieldValue);
    setErrors({
      ...errors,
      [name]: error
    });
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    Object.keys(validationRules).forEach(name => {
      newTouched[name] = true;
      newErrors[name] = validate(name, values[name]);
    });

    setTouched(newTouched);
    setErrors(newErrors);

    return Object.values(newErrors).every(error => !error);
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    setValues
  };
}