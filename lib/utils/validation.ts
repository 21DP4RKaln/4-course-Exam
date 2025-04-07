import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Validācijas prasības objekta tipu definīcija
 */
type ValidationRules<T> = {
  [K in keyof T]?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    isEmail?: boolean;
    isPhone?: boolean;
    isNumber?: boolean;
    min?: number;
    max?: number;
    custom?: (value: any, formValues: T) => boolean;
    message?: string | ((value: any, formValues: T) => string);
  };
};

/**
 * Validācijas kļūdu tipu definīcija
 */
type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Validācijas rezultātu tipu definīcija
 */
interface ValidationResult<T> {
  errors: ValidationErrors<T>;
  isValid: boolean;
}

/**
 * Validēt formas vērtības, izmantojot definētās prasības
 */
export function validateForm<T extends Record<string, any>>(
  values: T,
  rules: ValidationRules<T>,
  translations?: any
): ValidationResult<T> {
  const errors: ValidationErrors<T> = {};

  for (const key in rules) {
    if (rules.hasOwnProperty(key)) {
      const rule = rules[key]!;
      const value = values[key];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[key] = rule.message as string || translations?.required || 'This field is required';
        continue;
      }

      if (value === undefined || value === null || value === '') {
        continue;
      }

      if (rule.minLength !== undefined && typeof value === 'string' && value.length < rule.minLength) {
        errors[key] = rule.message as string || translations?.minLength
          ?.replace('{min}', rule.minLength.toString()) 
          || `Minimum length is ${rule.minLength} characters`;
        continue;
      }

      if (rule.maxLength !== undefined && typeof value === 'string' && value.length > rule.maxLength) {
        errors[key] = rule.message as string || translations?.maxLength
          ?.replace('{max}', rule.maxLength.toString()) 
          || `Maximum length is ${rule.maxLength} characters`;
        continue;
      }

      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors[key] = rule.message as string || translations?.pattern 
          || 'Invalid format';
        continue;
      }

      if (rule.isEmail && typeof value === 'string' && !/\S+@\S+\.\S+/.test(value)) {
        errors[key] = rule.message as string || translations?.email 
          || 'Invalid email address';
        continue;
      }

      if (rule.isPhone && typeof value === 'string' && !/^\+?[0-9]{8,15}$/.test(value)) {
        errors[key] = rule.message as string || translations?.phone 
          || 'Invalid phone number';
        continue;
      }

      if (rule.isNumber && isNaN(Number(value))) {
        errors[key] = rule.message as string || translations?.number 
          || 'Must be a number';
        continue;
      }

      if (rule.min !== undefined && Number(value) < rule.min) {
        errors[key] = rule.message as string || translations?.min
          ?.replace('{min}', rule.min.toString()) 
          || `Minimum value is ${rule.min}`;
        continue;
      }

      if (rule.max !== undefined && Number(value) > rule.max) {
        errors[key] = rule.message as string || translations?.max
          ?.replace('{max}', rule.max.toString()) 
          || `Maximum value is ${rule.max}`;
        continue;
      }

      if (rule.custom && !rule.custom(value, values)) {
        const message = typeof rule.message === 'function' 
          ? rule.message(value, values) 
          : rule.message;
        
        errors[key] = message || translations?.custom 
          || 'Invalid value';
        continue;
      }
    }
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}

/**
 * Formu validācijas hook pirmās izmantošanas vajadzībām
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>,
  onSubmit: (values: T) => void | Promise<void>
) {
  const t = useTranslations('validation');
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (errors[name as keyof T]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const fieldRule = { [name]: validationRules[name as keyof T] };
    const result = validateForm({ [name]: values[name as keyof T] } as T, fieldRule as ValidationRules<T>, t);
    
    if (result.errors[name as keyof T]) {
      setErrors(prev => ({
        ...prev,
        [name]: result.errors[name as keyof T]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    
    setTouched(allTouched);

    const result = validateForm(values, validationRules, t);
    setErrors(result.errors);
    
    if (result.isValid) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  };
  
  return {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    errors,
    touched,
    isSubmitting,
    resetForm,
    setValues
  };
}

/**
 * Validācijas izanalizē formu datus un prasības
 */
export class FormValidator<T extends Record<string, any>> {
  private rules: ValidationRules<T>;
  private translations: any;
  
  constructor(rules: ValidationRules<T>, translations?: any) {
    this.rules = rules;
    this.translations = translations;
  }
  
  /**
   * Validē visu formu
   */
  validateAll(values: T): ValidationResult<T> {
    return validateForm(values, this.rules, this.translations);
  }
  
  /**
   * Validē tikai vienu lauku
   */
  validateField(values: T, fieldName: keyof T): string | undefined {
    const fieldRule = { [fieldName]: this.rules[fieldName] };
    const result = validateForm(values, fieldRule as ValidationRules<T>, this.translations);
    return result.errors[fieldName];
  }
  
  /**
   * Pieteikt kļūdas ziņojumu konkrētam laukam
   */
  getErrorMessage(fieldName: keyof T, values: T): string | undefined {
    const rule = this.rules[fieldName];
    if (!rule) return undefined;
    
    const value = values[fieldName];

    if (rule.required && (value === undefined || value === null || value === '')) {
      return this.translations?.required || 'This field is required';
    }

    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    
    return undefined;
  }
}