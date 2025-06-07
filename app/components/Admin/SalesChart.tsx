'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@/app/contexts/ThemeContext';

interface SalesData {
  date: string;
  sales: number;
  revenue: number;
}

export function SalesChart() {
  const t = useTranslations();
  const { theme } = useTheme();
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/sales-chart');
      if (response.ok) {
        const salesData = await response.json();
        setData(salesData);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartColors = {
    sales: theme === 'dark' ? '#3b82f6' : '#2563eb',
    revenue: theme === 'dark' ? '#10b981' : '#059669',
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
          />
          <XAxis
            dataKey="date"
            stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
            fontSize={12}
            tickFormatter={value => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />{' '}
          <YAxis
            stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
            fontSize={12}
            yAxisId="left"
          />
          <YAxis
            stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
            fontSize={12}
            yAxisId="right"
            orientation="right"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              borderRadius: '0.5rem',
              color: theme === 'dark' ? '#f3f4f6' : '#111827',
            }}
            labelFormatter={value => {
              const date = new Date(value);
              return date.toLocaleDateString();
            }}
            formatter={(value, name) => [
              name === 'revenue' ? `€${value}` : value,
              name === 'sales'
                ? t('staff.totalOrders')
                : t('staff.totalRevenue'),
            ]}
          />{' '}
          <Line
            type="monotone"
            dataKey="sales"
            stroke={chartColors.sales}
            strokeWidth={2}
            dot={{ fill: chartColors.sales, strokeWidth: 2, r: 4 }}
            name="sales"
            yAxisId="left"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke={chartColors.revenue}
            strokeWidth={2}
            dot={{ fill: chartColors.revenue, strokeWidth: 2, r: 4 }}
            name="revenue"
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
