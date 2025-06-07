/**
 * Universālā produkta lapa - UniversalProductPage
 *
 * Šis komponents ir atbildīgs par produktu detalizētās informācijas attēlošanu
 * visiem produktu veidiem (konfigurācijas, komponenti, perifērija).
 *
 * Galvenās funkcijas:
 * - Produkta informācijas ielāde no dažādiem API
 * - Dinamiska produkta veida noteikšana un attēlošana
 * - Groza un vēlmju saraksta pārvaldība
 * - Produkta kopīgošana un saglabāšana
 * - Specifikāciju un atsauksmju attēlošana
 * - Daudzvalodu atbalsts ar internationalizāciju
 *
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/contexts/CartContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import SpecificationsTable from '../Shop/SpecificationsTable';
import { useProductView } from '@/app/hooks/useProductView';
import ReviewSystem from '../ReviewSystem/ReviewSystem';
import Loading from '@/app/components/ui/Loading';
import {
  useLoading,
  LoadingSpinner,
  FullPageLoading,
  ButtonLoading,
} from '@/app/hooks/useLoading';
import { parseSpecifications } from '@/lib/utils/specifications';
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Copy,
} from 'lucide-react';
import AnimatedButton from '@/app/components/ui/animated-button';

/**
 * Produkta kopīgās īpašības - izmanto visiem produktu veidiem
 */

/**
 * Produkta kopīgās īpašības - izmanto visiem produktu veidiem
 */
interface ProductCommonProps {
  id: string;
  type: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  stock: number;
  longDescription?: string;
  ratings?: {
    average: number;
    count: number;
  };
}

/**
 * Konfigurācijas produkts - gatavs dators ar komponentu sarakstu
 */
interface ConfigurationProduct extends ProductCommonProps {
  type: 'configuration';
  components: any[];
}

/**
 * Komponenta produkts - atsevišķa datora sastāvdaļa
 */
interface ComponentProduct extends ProductCommonProps {
  type: 'component';
  category: string;
  specifications: Record<string, string>;
}

/**
 * Perifērijas produkts - papildu ierīces (klaviatūras, peles u.c.)
 */
interface PeripheralProduct extends ProductCommonProps {
  type: 'peripheral';
  category: string;
  specifications: Record<string, string>;
}

/**
 * Visi iespējamie produktu veidi
 */
type Product = ConfigurationProduct | ComponentProduct | PeripheralProduct;

/**
 * Komponenta props interfeisc
 */
interface UniversalProductPageProps {
  productId?: string;
}

/**
 * Galvenais universālās produkta lapas komponents
 * Apstrādā visus produktu veidus un nodrošina pilnu funkcionalitāti
 */
export default function UniversalProductPage({
  productId: propProductId,
}: UniversalProductPageProps) {
  // Iegūstam produkta ID no URL parametriem vai props
  const params = useParams();
  const routeProductId = params?.id as string;
  const productId = propProductId || routeProductId;

  // Iegūstam locale no URL parametriem
  const localeFromParams = params?.locale as string;

  // Debug informācija par produkta ID iegūšanu
  console.log('UniversalProductPage - params:', params);
  console.log('UniversalProductPage - routeProductId:', routeProductId);
  console.log('UniversalProductPage - propProductId:', propProductId);
  console.log('UniversalProductPage - final productId:', productId);
  console.log('UniversalProductPage - locale from params:', localeFromParams);

  // React hooks un navigācijas funkcijas
  const router = useRouter();

  // Tulkošanas hooks dažādām sadaļām
  const t = useTranslations('product');
  const tNav = useTranslations('nav');
  const tButtons = useTranslations('buttons');
  const tCommon = useTranslations('common');

  // Citi konteksti un hooks
  const pathname = usePathname();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Iegūstam locale drošticami no URL parametriem vai pathway
  const locale = localeFromParams || pathname.split('/')[1] || 'en';

  // Debug locale iegūšana
  console.log('Debug locale detection:');
  console.log('- localeFromParams:', localeFromParams);
  console.log('- pathname:', pathname);
  console.log('- pathname.split("/"):', pathname.split('/'));
  console.log('- pathname.split("/")[1]:', pathname.split('/')[1]);
  console.log('- final locale:', locale);

  // Komponenta stāvokļa mainīgie
  const [quantity, setQuantity] = useState(1); // Izvēlētais daudzums
  const [activeTab, setActiveTab] = useState('description'); // Aktīvā cilne
  const [product, setProduct] = useState<Product | null>(null); // Produkta dati
  const [loading, setLoading] = useState(true); // Ielādes stāvoklis
  const [error, setError] = useState<string | null>(null); // Kļūdas ziņojums
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]); // Saistītie produkti
  const [referrer, setReferrer] = useState<string | null>(null); // Iepriekšējā lapa
  const [isWishlisted, setIsWishlisted] = useState(false); // Vai produkts ir vēlmju sarakstā
  const [copied, setCopied] = useState(false); // Vai saite ir nokopēta

  // Noklusējuma attēla URL gadījumā, ja produktam nav attēla
  const defaultImageUrl = '/images/product-placeholder.svg';

  // Reģistrē produkta skatīšanos analītikas nolūkos
  useProductView(productId, product?.type);

  // Debug produkta ID iegūšanu
  // Debug produkta ID iegūšanu
  useEffect(() => {
    console.log('ProductID in UniversalProductPage:', productId);
    console.log('Current locale:', locale);
    console.log('Locale from params:', localeFromParams);
    console.log('Current pathname:', pathname);
    console.log('Pathname split:', pathname.split('/'));
  }, [productId, locale, localeFromParams, pathname]);

  /**
   * Iepriekšējās lapas URL iegūšana
   * Izmanto, lai varētu atgriezties uz iepriekšējo lapu
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ref = document.referrer;
      const origin = window.location.origin;
      console.log('Document referrer:', ref);
      console.log('Current origin:', origin);

      if (ref && ref.startsWith(origin)) {
        const referrerPath = ref.substring(origin.length);
        console.log('Referrer path:', referrerPath);

        // Neiestatām referrer, ja tas ir tā pati produkta lapa
        if (
          !referrerPath.includes(`/product/${productId}`) &&
          referrerPath !== window.location.pathname
        ) {
          setReferrer(referrerPath);
          console.log('Set referrer to:', referrerPath);
        }
      }
    }
  }, [productId]);

  /**
   * Produkta datu ielāde no API
   * Mēģina ielādēt produktu no dažādiem endpoint'iem atkarībā no veida
   */
  useEffect(() => {
    const fetchProduct = async () => {
      // Pārbauda vai produkta ID ir pieejams
      if (!productId) {
        setError(t('productIdMissing'));
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Attempting to fetch product with ID:', productId);

        // Pievienojam timestamp, lai novērstu cache problēmas
        let timestamp = new Date().getTime();
        let response = await fetch(
          `/api/shop/product/${productId}?_t=${timestamp}`
        );
        let responseText = await response.clone().text();
        console.log('First API response status:', response.status);
        console.log(
          'First API response body preview:',
          responseText.substring(0, 200)
        );

        // Ja nav atrasts, mēģinām komponentu API
        if (response.status === 404) {
          console.log('Trying components API...');
          response = await fetch(
            `/api/shop/product/components/${productId}?_t=${timestamp}`
          );
          responseText = await response.clone().text();
          console.log('Components API response status:', response.status);
          console.log(
            'Components API response body preview:',
            responseText.substring(0, 200)
          );

          // Ja joprojām nav atrasts, mēģinām perifērijas API
          if (response.status === 404) {
            console.log('Trying peripherals API...');
            response = await fetch(
              `/api/shop/product/peripherals/${productId}?_t=${timestamp}`
            );
            responseText = await response.clone().text();
            console.log('Peripherals API response status:', response.status);
            console.log(
              'Peripherals API response body preview:',
              responseText.substring(0, 200)
            );
          }
        }

        // Kļūdu apstrāde
        if (!response.ok) {
          if (response.status === 404) {
            setError(t('productNotFound'));
          } else {
            setError(t('failedToLoad'));
          }
          setLoading(false);
          return;
        }

        const data = await response.json();

        // Pārbauda vai dati ir korekti
        if (!data || typeof data !== 'object' || !data.name) {
          throw new Error(t('invalidProductData'));
        }

        // Specifikāciju parsēšana un sagatavošana
        if (data.specifications) {
          const origSpecs = data.specifications;
          data.specifications = parseSpecifications(data.specifications);
          console.log('Original specifications:', origSpecs);
          console.log('Parsed specifications:', data.specifications);
        } else {
          data.specifications = {};
        }

        console.log('Product data loaded:', data);
        console.log(
          'Specifications parsed:',
          data.specifications,
          'Type:',
          typeof data.specifications
        );
        console.log('Specifications keys:', Object.keys(data.specifications));

        setProduct(data);

        // Pārbauda vēlmju saraksta statusu, ja lietotājs ir autentificēts
        if (isAuthenticated) {
          checkWishlistStatus();
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error instanceof Error ? error.message : t('failedToLoad'));
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setError(t('productIdMissing'));
      setLoading(false);
    }
  }, [productId, isAuthenticated, t]);

  /**
   * Pārbauda vai produkts ir lietotāja vēlmju sarakstā
   */
  const checkWishlistStatus = async () => {
    if (!isAuthenticated || !productId || !product) return;

    try {
      const response = await fetch(
        `/api/wishlist/check?productId=${productId}`
      );
      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(data.isWishlisted);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  /**
   * Produkta pievienošana grozam
   */
  const handleAddToCart = () => {
    if (!product) return;

    addItem(
      {
        id: product.id,
        type: product.type,
        name: product.name,
        price: product.discountPrice || product.price,
        imageUrl: product.imageUrl ?? defaultImageUrl,
      },
      quantity
    );
  };

  /**
   * Tūlītēja pirkšana - pievieno grozam un pāriet uz groza lapu
   */
  const handleBuyNow = () => {
    handleAddToCart();
    router.push(`/${locale}/cart`);
  };

  /**
   * Produkta pievienošana/noņemšana no vēlmju saraksta
   */
  const handleWishlistToggle = async () => {
    // Ja lietotājs nav autentificēts, novirza uz pieteikšanās lapu
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    if (!product) return;

    try {
      const response = await fetch('/api/wishlist', {
        method: isWishlisted ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productType: product.type.toUpperCase(),
        }),
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  /**
   * Produkta saites kopīgošana
   * Kopē pašreizējās lapas URL uz starpliktuvi
   */
  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      // Atiestatām "nokopēts" statusu pēc 2 sekundēm
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  /**
   * Nosaka atgriešanās saiti atkarībā no produkta veida un iepriekšējās lapas
   */
  const getBackLink = () => {
    console.log('getBackLink called with:');
    console.log('- referrer:', referrer);
    console.log('- locale:', locale);
    console.log('- localeFromParams:', localeFromParams);
    console.log('- product type:', product?.type);
    console.log('- pathname:', pathname);

    // Pārbaudām vai locale ir derīgs
    const validLocales = ['en', 'lv', 'ru'];
    const currentLocale = validLocales.includes(locale) ? locale : 'en';
    console.log('- validated locale:', currentLocale);

    // Ja ir referrer un tas nav tā pati lapa, izmantojam to
    if (
      referrer &&
      !referrer.includes(`/product/${productId}`) &&
      !referrer.includes('/product/') &&
      referrer !== '/'
    ) {
      console.log('Using referrer:', referrer);
      return referrer;
    }

    // Ja nav produkta, atgriežamies uz shop ar pareizo locale
    if (!product) {
      const shopLink = `/${currentLocale}/shop`;
      console.log('No product, returning shop:', shopLink);
      return shopLink;
    }

    // Atgriešanās saite atkarībā no produkta veida ar pareizo locale
    let backLink;
    switch (product.type) {
      case 'configuration':
        backLink = `/${currentLocale}/shop/ready-made`;
        break;
      case 'component':
        backLink = `/${currentLocale}/components`;
        break;
      case 'peripheral':
        backLink = `/${currentLocale}/peripherals`;
        break;
      default:
        backLink = `/${currentLocale}/shop`;
    }

    console.log('Generated back link:', backLink);
    return backLink;
  };

  /**
   * Renderē specifikāciju sadaļu atkarībā no produkta veida
   */
  const renderSpecificationsSection = () => {
    if (!product) return null;

    // Konfigurācijas produktiem rāda komponentu sarakstu
    if (product.type === 'configuration') {
      const configProduct = product as ConfigurationProduct;
      return (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('components')}
          </h3>
          <div className="space-y-4">
            {configProduct.components.map(component => (
              <div key={component.id} className="p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {component.name}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {component.category}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    €{component.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // Komponentiem un perifērijai rāda specifikāciju tabulu
    else if (product.type === 'component' || product.type === 'peripheral') {
      const componentProduct = product as ComponentProduct | PeripheralProduct;
      let specs: Record<string, string> = {};

      // Specifikāciju parsēšana no dažādiem formātiem
      if (componentProduct.specifications) {
        if (typeof componentProduct.specifications === 'string') {
          try {
            const parsedSpecs = JSON.parse(componentProduct.specifications);
            if (typeof parsedSpecs === 'object' && parsedSpecs !== null) {
              Object.entries(parsedSpecs).forEach(([key, value]) => {
                specs[key] = String(value);
              });
            } else {
              specs = { raw: componentProduct.specifications };
            }
          } catch (e) {
            console.error('Failed to parse specifications string:', e);
            specs = { raw: componentProduct.specifications };
          }
        } else if (
          typeof componentProduct.specifications === 'object' &&
          componentProduct.specifications !== null
        ) {
          Object.entries(
            componentProduct.specifications as Record<string, any>
          ).forEach(([key, value]) => {
            specs[key] = String(value);
          });
        }
      }

      // Noņemam debug informāciju no specifikācijām
      const debugKeysToRemove = [
        '_debug_count',
        '_debug_keys',
        '_debug_timestamp',
      ];
      const displaySpecs = { ...specs };
      debugKeysToRemove.forEach(key => delete displaySpecs[key]);

      console.log('Rendering specifications:');
      console.log('- Type:', typeof componentProduct.specifications);
      console.log('- Raw specs:', componentProduct.specifications);
      console.log('- Final specs:', displaySpecs);
      console.log('- Keys count:', Object.keys(displaySpecs).length);
      console.log('- Keys:', Object.keys(displaySpecs));

      return (
        <div className="max-w-3xl mx-auto">
          {displaySpecs && Object.keys(displaySpecs).length > 0 ? (
            <SpecificationsTable
              specifications={displaySpecs}
              isExpanded={true}
              toggleExpand={() => {}}
            />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              {t('noSpecifications')}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  /**
   * Iegūst kategorijas nosaukumu attēlošanai atkarībā no produkta veida
   */
  const getCategoryDisplay = () => {
    if (!product) return '';

    if (product.type === 'configuration') {
      return t('pcConfiguration');
    } else if (product.type === 'component' || product.type === 'peripheral') {
      return (product as ComponentProduct | PeripheralProduct).category;
    }

    return '';
  };

  // Ielādes stāvokļa attēlošana
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    );
  }

  // Kļūdas vai produkta neesamības attēlošana
  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="p-8">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || t('productNotFound')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('productRemovedText')}
          </p>
          <AnimatedButton
            href={getBackLink()}
            title={t('backToShop')}
            direction="left"
          />
        </div>
      </div>
    );
  }

  // Galvenais produkta satura renderēšana
  return (
    <div className="max-w-7xl mx-auto">
      {/* Atgriešanās poga */}
      <div className="mb-6">
        <Link href={getBackLink()}>
          <AnimatedButton title={t('backToShop')} direction="left" />
        </Link>
      </div>

      <div className="p-6">
        {/* Produkta galvenā informācija - attēls un detaļas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Produkta attēls */}
          <div className="flex items-center justify-center">
            <img
              src={(product?.imageUrl || defaultImageUrl).trim()}
              alt={product?.name}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Produkta detaļas un pasūtīšanas sekcija */}
          <div className="flex flex-col">
            {/* Produkta nosaukums un kategorija */}
            <div className="mb-4">
              <span className="badge badge-destructive mb-2">
                {getCategoryDisplay()}
              </span>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>
            </div>

            {/* Cenas un noliktavas informācija */}
            <div className="mb-6">
              <div className="flex items-baseline mb-2">
                {product.discountPrice ? (
                  <>
                    <span className="product-price-display">
                      €{product.discountPrice.toFixed(2)}
                    </span>
                    <span className="product-price-original">
                      €{product.price.toFixed(2)}
                    </span>
                    <span className="product-discount-badge">
                      {t('saveAmount', {
                        amount: (
                          product.price - (product.discountPrice || 0)
                        ).toFixed(2),
                      })}
                    </span>
                  </>
                ) : (
                  <span className="product-price-display">
                    €{product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Noliktavas statusa indikators */}
              <div
                className={`product-stock-badge ${
                  product.stock <= 3
                    ? 'product-stock-low'
                    : product.stock > 0
                      ? 'product-stock-in'
                      : 'product-stock-out'
                }`}
              >
                {product.stock > 0
                  ? product.stock <= 3
                    ? t('onlyLeft', { count: product.stock })
                    : t('inStock')
                  : t('outOfStock')}
              </div>
            </div>

            {/* Daudzuma izvēle un pogas */}
            <div className="flex flex-col space-y-4 mt-auto">
              {/* Daudzuma izvēlētājs */}
              <div className="flex items-center">
                <span className="mr-4 text-gray-700 dark:text-gray-300">
                  {t('quantity')}:
                </span>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="product-quantity-btn"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-gray-900 dark:text-white min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="product-quantity-btn"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Galvenās darbības pogas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn btn-primary"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  {t('addToCart')}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="btn btn-secondary"
                >
                  {t('buyNow')}
                </button>
              </div>

              {/* Papildu darbības - vēlmes un kopīgošana */}
              <div className="flex space-x-4">
                <button
                  onClick={handleWishlistToggle}
                  className={`action-button ${
                    isWishlisted ? 'text-red-600 dark:text-red-400' : ''
                  }`}
                >
                  <Heart
                    size={18}
                    className={`mr-1 ${isWishlisted ? 'fill-current' : ''}`}
                  />
                  <span className="text-sm">
                    {isWishlisted ? t('saved') : t('addToWishlist')}
                  </span>
                </button>

                <button onClick={handleShare} className="action-button">
                  {copied ? (
                    <>
                      <CheckCircle size={18} className="mr-1" />
                      <span className="text-sm">{t('copied')}</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={18} className="mr-1" />
                      <span className="text-sm">{t('share')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Piegādes un garantijas informācija */}
            <div className="mt-8 space-y-3">
              <div className="product-info-icon">
                <Shield size={16} className="mr-2" />
                <span>{t('yearsWarranty', { years: 2 })}</span>
              </div>
              <div className="product-info-icon ps-4">
                <Clock size={16} className="mr-2" />
                <span>{t('deliveryTime')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalizētās informācijas cilnes */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`product-tab ${
                activeTab === 'description'
                  ? 'product-tab-active'
                  : 'product-tab-inactive'
              }`}
              onClick={() => setActiveTab('description')}
            >
              {t('description')}
            </button>
            <button
              className={`product-tab ${
                activeTab === 'specifications'
                  ? 'product-tab-active'
                  : 'product-tab-inactive'
              }`}
              onClick={() => setActiveTab('specifications')}
            >
              {t('specifications')}
            </button>
            <button
              className={`product-tab ${
                activeTab === 'reviews'
                  ? 'product-tab-active'
                  : 'product-tab-inactive'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              {t('reviews')}
            </button>
          </div>

          {/* Cilņu saturs */}
          <div className="p-6">
            {/* Apraksta cilne */}
            {activeTab === 'description' && (
              <div className="product-description">
                <p className="whitespace-pre-line">
                  {product.longDescription || product.description}
                </p>
              </div>
            )}

            {/* Specifikāciju cilne */}
            {activeTab === 'specifications' && renderSpecificationsSection()}

            {/* Atsauksmju cilne */}
            {activeTab === 'reviews' && (
              <ReviewSystem
                productId={product.id}
                productType={
                  product.type.toUpperCase() as
                    | 'CONFIGURATION'
                    | 'COMPONENT'
                    | 'PERIPHERAL'
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
