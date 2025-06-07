'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@/app/contexts/ThemeContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';

interface RepairMetrics {
  month: string;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export function RepairMetricsChart() {
  const t = useTranslations();
  const { theme } = useTheme();
  const [data, setData] = useState<RepairMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepairMetrics();
  }, []);

  const fetchRepairMetrics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/repairs');
      if (response.ok) {
        const metricsData = await response.json();
        setData(metricsData);
      }
    } catch (error) {
      console.error('Error fetching repair metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartColors = {
    pending: theme === 'dark' ? '#f59e0b' : '#d97706',
    inProgress: theme === 'dark' ? '#3b82f6' : '#2563eb',
    completed: theme === 'dark' ? '#10b981' : '#059669',
    cancelled: theme === 'dark' ? '#ef4444' : '#dc2626',
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.charts.repairMetrics')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.charts.repairMetrics')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
              />
              <XAxis
                dataKey="month"
                stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
              />
              <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '0.5rem',
                  color: theme === 'dark' ? '#f3f4f6' : '#111827',
                }}
              />
              <Legend />
              <Bar
                dataKey="pending"
                fill={chartColors.pending}
                name={t('admin.charts.pending')}
              />
              <Bar
                dataKey="inProgress"
                fill={chartColors.inProgress}
                name={t('admin.charts.inProgress')}
              />
              <Bar
                dataKey="completed"
                fill={chartColors.completed}
                name={t('admin.charts.completed')}
              />
              <Bar
                dataKey="cancelled"
                fill={chartColors.cancelled}
                name={t('admin.charts.cancelled')}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
