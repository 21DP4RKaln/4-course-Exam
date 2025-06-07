'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/contexts/CartContext';
import Loading from '@/app/components/ui/Loading';
import {
  useLoading,
  LoadingSpinner,
  FullPageLoading,
  ButtonLoading,
} from '@/app/hooks/useLoading';
import {
  ShoppingCart,
  Heart,
  Filter,
  ChevronDown,
  Search,
  X,
  Info,
  AlertTriangle,
  Star,
  Cpu,
  Monitor,
  Keyboard,
  HardDrive,
  Layers,
  Zap,
} from 'lucide-react';

import type {
  ConfigurationProduct,
  ComponentProduct,
  PeripheralProduct,
} from '@/lib/services/universalProductService';

// Produktu tipu definīcija - apvieno visus iespējamos produktu tipus
type Product = ConfigurationProduct | ComponentProduct | PeripheralProduct;

interface FilterState {
  category: string;
  priceRange: [number, number];
  sort: string;
  search: string;
}

// Kategoriju masīvs ar ID un nosaukumiem
const getCategoriesArray = (t: any) => [
  { id: 'all', name: t('categories.all') },
  { id: 'gaming', name: t('categories.gaming') },
  { id: 'workstation', name: t('categories.workstation') },
  { id: 'office', name: t('categories.office') },
  { id: 'budget', name: t('categories.budget') },
  { id: 'cpu', name: t('categories.cpu') },
  { id: 'gpu', name: t('categories.gpu') },
  { id: 'motherboard', name: t('categories.motherboard') },
  { id: 'ram', name: t('categories.ram') },
  { id: 'storage', name: t('categories.storage') },
  { id: 'case', name: t('categories.case') },
  { id: 'cooling', name: t('categories.cooling') },
  { id: 'psu', name: t('categories.psu') },
  { id: 'keyboards', name: t('categories.keyboards') },
  { id: 'mice', name: t('categories.mice') },
  { id: 'monitors', name: t('categories.monitors') },
  { id: 'headphones', name: t('categories.headphones') },
];

/**
 * Galvenā produktu lapas komponente
 * Latvian: Šī komponente nodrošina:
 * - Produktu saraksta attēlošanu
 * - Filtru un meklēšanas funkcionalitāti
 * - Kategoriju navigāciju
 * - Produktu pievienošanu grozā
 */
export default function ProductsPage() {
  // Tulkošanas hook internationalizācijai
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = pathname.split('/')[1];
  const { addItem } = useCart();

  // Iegūst lokalizēto kategoriju masīvu
  const categories = getCategoriesArray(t);

  // Sākotnējā kategorija no URL parametriem
  const initialCategory = searchParams.get('category') || 'all';

  // Stāvokļa mainīgie
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtru stāvoklis ar sākotnējām vērtībām
  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    priceRange: [0, 5000],
    sort: 'price-asc',
    search: searchParams.get('search') || '',
  });

  // UI stāvokļa mainīgie
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [expandedSpecs, setExpandedSpecs] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url =
          filters.category === 'all'
            ? '/api/shop/product'
            : `/api/shop/product?category=${filters.category}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(t('productsPage.errors.loadingFailed'));
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setProducts(data);

          // Atjaunina URL parametrus
          const params = new URLSearchParams(searchParams.toString());
          params.set('category', filters.category);
          if (filters.search) {
            params.set('search', filters.search);
          } else {
            params.delete('search');
          }

          window.history.pushState({}, '', `${pathname}?${params.toString()}`);
        } else {
          throw new Error('Invalid response data');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(t('productsPage.errors.loadingFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.category, pathname, searchParams, t]);

  useEffect(() => {
    if (products.length === 0) return;

    let result = [...products];

    // Meklēšanas filtrs
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(product => {
        // Meklē produkta nosaukumā un aprakstā
        if (
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
        ) {
          return true;
        }

        // Meklē komponentu un perifērijas ierīču specifikācijās
        if (product.type === 'component' || product.type === 'peripheral') {
          return Object.values(product.specifications).some(
            spec =>
              typeof spec === 'string' &&
              spec.toLowerCase().includes(searchTerm)
          );
        }

        // Meklē konfigurāciju komponentos
        if (product.type === 'configuration') {
          return product.components.some(component =>
            component.name.toLowerCase().includes(searchTerm)
          );
        }

        return false;
      });
    }

    // Cenu diapazons filtrs
    result = result.filter(product => {
      const price = product.discountPrice || product.price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Kārtošana pēc izvēlētās opcijas
    switch (filters.sort) {
      case 'price-asc':
        result.sort(
          (a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price)
        );
        break;
      case 'price-desc':
        result.sort(
          (a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price)
        );
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating-desc':
        result.sort(
          (a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0)
        );
        break;
    }

    setFilteredProducts(result);
  }, [filters, products]);

  const toggleSpecs = (id: string) => {
    if (expandedSpecs === id) {
      setExpandedSpecs(null);
    } else {
      setExpandedSpecs(id);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      type: product.type,
      name: product.name,
      price: product.discountPrice || product.price,
      imageUrl: product.imageUrl || '',
    });
  };

  const resetFilters = () => {
    setFilters({
      category: filters.category,
      priceRange: [0, 5000],
      sort: 'price-asc',
      search: '',
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    window.history.pushState({}, '', `${pathname}?${params.toString()}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'gaming':
      case 'workstation':
      case 'office':
      case 'budget':
        return <Monitor size={20} className="mr-2 text-red-500" />;
      case 'configuration':
        return <Monitor size={20} className="mr-2 text-red-500" />;
      case 'cpu':
        return <Cpu size={20} className="mr-2 text-red-500" />;
      case 'gpu':
      case 'graphics card':
      case 'monitors':
        return <Monitor size={20} className="mr-2 text-red-500" />;
      case 'motherboard':
        return <Cpu size={20} className="mr-2 text-red-500" />;
      case 'ram':
      case 'memory':
        return <HardDrive size={20} className="mr-2 text-red-500" />;
      case 'storage':
        return <HardDrive size={20} className="mr-2 text-red-500" />;
      case 'case':
        return <Layers size={20} className="mr-2 text-red-500" />;
      case 'cooling':
        return <Monitor size={20} className="mr-2 text-red-500" />;
      case 'psu':
      case 'power supply':
        return <Zap size={20} className="mr-2 text-red-500" />;
      case 'keyboards':
      case 'mice':
      case 'headphones':
        return <Keyboard size={20} className="mr-2 text-red-500" />;
      default:
        return <Cpu size={20} className="mr-2 text-red-500" />;
    }
  };

  const getProductTypeDisplay = (product: Product) => {
    if (product.type === 'configuration') {
      return 'PC Configuration';
    }

    if (product.type === 'component' || product.type === 'peripheral') {
      return product.category;
    }

    return 'Product';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto text-center py-16">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          {error}
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Galvenes sadaļa ar virsrakstu un meklēšanu */}
      <div className="flex flex-wrap items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4 md:mb-0">
          {filters.category === 'all'
            ? t('categories.all')
            : categories.find(cat => cat.id === filters.category)?.name ||
              t('productsPage.title')}
        </h1>

        {/* Meklēšanas josla - darbvirsmas versija */}
        <div className="hidden md:flex w-full md:w-auto">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search
                size={18}
                className="text-neutral-500 dark:text-neutral-400"
              />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={e => {
                setFilters({ ...filters, search: e.target.value });

                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) {
                  params.set('search', e.target.value);
                } else {
                  params.delete('search');
                }
                window.history.pushState(
                  {},
                  '',
                  `${pathname}?${params.toString()}`
                );
              }}
              placeholder={t('common.search')}
              className="block w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {/* Meklēšanas notīrīšanas poga */}
            {filters.search && (
              <button
                onClick={() => {
                  setFilters({ ...filters, search: '' });

                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('search');
                  window.history.pushState(
                    {},
                    '',
                    `${pathname}?${params.toString()}`
                  );
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kategoriju rinda */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-md whitespace-nowrap flex items-center ${
                filters.category === category.id
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-100 dark:bg-stone-950 text-stone-950 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
              onClick={() => setFilters({ ...filters, category: category.id })}
            >
              {getCategoryIcon(category.id)}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Meklēšanas josla - mobilā versija */}
      <div className="md:hidden mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search
              size={18}
              className="text-neutral-500 dark:text-neutral-400"
            />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={e => {
              setFilters({ ...filters, search: e.target.value });

              const params = new URLSearchParams(searchParams.toString());
              if (e.target.value) {
                params.set('search', e.target.value);
              } else {
                params.delete('search');
              }
              window.history.pushState(
                {},
                '',
                `${pathname}?${params.toString()}`
              );
            }}
            placeholder={t('common.search')}
            className="w-full pl-10 pr-10 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {filters.search && (
            <button
              onClick={() => {
                setFilters({ ...filters, search: '' });

                const params = new URLSearchParams(searchParams.toString());
                params.delete('search');
                window.history.pushState(
                  {},
                  '',
                  `${pathname}?${params.toString()}`
                );
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Galvenā satura zona ar sānjoslu un produktu režģi */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtru sānjosla - darbvirsmas versija */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
                <Filter size={18} className="mr-2" />
                {t('productsPage.filters')}
              </h2>
              <button
                onClick={resetFilters}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                {t('productsPage.messages.clearFilters')}
              </button>
            </div>

            {/* Cenu diapazons filtrs */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
                {t('productsPage.priceRange')}
              </h3>
              <div className="flex items-center space-x-4 mb-2">
                <div className="w-full">
                  <label className="sr-only">Minimum Price</label>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.priceRange[0]}
                    onChange={e =>
                      setFilters({
                        ...filters,
                        priceRange: [
                          parseInt(e.target.value),
                          filters.priceRange[1],
                        ],
                      })
                    }
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-red-600 dark:bg-neutral-700"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-3">
                <div className="w-full">
                  <label className="sr-only">Maximum Price</label>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={e =>
                      setFilters({
                        ...filters,
                        priceRange: [
                          filters.priceRange[0],
                          parseInt(e.target.value),
                        ],
                      })
                    }
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-red-600 dark:bg-neutral-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  €{filters.priceRange[0]}
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  €{filters.priceRange[1]}
                </span>
              </div>
            </div>

            {/* Kārtošanas opcijas */}
            <div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
                {t('productsPage.sortBy')}
              </h3>
              <select
                value={filters.sort}
                onChange={e => setFilters({ ...filters, sort: e.target.value })}
                className="block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="price-asc">
                  {t('productsPage.sortOptions.priceAsc')}
                </option>
                <option value="price-desc">
                  {t('productsPage.sortOptions.priceDesc')}
                </option>
                <option value="name-asc">
                  {t('productsPage.sortOptions.name')} A-Z
                </option>
                <option value="name-desc">
                  {t('productsPage.sortOptions.name')} Z-A
                </option>
                <option value="rating-desc">
                  {t('productsPage.sortOptions.rating')}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobilais filtru panelis */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="w-full flex items-center justify-center py-2 px-4 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-stone-950 text-neutral-700 dark:text-neutral-300"
          >
            <Filter size={18} className="mr-2" />
            {t('productsPage.filters')}
            <ChevronDown
              size={18}
              className={`ml-2 ${isMobileFilterOpen ? 'rotate-180' : ''} transform transition-transform`}
            />
          </button>
        </div>

        {/* Mobilais filtru panelis */}
        {isMobileFilterOpen && (
          <div className="md:hidden bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {t('productsPage.filters')}
              </h2>
              <button
                onClick={resetFilters}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                {t('productsPage.messages.clearFilters')}
              </button>
            </div>

            {/* Mobilā versijas filtru saturs - vienkāršota versija */}
            <div className="space-y-6">
              {/* Kārtošanas opcijas */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  {t('productsPage.sortBy')}
                </h3>
                <select
                  value={filters.sort}
                  onChange={e =>
                    setFilters({ ...filters, sort: e.target.value })
                  }
                  className="block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="price-asc">
                    {t('productsPage.sortOptions.priceAsc')}
                  </option>
                  <option value="price-desc">
                    {t('productsPage.sortOptions.priceDesc')}
                  </option>
                  <option value="name-asc">
                    {t('productsPage.sortOptions.name')} A-Z
                  </option>
                  <option value="name-desc">
                    {t('productsPage.sortOptions.name')} Z-A
                  </option>
                  <option value="rating-desc">
                    {t('productsPage.sortOptions.rating')}
                  </option>
                </select>
              </div>

              {/* Cenu diapazons filtrs */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  {t('productsPage.priceRange')}: €{filters.priceRange[0]} - €
                  {filters.priceRange[1]}
                </h3>
                <div className="flex items-center space-x-4 mb-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    €0
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={e =>
                      setFilters({
                        ...filters,
                        priceRange: [
                          filters.priceRange[0],
                          parseInt(e.target.value),
                        ],
                      })
                    }
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-red-600 dark:bg-neutral-700"
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    €5000
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 px-4 border border-neutral-300 dark:border-neutral-600 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        )}

        {/* Galvenais produktu režģis */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-8 text-center">
              <Info size={48} className="mx-auto text-neutral-400 mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {t('productsPage.messages.noResults')}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                {t('productsPage.messages.noResults')}
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {t('productsPage.messages.clearFilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Produktu karte ar lokalizētiem tekstiem */}
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-stone-950 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Produkta attēls */}
                  <div className="relative h-48 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={(
                          product.imageUrl || '/images/product-placeholder.svg'
                        ).trim()}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {getProductTypeDisplay(product)}
                      </span>
                    )}

                    {/* Kategorijas iezīme */}
                    <span className="absolute top-2 left-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs px-2 py-1 rounded">
                      {getProductTypeDisplay(product)}
                    </span>

                    {/* Krājuma indikators */}
                    <span
                      className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${
                        product.stock <= 3
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}
                    >
                      {product.stock <= 0
                        ? t('common.outOfStock')
                        : product.stock <= 3
                          ? `${t('common.onlyLeft')} ${product.stock}`
                          : t('common.inStock')}
                    </span>

                    {/* Ātrās darbības pogas */}
                    {hoveredProduct === product.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                            aria-label="Add to cart"
                            disabled={product.stock <= 0}
                          >
                            <ShoppingCart size={20} />
                          </button>
                          <button
                            className="p-2 bg-white text-neutral-900 rounded-full hover:bg-neutral-100"
                            aria-label="Add to wishlist"
                          >
                            <Heart size={20} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Novērtējuma zvaigznes */}
                    <div className="flex items-center mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < Math.floor(product.ratings?.average || 0)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-neutral-300 dark:text-neutral-600'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
                        ({product.ratings?.count || 0})
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                        <Link
                          href={`/${locale}/product/${product.id}`}
                          className="hover:text-red-600 dark:hover:text-red-400"
                        >
                          {product.name}
                        </Link>
                      </h3>
                      <button
                        onClick={() => toggleSpecs(product.id)}
                        className={`text-red-600 dark:text-red-400 hover:underline text-sm ${
                          product.type !== 'component' &&
                          product.type !== 'peripheral'
                            ? 'invisible'
                            : ''
                        }`}
                      >
                        Specs
                      </button>
                    </div>

                    <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2 mb-3">
                      {product.description}
                    </p>

                    {/* Izvērstās specifikācijas */}
                    {expandedSpecs === product.id &&
                      (product.type === 'component' ||
                        product.type === 'peripheral') && (
                        <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-md mb-3">
                          <ul className="text-sm space-y-1">
                            {Object.entries(product.specifications)
                              .slice(0, 4)
                              .map(([key, value]) => (
                                <li
                                  key={key}
                                  className="flex items-start text-neutral-700 dark:text-neutral-300"
                                >
                                  <span className="font-medium mr-1">
                                    {key}:
                                  </span>{' '}
                                  {value}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                    <div className="flex items-end justify-between">
                      <div>
                        {product.discountPrice ? (
                          <div>
                            <span className="text-xl font-bold text-neutral-900 dark:text-white">
                              €{product.discountPrice.toFixed(2)}
                            </span>
                            <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400 line-through">
                              €{product.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-neutral-900 dark:text-white">
                            €{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          href={`/${locale}/product/${product.id}`}
                          className="p-2 text-neutral-700 border border-neutral-300 dark:border-neutral-600 dark:text-neutral-300 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                          {t('common.view')}
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                          className="p-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
