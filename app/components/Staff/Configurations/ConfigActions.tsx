'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Edit,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Copy,
  ShoppingCart,
  MoreVertical,
} from 'lucide-react';

interface Configuration {
  id: string;
  name: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  isTemplate: boolean;
  isPublic: boolean;
}

interface ConfigActionsProps {
  configuration: Configuration;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onStatusChange?: (status: 'APPROVED' | 'REJECTED') => void;
  onDuplicate?: () => void;
  variant?: 'dropdown' | 'inline';
}

export function ConfigActions({
  configuration,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onStatusChange,
  onDuplicate,
  variant = 'inline',
}: ConfigActionsProps) {
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isSpecialist = user?.role === 'SPECIALIST';

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      router.push(
        `/${user?.role.toLowerCase()}/configurations/${configuration.id}`
      );
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      router.push(
        `/${user?.role.toLowerCase()}/configurations/${configuration.id}/edit`
      );
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      if (onDelete) {
        onDelete();
      } else {
        try {
          const response = await fetch(
            `/api/staff/configurations/${configuration.id}`,
            {
              method: 'DELETE',
            }
          );
          if (response.ok) {
            router.refresh();
          }
        } catch (error) {
          console.error('Error deleting configuration:', error);
        }
      }
    }
  };

  const handleStatusChange = async (newStatus: 'APPROVED' | 'REJECTED') => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    } else {
      try {
        const response = await fetch(
          `/api/staff/configurations/${configuration.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          }
        );
        if (response.ok) {
          router.refresh();
        }
      } catch (error) {
        console.error('Error updating configuration status:', error);
      }
    }
  };

  const actions = [
    {
      icon: Eye,
      label: 'View',
      onClick: handleView,
      show: true,
      className:
        'text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300',
    },
    {
      icon: Edit,
      label: 'Edit',
      onClick: handleEdit,
      show: (isAdmin || isSpecialist) && configuration.status !== 'APPROVED',
      className:
        'text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300',
    },
    {
      icon: CheckCircle,
      label: 'Approve',
      onClick: () => handleStatusChange('APPROVED'),
      show: (isAdmin || isSpecialist) && configuration.status === 'SUBMITTED',
      className:
        'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300',
    },
    {
      icon: XCircle,
      label: 'Reject',
      onClick: () => handleStatusChange('REJECTED'),
      show: (isAdmin || isSpecialist) && configuration.status === 'SUBMITTED',
      className:
        'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300',
    },
    {
      icon: Send,
      label: 'Publish to Shop',
      onClick:
        onPublish ||
        (() =>
          router.push(
            `/${user?.role.toLowerCase()}/configurations/${configuration.id}/publish`
          )),
      show:
        (isAdmin || isSpecialist) &&
        configuration.status === 'APPROVED' &&
        !configuration.isPublic,
      className:
        'text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300',
    },
    {
      icon: Copy,
      label: 'Duplicate',
      onClick:
        onDuplicate ||
        (() => console.log('Duplicate functionality not implemented')),
      show: isAdmin || isSpecialist,
      className:
        'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300',
    },
    {
      icon: ShoppingCart,
      label: 'Add to Shop',
      onClick: () => router.push(`/shop/product/${configuration.id}`),
      show: configuration.isPublic,
      className:
        'text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300',
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: handleDelete,
      show: isAdmin && configuration.status !== 'APPROVED',
      className:
        'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300',
    },
  ];

  const visibleActions = actions.filter(action => action.show);

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <MoreVertical
            size={20}
            className="text-neutral-500 dark:text-neutral-400"
          />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-stone-950 ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu">
              {visibleActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      setShowDropdown(false);
                    }}
                    className={`${action.className} flex items-center gap-2 px-4 py-2 text-sm w-full text-left`}
                    role="menuitem"
                  >
                    <Icon size={16} />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {visibleActions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.onClick}
            className={action.className}
            title={action.label}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}
