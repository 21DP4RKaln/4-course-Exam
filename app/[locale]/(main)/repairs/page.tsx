'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
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
  Image as ImageIcon
} from 'lucide-react'
import AnimatedButton from '@/app/components/ui/animated-button'
import PhoneInput from '@/app/components/ui/PhoneInput'

const repairServices = [
  {
    id: 'diagnostics',
    name: 'PC Diagnostics & Troubleshooting', 
    icon: <Wrench size={24} />,
    description: 'Complete computer diagnostics to identify hardware and software issues.',
    price: 10,
    timeEstimate: '1-3 days',
  },
  {
    id: 'hardware-replacement',
    name: 'Hardware Replacement',
    icon: <Cpu size={24} />,
    description: 'Professional replacement of damaged or failing hardware components.',
    price: 20,
    timeEstimate: '1-2 weeks',
    note: 'Bring your own parts and save on costs'
  },
  {
    id: 'data-recovery', 
    name: 'Data Recovery',
    icon: <HardDrive size={24} />,
    description: 'Recovery of lost, deleted, or corrupted data from storage devices.',
    price: 30,
    timeEstimate: '3-7 days',
  },
  {
    id: 'virus-removal',
    name: 'Virus & Malware Removal',
    icon: <Shield size={24} />,
    description: 'Removal of viruses, malware, and other threats from your computer.',
    price: 20,
    timeEstimate: '1-3 days',
  },
  {
    id: 'performance-optimization',
    name: 'Performance Optimization',
    icon: <Zap size={24} />,
    description: 'Speed up your computer by optimizing software and hardware settings.',
    timeEstimate: '1-3 days',
  },
  {
    id: 'custom',
    name: 'Custom Repair',
    icon: <Code size={24} />,
    description: 'For unique issues that require specialized attention.',
    price: 35,
    timeEstimate: '1-7 days',
  }
]

export default function RepairsPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const locale = pathname.split('/')[1]
  
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [selectedService, setSelectedService] = useState('')
  const [issue, setIssue] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const selectedServiceDetails = repairServices.find(s => s.id === selectedService)
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService || !issue || !email || (!phone && !user)) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('serviceId', selectedService)
      formData.append('issue', issue)
      if (image) {
        formData.append('image', image)
      }
      
      // Here you would send to API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success message
      setShowSuccess(true)
      
      // Reset form if not logged in
      if (!user) {
        setFirstName('')
        setLastName('')
        setEmail('')
        setPhone('')
      }
      setSelectedService('')
      setIssue('')
      setImage(null)
      
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    } catch (error) {
      console.error('Error submitting repair request:', error)
      alert('Failed to submit repair request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 to-red-600 dark:from-red-700 dark:to-red-900 rounded-lg p-8 mb-12 text-white">
        <h1 className="text-3xl font-bold mb-4">
          Computer Repair Services
        </h1>
        <p className="text-lg opacity-90 max-w-2xl">
          Professional repair services for your PC, laptop, and peripherals. Fast, reliable, and affordable.
        </p>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Repair Form */}
        <div className="order-2 md:order-1">
          <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Request a Repair
            </h2>
            
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg flex items-start">
                <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Success!</p>
                  <p className="text-sm mt-1">Your repair request has been submitted. We'll contact you shortly.</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {!user && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number (Required)
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Service
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repairServices.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedService === service.id
                          ? 'border-blue-500 dark:border-red-500 bg-blue-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-red-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-blue-600 dark:text-red-400">{service.icon}</div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          From €{service.price}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {service.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock size={14} className="mr-1" />
                        {service.timeEstimate}
                      </div>
                      {service.note && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                          {service.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="issue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Describe the Issue
                </label>
                <textarea
                  id="issue"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  required
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                  placeholder="Please provide as much detail as possible about the issue..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Attach Image (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {image ? (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center justify-center">
                          <ImageIcon size={48} className="mx-auto text-gray-400 mb-2" />
                        </div>
                        <p className="font-medium">{image.name}</p>
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={48} className="mx-auto text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white dark:bg-gray-900 font-medium text-blue-600 dark:text-red-400 hover:text-blue-500 dark:hover:text-red-300"
                          >
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Repair Request'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Service Details & Summary */}
        <div className="order-1 md:order-2 space-y-6">
          {selectedServiceDetails && (
            <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Service Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-red-400 mr-4">
                    {selectedServiceDetails.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{selectedServiceDetails.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedServiceDetails.description}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 dark:text-gray-400">Estimated Price:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">From €{selectedServiceDetails.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Estimated Time:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{selectedServiceDetails.timeEstimate}</span>
                  </div>
                </div>
                
                {selectedServiceDetails.note && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    <p className="text-sm text-green-700 dark:text-green-400">{selectedServiceDetails.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Process steps */}
          <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Repair Process
            </h3>
            <div className="space-y-4">
              {[
                { icon: <Package size={20} />, title: 'Submission', desc: 'Submit your repair request' },
                { icon: <CheckCircle size={20} />, title: 'Review', desc: 'Our specialists review your case' },
                { icon: <Wrench size={20} />, title: 'Repair', desc: 'Professional repair service' },
                { icon: <CheckCircle size={20} />, title: 'Complete', desc: 'Device returned to you' },
              ].map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-blue-600 dark:text-red-400 mr-3">
                    {step.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{step.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Service info alert */}
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
            <div className="flex">
              <AlertTriangle size={20} className="text-amber-400 mr-2 flex-shrink-0" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium">Important Note</p>
                <p className="mt-1">Final pricing may vary based on the actual issues found during diagnostics. We'll contact you with a detailed quote before proceeding.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}