'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Wrench,
  Settings,
  PackageCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'repair' | 'configuration' | 'order' | 'user';
  action: string;
  details: string;
  timestamp: string;
  user?: {
    name: string;
    role: string;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityProps {
  limit?: number;
  showUser?: boolean;
}

export function RecentActivity({
  limit = 10,
  showUser = false,
}: RecentActivityProps) {
  const t = useTranslations();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/staff/activities?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit]);

  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case 'repair':
        return <Wrench className="h-5 w-5" />;
      case 'configuration':
        return <Settings className="h-5 w-5" />;
      case 'order':
        return <PackageCheck className="h-5 w-5" />;
      case 'user':
        return <User className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'repair':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'configuration':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'order':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'user':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-900/20 dark:text-neutral-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-950 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            {t('dashboard.recentActivity')}
          </h3>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-700 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-100 dark:bg-neutral-700 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-700 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-950 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          {t('dashboard.recentActivity')}
        </h3>

        {activities.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
            {t('dashboard.noRecentActivity')}
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={cn(
                    'flex-shrink-0 p-2 rounded-full',
                    getIconBgColor(activity.type)
                  )}
                >
                  {getActivityIcon(activity.type, activity.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {activity.action}
                    </p>
                    {getStatusIcon(activity.status)}
                  </div>

                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {activity.details}
                  </p>

                  <div className="mt-1 flex items-center space-x-2 text-xs text-neutral-400 dark:text-neutral-500">
                    <span>
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </span>

                    {showUser && activity.user && (
                      <>
                        <span>•</span>
                        <span>
                          {activity.user.name} ({activity.user.role})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
