'use client';

import React, { useState, useEffect } from 'react';

interface AddressInputProps {
  values: {
    street: string;
    city: string;
    postalCode: string;
    country: 'LV' | 'LT' | 'EE';
  };
  onChange: (values: AddressInputProps['values']) => void;
  errors?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

const POSTAL_CODE_PATTERNS = {
  LV: /^LV-\d{4}$/,
  LT: /^LT-\d{5}$/,
  EE: /^\d{5}$/
};

const POSTAL_CODE_FORMATS = {
  LV: 'LV-1234',
  LT: 'LT-12345',
  EE: '12345'
};

export default function AddressInput({ values, onChange, errors }: AddressInputProps) {
  const [formattedPostalCode, setFormattedPostalCode] = useState(values.postalCode);

  useEffect(() => {
    setFormattedPostalCode(values.postalCode);
  }, [values.postalCode]);

  const formatPostalCode = (code: string, country: 'LV' | 'LT' | 'EE') => {
    // Remove any non-digit characters
    const digits = code.replace(/\D/g, '');
    
    switch(country) {
      case 'LV':
        return digits ? `LV-${digits.slice(0, 4)}` : '';
      case 'LT':
        return digits ? `LT-${digits.slice(0, 5)}` : '';
      case 'EE':
        return digits.slice(0, 5);
      default:
        return code;
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPostalCode = formatPostalCode(e.target.value, values.country);
    setFormattedPostalCode(newPostalCode);
    onChange({
      ...values,
      postalCode: newPostalCode
    });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value as 'LV' | 'LT' | 'EE';
    const newPostalCode = formatPostalCode(values.postalCode, newCountry);
    setFormattedPostalCode(newPostalCode);
    onChange({
      ...values,
      country: newCountry,
      postalCode: newPostalCode
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="form-label">Street Address</label>
        <input
          type="text"
          value={values.street}
          onChange={(e) => onChange({ ...values, street: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors?.street ? 'border-red-500' : ''
          }`}
          placeholder="Enter street address"
        />
        {errors?.street && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.street}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">City</label>
          <input
            type="text"
            value={values.city}
            onChange={(e) => onChange({ ...values, city: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors?.city ? 'border-red-500' : ''
            }`}
            placeholder="Enter city"
          />
          {errors?.city && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="form-label">Postal Code</label>
          <input
            type="text"
            value={formattedPostalCode}
            onChange={handlePostalCodeChange}
            className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors?.postalCode ? 'border-red-500' : ''
            }`}
            placeholder={POSTAL_CODE_FORMATS[values.country]}
          />
          {errors?.postalCode && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.postalCode}</p>
          )}
        </div>
      </div>

      <div>
        <label className="form-label">Country</label>
        <select
          value={values.country}
          onChange={handleCountryChange}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="LV">Latvia</option>
          <option value="LT">Lithuania</option>
          <option value="EE">Estonia</option>
        </select>
        {errors?.country && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country}</p>
        )}
      </div>
    </div>
  );
}
