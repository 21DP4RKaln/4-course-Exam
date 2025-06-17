'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Component, Specification, CategoryPageProps } from './types';
import { FilterGroup, FilterOption } from './filterInterfaces';
import { createKeyboardFilterGroups } from './filters/keyboardFilters';
import { createMouseFilterGroups } from './filters/mouseFilters';
import { createHeadphonesFilterGroups } from './filters/headphonesFilters';
import { createMonitorFilterGroups } from './filters/monitorFilters';
import { createMicrophoneFilterGroups } from './filters/microphoneFilters';
import { createGpuFilterGroups } from './filters/gpuFilters';
import { createCpuFilterGroups } from './filters/cpuFilters';
import { createMotherboardFilterGroups } from './filters/motherboardFilters';
import { createRamFilterGroups } from './filters/ramFilters';
import { createStorageFilterGroups } from './filters/storageFilters';
import { createPsuFilterGroups } from './filters/psuFilters';
import { createCaseFilterGroups } from './filters/caseFilters';
import { createCoolingFilterGroups } from './filters/coolerFilters';
import { createCameraFilterGroups } from './filters/cameraFilters';
import { createSpeakerFilterGroups } from './filters/speakerFilters';
import { createMousePadFilterGroups } from './filters/mousePadFilters';
import { createGamepadFilterGroups } from './filters/gamepadFilters';
import {
  AlertTriangle,
  Info,
  Filter,
  Search,
  X,
  ChevronDown,
  Check,
  ShoppingCart,
  Star,
} from 'lucide-react';
import AnimatedButton from '@/app/components/ui/animated-button';
import ProductCard from '@/app/components/Shop/ProductCard';
import Loading from '@/app/components/ui/Loading';
import TryAgainButton from '@/app/components/ui/TryAgainButton';
import styled from 'styled-components';
import { useTheme } from '@/app/contexts/ThemeContext';

export default function CategoryPage({ params, type }: CategoryPageProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1];
  const pathParts = pathname.split('/');
  const categorySlug = pathParts[3];
  const [components, setComponents] = useState<Component[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, resolvedTheme } = useTheme();

  const maxPrice = useMemo(() => {
    if (components.length === 0) return 5000;
    return Math.max(...components.map(component => component.price));
  }, [components]);

  const minPrice = useMemo(() => {
    if (components.length === 0) return 0;
    return Math.min(...components.map(component => component.price));
  }, [components]);

  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 5000,
  });

  useEffect(() => {
    if (components.length > 0) {
      setPriceRange({ min: minPrice, max: maxPrice });
    }
  }, [components, minPrice, maxPrice]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [sortOption, setSortOption] = useState('price-asc');
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);

  // Organize specifications into filter groups
  const organizeFiltersIntoGroups = (specs: Specification[]): FilterGroup[] => {
    // Define common filter types
    const filterTypes = {
      manufacturer: ['brand', 'manufacturer', 'make'],
      performance: ['clock', 'speed', 'frequency', 'power', 'tdp'],
      memory: ['memory', 'ram', 'capacity', 'storage'],
      display: ['resolution', 'refresh', 'panel', 'size'],
      connectivity: ['port', 'interface', 'connection', 'wireless'],
      physical: ['dimension', 'size', 'weight', 'material'],
      features: ['rgb', 'lighting', 'fan', 'cooling'],
    };

    // Initialize filter groups
    const groupMap: Record<string, FilterGroup> = {};

    // Process specifications
    specs.forEach(spec => {
      if (!spec?.values?.length) return;

      const name = spec.name.toLowerCase();
      const displayName = spec.displayName || spec.name;

      // Determine group type
      let groupType = 'other';
      let groupTitle = displayName;

      // Check for manufacturer/brand first
      if (filterTypes.manufacturer.some(term => name.includes(term))) {
        groupType = 'manufacturer';
        groupTitle = t('categoryPage.filterGroups.manufacturer');
      }
      // Then check other filter types
      else {
        for (const [type, terms] of Object.entries(filterTypes)) {
          if (terms.some(term => name.includes(term))) {
            groupType = type;
            groupTitle = t(`categoryPage.filterGroups.${type}`);
            break;
          }
        }
      }

      // Get or create group
      if (!groupMap[groupType]) {
        groupMap[groupType] = {
          title: groupTitle,
          type: groupType,
          options: [],
        };
      }

      // Add options to group
      spec.values
        .filter(value => value && String(value).trim())
        .forEach(value => {
          const option = {
            id: `${spec.name}=${value}`,
            name: String(value).trim(),
          };

          // Check for duplicate before adding
          if (!groupMap[groupType].options.some(o => o.id === option.id)) {
            groupMap[groupType].options.push(option);
          }
        });
    });

    // Sort groups and their options
    const groups = Object.values(groupMap)
      .filter(g => g.options.length > 0)
      .sort((a, b) => {
        // Put manufacturer first
        if (a.type === 'manufacturer') return -1;
        if (b.type === 'manufacturer') return 1;
        return a.title.localeCompare(b.title);
      });

    // Sort options within each group
    groups.forEach(group => {
      group.options.sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  };

  // Extract specifications from components
  const extractSpecificationsFromComponents = (
    components: Component[]
  ): Specification[] => {
    // Map to store unique values for each specification
    const specValueMap = new Map<string, Set<string>>();

    // Helper to add a specification value
    const addSpecValue = (name: string, value: string) => {
      if (!specValueMap.has(name)) {
        specValueMap.set(name, new Set());
      }
      specValueMap.get(name)?.add(value);
    };

    // Process each component
    components.forEach(component => {
      if (!component.specifications) return;

      // Extract category type
      const category = (component.categoryName || '').toLowerCase();

      // Process each specification
      Object.entries(component.specifications).forEach(([key, rawValue]) => {
        if (!rawValue) return;

        const value = String(rawValue).trim();
        const keyLower = key.toLowerCase();

        // Add basic specification
        addSpecValue(key, value);

        // Special handling based on category and key
        if (category.includes('gpu') && keyLower.includes('memory')) {
          addSpecValue('vram', value);
        } else if (keyLower.includes('core') && keyLower.includes('clock')) {
          addSpecValue('core_clock', value);
        } else if (keyLower.includes('boost') && keyLower.includes('clock')) {
          addSpecValue('boost_clock', value);
        } else if (keyLower.includes('memory') && keyLower.includes('type')) {
          addSpecValue('memory_type', value);
        } else if (keyLower.includes('tdp') || keyLower.includes('power')) {
          addSpecValue('tdp', value);
        }
      });
    });

    // Convert map to specifications array
    const specifications: Specification[] = Array.from(specValueMap.entries())
      .map(([name, values]) => ({
        id: name,
        name,
        displayName: name
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        values: Array.from(values),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return specifications;
  };

  // Fetch and process component data
  useEffect(() => {
    // Create category helper
    const createCheckCategory = (slug?: string, name?: string) => {
      return (slugs: string[], namePatterns: string[]) => {
        if (!slug && !name) return false;
        return (
          (slug && slugs.includes(slug.toLowerCase())) ||
          (name &&
            namePatterns.some(pattern => name.toLowerCase().includes(pattern)))
        );
      };
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const resolvedParams = await params;
        const categorySlug = resolvedParams.category;
        const url = categorySlug
          ? `/api/shop/product/${type}s?category=${categorySlug}&locale=${locale}`
          : `/api/shop/product/${type}s?locale=${locale}`;

        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(
            t('categoryPage.fetchError', { type, details: errorData })
          );
        }

        const data = await response.json();

        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format');
        }
        if (data.error) {
          throw new Error(data.error);
        }

        // Set category name
        let currentCategoryName = '';
        if (data.categories?.length) {
          const category = data.categories.find(
            (cat: any) => cat.slug === categorySlug
          );
          currentCategoryName = category
            ? category.name
            : data.categories[0].name;
          setCategoryName(currentCategoryName);
        }

        // Process components
        if (data.components?.length) {
          setComponents(data.components);
          setFilteredComponents(data.components);

          // If no specifications provided, extract them from components
          if (!data.specifications?.length) {
            const extractedSpecs = extractSpecificationsFromComponents(
              data.components
            );
            data.specifications = extractedSpecs;
          }
        }
        if (data.specifications?.length) {
          setSpecifications(data.specifications);
          // Initialize category checker with resolved values
          const checkCategory = createCheckCategory(
            categorySlug,
            currentCategoryName
          );
          // Define category checks
          const categoryChecks = {
            isGpuCategory: checkCategory(
              ['graphics-cards', 'gpu'],
              ['gpu', 'graphics']
            ),
            isKeyboardCategory: checkCategory(
              ['keyboards', 'keyboard'],
              ['keyboard']
            ),
            isMouseCategory: checkCategory(['mice', 'mouse'], ['mouse']),
            isMousePadCategory: checkCategory(
              ['mouse-pads', 'mousepad', 'mouse-pad'],
              ['mouse pad', 'mousepad']
            ),
            isHeadphonesCategory: checkCategory(
              ['headphones', 'headset'],
              ['headphone', 'headset']
            ),
            isMonitorCategory: checkCategory(
              ['monitors', 'monitor', 'displays'],
              ['monitor', 'display']
            ),
            isMicrophoneCategory: checkCategory(
              ['microphones', 'microphone', 'mics'],
              ['microphone', 'mic']
            ),
            isCameraCategory: checkCategory(
              ['cameras', 'camera', 'webcams'],
              ['camera', 'webcam']
            ),
            isSpeakerCategory: checkCategory(
              ['speakers', 'speaker'],
              ['speaker']
            ),
            isGamepadCategory: checkCategory(
              ['gamepads', 'gamepad', 'controllers'],
              ['gamepad', 'controller']
            ),
            isCpuCategory: checkCategory(
              ['processors', 'cpus', 'cpu'],
              ['cpu', 'processor']
            ),
            isMotherboardCategory: checkCategory(
              ['motherboards', 'motherboard', 'mainboards'],
              ['motherboard']
            ),
            isRamCategory: checkCategory(['memory', 'ram'], ['ram', 'memory']),
            isStorageCategory: checkCategory(
              ['storage', 'drives', 'ssd', 'hdd'],
              ['storage', 'drive', 'ssd', 'hdd']
            ),
            isPsuCategory: checkCategory(
              ['power-supplies', 'psu'],
              ['psu', 'power supply']
            ),
            isCaseCategory: checkCategory(
              ['cases', 'case', 'chassis'],
              ['case', 'chassis']
            ),
            isCoolerCategory: checkCategory(
              ['coolers', 'cooling'],
              ['cooler', 'cooling']
            ),
          }; // Create filter groups
          let filterGroups: FilterGroup[] = []; // First, check if the API provided filterGroups (preferred)
          if (data.filterGroups && data.filterGroups.length > 0) {
            filterGroups = data.filterGroups;
          }
          // Otherwise, create filter groups from components (fallback)
          else if (data.components?.length) {
            // Use specialized filter creators based on category
            if (categoryChecks.isGpuCategory)
              filterGroups = createGpuFilterGroups(data.components);
            else if (categoryChecks.isKeyboardCategory)
              filterGroups = createKeyboardFilterGroups(data.components);
            else if (categoryChecks.isMouseCategory)
              filterGroups = createMouseFilterGroups(data.components);
            else if (categoryChecks.isMousePadCategory)
              filterGroups = createMousePadFilterGroups(data.components);
            else if (categoryChecks.isHeadphonesCategory)
              filterGroups = createHeadphonesFilterGroups(data.components);
            else if (categoryChecks.isMonitorCategory)
              filterGroups = createMonitorFilterGroups(data.components);
            else if (categoryChecks.isMicrophoneCategory)
              filterGroups = createMicrophoneFilterGroups(data.components);
            else if (categoryChecks.isCameraCategory)
              filterGroups = createCameraFilterGroups(data.components);
            else if (categoryChecks.isSpeakerCategory)
              filterGroups = createSpeakerFilterGroups(data.components);
            else if (categoryChecks.isGamepadCategory)
              filterGroups = createGamepadFilterGroups(data.components);
            else if (categoryChecks.isCpuCategory) {
              filterGroups = createCpuFilterGroups(data.components, t);
            } else if (categoryChecks.isMotherboardCategory)
              filterGroups = createMotherboardFilterGroups(data.components);
            else if (categoryChecks.isRamCategory)
              filterGroups = createRamFilterGroups(data.components);
            else if (categoryChecks.isStorageCategory)
              filterGroups = createStorageFilterGroups(data.components);
            else if (categoryChecks.isPsuCategory)
              filterGroups = createPsuFilterGroups(data.components);
            else if (categoryChecks.isCaseCategory)
              filterGroups = createCaseFilterGroups(data.components);
            else if (categoryChecks.isCoolerCategory)
              filterGroups = createCoolingFilterGroups(data.components);
          }

          // Fallback to generic filters if none created
          if (!filterGroups.length) {
            filterGroups = organizeFiltersIntoGroups(data.specifications);
          }
          // Ensure at least a manufacturer group
          if (!filterGroups.length) {
            filterGroups = [
              {
                title: t('categoryPage.filterGroups.manufacturer'),
                type: 'manufacturer',
                options: [],
              },
            ];
          }
          setFilterGroups(filterGroups); // Initialize filter states - collapse all filter sections by default
          const initialExpandedSections = filterGroups.reduce(
            (acc, group) => ({
              ...acc,
              [group.type]: false, // Collapse all sections by default for cleaner UI
            }),
            {}
          );

          const initialSelectedFilters = filterGroups.reduce(
            (acc, group) => ({
              ...acc,
              [group.type]: [],
            }),
            {}
          );

          setExpandedSections(initialExpandedSections);
          setSelectedFilters(initialSelectedFilters);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError(error instanceof Error ? error.message : String(error));
        setComponents([]);
        setFilteredComponents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, type, t]);

  const handleFilterChange = (type: string, value: string) => {
    setSelectedFilters(prev => {
      const current = [...(prev[type] || [])];
      const index = current.indexOf(value);

      if (index >= 0) {
        current.splice(index, 1);
      } else {
        current.push(value);
      }

      return {
        ...prev,
        [type]: current,
      };
    });
  };

  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  useEffect(() => {
    if (!components.length) return;

    let filtered = [...components];

    // Apply text search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(component => {
        // Check basic fields
        if (
          component.name.toLowerCase().includes(query) ||
          component.description.toLowerCase().includes(query)
        ) {
          return true;
        }
        // Check specifications
        return Object.values(component.specifications || {}).some(value =>
          String(value).toLowerCase().includes(query)
        );
      });
    }

    // Apply price range filter
    filtered = filtered.filter(
      component =>
        component.price >= priceRange.min && component.price <= priceRange.max
    ); // Apply selected filters
    const activeFilters = Object.entries(selectedFilters).filter(
      ([_, values]) => values.length > 0
    );

    if (activeFilters.length) {
      filtered = filtered.filter(component => {
        // Get peripheral data from component (for peripheral components)
        const peripheral = component as any;

        return activeFilters.every(([type, filters]) => {
          // Manufacturer filter: match against component.brand, manufacturer, or type-specific brand
          if (type === 'manufacturer') {
            // Check main brand/manufacturer fields
            const brandField = (
              component.brand ||
              component.manufacturer ||
              ''
            ).trim();
            const specEntry = Object.entries(
              component.specifications || {}
            ).find(
              ([key, val]) =>
                val &&
                (key.toLowerCase().includes('brand') ||
                  key.toLowerCase().includes('manufacturer') ||
                  key.toLowerCase() === 'make')
            );
            const specBrand = specEntry ? String(specEntry[1]).trim() : '';
            // Debug logging for CPU filtering
            if (component.cpu?.series) {
              console.log(`[CPU Filter Debug] ${component.name}:`, {
                brandField,
                specBrand,
                cpuSeries: component.cpu.series,
                cpuBrand: component.cpu?.brand,
                filters,
              });
            }
            // For CPUs, use the brand field if available, otherwise derive from series
            let cpuBrand = '';
            if (component.cpu?.brand) {
              cpuBrand = component.cpu.brand;
            } else if (component.cpu?.series) {
              const series = component.cpu.series.toLowerCase();
              if (
                series.includes('ryzen') ||
                series.includes('athlon') ||
                series.includes('fx')
              ) {
                cpuBrand = 'AMD';
              } else if (
                series.includes('core') ||
                series.includes('pentium') ||
                series.includes('celeron') ||
                series.includes('xeon')
              ) {
                cpuBrand = 'Intel';
              }
            }

            // Check type-specific brand fields (only for types that have brand)
            const typeBrand =
              (component.gpu as any)?.brand ||
              (component.motherboard as any)?.brand ||
              (component.ram as any)?.brand ||
              (component.storage as any)?.brand ||
              (component.psu as any)?.brand ||
              (component.cooling as any)?.brand ||
              (component.caseModel as any)?.brand ||
              (peripheral.keyboard as any)?.brand ||
              (peripheral.mouse as any)?.brand ||
              (peripheral.microphone as any)?.brand ||
              (peripheral.camera as any)?.brand ||
              (peripheral.monitor as any)?.brand ||
              (peripheral.headphones as any)?.brand ||
              (peripheral.speakers as any)?.brand ||
              (peripheral.gamepad as any)?.brand ||
              (peripheral.mousePad as any)?.brand ||
              '';
            const compBrand = (
              brandField ||
              specBrand ||
              cpuBrand ||
              typeBrand
            ).toLowerCase();

            // Debug logging for final brand and matching
            if (component.cpu?.series) {
              console.log(
                `[CPU Filter Debug] ${component.name} - Final brand: "${compBrand}", CPU brand: "${cpuBrand}"`
              );
            }

            return filters.some(filter => {
              const [, val] = filter.split('=');
              const matches = compBrand === val.toLowerCase();
              if (component.cpu?.series) {
                console.log(
                  `[CPU Filter Debug] ${component.name} - Filter: ${filter}, Matches: ${matches}`
                );
              }
              return matches;
            });
          }

          // Handle type-specific filters for gamepads
          if (
            peripheral.gamepad &&
            [
              'connection',
              'platform',
              'layout',
              'rgb',
              'vibration',
              'programmable',
            ].includes(type)
          ) {
            return filters.some(filter => {
              const [, val] = filter.split('=');
              const gamepadValue =
                peripheral.gamepad![type as keyof typeof peripheral.gamepad];
              if (typeof gamepadValue === 'boolean') {
                return String(gamepadValue) === val;
              }
              return String(gamepadValue).toLowerCase() === val.toLowerCase();
            });
          }
          // Handle type-specific filters for other peripherals and components
          const getTypeSpecificValue = (key: string) => {
            // Check all component types for the key
            const typeData =
              component.cpu ||
              component.gpu ||
              component.motherboard ||
              component.ram ||
              component.storage ||
              component.psu ||
              component.cooling ||
              component.caseModel ||
              peripheral.keyboard ||
              peripheral.mouse ||
              peripheral.microphone ||
              peripheral.camera ||
              peripheral.monitor ||
              peripheral.headphones ||
              peripheral.speakers ||
              peripheral.mousePad;

            if (typeData && key in typeData) {
              return (typeData as any)[key];
            }
            return null;
          };

          // CPU series filter: match against component name
          if (type === 'cpu_series') {
            const compName = component.name.toLowerCase();
            return filters.some(filter => {
              const [, val] = filter.split('=');
              return compName.includes(val.toLowerCase());
            });
          }

          // Other filters: group filters by their base key (before the = sign)
          const filterGroups = filters.reduce(
            (acc, filter) => {
              const [key, value] = filter.split('=');
              if (!acc[key]) acc[key] = [];
              acc[key].push(value.toLowerCase());
              return acc;
            },
            {} as Record<string, string[]>
          );

          // Check each filter group against specifications and type-specific data
          return Object.entries(filterGroups).every(([key, values]) => {
            // First check type-specific data
            const typeSpecificValue = getTypeSpecificValue(key);
            if (typeSpecificValue !== null) {
              const valueStr = String(typeSpecificValue).toLowerCase();
              return values.some(
                value => valueStr.includes(value) || value.includes(valueStr)
              );
            }

            // Then check specifications
            const matchingSpec = Object.entries(
              component.specifications || {}
            ).find(([specKey]) =>
              specKey.toLowerCase().includes(key.toLowerCase())
            );
            if (!matchingSpec) return false;
            const [, specValue] = matchingSpec;
            const specValueStr = String(specValue).toLowerCase();
            return values.some(
              value =>
                specValueStr.includes(value) || value.includes(specValueStr)
            );
          });
        });
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'stock-desc':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

    setFilteredComponents(filtered);
  }, [components, searchQuery, selectedFilters, sortOption, priceRange]);

  const resetFilters = () => {
    const initialSelectedFilters: Record<string, string[]> = {};
    filterGroups.forEach(group => {
      initialSelectedFilters[group.type] = [];
    });
    setSelectedFilters(initialSelectedFilters);
    setSearchQuery('');
    setSortOption('price-asc');
    setPriceRange({ min: minPrice, max: maxPrice });
  };
  if (loading) {
    return (
      <motion.div
        className="flex justify-center items-center min-h-[50vh] bg-neutral-50 dark:bg-neutral-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Loading size="medium" />
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="max-w-7xl mx-auto text-center py-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />{' '}
        </motion.div>
        <motion.h2
          className="text-2xl font-bold text-neutral-900 dark:text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {error}
        </motion.h2>{' '}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <TryAgainButton
            onClick={() => window.location.reload()}
            className="mt-4"
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back button */}
      <motion.div
        className="mb-3 flex justify-start"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Link href={`/${locale}/${type}s`}>
          <AnimatedButton
            title={t('categoryPage.backTo', {
              type:
                type === 'peripheral'
                  ? t('nav.peripherals')
                  : t('nav.components'),
            })}
            direction="left"
            className="text-neutral-600 dark:text-neutral-200"
          />
        </Link>
      </motion.div>{' '}
      {/* Header Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      ></motion.div>
      <motion.div
        className="flex flex-col lg:flex-row gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Filters */}
        <motion.div
          className="w-full lg:w-80 shrink-0"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="sticky top-4 transition-transform duration-200">
            <div className="bg-blue-100/80 dark:bg-red-900/60 backdrop-blur-sm rounded-2xl border border-blue-200 dark:border-red-700/50 shadow-md p-6 overflow-y-auto scrollbar-hide max-h-[calc(100vh-2rem)] overflow-x-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
                  <Filter size={18} className="mr-2" />
                  {t('categoryPage.filters')}
                </h2>

                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 dark:text-red-400 hover:text-blue-700 dark:hover:text-red-300 transition-colors"
                >
                  {t('buttons.reset')}
                </button>
              </div>
              {/* Active Filters Summary */}
              <AnimatePresence>
                {Object.entries(selectedFilters).some(
                  ([_, values]) => values.length > 0
                ) && (
                  <motion.div
                    className="mb-4 p-3 bg-blue-50 dark:bg-red-950/30 rounded-lg"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                      {t('categoryPage.activeFilters')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedFilters).map(([type, values]) =>
                        values.map(value => {
                          const [key, val] = value.split('=');
                          // Find the filter option to get translation
                          const filterGroup = filterGroups.find(
                            g => g.type === type
                          );
                          const filterOption = filterGroup?.options.find(
                            o => o.id === value
                          );
                          const displayValue = filterOption?.translationKey
                            ? t(
                                `filterValues.${filterOption.translationKey.split('.').pop()}`,
                                { value: val }
                              )
                            : val;
                          return (
                            <motion.button
                              key={value}
                              onClick={() => handleFilterChange(type, value)}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-red-900/40 text-blue-700 dark:text-red-300 hover:bg-blue-200 dark:hover:bg-red-800/40 transition-colors"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {displayValue}
                              <X size={14} className="ml-1" />
                            </motion.button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search bar */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search
                    size={16}
                    className="text-neutral-500 dark:text-neutral-400"
                  />
                </div>{' '}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('categoryPage.searchPlaceholder')}
                  className="block w-full pl-10 pr-10 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Sort options */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  {t('categoryPage.sortBy')}
                </h3>{' '}
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value)}
                  className="block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-400 transition-all"
                >
                  <option value="price-asc">
                    {t('categoryPage.sortOptions.priceAsc')}
                  </option>
                  <option value="price-desc">
                    {t('categoryPage.sortOptions.priceDesc')}
                  </option>
                  <option value="name-asc">
                    {t('categoryPage.sortOptions.nameAsc')}
                  </option>
                  <option value="name-desc">
                    {t('categoryPage.sortOptions.nameDesc')}
                  </option>
                  <option value="stock-desc">
                    {t('categoryPage.sortOptions.stockDesc')}
                  </option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  {t('categoryPage.priceRange')}
                </h3>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        {t('categoryPage.min')}
                      </label>{' '}
                      <input
                        type="number"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange.min}
                        onChange={e =>
                          setPriceRange(prev => ({
                            ...prev,
                            min: Number(e.target.value),
                          }))
                        }
                        className="block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-400 transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        {t('categoryPage.max')}
                      </label>
                      <input
                        type="number"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange.max}
                        onChange={e =>
                          setPriceRange(prev => ({
                            ...prev,
                            max: Number(e.target.value),
                          }))
                        }
                        className="block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-400 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Filter groups */}
              <div className="space-y-4 overflow-y-visible">
                {filterGroups.map((group, index) => (
                  <motion.div
                    key={group.type}
                    className="border-t border-neutral-200 dark:border-neutral-700 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <button
                      onClick={() => toggleSection(group.type)}
                      className="flex items-center justify-between w-full text-left hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {group.titleTranslationKey
                          ? t(group.titleTranslationKey)
                          : group.title}
                      </span>
                      <motion.div
                        animate={{
                          rotate: expandedSections[group.type] ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={18} className="text-neutral-500" />
                      </motion.div>{' '}
                    </button>

                    <AnimatePresence>
                      {expandedSections[group.type] && (
                        <motion.div
                          className="mt-2 ml-2 space-y-1 max-h-48 overflow-y-auto scrollbar-hide"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {group.options.length > 0 ? (
                            group.options.map((option, optionIndex) => (
                              <motion.div
                                key={option.id}
                                className="flex items-center"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: 0.05 * optionIndex,
                                }}
                              >
                                <label
                                  className="flex items-center cursor-pointer"
                                  onClick={() =>
                                    handleFilterChange(group.type, option.id)
                                  }
                                >
                                  <motion.div
                                    className={`w-4 h-4 mr-2 border rounded-sm flex items-center justify-center transition-all ${
                                      (
                                        selectedFilters[group.type] || []
                                      ).includes(option.id)
                                        ? 'bg-blue-600 dark:bg-red-600 border-blue-600 dark:border-red-600 text-white shadow-sm'
                                        : 'border-neutral-300 dark:border-neutral-600 hover:border-blue-500 dark:hover:border-red-400'
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    {(
                                      selectedFilters[group.type] || []
                                    ).includes(option.id) && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Check size={12} />
                                      </motion.div>
                                    )}
                                  </motion.div>
                                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                    {option.translationKey
                                      ? t(option.translationKey)
                                      : option.name}
                                  </span>
                                </label>
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {t('categoryPage.noOptions')}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        {/* Product grid */}
        <motion.div
          className="flex-1 min-w-0"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {filteredComponents.length === 0 ? (
            <motion.div
              className="bg-white/95 dark:bg-red-900/20 backdrop-blur-sm rounded-2xl p-8 text-center border border-blue-400/50 dark:border-red-900/30 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <Info
                  size={48}
                  className="mx-auto text-blue-500 dark:text-red-400 mb-4"
                />
              </motion.div>
              <motion.h2
                className="text-xl font-semibold text-neutral-900 dark:text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                {t('categoryPage.noProductsFound')}
              </motion.h2>
              <motion.p
                className="text-neutral-600 dark:text-neutral-400 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
              >
                {t('categoryPage.noCriteriaMatch')}
              </motion.p>{' '}
              <motion.button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 dark:bg-red-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-red-700 transition-colors shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('categoryPage.resetFilters')}
              </motion.button>{' '}
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <AnimatePresence mode="popLayout">
                {filteredComponents.map((component, index) => (
                  <motion.div
                    key={component.id}
                    className="h-full flex"
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{
                      duration: 0.4,
                      delay: Math.min(index * 0.1, 1.0),
                      layout: { duration: 0.3 },
                    }}
                    whileHover={{ y: -5 }}
                  >
                    <ProductCard
                      id={component.id}
                      name={component.name}
                      price={component.price}
                      imageUrl={component.imageUrl}
                      category={component.categoryName}
                      type={type}
                      linkPrefix={`/${locale}/${type}s/${categorySlug}`}
                      stock={component.stock}
                      specs={component.specifications}
                      showRating={true}
                      rating={component.rating}
                      ratingCount={component.ratingCount}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const StyledScrollbar = styled.div`
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${props =>
      props.theme === 'dark'
        ? 'rgba(185, 28, 28, 0.5)'
        : 'rgba(59, 130, 246, 0.5)'};
    border-radius: 20px;
    border: none;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: ${props =>
      props.theme === 'dark'
        ? 'rgba(220, 38, 38, 0.8)'
        : 'rgba(37, 99, 235, 0.8)'};
  }
`;

const StyledWrapper = styled.div`
  .button {
    --h-button: 48px;
    --w-button: 102px;
    --round: 0.75rem;
    cursor: pointer;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.25s ease;
    background: linear-gradient(121deg, #d40b11, #5e44c7, #179aeb);
    border-radius: var(--round);
    border: none;
    outline: none;
    padding: 12px 24px;
    white-space: nowrap;
    max-width: 100%;
  }
  .button::before,
  .button::after {
    content: "";
    position: absolute;
    inset: var(--space);
    transition: all 0.5s ease-in-out;
    border-radius: calc(var(--round) - var(--space));
    z-index: 0;
  }
  .button::before {
    --space: 1px;
    background: linear-gradient(
      177.95deg,
      rgba(255, 255, 255, 0.19) 0%,
      rgba(255, 255, 255, 0) 100%
    );
  }
  .button::after {
    --space: 2px;
    background: transparent;
      linear-gradient(0deg, #7a5af8, #7a5af8);
  }
  .button:active {
    transform: scale(0.95);
  }

    .points_wrapper {
      overflow: hidden;
      width: 100%;
      height: 100%;
      pointer-events: none;
      position: absolute;
    }
  `;
