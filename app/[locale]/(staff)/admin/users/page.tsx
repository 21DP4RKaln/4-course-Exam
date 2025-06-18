'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  UserCheck,
  UserX,
} from 'lucide-react';
import { DataTable, Column } from '@/app/components/Staff/Common/DataTable';
import { ActionButtons } from '@/app/components/Staff/Common/ActionButtons';
import { SearchBar } from '@/app/components/Staff/Common/SearchBar';
import { StatusBadge } from '@/app/components/Staff/Common/StatusBadge';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SPECIALIST';
  isBlocked: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const { user: currentUser, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleToggleBlock = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/toggle-block`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(
          users.map(u =>
            u.id === user.id ? { ...u, isBlocked: updatedUser.isBlocked } : u
          )
        );
      } else {
        console.error('Failed to toggle user block status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert('Failed to update user status. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling user block status:', error);
      alert('Failed to update user status. Please try again.');
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
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert('Failed to delete user. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name' as keyof User,
      label: 'Name',
    },
    {
      key: 'email' as keyof User,
      label: 'Email',
    },
    {
      key: 'role' as keyof User,
      label: 'Role',
      render: (value: User['role']) => (
        <StatusBadge
          status={value}
          variant={
            value === 'ADMIN'
              ? 'danger'
              : value === 'SPECIALIST'
                ? 'warning'
                : 'info'
          }
        />
      ),
    },
    {
      key: 'isBlocked' as keyof User,
      label: 'Status',
      render: (value: boolean) => (
        <StatusBadge
          status={value ? 'Blocked' : 'Active'}
          variant={value ? 'danger' : 'success'}
        />
      ),
    },
    {
      key: 'createdAt' as keyof User,
      label: 'Joined',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'id' as keyof User,
      label: 'Actions',
      render: (value: string, user: User) => (
        <div className="flex items-center space-x-2">
          <ActionButtons
            onView={() => router.push(`/${locale}/admin/users/${user.id}`)}
            onEdit={() => router.push(`/${locale}/admin/users/${user.id}/edit`)}
            onDelete={() => handleDelete(user.id)}
          />
          <button
            onClick={() => handleToggleBlock(user)}
            className={`p-2 rounded-lg ${
              user.isBlocked
                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
            title={user.isBlocked ? 'Unblock User' : 'Block User'}
          >
            {user.isBlocked ? (
              <UserCheck className="w-4 h-4" />
            ) : (
              <UserX className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  const filteredUsers = users.filter(
    user =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('Users state:', users);
  console.log('Filtered users:', filteredUsers);
  console.log('Loading state:', loading);
  console.log('Auth loading state:', authLoading);
  console.log('Current user:', currentUser);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Users Management
          </h1>
        </div>
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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-500 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Users Management
        </h1>
        <button
          onClick={() => router.push(`/${locale}/admin/users/create`)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-sm">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users..."
          />
        </div>

        {filteredUsers.length === 0 && !loading ? (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            No users found
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredUsers}
            loading={loading}
            emptyMessage="No users found"
          />
        )}
      </div>
    </div>
  );
}
