'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Save, ArrowLeft, Send, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  enabled: boolean
  description: string
}

export default function EmailSettingsPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [testEmail, setTestEmail] = useState('')
  
  // SMTP Configuration
  const [smtpConfig, setSmtpConfig] = useState({
    provider: 'custom',
    host: 'smtp.gmail.com',
    port: '587',
    username: 'noreply@ivapro.com',
    password: '',
    secure: 'tls',
    fromEmail: 'noreply@ivapro.com',
    fromName: 'IvaPro Support',
    replyTo: 'support@ivapro.com'
  })

  // Email Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: 'order_confirmation',
      name: 'Order Confirmation',
      subject: 'Order #{orderId} Confirmation - IvaPro',
      enabled: true,
      description: 'Sent when a customer places an order'
    },
    {
      id: 'order_shipped',
      name: 'Order Shipped',
      subject: 'Your Order #{orderId} Has Been Shipped',
      enabled: true,
      description: 'Sent when an order is marked as shipped'
    },
    {
      id: 'order_delivered',
      name: 'Order Delivered',
      subject: 'Your Order #{orderId} Has Been Delivered',
      enabled: true,
      description: 'Sent when an order is marked as delivered'
    },
    {
      id: 'repair_status',
      name: 'Repair Status Update',
      subject: 'Repair #{repairId} Status Update',
      enabled: true,
      description: 'Sent when repair status changes'
    },
    {
      id: 'repair_completed',
      name: 'Repair Completed',
      subject: 'Your Repair #{repairId} is Complete',
      enabled: true,
      description: 'Sent when repair is marked as complete'
    },
    {
      id: 'user_welcome',
      name: 'Welcome Email',
      subject: 'Welcome to IvaPro!',
      enabled: true,
      description: 'Sent to new users after registration'
    },
    {
      id: 'password_reset',
      name: 'Password Reset',
      subject: 'Reset Your Password',
      enabled: true,
      description: 'Sent when user requests password reset'
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      subject: 'IvaPro Monthly Newsletter',
      enabled: false,
      description: 'Monthly newsletter to subscribed users'
    }
  ])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/admin/settings/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtp: smtpConfig,
          templates: templates
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      alert('Email settings saved successfully!')
    } catch (error) {
      console.error('Error saving email settings:', error)
      alert('Failed to save email settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter a test email address')
      return
    }
    
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/admin/settings/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testEmail,
          config: smtpConfig
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send test email')
      }

      setTestResult({
        success: true,
        message: 'Test email sent successfully! Please check your inbox.'
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send test email'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSmtpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSmtpConfig(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTemplateToggle = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, enabled: !template.enabled }
        : template
    ))
  }

  const handleProviderChange = (provider: string) => {
    setSmtpConfig(prev => {
      switch (provider) {
        case 'gmail':
          return {
            ...prev,
            provider: 'gmail',
            host: 'smtp.gmail.com',
            port: '587',
            secure: 'tls'
          }
        case 'outlook':
          return {
            ...prev,
            provider: 'outlook',
            host: 'smtp-mail.outlook.com',
            port: '587',
            secure: 'tls'
          }
        case 'sendgrid':
          return {
            ...prev,
            provider: 'sendgrid',
            host: 'smtp.sendgrid.net',
            port: '587',
            secure: 'tls'
          }
        default:
          return {
            ...prev,
            provider: 'custom'
          }
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          href={`/${locale}/admin/settings`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Email Settings
        </h1>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* SMTP Configuration */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">SMTP Configuration</h2>
          
          {/* Provider Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Provider
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['gmail', 'outlook', 'sendgrid', 'custom'].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handleProviderChange(provider)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    smtpConfig.provider === provider
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SMTP Host
              </label>
              <input
                type="text"
                name="host"
                value={smtpConfig.host}
                onChange={handleSmtpChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="smtp.example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SMTP Port
              </label>
              <input
                type="text"
                name="port"
                value={smtpConfig.port}
                onChange={handleSmtpChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="587"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SMTP Username
              </label>
              <input
                type="text"
                name="username"
                value={smtpConfig.username}
                onChange={handleSmtpChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="username@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SMTP Password
              </label>
              <input
                type="password"
                name="password"
                value={smtpConfig.password}
                onChange={handleSmtpChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Security
              </label>
              <select
                name="secure"
                value={smtpConfig.secure}
                onChange={handleSmtpChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="none">None</option>
                <option value="ssl">SSL</option>
                <option value="tls">TLS</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Email
              </label>
              <input
                type="email"
                name="fromEmail"
                value={smtpConfig.fromEmail}
                onChange={handleSmtpChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="noreply@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Name
              </label>
              <input
                type="text"
                name="fromName"
                value={smtpConfig.fromName}
                onChange={handleSmtpChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Company Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reply-To Email
              </label>
              <input
                type="email"
                name="replyTo"
                value={smtpConfig.replyTo}
                onChange={handleSmtpChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="support@example.com"
              />
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Email Templates</h2>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Subject: {template.subject}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={template.enabled}
                    onChange={() => handleTemplateToggle(template.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Test Email */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Test Email Configuration</h2>
          <div className="flex space-x-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter email address to send test"
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={isTesting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Send Test</span>
                </>
              )}
            </button>
          </div>
          
          {testResult && (
            <div className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
              testResult.success 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {testResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}