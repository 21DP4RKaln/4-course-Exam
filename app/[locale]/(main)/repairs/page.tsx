'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  Wrench,
  HardDrive,
  Cpu,
  Monitor,
  Calendar,
  Clock,
  Zap,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Shield,
  AlertTriangle,
  Upload,
  Phone,
  Mail,
  User,
  MessageCircle,
  X,
  Package,
  Code,
  ScrollText,
  BarChart,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import AnimatedButton from '@/app/components/ui/animated-button';
import PhoneInput from '@/app/components/ui/PhoneInput';

const repairServices = [
  {
    id: 'diagnostics',
    icon: <Wrench size={24} />,
    price: 10,
    timeEstimate: '1-3 days',
  },
  {
    id: 'hardware-replacement',
    icon: <Cpu size={24} />,
    price: 20,
    timeEstimate: '1-2 weeks',
    hasNote: true,
  },
  {
    id: 'data-recovery',
    icon: <HardDrive size={24} />,
    price: 30,
    timeEstimate: '3-7 days',
  },
  {
    id: 'virus-removal',
    icon: <Shield size={24} />,
    price: 20,
    timeEstimate: '1-3 days',
  },
  {
    id: 'performance-optimization',
    icon: <Zap size={24} />,
    timeEstimate: '1-3 days',
  },
  {
    id: 'custom',
    icon: <Code size={24} />,
    price: 35,
    timeEstimate: '1-7 days',
  },
];

export default function RepairsPage() {
  const t = useTranslations('repairs');
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const locale = pathname.split('/')[1];

  const [currentStep, setCurrentStep] = useState(1);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedService, setSelectedService] = useState('');
  const [issue, setIssue] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const selectedServiceDetails = repairServices.find(
    s => s.id === selectedService
  );
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prevImages => [...prevImages, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setTimeout(scrollToForm, 100);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setTimeout(scrollToForm, 100);
    }
  };

  const canProceedFromStep = (step: number) => {
    switch (step) {
      case 1:
        if (!user) {
          return firstName && lastName && email && phone;
        }
        return true;
      case 2:
        return selectedService !== '';
      case 3:
        return issue.trim() !== '';
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !issue || !email || (!phone && !user)) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('serviceId', selectedService);
      formData.append('issue', issue);
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      setShowSuccess(true);

      if (!user) {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
      }
      setSelectedService('');
      setIssue('');
      setImages([]);
      setCurrentStep(1);

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting repair request:', error);
      alert('Failed to submit repair request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 to-red-600 dark:from-red-600 dark:to-blue-600 rounded-lg p-8 mb-12 text-white">
        <h1 className="text-3xl font-bold mb-4">{t('pageTitle')}</h1>
        <p className="text-lg opacity-90 max-w-2xl">{t('pageSubtitle')}</p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step-by-step Form */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div
            ref={formRef}
            className="bg-white dark:bg-stone-950 rounded-lg shadow-md overflow-hidden"
          >
            {/* Progress indicator */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-400 dark:from-red-700 dark:to-red-900 p-6 text-white">
              <h2 className="text-2xl font-semibold mb-4">
                {t('requestTitle')}
              </h2>

              {/* Step indicators */}
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map(step => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                        step <= currentStep
                          ? 'bg-white text-blue-600 dark:text-red-600'
                          : 'bg-white/30 text-white'
                      }`}
                    >
                      {step < currentStep ? <CheckCircle size={20} /> : step}
                    </div>
                    {step < 5 && (
                      <div
                        className={`w-8 h-0.5 mx-2 transition-all duration-300 ${
                          step < currentStep ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step labels */}
              <div className="flex justify-between mt-3 text-sm">
                <span
                  className={currentStep === 1 ? 'font-semibold' : 'opacity-70'}
                >
                  {t('step1')}
                </span>
                <span
                  className={currentStep === 2 ? 'font-semibold' : 'opacity-70'}
                >
                  {t('step2')}
                </span>
                <span
                  className={currentStep === 3 ? 'font-semibold' : 'opacity-70'}
                >
                  {t('step3')}
                </span>
                <span
                  className={currentStep === 4 ? 'font-semibold' : 'opacity-70'}
                >
                  {t('step4')}
                </span>
                <span
                  className={currentStep === 5 ? 'font-semibold' : 'opacity-70'}
                >
                  {t('step5')}
                </span>
              </div>
            </div>

            {showSuccess && (
              <div className="p-6 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 flex items-start animate-in slide-in-from-top duration-500">
                <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{t('successTitle')}</p>
                  <p className="text-sm mt-1">{t('successMessage')}</p>
                </div>
              </div>
            )}

            {/* Form content */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                    {t('step1')}
                  </h3>

                  {!user && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                        >
                          {t('firstName')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-neutral-400" />
                          </div>
                          <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            required
                            className="block w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                        >
                          {t('lastName')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-neutral-400" />
                          </div>
                          <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            required
                            className="block w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                        >
                          {t('email')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-neutral-400" />
                          </div>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="block w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                        >
                          {t('phoneRequired')}
                        </label>
                        <div className="relative">
                          <PhoneInput
                            value={phone}
                            onChange={setPhone}
                            required
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {user && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-blue-800 dark:text-blue-300 text-sm">
                        Logged in as:{' '}
                        <span className="font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Select Service */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                    {t('step2')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repairServices.map(service => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${
                          selectedService === service.id
                            ? 'border-blue-500 dark:border-red-500 bg-blue-50 dark:bg-red-900/20 shadow-md'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-red-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-blue-600 dark:text-red-400">
                            {service.icon}
                          </div>
                          {service.price && (
                            <span className="font-semibold text-neutral-900 dark:text-white">
                              From €{service.price}
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-neutral-900 dark:text-white mb-1">
                          {t(`services.${service.id}.name`)}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          {t(`services.${service.id}.description`)}
                        </p>
                        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                          <Clock size={14} className="mr-1" />
                          {service.timeEstimate}
                        </div>
                        {service.hasNote && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            {t(`services.${service.id}.note`)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Describe Issue */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                    {t('step3')}
                  </h3>

                  <div>
                    <label
                      htmlFor="issue"
                      className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                      {t('describeIssue')}
                    </label>
                    <textarea
                      id="issue"
                      value={issue}
                      onChange={e => setIssue(e.target.value)}
                      required
                      rows={6}
                      className="block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 transition-all duration-200"
                      placeholder={t('issueDescription')}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Upload Image */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                    {t('step4')}
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      {t('attachImage')}
                    </label>

                    {/* Display uploaded images */}
                    {images.length > 0 && (
                      <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((img, index) => (
                          <div
                            key={index}
                            className="relative bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-center mb-2">
                              <ImageIcon
                                size={32}
                                className="text-neutral-400"
                              />
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate text-center">
                              {img.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload area */}
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 dark:border-neutral-700 border-dashed rounded-md relative transition-all duration-200 hover:border-blue-400 dark:hover:border-red-400">
                      <div className="space-y-1 text-center">
                        <Upload
                          size={48}
                          className="mx-auto text-neutral-400"
                        />
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {t('uploadImageText')}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                          {images.length > 0
                            ? `${images.length} ${t('imagesSelected')}`
                            : t('selectMultipleImages')}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                    {t('step5')}
                  </h3>

                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-4">
                    {/* Personal info summary */}
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
                        {t('step1')}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {firstName} {lastName} • {email} • {phone}
                      </p>
                    </div>

                    {/* Service summary */}
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
                        {t('step2')}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {selectedServiceDetails &&
                          t(`services.${selectedServiceDetails.id}.name`)}
                      </p>
                    </div>

                    {/* Issue summary */}
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
                        {t('step3')}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                        {issue}
                      </p>
                    </div>

                    {/* Image summary */}
                    {images.length > 0 && (
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
                          {t('step4')}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {images.map(img => img.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={previousStep}
                  disabled={currentStep === 1}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentStep === 1
                      ? 'opacity-50 cursor-not-allowed text-neutral-400'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  {t('previousStep')}
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedFromStep(currentStep)}
                    className={`flex items-center px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      canProceedFromStep(currentStep)
                        ? 'bg-blue-600 dark:bg-red-600 text-white hover:bg-blue-700 dark:hover:bg-red-700'
                        : 'opacity-50 cursor-not-allowed bg-neutral-300 dark:bg-neutral-700 text-neutral-500'
                    }`}
                  >
                    {t('nextStep')}
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-2 bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? t('submitting') : t('submitRequest')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Service Details & Information */}
        <div className="order-1 lg:order-2 space-y-6">
          {selectedServiceDetails && (
            <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 animate-in slide-in-from-left duration-500">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                {t('serviceDetails')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="text-blue-600 dark:text-red-400 mr-2">
                    {selectedServiceDetails.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {t(`services.${selectedServiceDetails.id}.name`)}
                  </h4>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {t(`services.${selectedServiceDetails.id}.description`)}
                </p>
                {selectedServiceDetails.price && (
                  <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                    <Package size={16} className="mr-1" /> From €
                    {selectedServiceDetails.price}
                  </div>
                )}
                <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                  <Clock size={16} className="mr-1" />{' '}
                  {selectedServiceDetails.timeEstimate}
                </div>
                {selectedServiceDetails.hasNote && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t(`services.${selectedServiceDetails.id}.note`)}
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Process steps */}
          <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              {t('repairProcess')}
            </h3>
            <div className="space-y-4">
              {[
                { icon: <ScrollText size={20} />, key: 'submit' },
                { icon: <Mail size={20} />, key: 'contact' },
                { icon: <Package size={20} />, key: 'ship' },
                { icon: <Wrench size={20} />, key: 'repair' },
                { icon: <CheckCircle size={20} />, key: 'receive' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="text-blue-600 dark:text-red-400 mr-2">
                    {step.icon}
                  </div>
                  <span className="text-neutral-900 dark:text-white">
                    {t(`processSteps.${step.key}`)}
                  </span>
                  {idx < 4 && (
                    <ChevronRight
                      size={14}
                      className="mx-2 text-neutral-500 dark:text-neutral-400"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Service info alert */}
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
            <div className="flex">
              <AlertTriangle
                size={20}
                className="text-amber-400 mr-2 flex-shrink-0"
              />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium">{t('importantNote')}</p>
                <p className="mt-1">{t('finalPricingNote')}</p>
              </div>
            </div>
          </div>{' '}
        </div>
      </div>
    </div>
  );
}
