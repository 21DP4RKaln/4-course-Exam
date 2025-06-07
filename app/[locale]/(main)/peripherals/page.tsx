'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/app/components/ui/Loading';
import {
  useLoading,
  LoadingSpinner,
  FullPageLoading,
  ButtonLoading,
} from '@/app/hooks/useLoading';
import {
  AlertTriangle,
  ArrowLeft,
  Keyboard,
  Monitor,
  Headphones,
  Mouse,
  Gamepad,
  Printer,
  Speaker,
  Webcam,
  Tablet,
  Mic,
} from 'lucide-react';
import { MousepadIcon } from '@/app/components/ui/icons/MousepadIcon';
import CustomButton from '@/app/components/ui/TryAgainButton';
import AnimatedButton from '@/app/components/ui/animated-button';
import { motion, useInView } from 'framer-motion';

// Kategorijas interfeiss
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  componentCount: number;
}

/**
 * Perifērijas lapas komponente
 * Rāda perifērijas kategoriju sarakstu ar animācijām un ikonām
 */
export default function PeripheralsPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1];

  // Komponentes stāvokļi
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  // Animāciju atsauces
  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  // Animāciju varianti konteineram
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Animāciju varianti elementiem
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Animāciju varianti bannerim
  const bannerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  // Iegūst kategoriju datus no API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/peripherals');
        if (!response.ok)
          throw new Error('Failed to fetch peripheral categories');

        const data = await response.json();

        // Pārbauda un uzstāda kategorijas
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          throw new Error('Invalid response data');
        }

        // Pārbauda un uzstāda izceltos produktus
        if (data.featuredProducts && Array.isArray(data.featuredProducts)) {
          setFeaturedProducts(data.featuredProducts);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(
          'Failed to load peripheral categories. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /**
   * Atgriež atbilstošo ikonu kategorijas slug vērtībai
   * @param slug - kategorijas identifikators
   * @returns React ikona elements
   */
  const getCategoryIcon = (slug: string) => {
    // Normalizē slug - noņem 's' beigās, ja tas ir
    const normalizedSlug = slug.replace(/s$/, '').replace(/pads$/, 'pad');

    const iconMap: Record<string, JSX.Element> = {
      keyboard: <Keyboard size={30} className="text-red-500" />,
      mouse: <Mouse size={30} className="text-blue-500" />,
      monitor: <Monitor size={30} className="text-purple-500" />,
      headphone: <Headphones size={30} className="text-green-500" />,
      speaker: <Speaker size={30} className="text-indigo-500" />,
      gamepad: <Gamepad size={30} className="text-yellow-500" />,
      camera: <Webcam size={30} className="text-red-500" />,
      tablet: <Tablet size={30} className="text-orange-500" />,
      microphone: <Mic size={30} className="text-pink-500" />,
      mousepad: <MousepadIcon size={30} className="text-gray-500" />,
    };

    return (
      iconMap[normalizedSlug] ||
      iconMap[slug] || <Keyboard size={30} className="text-neutral-500" />
    );
  };

  // Definē kategoriju kārtību attēlošanai
  const getCategoriesInOrder = () => {
    const orderedSlugs = [
      // Pirmā rinda: keyboards, mice, monitors
      'keyboards',
      'mouse',
      'monitors',
      // Otrā rinda: headphones, microphones, speakers
      'headphones',
      'microphones',
      'speakers',
      // Trešā rinda: cameras, mouse pads, gamepads
      'cameras',
      'mousepads',
      'gamepads',
      // Ceturtā rinda: tablets
      'tablets',
    ];

    const orderedCategories: Category[] = [];
    const remainingCategories = [...categories];

    // Pievieno kategorijas noteiktajā secībā
    orderedSlugs.forEach(slug => {
      const categoryIndex = remainingCategories.findIndex(
        cat => cat.slug === slug || cat.slug === slug.replace(/s$/, '')
      );
      if (categoryIndex !== -1) {
        orderedCategories.push(remainingCategories[categoryIndex]);
        remainingCategories.splice(categoryIndex, 1);
      }
    });

    // Pievieno atlikušās kategorijas beigās
    orderedCategories.push(...remainingCategories);

    return orderedCategories;
  };

  // Ielādes stāvoklis
  if (loading) {
    return <FullPageLoading />;
  }

  // Kļūdas stāvoklis
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatedButton
          href={`/${locale}/`}
          title={t('categoryPage.backToHome')}
          direction="left"
          className="mb-6 inline-block"
        />
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          {error}
        </h2>
        <CustomButton
          onClick={() => window.location.reload()}
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 py-8"
    >
      {/* Navigācijas poga atpakaļ */}
      <div className="mb-6 flex justify-start">
        <AnimatedButton
          href={`/${locale}`}
          title={t('common.backToHome')}
          direction="left"
          className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
        />
      </div>

      {/* Lapas virsraksts */}
      <motion.h1
        variants={itemVariants}
        className="text-3xl font-bold text-neutral-900 dark:text-white mb-6"
      >
        {t('peripherals.title')}
      </motion.h1>

      {/* Lapas apraksts */}
      <motion.p
        variants={itemVariants}
        className="text-lg text-neutral-600 dark:text-neutral-400 mb-8"
      >
        {t('peripherals.description')}
      </motion.p>

      {/* Kategoriju režģis */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {getCategoriesInOrder().map(category => (
          <motion.div key={category.id} variants={itemVariants}>
            <Link
              href={`/${locale}/peripherals/${category.slug}`}
              className="block h-full bg-white dark:bg-stone-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6 h-full flex flex-col">
                {/* Kategorijas ikona */}
                <div className="mb-4">{getCategoryIcon(category.slug)}</div>
                {/* Kategorijas nosaukums */}
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  {(() => {
                    try {
                      return t(`categories.${category.slug}`) || category.name;
                    } catch (e) {
                      return category.name;
                    }
                  })()}
                </h2>
                {/* Kategorijas apraksts */}
                <p className="text-neutral-600 dark:text-neutral-400 mb-3 flex-grow">
                  {(() => {
                    try {
                      return t(`peripheralDescriptions.${category.slug}`);
                    } catch (e) {
                      return (
                        category.description ||
                        `Browse our selection of ${category.name.toLowerCase()}`
                      );
                    }
                  })()}
                </p>
                {/* Produktu skaits */}
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-auto">
                  {t('peripherals.productsAvailable', {
                    count: category.componentCount,
                  })}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA sekcija ar darbības aicinājumiem */}
      <div className="mt-12 bg-gradient-to-r from-blue-800 to-blue-950 dark:from-red-900/30 dark:to-neutral-900 rounded-lg border border-blue-700 dark:border-neutral-800 shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          {t('peripherals.buildingNewPc')}
        </h2>
        <p className="text-neutral-300 mb-6 max-w-2xl mx-auto">
          {t('peripherals.buildingDesc')}
        </p>
        {/* Darbības pogas */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${locale}/components`}
            className="px-6 py-3 bg-blue-600 dark:bg-red-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-red-700 border border-blue-500 dark:border-red-500"
          >
            <Keyboard size={18} className="inline-block mr-2" />
            {t('peripherals.browseComponents')}
          </Link>
          <Link
            href={`/${locale}/configurator`}
            className="px-6 py-3 bg-white text-neutral-900 rounded-md hover:bg-neutral-100 border border-neutral-300"
          >
            <Monitor size={18} className="inline-block mr-2" />
            {t('peripherals.configurePc')}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
