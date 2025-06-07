'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  Plus,
  Wrench,
  Settings,
  Package,
  Eye,
  UserPlus,
  FileText,
  BarChart2,
} from 'lucide-react';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  roles: ('ADMIN' | 'SPECIALIST')[];
}

export function QuickActions() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const { user } = useAuth();

  const actions: QuickAction[] = [
    {
      label: t('dashboard.actions.createConfig'),
      icon: <Plus className="h-5 w-5" />,
      href: `/${locale}/${user?.role.toLowerCase()}/configurations/create`,
      color: 'bg-blue-500 hover:bg-blue-600',
      roles: ['ADMIN', 'SPECIALIST'],
    },
    {
      label: t('dashboard.actions.viewRepairs'),
      icon: <Wrench className="h-5 w-5" />,
      href: `/${locale}/${user?.role.toLowerCase()}/repairs`,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      roles: ['ADMIN', 'SPECIALIST'],
    },
    {
      label: t('dashboard.actions.pendingConfigs'),
      icon: <Settings className="h-5 w-5" />,
      href: `/${locale}/${user?.role.toLowerCase()}/configurations?status=pending`,
      color: 'bg-purple-500 hover:bg-purple-600',
      roles: ['ADMIN', 'SPECIALIST'],
    },
    {
      label: t('dashboard.actions.viewInventory'),
      icon: <Package className="h-5 w-5" />,
      href: `/${locale}/${user?.role.toLowerCase()}/components`,
      color: 'bg-green-500 hover:bg-green-600',
      roles: ['ADMIN', 'SPECIALIST'],
    },
    {
      label: t('dashboard.actions.viewUsers'),
      icon: <UserPlus className="h-5 w-5" />,
      href: `/${locale}/admin/users`,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      roles: ['ADMIN'],
    },
    {
      label: t('dashboard.actions.financialReports'),
      icon: <FileText className="h-5 w-5" />,
      href: `/${locale}/admin/financial/reports`,
      color: 'bg-pink-500 hover:bg-pink-600',
      roles: ['ADMIN'],
    },
    {
      label: t('dashboard.actions.analytics'),
      icon: <BarChart2 className="h-5 w-5" />,
      href: `/${locale}/admin/analytics`,
      color: 'bg-orange-500 hover:bg-orange-600',
      roles: ['ADMIN'],
    },
    {
      label: t('dashboard.actions.viewOrders'),
      icon: <Eye className="h-5 w-5" />,
      href: `/${locale}/admin/orders`,
      color: 'bg-teal-500 hover:bg-teal-600',
      roles: ['ADMIN'],
    },
  ];

  const filteredActions = actions.filter(action =>
    action.roles.includes(user?.role as 'ADMIN' | 'SPECIALIST')
  );

  return (
    <div className="bg-white dark:bg-stone-950 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          {t('dashboard.quickActions')}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredActions.map((action, index) => (
            <button
              key={index}
              onClick={() => router.push(action.href)}
              className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors`}
            >
              {action.icon}
              <span className="text-sm font-medium text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
