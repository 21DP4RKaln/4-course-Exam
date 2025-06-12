'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import {
  Wrench,
  Package,
  Cpu,
  Monitor,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardStats {
  repairs: {
    pendingRepairs: number;
    activeRepairs: number;
    completedRepairs: number;
    totalRepairs: number;
  };
  configurations: {
    pendingConfigurations: number;
    approvedConfigurations: number;
    totalConfigurations: number;
  };
  inventory: {
    components: number;
    lowStock: number;
    peripherals: number;
  };
  recentActivity: {
    repairs: Array<{
      id: string;
      title: string;
      status: string;
      customer: string;
      createdAt: string;
      updatedAt: string;
    }>;
    configurations: Array<{
      id: string;
      name: string;
      status: string;
      user: string;
      createdAt: string;
    }>;
  };
}

export default function SpecialistDashboard() {
  const t = useTranslations();
  const { user } = useAuth();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/staff/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">
          {t('common.loading')}
        </span>
      </div>
    );
  }

  const quickLinks = [
    {
      title: t('specialist.dashboard.repairRequests'),
      description: t('specialist.dashboard.manageRepairRequests'),
      href: `/${locale}/specialist/repairs`,
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t('specialist.dashboard.configurations'),
      description: t('specialist.dashboard.reviewUserConfigurations'),
      href: `/${locale}/specialist/configurations`,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t('specialist.dashboard.components'),
      description: t('specialist.dashboard.viewComponentInventory'),
      href: `/${locale}/specialist/components`,
      icon: Cpu,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: t('specialist.dashboard.readyMadePCs'),
      description: t('specialist.dashboard.manageShopPCs'),
      href: `/${locale}/specialist/ready-made`,
      icon: Monitor,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          {t('specialist.dashboard.welcomeBack')}, {user?.name}!
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {t('specialist.dashboard.todayOverview')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('specialist.dashboard.pendingRepairs')}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>{' '}
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.repairs?.pendingRepairs || 0}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('specialist.dashboard.awaitingAction')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('specialist.dashboard.activeRepairs')}
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>{' '}
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.repairs?.activeRepairs || 0}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('specialist.dashboard.inProgress')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('specialist.dashboard.pendingConfigs')}
            </CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>{' '}
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.configurations?.pendingConfigurations || 0}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('specialist.dashboard.needReview')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('specialist.dashboard.completedToday')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>{' '}
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.repairs?.completedRepairs || 0}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('specialist.dashboard.repairsFinished')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
          {t('specialist.dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map(link => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div
                    className={`${link.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                  >
                    <link.icon className={`h-6 w-6 ${link.color}`} />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                    {link.title}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {link.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('specialist.dashboard.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity ? (
              (() => {
                // Combine and sort all recent activities
                const allActivities = [
                  ...stats.recentActivity.repairs.map(repair => ({
                    type: 'repair' as const,
                    id: repair.id,
                    title: repair.title,
                    status: repair.status,
                    user: repair.customer,
                    timestamp: repair.updatedAt,
                  })),
                  ...stats.recentActivity.configurations.map(config => ({
                    type: 'configuration' as const,
                    id: config.id,
                    title: config.name,
                    status: config.status,
                    user: config.user,
                    timestamp: config.createdAt,
                  })),
                ]
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .slice(0, 5);

                const formatTimeAgo = (timestamp: string) => {
                  const now = new Date();
                  const past = new Date(timestamp);
                  const diffInMinutes = Math.floor(
                    (now.getTime() - past.getTime()) / (1000 * 60)
                  );

                  if (diffInMinutes < 1)
                    return t('specialist.dashboard.minutesAgo', {
                      minutes: '0',
                    });
                  if (diffInMinutes < 60)
                    return t('specialist.dashboard.minutesAgo', {
                      minutes: diffInMinutes,
                    });
                  if (diffInMinutes < 1440) {
                    const hours = Math.floor(diffInMinutes / 60);
                    return hours === 1
                      ? t('specialist.dashboard.hourAgo')
                      : t('specialist.dashboard.hoursAgo', { hours });
                  }
                  const diffInDays = Math.floor(diffInMinutes / 1440);
                  if (diffInDays === 1)
                    return t('specialist.dashboard.yesterday');
                  return t('specialist.dashboard.today');
                };

                const getStatusColor = (status: string) => {
                  switch (status.toLowerCase()) {
                    case 'completed':
                      return 'bg-green-500';
                    case 'submitted':
                    case 'pending':
                      return 'bg-blue-500';
                    case 'in_progress':
                    case 'diagnosing':
                      return 'bg-yellow-500';
                    case 'approved':
                      return 'bg-green-500';
                    default:
                      return 'bg-gray-500';
                  }
                };

                const getActivityText = (
                  activity: (typeof allActivities)[0]
                ) => {
                  if (activity.type === 'repair') {
                    switch (activity.status.toLowerCase()) {
                      case 'completed':
                        return t('specialist.dashboard.repairCompleted', {
                          id: activity.id.slice(0, 8),
                        });
                      case 'pending':
                        return t('specialist.dashboard.newRepairRequest');
                      default:
                        return `${activity.title} - ${activity.status}`;
                    }
                  } else {
                    return activity.status === 'SUBMITTED'
                      ? t('specialist.dashboard.newConfigurationSubmitted')
                      : `${activity.title} - ${activity.status}`;
                  }
                };

                return allActivities.length > 0 ? (
                  allActivities.map((activity, index) => (
                    <div
                      key={`${activity.type}-${activity.id}-${index}`}
                      className="flex items-center"
                    >
                      <div
                        className={`w-2 h-2 ${getStatusColor(activity.status)} rounded-full mr-3`}
                      ></div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {getActivityText(activity)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {t('specialist.dashboard.noRecentActivity')}
                    </p>
                  </div>
                );
              })()
            ) : (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mr-3 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
