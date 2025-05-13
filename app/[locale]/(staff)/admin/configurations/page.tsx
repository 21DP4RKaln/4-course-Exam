'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Eye, Edit, Trash, Plus } from 'lucide-react'

export default function AdminConfigurationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [configurations, setConfigurations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/unauthorized')
      return
    }
    fetchConfigurations()
  }, [user])

  const fetchConfigurations = async () => {
    try {
      const response = await fetch('/api/admin/configurations')
      const data = await response.json()
      setConfigurations(data)
    } catch (error) {
      console.error('Error fetching configurations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this configuration?')) {
      try {
        await fetch(`/api/admin/configurations/${id}`, {
          method: 'DELETE'
        })
        fetchConfigurations()
      } catch (error) {
        console.error('Error deleting configuration:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurations</h1>
        <button
          onClick={() => router.push('/admin/configurations/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Configuration
        </button>
      </div>

      <div className="bg-white dark:bg-stone-950 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Creator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Public</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-stone-950 divide-y divide-gray-200 dark:divide-gray-700">
            {configurations.map((config: any) => (
              <tr key={config.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {config.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {config.user?.name || 'System'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${config.status === 'DRAFT' ? 'bg-gray-100 text-stone-950' : ''}
                    ${config.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${config.status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                    ${config.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {config.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${config.isTemplate ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                  `}>
                    {config.isTemplate ? 'Template' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${config.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-stone-950'}
                  `}>
                    {config.isPublic ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  €{config.totalPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(config.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/configurations/${config.id}`)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/configurations/${config.id}/edit`)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}