'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { 
  Save, ArrowLeft, Database, Download, 
  Upload, Clock, HardDrive, Trash2, 
  RefreshCw, CheckCircle, AlertTriangle 
} from 'lucide-react'
import Link from 'next/link'

export default function BackupSettingsPage() {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)
  
  const [settings, setSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: 30,
    backupLocation: 'local',
    includeUploads: true,
    compressBackups: true,
    encryptBackups: false,
    emailNotifications: true,
    notificationEmail: 'admin@ivapro.com'
  })

  const [backups, setBackups] = useState([
    {
      id: '1',
      name: 'backup_2024_01_10_02_00.sql',
      date: '2024-01-10T02:00:00',
      size: '125 MB',
      status: 'completed',
      type: 'automatic'
    },
    {
      id: '2',
      name: 'backup_2024_01_09_14_30.sql',
      date: '2024-01-09T14:30:00',
      size: '123 MB',
      status: 'completed',
      type: 'manual'
    },
    {
      id: '3',
      name: 'backup_2024_01_09_02_00.sql',
      date: '2024-01-09T02:00:00',
      size: '122 MB',
      status: 'completed',
      type: 'automatic'
    }
  ])

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const newBackup = {
        id: Date.now().toString(),
        name: `backup_${new Date().toISOString().replace(/[:-]/g, '_').replace('T', '_').split('.')[0]}.sql`,
        date: new Date().toISOString(),
        size: '124 MB',
        status: 'completed',
        type: 'manual'
      }
      
      setBackups(prev => [newBackup, ...prev])
      alert('Backup created successfully!')
    } catch (error) {
      alert('Failed to create backup')
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      return
    }
    
    setIsRestoring(true)
    setSelectedBackup(backupId)
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 5000))
      alert('Backup restored successfully!')
    } catch (error) {
      alert('Failed to restore backup')
    } finally {
      setIsRestoring(false)
      setSelectedBackup(null)
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return
    }
    
    try {
      setBackups(prev => prev.filter(backup => backup.id !== backupId))
      alert('Backup deleted successfully!')
    } catch (error) {
      alert('Failed to delete backup')
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Save settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Backup settings saved successfully!')
    } catch (error) {
      alert('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link 
          href="/admin/settings"
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Backup & Restore
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-stone-950 shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
          >
            {isCreatingBackup ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Creating Backup...</span>
              </>
            ) : (
              <>
                <Database className="h-5 w-5" />
                <span>Create Backup Now</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-medium">Last Backup</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Today at 02:00 AM</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <HardDrive className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-medium">Total Backups</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">12 backups (1.4 GB)</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-medium">Next Backup</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Tomorrow at 02:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup List */}
      <div className="bg-white dark:bg-stone-950 shadow rounded-lg">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold">Recent Backups</h2>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {backups.map((backup) => (
            <div key={backup.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Database className="h-6 w-6 text-neutral-400" />
                <div>
                  <h3 className="font-medium">{backup.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {new Date(backup.date).toLocaleString()} • {backup.size} • {backup.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => alert('Download functionality not implemented')}
                  className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleRestoreBackup(backup.id)}
                  disabled={isRestoring}
                  className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  title="Restore"
                >
                  {isRestoring && selectedBackup === backup.id ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteBackup(backup.id)}
                  className="p-2 text-red-600 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup Settings */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="bg-white dark:bg-stone-950 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Backup Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Automatic Backups</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Enable automatic scheduled backups
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="autoBackup"
                  checked={settings.autoBackup}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Backup Frequency
                </label>
                <select
                  name="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={handleChange}
                  disabled={!settings.autoBackup}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 disabled:opacity-50"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Backup Time
                </label>
                <input
                  type="time"
                  name="backupTime"
                  value={settings.backupTime}
                  onChange={handleChange}
                  disabled={!settings.autoBackup}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Retention Period (days)
                </label>
                <input
                  type="number"
                  name="retentionDays"
                  value={settings.retentionDays}
                  onChange={handleChange}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Backup Location
                </label>
                <select
                  name="backupLocation"
                  value={settings.backupLocation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                >
                  <option value="local">Local Storage</option>
                  <option value="s3">Amazon S3</option>
                  <option value="google">Google Cloud Storage</option>
                  <option value="azure">Azure Blob Storage</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Include Uploads</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Include uploaded files in backups
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="includeUploads"
                    checked={settings.includeUploads}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Compress Backups</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Compress backup files to save space
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="compressBackups"
                    checked={settings.compressBackups}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Send email notifications for backup status
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}