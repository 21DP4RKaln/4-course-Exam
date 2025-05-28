'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Edit, UserX, UserCheck } from 'lucide-react'
import { StatusBadge } from '@/app/components/Staff/Common/StatusBadge'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  phone: string
  role: 'USER' | 'ADMIN' | 'SPECIALIST'
  isBlocked: boolean
  blockReason: string
  profileImageUrl: string
  createdAt: string
  updatedAt: string
}

export default function ViewUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [params.id])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/admin/users/${user.id}/toggle-block`, {
        method: 'POST',
      })
      
      if (response.ok) {
        setUser({ ...user, isBlocked: !user.isBlocked })
      }
    } catch (error) {
      console.error('Error toggling user block status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark:text-neutral-400">User not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            User Details
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleBlock}
            className={`flex items-center px-4 py-2 rounded-lg ${
              user.isBlocked
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {user.isBlocked ? (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Unblock User
              </>
            ) : (
              <>
                <UserX className="w-4 h-4 mr-2" />
                Block User
              </>
            )}
          </button>
          <button
            onClick={() => router.push(`/${locale}/admin/users/${user.id}/edit`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit User
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Personal Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">Full Name</dt>
                <dd className="text-neutral-900 dark:text-white">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">Email</dt>
                <dd className="text-neutral-900 dark:text-white">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">Phone</dt>
                <dd className="text-neutral-900 dark:text-white">{user.phone || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">Role</dt>
                <dd>
                  <StatusBadge 
                    status={user.role} 
                    variant={user.role === 'ADMIN' ? 'danger' : user.role === 'SPECIALIST' ? 'warning' : 'info'}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">Status</dt>
                <dd>
                  <StatusBadge 
                    status={user.isBlocked ? 'Blocked' : 'Active'}
                    variant={user.isBlocked ? 'danger' : 'success'}
                  />
                </dd>
              </div>
              {user.isBlocked && user.blockReason && (
                <div>
                  <dt className="text-sm text-neutral-500 dark:text-neutral-400">Block Reason</dt>
                  <dd className="text-neutral-900 dark:text-white">{user.blockReason}</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            {user.profileImageUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Profile Image</h3>
                <img
                  src={user.profileImageUrl}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>
            )}
            
            <h3 className="text-lg font-medium mb-4">Account Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">User ID</dt>
                <dd className="text-neutral-900 dark:text-white font-mono text-sm">{user.id}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">Created</dt>
                <dd className="text-neutral-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">Last Updated</dt>
                <dd className="text-neutral-900 dark:text-white">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}