'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { 
  Settings, Mail, Database, Shield, 
  ChevronRight, Server, Bell, KeyRound 
} from 'lucide-react'

export default function SettingsPage() {
  const t = useTranslations()

  const settingsSections = [
    {
      title: 'General Settings',
      description: 'Configure basic system settings, company information, and preferences',
      icon: Settings,
      href: 'settings/general',
      color: 'blue'
    },
    {
      title: 'Email Configuration',
      description: 'Set up email servers, templates, and notification settings',
      icon: Mail,
      href: 'settings/email',
      color: 'green'
    },
    {
      title: 'Backup & Restore',
      description: 'Manage system backups, restore points, and data exports',
      icon: Database,
      href: 'settings/backup',
      color: 'purple'
    },
    {
      title: 'Security Settings',
      description: 'Configure authentication, permissions, and security policies',
      icon: Shield,
      href: 'settings/security',
      color: 'red'
    },
    {
      title: 'API & Integrations',
      description: 'Manage API keys, webhooks, and third-party integrations',
      icon: KeyRound,
      href: 'settings/api',
      color: 'yellow'
    },
    {
      title: 'System Information',
      description: 'View system status, logs, and performance metrics',
      icon: Server,
      href: 'settings/system',
      color: 'neutral'
    },
    {
      title: 'Notifications',
      description: 'Configure system notifications and alerts',
      icon: Bell,
      href: 'settings/notifications',
      color: 'indigo'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
      yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
      neutral: 'bg-neutral-50 text-neutral-600 dark:bg-neutral-900/20 dark:text-neutral-400',
      indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
    }
    return colors[color as keyof typeof colors] || colors.neutral
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          System Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="block p-6 bg-white dark:bg-stone-950 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${getColorClasses(section.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    {section.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {section.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-400" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}