'use client';

import React, { useState, useEffect } from 'react';
import { parsePhoneNumber, isValidPhoneNumber, AsYouType } from 'libphonenumber-js';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  error?: string;
  placeholder?: string;
  defaultCountry?: 'LV' | 'LT' | 'EE';
}

export default function PhoneInput({
  value,
  onChange,
  required = false,
  className = '',
  error,
  placeholder = '',
  defaultCountry = 'LV'
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [isValid, setIsValid] = useState(true);

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const formatter = new AsYouType(selectedCountry);
    const formattedNumber = formatter.input(newValue);
    onChange(formattedNumber);

    // Validate phone number
    if (newValue) {
      try {
        const isValid = isValidPhoneNumber(newValue, selectedCountry);
        setIsValid(isValid);
      } catch {
        setIsValid(false);
      }
    } else {
      setIsValid(true); // Empty is considered valid unless required
    }
  };

  // Update validation when country changes
  useEffect(() => {
    if (value) {
      try {
        const isValid = isValidPhoneNumber(value, selectedCountry);
        setIsValid(isValid);
      } catch {
        setIsValid(false);
      }
    }
  }, [selectedCountry, value]);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value as 'LV' | 'LT' | 'EE')}
          className="px-2 py-2.5 border rounded-lg dark:bg-neutral-950 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 focus:border-transparent"
        >
          <option value="LV">+371 (LV)</option>
          <option value="LT">+370 (LT)</option>
          <option value="EE">+372 (EE)</option>
        </select>
        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          className={`flex-1 px-3 py-2.5 border rounded-lg dark:bg-neutral-950 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 focus:border-transparent ${
            !isValid && value ? 'border-red-500' : ''
          } ${className}`}
          placeholder={placeholder || 'Phone number'}
          required={required}
        />
      </div>
      {!isValid && value && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Please enter a valid phone number for {selectedCountry}
        </p>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
