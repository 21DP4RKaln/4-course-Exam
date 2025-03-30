'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toaster';
import LoadingIndicator from '../ui/LoadingIndicator';

// Address validation schema
interface AddressValidation {
  street: boolean;
  city: boolean;
  postalCode: boolean;
  country: boolean;
}

// Form data interface
interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  additionalInfo: string;
  paymentMethod: 'card' | 'bank_transfer' | 'cash_on_delivery';
  saveInfo: boolean;
}

export default function CheckoutForm() {
  const t = useTranslations('checkout');
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { addToast } = useToast();

  // Form state
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Latvia',
    additionalInfo: '',
    paymentMethod: 'cash_on_delivery',
    saveInfo: true
  });

  // Validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addressValid, setAddressValid] = useState<AddressValidation>({
    street: false,
    city: false,
    postalCode: false,
    country: true
  });

  // Checkout state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name || prev.firstName,
        lastName: user.surname || prev.lastName,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone
      }));
    }
  }, [user]);

  // Validate form on field change
  useEffect(() => {
    validateForm();
  }, [formData]);

  // Validate form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (touched.firstName && !formData.firstName) newErrors.firstName = t('errors.required');
    if (touched.lastName && !formData.lastName) newErrors.lastName = t('errors.required');
    
    // Email validation
    if (touched.email && !formData.email) {
      newErrors.email = t('errors.required');
    } else if (touched.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('errors.invalidEmail');
    }
    
    // Phone validation
    if (touched.phone && !formData.phone) {
      newErrors.phone = t('errors.required');
    } else if (touched.phone && !/^\+?[0-9]{8,15}$/.test(formData.phone)) {
      newErrors.phone = t('errors.invalidPhone');
    }
    
    // Address validation
    if (touched.street && !formData.street) newErrors.street = t('errors.required');
    if (touched.city && !formData.city) newErrors.city = t('errors.required');
    if (touched.postalCode && !formData.postalCode) newErrors.postalCode = t('errors.required');
    if (touched.country && !formData.country) newErrors.country = t('errors.required');
    
    // Update address validation state
    setAddressValid({
      street: !!formData.street,
      city: !!formData.city,
      postalCode: !!formData.postalCode,
      country: !!formData.country
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allFields = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(allFields);
    
    if (!validateForm()) {
      addToast(t('errors.formValidation'), 'error');
      return;
    }
    
    if (items.length === 0) {
      addToast(t('errors.emptyCart'), 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get order ID (would come from API in real implementation)
      const mockOrderId = `ORD-${Math.floor(Math.random() * 10000)}-${Date.now().toString().slice(-4)}`;
      
      setOrderId(mockOrderId);
      setOrderPlaced(true);
      clearCart();
      
      // Show success message
      addToast(t('orderSuccess'), 'success');
      
    } catch (error) {
      console.error('Checkout error:', error);
      addToast(t('errors.checkoutFailed'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      !!formData.firstName &&
      !!formData.lastName &&
      !!formData.email &&
      !!formData.phone &&
      addressValid.street &&
      addressValid.city &&
      addressValid.postalCode &&
      addressValid.country
    );
  };

  // If order is placed, show success message
  if (orderPlaced) {
    return (
      <div className="bg-[#2A2A2A] rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">{t('orderSuccess')}</h2>
        <p className="text-gray-400 mb-6">{t('orderSuccessMessage')}</p>
        <p className="text-gray-400 mb-6">
          {t('orderNumber')}: <span className="font-medium text-white">{orderId}</span>
        </p>
        <button
          onClick={() => router.push(`/${router.locale}/dashboard`)}
          className="inline-block px-6 py-3 bg-[#E63946] text-white rounded-lg hover:bg-[#FF4D5A] transition-colors"
        >
          {t('viewOrders')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Information */}
      <div className="bg-[#2A2A2A] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">{t('contactInfo')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-400 mb-1">
              {t('firstName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full rounded-md border ${errors.firstName ? 'border-red-500' : 'border-gray-700'} bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]`}
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-400 mb-1">
              {t('lastName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full rounded-md border ${errors.lastName ? 'border-red-500' : 'border-gray-700'} bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              {t('email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-700'} bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">
              {t('phone')} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+371 12345678"
              className={`w-full rounded-md border ${errors.phone ? 'border-red-500' : 'border-gray-700'} bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]`}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>
        </div>
      </div>
      
      {/* Shipping Address */}
      <div className="bg-[#2A2A2A] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">{t('shippingAddress')}</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-400 mb-1">
              {t('street')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className={`w-full rounded-md border ${errors.street ? 'border-red-500' : 'border-gray-700'} bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]`}
            />
            {errors.street && <p className="mt-1 text-sm text-red-500">{errors.street}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-400 mb-1">
                {t('city')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.city ? 'border-red-500' : 'border-gray-700'} bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]`}
              />
              {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
            </div>
            
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-400 mb-1">
                {t('postalCode')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.postalCode ? 'border-red-500' : 'border-gray-700'} bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]`}
              />
              {errors.postalCode && <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>}
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-400 mb-1">
                {t('country')} <span className="text-red-500">*</span>
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`w-full rounded-md border ${errors.country ? 'border-red-500' : 'border-gray-700'} bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]`}
              >
                <option value="Latvia">Latvia</option>
                <option value="Estonia">Estonia</option>
                <option value="Lithuania">Lithuania</option>
              </select>
              {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
            </div>
          </div>
          
          <div>
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-400 mb-1">
              {t('additionalInfo')}
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows={3}
              className={`w-full rounded-md border border-gray-700 bg-[#1E1E1E] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E63946]`}
              placeholder={t('additionalInfoPlaceholder')}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="saveInfo"
              name="saveInfo"
              checked={formData.saveInfo}
              onChange={handleChange}
              className="h-4 w-4 text-[#E63946] focus:ring-[#E63946] border-gray-700 rounded bg-[#1E1E1E]"
            />
            <label htmlFor="saveInfo" className="ml-2 text-sm text-gray-400">
              {t('saveInfo')}
            </label>
          </div>
        </div>
      </div>
      
      {/* Payment Methods */}
      <div className="bg-[#2A2A2A] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">{t('paymentMethod')}</h2>
        
        <div className="space-y-4">
          <div className="flex items-center p-4 border border-gray-700 rounded-lg">
            <input
              type="radio"
              id="cash_on_delivery"
              name="paymentMethod"
              value="cash_on_delivery"
              checked={formData.paymentMethod === 'cash_on_delivery'}
              onChange={handleChange}
              className="h-4 w-4 text-[#E63946] focus:ring-[#E63946] border-gray-700 bg-[#1E1E1E]"
            />
            <label htmlFor="cash_on_delivery" className="ml-3 flex flex-col">
              <span className="text-sm font-medium text-white">{t('cashOnDelivery')}</span>
              <span className="text-xs text-gray-400">{t('cashOnDeliveryDesc')}</span>
            </label>
          </div>
          
          <div className="flex items-center p-4 border border-gray-700 rounded-lg opacity-50 cursor-not-allowed">
            <input
              type="radio"
              id="bank_transfer"
              name="paymentMethod"
              value="bank_transfer"
              disabled
              className="h-4 w-4 text-[#E63946] focus:ring-[#E63946] border-gray-700 bg-[#1E1E1E]"
            />
            <label htmlFor="bank_transfer" className="ml-3 flex flex-col">
              <span className="text-sm font-medium text-white">{t('bankTransfer')}</span>
              <span className="text-xs text-gray-400">{t('comingSoon')}</span>
            </label>
          </div>
          
          <div className="flex items-center p-4 border border-gray-700 rounded-lg opacity-50 cursor-not-allowed">
            <input
              type="radio"
              id="card"
              name="paymentMethod"
              value="card"
              disabled
              className="h-4 w-4 text-[#E63946] focus:ring-[#E63946] border-gray-700 bg-[#1E1E1E]"
            />
            <label htmlFor="card" className="ml-3 flex flex-col">
              <span className="text-sm font-medium text-white">{t('creditCard')}</span>
              <span className="text-xs text-gray-400">{t('comingSoon')}</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="bg-[#2A2A2A] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">{t('orderSummary')}</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-400">{t('subtotal')}</span>
            <span className="text-white">€{totalPrice.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">{t('shipping')}</span>
            <span className="text-white">{t('free')}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">{t('tax')} (21%)</span>
            <span className="text-white">€{(totalPrice * 0.21).toFixed(2)}</span>
          </div>
          
          <div className="border-t border-gray-700 pt-4 mt-4">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">{t('total')}</span>
              <span className="text-[#E63946]">€{(totalPrice * 1.21).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid()}
          className="px-8 py-4 bg-[#E63946] text-white font-medium rounded-lg hover:bg-[#FF4D5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LoadingIndicator size="sm" variant="spinner" /> 
              {t('processing')}
            </>
          ) : (
            t('placeOrder')
          )}
        </button>
      </div>
    </form>
  );
}