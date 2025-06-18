'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SPECIALIST';
  isBlocked: boolean;
  createdAt: string;
}

export default function UsersPageSimple() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const { user: currentUser, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication first
    if (authLoading) return;

    if (!currentUser || currentUser.role !== 'ADMIN') {
      router.push(`/${locale}/unauthorized`);
      return;
    }

    fetchUsers();
  }, [currentUser, authLoading, locale, router]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      setError(null);
      const response = await fetch('/api/admin/users');
      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Received data:', data);
        setUsers(data.users || []); // API returns { users: [...], pagination: {...} }
      } else {
        console.error(
          'Failed to fetch users:',
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError(
          `Failed to fetch users: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(
        `Error fetching users: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== id));
      } else {
        console.error('Failed to delete user:', response.status);
        alert('Failed to delete user. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-500 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Users Management
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Users Management
        </h1>
        <button
          onClick={() => router.push(`/${locale}/admin/users/create`)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add User
        </button>
      </div>

      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Total users: {users.length}
          </p>

          {users.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-stone-950 divide-y divide-neutral-200 dark:border-neutral-700">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        {user.name || 'No name'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : ''}
                          ${user.role === 'SPECIALIST' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${user.role === 'USER' ? 'bg-blue-100 text-blue-800' : ''}
                        `}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                        `}
                        >
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              router.push(`/${locale}/admin/users/${user.id}`)
                            }
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/${locale}/admin/users/${user.id}/edit`
                              )
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
