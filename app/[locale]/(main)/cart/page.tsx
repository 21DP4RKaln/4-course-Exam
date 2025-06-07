'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/app/contexts/CartContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft } from 'lucide-react';

// Animāciju konfigurācijas objekti
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const cartItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function CartPage() {
  // Inicializē hooks un states
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1];
  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();

  // State mainīgie promo koda un maksājuma apstrādei
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  // Funkcija preču daudzuma maiņai
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  // Promo koda validācijas funkcija
  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError(t('cart.enterPromoCode'));
      return;
    }

    console.log('Starting promo code validation...');
    setPromoError('');
    setPromoMessage('');

    const requestData = {
      code: promoCode.trim(),
      total: totalPrice,
    };
    console.log('Sending request data:', requestData);

    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        setPromoError('Server returned invalid response');
        setPromoDiscount(0);
        return;
      }

      if (!response.ok) {
        console.error(
          'Promo code validation failed with status:',
          response.status,
          data
        );
        if (response.status === 400) {
          setPromoError(t('cart.invalidPromoCode'));
        } else {
          setPromoError(t('cart.promoValidationFailed'));
        }
        setPromoDiscount(0);
        return;
      }

      // Pārbauda vai kods ir derīgs
      if (!data.valid) {
        setPromoError(t('cart.invalidPromoCode'));
        setPromoDiscount(0);
        return;
      }

      // Piemēro atlaidi
      setPromoError('');
      setPromoDiscount(data.discount || 0);

      if (data.discountPercentage) {
        const successMessage = `${promoCode.toUpperCase()} - ${data.discountPercentage}% off applied`;
        setPromoMessage(successMessage);
        console.log('Success:', successMessage);
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoError(t('cart.promoValidationFailed'));
      setPromoDiscount(0);
    }
  };

  const finalTotal = totalPrice - promoDiscount;

  const handleCheckout = () => {
    setIsProcessing(true);
    const checkoutUrl = new URL(`/${locale}/checkout`, window.location.origin);

    if (promoDiscount > 0 && promoCode) {
      checkoutUrl.searchParams.set('promo', promoCode);
    }

    if (!isAuthenticated) {
      checkoutUrl.searchParams.set('guest', 'true');
    }

    router.push(checkoutUrl.pathname + checkoutUrl.search);
    setIsProcessing(false);
  };

  // Ja grozs ir tukšs, parāda atbilstošu ziņojumu
  if (items.length === 0) {
    return (
      <motion.div
        className="max-w-4xl mx-auto text-center py-12"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <motion.div
          className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-8 border border-neutral-200 dark:border-neutral-800 hover:border-brand-blue-200 dark:hover:border-brand-red-800 transition-all duration-300"
          variants={slideUp}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <ShoppingBag size={48} className="mx-auto text-neutral-400 mb-4" />
          </motion.div>
          <motion.h1
            className="text-2xl font-bold text-neutral-900 dark:text-white mb-4"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {t('cart.empty')}
          </motion.h1>{' '}
          <motion.p
            className="text-neutral-600 dark:text-neutral-400 mb-8"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {t('cart.emptyMessage')}
          </motion.p>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ x: -5, transition: { duration: 0.2 } }}
          >
            <Link
              href={`/${locale}/`}
              className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
            >
              <ChevronLeft className="inline-block mr-2" size={20} />
              {t('cart.continueShoping')}
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Grozā izskats
  return (
    <motion.section
      className="py-8"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <motion.div className="w-full max-w-7xl" variants={slideUp}>
            <motion.div
              className="bg-white dark:bg-stone-950 rounded-2xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-brand-blue-200 dark:hover:border-brand-red-800 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            >
              <div className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Kreisā puse - Groza preces */}
                  <div className="lg:col-span-8">
                    <div className="p-8">
                      <motion.div
                        className="flex justify-between items-center mb-8"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {' '}
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                          {t('cart.shoppingCart')}
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                          {t('cart.items')}
                        </p>
                      </motion.div>

                      <hr className="my-6 border-neutral-200 dark:border-neutral-700" />

                      {/* Preču saraksts ar animācijām */}
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        <AnimatePresence>
                          {items.map((item, index) => (
                            <motion.div
                              key={item.id}
                              variants={cartItemVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              custom={index}
                              layout
                            >
                              <div className="flex items-center py-6">
                                {/* Preces attēls */}
                                <motion.div
                                  className="relative w-20 h-20 lg:w-24 lg:h-24 bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-600"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Image
                                    src={
                                      item.imageUrl ||
                                      '/images/product-placeholder.svg'
                                    }
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 80px, 96px"
                                    priority
                                  />
                                </motion.div>
                                {/* Preces detaļas */}
                                <div className="ml-6 flex-1">
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {item.type === 'component'
                                      ? t('cart.itemType.component')
                                      : t('cart.itemType.configuration')}
                                  </p>{' '}
                                  <motion.div
                                    whileHover={{ x: 3 }}
                                    transition={{
                                      type: 'spring',
                                      stiffness: 400,
                                    }}
                                  >
                                    <Link
                                      href={
                                        item.type === 'component'
                                          ? `/${locale}/components/${item.id}`
                                          : `/${locale}/shop/product/${item.id}`
                                      }
                                      className="hover:text-brand-blue-600 dark:hover:text-brand-red-500 transition-colors"
                                    >
                                      <h3 className="text-base font-medium text-neutral-900 dark:text-white">
                                        {item.name}
                                      </h3>
                                    </Link>
                                  </motion.div>
                                </div>
                                {/* Daudzuma kontroles */}{' '}
                                <div className="flex items-center mx-4">
                                  <motion.button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.id,
                                        item.quantity - 1
                                      )
                                    }
                                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label={t('cart.decreaseQuantity')}
                                  >
                                    <Minus size={16} />
                                  </motion.button>

                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={e =>
                                      handleQuantityChange(
                                        item.id,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-16 mx-2 text-center border border-neutral-300 dark:border-neutral-600 rounded-md py-1 text-neutral-900 dark:text-white bg-white dark:bg-stone-950"
                                    min="0"
                                    aria-label={t('cart.quantity')}
                                  />

                                  <motion.button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.id,
                                        item.quantity + 1
                                      )
                                    }
                                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label={t('cart.increaseQuantity')}
                                  >
                                    <Plus size={16} />
                                  </motion.button>
                                </div>
                                {/* Dzēšanas poga */}
                                <motion.button
                                  onClick={() => removeItem(item.id)}
                                  className="ml-4 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
                                  whileHover={{ scale: 1.1, color: '#ef4444' }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Trash2 size={20} />
                                </motion.button>
                              </div>
                              {index < items.length - 1 && (
                                <hr className="my-6 border-neutral-200 dark:border-neutral-700" />
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>

                      <hr className="my-6 border-neutral-200 dark:border-neutral-700" />

                      {/* Atpakaļ uz veikalu saite */}
                      <div className="pt-8">
                        <motion.div
                          whileHover={{ x: -5 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <Link
                            href={`/${locale}/`}
                            className="inline-flex items-center text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                          >
                            <ChevronLeft className="mr-2" size={20} />
                            {t('cart.backToShop')}
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Labā puse - Pasūtījuma kopsavilkums */}
                  <motion.div
                    className="lg:col-span-4 bg-neutral-50 dark:bg-stone-900 border-l border-neutral-200 dark:border-neutral-800"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="p-8">
                      <motion.h2
                        className="text-2xl font-bold mb-8 text-neutral-900 dark:text-white"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        {t('cart.summary')}
                      </motion.h2>

                      <hr className="my-6 border-neutral-200 dark:border-neutral-700" />

                      {/* Starpsumma */}
                      <motion.div
                        className="flex justify-between mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <h5 className="text-sm text-neutral-600 dark:text-neutral-400">
                          {t('cart.subtotal')}
                        </h5>
                        <h5 className="text-neutral-900 dark:text-white">
                          € {totalPrice.toFixed(2)}
                        </h5>
                      </motion.div>

                      {/* Promo atlaides rādīšana */}
                      <AnimatePresence>
                        {promoDiscount > 0 && (
                          <motion.div
                            className="flex justify-between mb-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h5 className="text-sm text-green-600 dark:text-green-400">
                              {t('cart.promoDiscount')}
                            </h5>
                            <h5 className="text-green-600 dark:text-green-400">
                              -€ {promoDiscount.toFixed(2)}
                            </h5>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <hr className="my-6 border-neutral-200 dark:border-neutral-700" />

                      {/* Kopējā summa */}
                      <motion.div
                        className="flex justify-between mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <h5 className="text-sm uppercase font-medium text-neutral-900 dark:text-white">
                          {t('cart.totalPrice')}
                        </h5>
                        <motion.h5
                          className="text-lg font-bold text-neutral-900 dark:text-white"
                          key={finalTotal}
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.5 }}
                        >
                          € {finalTotal.toFixed(2)}
                        </motion.h5>
                      </motion.div>

                      {/* Promo koda ievade */}
                      <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <input
                          type="text"
                          placeholder={t('cart.promoCode')}
                          value={promoCode}
                          onChange={e =>
                            setPromoCode(e.target.value.toUpperCase())
                          }
                          className="w-full p-3 rounded-md bg-white dark:bg-stone-800 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white uppercase"
                          style={{ textTransform: 'uppercase' }}
                        />
                        <AnimatePresence>
                          {promoError && (
                            <motion.p
                              className="text-red-500 text-sm mt-2"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              {promoError}
                            </motion.p>
                          )}
                        </AnimatePresence>
                        <motion.button
                          onClick={validatePromoCode}
                          className="mt-4 w-full py-2 bg-neutral-900 dark:bg-neutral-800 text-white rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors duration-200 font-medium"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {t('cart.applyPromoCode')}
                        </motion.button>
                      </motion.div>

                      <hr className="my-6 border-neutral-200 dark:border-neutral-700" />

                      {/* Maksājuma poga */}
                      <motion.button
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-full py-4 bg-neutral-900 dark:bg-neutral-800 text-white rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                            {t('cart.processing')}
                          </div>
                        ) : !isAuthenticated ? (
                          t('cart.checkoutAsGuest')
                        ) : (
                          t('cart.checkout')
                        )}
                      </motion.button>

                      {/* Pieteikšanās saite neautentificētiem lietotājiem */}
                      {!isAuthenticated && (
                        <motion.div
                          className="mt-4 text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          <Link
                            href={`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`}
                            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                          >
                            {t('cart.alreadyHaveAccount')}
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
