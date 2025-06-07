'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { motion } from 'framer-motion';
import Loading from '@/app/components/ui/Loading';
import { User, Package, Cpu, Heart } from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/app/components/ui/tabs';
import {
  getUserConfigurations,
  getUserOrders,
  type UserConfiguration,
  type UserOrder,
} from '@/lib/services/dashboardService';

import ProfileTab from '@/app/components/Dashboard/Dashboard';
import WishlistTab from '@/app/components/Dashboard/WishlistTab';
import ConfigurationsTab from '@/app/components/Dashboard/ConfigurationsTab';
import OrdersTab from '@/app/components/Dashboard/OrdersTab';

export default function DashboardPage() {
  // Inicializē hooks tulkošanai, navigācijai un URL parametru pārvaldībai
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Iegūst autentifikācijas datus no konteksta
  const { user, isAuthenticated, loading } = useAuth();
  // State mainīgais aktīvā tab pārvaldībai
  const [activeTab, setActiveTab] = useState(tabParam || 'configurations');
  const locale = pathname.split('/')[1];

  // State mainīgie datu pārvaldībai
  const [configurations, setConfigurations] = useState<UserConfiguration[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect hook autentifikācijas un lietotāja lomas pārbaudei
  useEffect(() => {
    if (!loading) {
      // Ja nav autentificēts, novirza uz login lapu
      if (!isAuthenticated) {
        router.push(
          `/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`
        );
      }
      // Ja lietotājs ir administrators, novirza uz admin paneli
      else if (user?.role === 'ADMIN') {
        router.push(`/${locale}/admin`);
      }
      // Ja lietotājs ir specialists, novirza uz specialist paneli
      else if (user?.role === 'SPECIALIST') {
        router.push(`/${locale}/specialist`);
      }
    }
  }, [isAuthenticated, loading, router, locale, pathname, user?.role]);

  // useEffect hook tab parametru pārvaldībai URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    // Pārbauda vai tab parametrs ir derīgs un iestata to kā aktīvo
    if (
      tab &&
      ['configurations', 'orders', 'profile', 'wishlist'].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // useEffect hook datu ielādei atkarībā no aktīvā tab
  useEffect(() => {
    let mounted = true;

    if (!isAuthenticated || loading || user?.role !== 'USER') return;

    const fetchData = async () => {
      setDataLoading(true);
      setError(null);

      try {
        // Ielādē konfigurācijas, ja aktīvs ir configurations tab
        if (activeTab === 'configurations') {
          const configData = await getUserConfigurations(user.id);
          console.log('Fetched configurations:', configData);
          if (mounted) setConfigurations(configData);
        }
        // Ielādē pasūtījumus, ja aktīvs ir orders tab
        else if (activeTab === 'orders') {
          const response = await fetch('/api/dashboard/orders');
          const orderData = await response.json();
          console.log('Fetched orders:', orderData);
          if (mounted) setOrders(orderData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (mounted) setError('Failed to load data. Please try again later.');
      } finally {
        if (mounted) setDataLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [activeTab, isAuthenticated, loading, user?.id]);

  // Rāda ielādes indikatoru, kamēr notiek autentifikācijas pārbaude
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    );
  }

  // Ja nav autentificēts vai nav USER loma, neko nerāda
  if (!isAuthenticated || user?.role !== 'USER') {
    return null;
  }

  // Funkcija datumu formatēšanai lokalizētā formātā
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      DRAFT:
        'bg-neutral-100 text-stone-950 dark:bg-stone-950 dark:text-neutral-300',
      SUBMITTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      APPROVED:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      PENDING:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      PROCESSING:
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      COMPLETED:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    return (
      statusColors[status as keyof typeof statusColors] ||
      'bg-neutral-100 text-stone-950'
    );
  };

  // Funkcija tab maiņas pārvaldībai ar URL atjaunošanu
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const baseUrl = pathname.split('?')[0];
    router.replace(`${baseUrl}?tab=${value}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white dark:from-neutral-800 dark:via-neutral-950 dark:to-stone-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Sveiciena sekcija ar animāciju */}
        <motion.div
          className="relative p-6 mb-8 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent dark:from-red-800/20 dark:via-red-900/10 dark:to-transparent rounded-2xl border border-blue-200/20 dark:border-red-800/20 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            {/* Lapas virsraksts un sveiciena teksts */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                {t('dashboard.title')}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                {t('dashboard.welcomeBack')}
              </p>
            </div>

            {/* Lietotāja profila kartīte */}
            <motion.div
              className="mt-4 md:mt-0 md:ml-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white/50 dark:bg-neutral-800/30 px-6 py-4 rounded-xl border border-blue-200/30 dark:border-red-700/30 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-4">
                  {/* Lietotāja profila attēls vai noklusējuma ikona */}
                  <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user?.name || 'User Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-red-600 dark:to-red-700 flex items-center justify-center">
                        <User size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                  {/* Lietotāja informācija */}
                  <div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      {t('common.welcome')},
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      {user?.name || user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Dashboard tabs konteiners */}
        <motion.div
          className="bg-white/80 dark:bg-stone-950/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md border border-blue-200/30 dark:border-red-800/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            {/* Tab navigācijas saraksts */}
            <TabsList className="w-full flex p-2 gap-2 border-b border-blue-200/30 dark:border-red-800/30 bg-blue-50/50 dark:bg-neutral-900/50">
              {/* Konfigurāciju tab */}
              <TabsTrigger
                value="configurations"
                className="flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white/90 data-[state=active]:border-brand-blue-200 data-[state=active]:text-brand-blue-600 dark:data-[state=active]:bg-neutral-800/90 dark:data-[state=active]:border-red-900/20 dark:data-[state=active]:text-red-400 data-[state=active]:shadow-lg hover:bg-white/80 dark:hover:bg-neutral-800/80 group"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-blue-500 to-brand-blue-600 dark:from-brand-red-600 dark:to-brand-red-700 shadow-md group-data-[state=active]:ring-4 group-data-[state=active]:ring-brand-blue-500/20 dark:group-data-[state=active]:ring-brand-red-500/20 transition-all">
                    <Cpu size={16} className="text-white" />
                  </div>
                  <span>{t('dashboard.myConfigurations')}</span>
                </div>
              </TabsTrigger>

              {/* Pasūtījumu tab */}
              <TabsTrigger
                value="orders"
                className="flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white/90 data-[state=active]:border-brand-blue-200 data-[state=active]:text-brand-blue-600 dark:data-[state=active]:bg-neutral-800/90 dark:data-[state=active]:border-red-900/20 dark:data-[state=active]:text-red-400 data-[state=active]:shadow-lg hover:bg-white/80 dark:hover:bg-neutral-800/80 group"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-blue-500 to-brand-blue-600 dark:from-brand-red-600 dark:to-brand-red-700 shadow-md group-data-[state=active]:ring-4 group-data-[state=active]:ring-brand-blue-500/20 dark:group-data-[state=active]:ring-brand-red-500/20 transition-all">
                    <Package size={16} className="text-white" />
                  </div>
                  <span>{t('dashboard.myOrders')}</span>
                </div>
              </TabsTrigger>

              {/* Profila tab */}
              <TabsTrigger
                value="profile"
                className="flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white/90 data-[state=active]:border-brand-blue-200 data-[state=active]:text-brand-blue-600 dark:data-[state=active]:bg-neutral-800/90 dark:data-[state=active]:border-red-900/20 dark:data-[state=active]:text-red-400 data-[state=active]:shadow-lg hover:bg-white/80 dark:hover:bg-neutral-800/80 group"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-blue-500 to-brand-blue-600 dark:from-brand-red-600 dark:to-brand-red-700 shadow-md group-data-[state=active]:ring-4 group-data-[state=active]:ring-brand-blue-500/20 dark:group-data-[state=active]:ring-brand-red-500/20 transition-all">
                    <User size={16} className="text-white" />
                  </div>
                  <span>{t('dashboard.profile')}</span>
                </div>
              </TabsTrigger>

              {/* Vēlmju saraksta tab */}
              <TabsTrigger
                value="wishlist"
                className="flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white/90 data-[state=active]:border-brand-blue-200 data-[state=active]:text-brand-blue-600 dark:data-[state=active]:bg-neutral-800/90 dark:data-[state=active]:border-red-900/20 dark:data-[state=active]:text-red-400 data-[state=active]:shadow-lg hover:bg-white/80 dark:hover:bg-neutral-800/80 group"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-blue-500 to-brand-blue-600 dark:from-brand-red-600 dark:to-brand-red-700 shadow-md group-data-[state=active]:ring-4 group-data-[state=active]:ring-brand-blue-500/20 dark:group-data-[state=active]:ring-brand-red-500/20 transition-all">
                    <Heart size={16} className="text-white" />
                  </div>
                  <span>{t('dashboard.wishlist')}</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Tab saturs */}
            <div className="p-6">
              {/* Konfigurāciju tab saturs */}
              <TabsContent value="configurations">
                <ConfigurationsTab
                  configurations={configurations}
                  loading={dataLoading}
                  error={error}
                  onRetry={() => handleTabChange('configurations')}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                  locale={locale}
                />
              </TabsContent>

              {/* Pasūtījumu tab saturs */}
              <TabsContent value="orders">
                <OrdersTab
                  orders={orders}
                  loading={dataLoading}
                  error={error}
                  onRetry={() => handleTabChange('orders')}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                  locale={locale}
                />
              </TabsContent>

              {/* Profila tab saturs */}
              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>

              {/* Vēlmju saraksta tab saturs */}
              <TabsContent value="wishlist">
                <WishlistTab />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
