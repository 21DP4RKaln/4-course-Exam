'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import ConfiguratorLayout from './ConfiguratorLayout';
import CategoryList from './CategoryList';
import FilterSection from './FilterSection';
import { createCpuFilterGroups } from './filter/cpuFilters';
import { createGpuFilterGroups } from './filter/gpuFilters';
import { createRamFilterGroups } from './filter/ramFilters';
import { createMotherboardFilterGroups } from './filter/motherboardFilters';
import { createStorageFilterGroups } from './filter/storageFilters';
import { createPsuFilterGroups } from './filter/psuFilters';
import { createCaseFilterGroups } from './filter/caseFilters';
import { createCoolingFilterGroups } from './filter/coolingFilters';
import QuickFilters from './QuickFilters';
import ComponentSelectionGrid from './ComponentSelectionGrid';
import SelectedComponentsList from './SelectedComponentsList';
import { checkFormFactorCompatibility } from './compatibility';
import './customScrollbar.css';

import { useAuth } from '@/app/contexts/AuthContext';
import { useCart } from '@/app/contexts/CartContext';
import { useTheme } from '@/app/contexts/ThemeContext';

import { Component, Category, SelectedComponentsType } from './types';
import { getConfigurationById } from '@/lib/services/dashboardService';

const ConfiguratorPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { addItem } = useCart();
  const { theme } = useTheme();

  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<string>('cpu');
  const [quickCpuFilter, setQuickCpuFilter] = useState<string | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<
    Record<string, Component | Component[]>
  >({});
  const [components, setComponents] = useState<Component[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [configName, setConfigName] = useState(' ');
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([]);
  const [totalPowerConsumption, setTotalPowerConsumption] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>(
    {}
  );
  const [availableSpecifications, setAvailableSpecifications] = useState<any[]>(
    []
  );
  const [isLoadingConfiguration, setIsLoadingConfiguration] = useState(false);

  // Calculate min and max prices from components data
  const maxPrice = useMemo(() => {
    if (components.length === 0) return 50000;
    return Math.max(...components.map(component => component.price));
  }, [components]);
  const minPrice = useMemo(() => {
    if (components.length === 0) return 0;
    return Math.min(...components.map(component => component.price));
  }, [components]);
  const t = useTranslations();

  // Helper function to get a single component from selected components (handles both single components and arrays)
  const getSingleComponent = (categoryKey: string): Component | null => {
    const selected = selectedComponents[categoryKey];
    if (!selected) return null;
    if (Array.isArray(selected)) return selected[0] || null;
    return selected;
  };

  // Helper function to check if a component exists
  const hasComponent = (categoryKey: string): boolean => {
    const selected = selectedComponents[categoryKey];
    if (!selected) return false;
    if (Array.isArray(selected)) return selected.length > 0;
    return true;
  };

  // Update price range when components change and min/max prices are calculated
  useEffect(() => {
    if (components.length > 0) {
      // Only update if the current range is still the default or outside the actual bounds
      const currentMin = priceRange[0];
      const currentMax = priceRange[1];

      // Update if current range is the default values or outside actual component price bounds
      if (
        (currentMin === 0 && currentMax === 50000) ||
        currentMin < minPrice ||
        currentMax > maxPrice ||
        (currentMin === 0 && minPrice > 0) ||
        (currentMax === 50000 && maxPrice < 50000)
      ) {
        setPriceRange([minPrice, maxPrice]);
      }
    }
  }, [components, minPrice, maxPrice, priceRange]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/components?type=components');

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        const data = await response.json();

        if (
          data.categories &&
          Array.isArray(data.categories) &&
          data.categories.length > 0
        ) {
          const mappedCategories = data.categories.map((cat: any) => ({
            id: cat.slug,
            name: cat.name,
            slug: cat.slug,
            iconName: getIconNameForCategory(cat.slug),
          }));
          setCategories(mappedCategories);

          // If no active category is set, set it to the first category
          if (mappedCategories.length > 0) {
            // Set the active category, but prevent circular dependency
            // by not including activeCategory in the dependency array
            setActiveCategory(
              prevCategory => prevCategory || mappedCategories[0].id
            );
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use fallback categories defined below if API fails
      }
    };
    fetchCategories();
  }, []);

  // Load existing configuration if 'load' parameter is present
  useEffect(() => {
    const loadConfigId = searchParams.get('load');

    if (loadConfigId && user?.id && isAuthenticated) {
      const loadConfiguration = async () => {
        try {
          setIsLoadingConfiguration(true);

          const configData = await getConfigurationById(loadConfigId, user.id);

          if (configData && configData.components) {
            // Set the configuration name
            setConfigName(configData.name);

            // Map the components to the selectedComponents format
            const loadedComponents: Record<string, Component> = {};

            for (const component of configData.components) {
              // Fetch the full component details to get specifications
              const response = await fetch(`/api/components/${component.id}`);
              if (response.ok) {
                const fullComponent = await response.json();

                // Map category names to category IDs used by the configurator
                const categoryMap: Record<string, string> = {
                  Processors: 'cpu',
                  'Graphics Cards': 'gpu',
                  Motherboards: 'motherboard',
                  Memory: 'ram',
                  Storage: 'storage',
                  Cooling: 'cooling',
                  Cases: 'case',
                  'Power Supplies': 'psu',
                  Services: 'services',
                };

                const categoryId =
                  categoryMap[component.category] ||
                  component.category.toLowerCase();

                loadedComponents[categoryId] = {
                  id: fullComponent.id,
                  name: fullComponent.name,
                  description: fullComponent.description || '',
                  price: fullComponent.price,
                  imageUrl: fullComponent.imageUrl,
                  categoryId: fullComponent.categoryId,
                  specifications: fullComponent.specifications || {},
                };
              }
            }

            setSelectedComponents(loadedComponents);
          }
        } catch (error) {
          console.error('Error loading configuration:', error);
        } finally {
          setIsLoadingConfiguration(false);
        }
      };

      loadConfiguration();
    }
  }, [searchParams, user?.id, isAuthenticated]);

  // Helper function to map category slugs to icon names
  const getIconNameForCategory = (slug: string): string => {
    const categoryIcons: Record<string, string> = {
      processors: 'cpu',
      'graphics-cards': 'gpu',
      motherboards: 'motherboard',
      memory: 'ram',
      storage: 'storage',
      cooling: 'cooling',
      cases: 'case',
      'power-supplies': 'psu',
      services: 'services',
    };
    return categoryIcons[slug] || slug;
  };
  // Default fallback categories (static)
  const fallbackCategories: Category[] = useMemo(
    () => [
      { id: 'cpu', name: t('categories.cpu'), slug: 'cpu', iconName: 'cpu' },
      { id: 'gpu', name: t('categories.gpu'), slug: 'gpu', iconName: 'gpu' },
      {
        id: 'motherboard',
        name: t('categories.motherboard'),
        slug: 'motherboard',
        iconName: 'motherboard',
      },
      { id: 'ram', name: t('categories.ram'), slug: 'ram', iconName: 'ram' },
      {
        id: 'storage',
        name: t('categories.storage'),
        slug: 'storage',
        iconName: 'storage',
      },
      {
        id: 'cooling',
        name: t('categories.cooling'),
        slug: 'cooling',
        iconName: 'cooling',
      },
      {
        id: 'case',
        name: t('categories.case'),
        slug: 'case',
        iconName: 'case',
      },
      { id: 'psu', name: t('categories.psu'), slug: 'psu', iconName: 'psu' },
      {
        id: 'services',
        name: t('categories.services'),
        slug: 'services',
        iconName: 'services',
      },
    ],
    [t]
  );

  const rawCategories = categories.length > 0 ? categories : fallbackCategories;
  const componentCategories: Category[] = useMemo(
    () =>
      rawCategories.filter(
        cat => cat.slug !== 'networking' && cat.slug !== 'sound-cards'
      ),
    [rawCategories]
  );

  // Get current category slug
  const getCurrentCategorySlug = useCallback(() => {
    const category = componentCategories.find(cat => cat.id === activeCategory);
    return category ? category.slug : '';
  }, [activeCategory, componentCategories]);
  // Reset filters when category changes
  useEffect(() => {
    setQuickCpuFilter(null);
    setActiveFilters({});
    setSearchQuery('');
    // Reset price range to category's min/max
    if (components.length > 0) {
      const categoryMinPrice = Math.min(...components.map(c => c.price));
      const categoryMaxPrice = Math.max(...components.map(c => c.price));
      setPriceRange([categoryMinPrice, categoryMaxPrice]);
    }
  }, [activeCategory]);
  // Load components based on active category and apply filters
  useEffect(() => {
    const loadComponents = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();

        // Add category filter
        const currentSlug =
          componentCategories.find(cat => cat.id === activeCategory)?.slug ||
          '';
        queryParams.append('category', currentSlug);

        // Add price filters
        if (priceRange[0] > minPrice)
          queryParams.append('minPrice', String(priceRange[0]));
        if (priceRange[1] < maxPrice)
          queryParams.append('maxPrice', String(priceRange[1]));

        // Add active filters (includes both regular and converted quick filters)
        Object.entries(activeFilters).forEach(([key, active]) => {
          if (active) {
            queryParams.append('spec', key);
          }
        });

        // Add search query
        if (searchQuery) queryParams.append('q', searchQuery);
        const res = await fetch(`/api/components?${queryParams}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        let fetched = data.components || []; // Filter incompatible motherboards and cases
        const filtered = fetched.filter((component: Component) => {
          // If loading motherboards and a case is selected, filter by form factor
          if (activeCategory === 'motherboard' && hasComponent('case')) {
            const caseComponent = getSingleComponent('case');
            const caseForm =
              caseComponent?.specifications?.['Form Factor'] ||
              caseComponent?.specifications?.['Motherboard Support'] ||
              '';
            return checkFormFactorCompatibility(
              caseForm,
              component.specifications?.['Form Factor'] || ''
            );
          }
          // If loading cases and a motherboard is selected, filter by form factor
          if (activeCategory === 'case' && hasComponent('motherboard')) {
            const motherboard = getSingleComponent('motherboard');
            const mbForm = motherboard?.specifications?.['Form Factor'];
            const caseForm =
              component.specifications?.['Form Factor'] ||
              component.specifications?.['Motherboard Support'] ||
              '';
            return mbForm && checkFormFactorCompatibility(caseForm, mbForm);
          }
          return true;
        });
        setComponents(filtered);
      } catch (e) {
        console.error(e);
        setComponents([]);
      } finally {
        setLoading(false);
      }
    };
    loadComponents();
  }, [
    activeCategory,
    searchQuery,
    priceRange,
    activeFilters,
    componentCategories,
    getCurrentCategorySlug,
    selectedComponents,
  ]); // Calculate total price when selected components change
  useEffect(() => {
    // Calculate total price from all selected components, considering discounts
    const total = Object.values(selectedComponents).reduce(
      (sum, componentOrArray) => {
        if (Array.isArray(componentOrArray)) {
          // Handle services array
          return (
            sum +
            componentOrArray.reduce((arraySum, component) => {
              const price =
                component.discountPrice &&
                component.discountPrice < component.price
                  ? component.discountPrice
                  : component.price;
              return arraySum + (price || 0);
            }, 0)
          );
        } else {
          // Handle single component
          const price =
            componentOrArray.discountPrice &&
            componentOrArray.discountPrice < componentOrArray.price
              ? componentOrArray.discountPrice
              : componentOrArray.price;
          return sum + (price || 0);
        }
      },
      0
    );

    setTotalPrice(total);
    // Calculate total power consumption using database values
    let totalWattage = 0;

    // CPU power consumption from database
    if (hasComponent('cpu')) {
      const cpu = getSingleComponent('cpu');
      const cpuPower =
        cpu?.cpu?.powerConsumption ||
        parseInt(cpu?.specifications?.['TDP'] || '65', 10);
      totalWattage += isNaN(cpuPower) ? 65 : cpuPower;
    }

    // GPU power consumption from database
    if (hasComponent('gpu')) {
      const gpu = getSingleComponent('gpu');
      const gpuPower = gpu?.gpu?.powerConsumption || 150;
      totalWattage += isNaN(gpuPower) ? 150 : gpuPower;
    }

    // RAM power consumption from database
    if (hasComponent('ram')) {
      const ram = getSingleComponent('ram');
      const ramPower = ram?.ram?.powerConsumption || 10;
      totalWattage += ramPower;
    }

    // Storage power consumption from database
    if (hasComponent('storage')) {
      const storage = getSingleComponent('storage');
      const storagePower = storage?.storage?.powerConsumption || 15;
      totalWattage += storagePower;
    }

    // Motherboard (estimate if not in database)
    if (hasComponent('motherboard')) {
      totalWattage += 30;
    }

    // Cooling power consumption (fans/pumps)
    if (hasComponent('cooling')) {
      const cooling = getSingleComponent('cooling');
      const coolingType = cooling?.specifications?.['Type'];
      if (coolingType?.toLowerCase().includes('liquid')) {
        totalWattage += 20; // Liquid cooling pump + fans
      } else {
        totalWattage += 10; // Air cooling fans
      }
    }
    setTotalPowerConsumption(totalWattage);
    // Check for compatibility issues
    const issues: string[] = [];

    // Check CPU and motherboard compatibility
    if (hasComponent('cpu') && hasComponent('motherboard')) {
      const cpu = getSingleComponent('cpu');
      const motherboard = getSingleComponent('motherboard');

      const cpuSocket = cpu?.specifications?.['Socket'];
      const mbSocket =
        motherboard?.specifications?.['CPU Socket'] ||
        motherboard?.specifications?.['Socket'];

      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        issues.push(
          `${t('configurator.compatibility.cpuSocketMismatch')} (${cpuSocket} ≠ ${mbSocket})`
        );
      }

      // Check CPU brand and motherboard chipset compatibility
      const cpuBrand =
        cpu?.specifications?.['Brand'] ||
        cpu?.specifications?.['manufacturer'] ||
        (cpu?.name.toLowerCase().includes('intel')
          ? 'Intel'
          : cpu?.name.toLowerCase().includes('amd')
            ? 'AMD'
            : '');
      const chipset = motherboard?.specifications?.['Chipset'];

      if (cpuBrand && chipset) {
        const isIntelCpu = cpuBrand.toLowerCase().includes('intel');
        const isAmdCpu = cpuBrand.toLowerCase().includes('amd');
        const isIntelChipset = [
          'Z790',
          'Z690',
          'H770',
          'H670',
          'B760',
          'B660',
          'H610',
        ].includes(chipset);
        const isAmdChipset = [
          'X670E',
          'X670',
          'B650E',
          'B650',
          'A620',
          'X570',
          'B550',
          'A520',
          'B450',
          'X470',
        ].includes(chipset);

        if ((isIntelCpu && isAmdChipset) || (isAmdCpu && isIntelChipset)) {
          issues.push(
            `${t('configurator.compatibility.warnings.cpuMotherboardIncompatible.' + (isAmdCpu ? 'amd' : 'intel'))}`
          );
        }
      }
    } // Check RAM and motherboard compatibility
    if (hasComponent('ram') && hasComponent('motherboard')) {
      const ram = getSingleComponent('ram');
      const motherboard = getSingleComponent('motherboard');

      if (ram && motherboard) {
        const ramType =
          ram.specifications?.['Type'] || ram.specifications?.['Memory Type'];
        const mbRamType =
          motherboard.specifications?.['Memory Type'] ||
          motherboard.specifications?.['Memory Support'];

        if (ramType && mbRamType && !mbRamType.includes(ramType)) {
          issues.push(
            `${t('configurator.compatibility.ramTypeMismatch')} (${ramType} ≠ ${mbRamType})`
          );
        }

        // Check RAM capacity vs motherboard support
        const ramCapacity = ram.specifications?.['Capacity'];
        const maxMemory =
          motherboard.specifications?.['Max Memory'] ||
          motherboard.specifications?.['Maximum Memory'];
        if (ramCapacity && maxMemory) {
          const ramGb = parseInt(ramCapacity.replace(/[^\d]/g, ''));
          const maxGb = parseInt(maxMemory.toString());
          if (!isNaN(ramGb) && !isNaN(maxGb) && ramGb > maxGb) {
            issues.push(
              `${t('configurator.compatibility.ramCapacityExceeded')} (${ramGb}GB > ${maxGb}GB)`
            );
          }
        }

        // Check RAM speed compatibility
        const ramSpeed = ram.specifications?.['Speed'];
        const mbMaxRamSpeed =
          motherboard.specifications?.['Memory Speed'] ||
          motherboard.specifications?.['Max Memory Speed'];
        if (ramSpeed && mbMaxRamSpeed) {
          const ramSpeedMhz = parseInt(
            ramSpeed.toString().replace(/[^\d]/g, '')
          );
          const maxSpeedMhz = parseInt(
            mbMaxRamSpeed.toString().replace(/[^\d]/g, '')
          );
          if (
            !isNaN(ramSpeedMhz) &&
            !isNaN(maxSpeedMhz) &&
            ramSpeedMhz > maxSpeedMhz
          ) {
            issues.push(
              `${t('configurator.compatibility.ramSpeedTooHigh')} (${ramSpeedMhz}MHz > ${maxSpeedMhz}MHz)`
            );
          }
        }
      }
    }
    // Check case and motherboard form factor compatibility
    if (hasComponent('case') && hasComponent('motherboard')) {
      const caseComponent = getSingleComponent('case');
      const motherboard = getSingleComponent('motherboard');

      if (caseComponent && motherboard) {
        const caseFormFactor =
          caseComponent.specifications?.['Form Factor'] ||
          caseComponent.specifications?.['Motherboard Support'];
        const mbFormFactor = motherboard.specifications?.['Form Factor'];

        if (caseFormFactor && mbFormFactor) {
          const isCompatible = checkFormFactorCompatibility(
            caseFormFactor,
            mbFormFactor
          );
          if (!isCompatible) {
            issues.push(
              `${t('configurator.compatibility.caseMotherboardIncompatible')} (${mbFormFactor} in ${caseFormFactor})`
            );
          }
        }
      }
    } // Check GPU clearance in case
    if (hasComponent('gpu') && hasComponent('case')) {
      const gpu = getSingleComponent('gpu');
      const caseComponent = getSingleComponent('case');

      if (gpu && caseComponent) {
        const gpuLength =
          gpu.specifications?.['Length'] || gpu.specifications?.['Card Length'];
        const maxGpuLength =
          caseComponent.specifications?.['Max GPU Length'] ||
          caseComponent.specifications?.['Maximum GPU Length'] ||
          caseComponent.specifications?.['GPU Clearance'];

        if (gpuLength && maxGpuLength) {
          const gpuMm = parseInt(gpuLength.toString().replace(/[^\d]/g, ''));
          const maxMm = parseInt(maxGpuLength.toString().replace(/[^\d]/g, ''));
          if (!isNaN(gpuMm) && !isNaN(maxMm) && gpuMm > maxMm) {
            issues.push(
              `${t('configurator.compatibility.gpuTooLong')} (${gpuMm}mm > ${maxMm}mm)`
            );
          }
        }

        // Check GPU width/height compatibility
        const gpuHeight = gpu.specifications?.['Height'];
        const maxSlots =
          caseComponent.specifications?.['Expansion Slots'] ||
          caseComponent.specifications?.['GPU Slots'];
        const gpuSlots =
          gpu.specifications?.['Slot Width'] ||
          gpu.specifications?.['Slots Required'];

        if (gpuSlots && maxSlots) {
          const gpuSlotsNum = parseInt(
            gpuSlots.toString().replace(/[^\d]/g, '')
          );
          const maxSlotsNum = parseInt(
            maxSlots.toString().replace(/[^\d]/g, '')
          );
          if (
            !isNaN(gpuSlotsNum) &&
            !isNaN(maxSlotsNum) &&
            gpuSlotsNum > maxSlotsNum
          ) {
            issues.push(
              `${t('configurator.compatibility.gpuTooWide')} (${gpuSlotsNum} slots > ${maxSlotsNum} slots)`
            );
          }
        }
      }
    }
    // Check CPU cooler clearance in case
    if (hasComponent('cooling') && hasComponent('case')) {
      const cooling = getSingleComponent('cooling');
      const caseComponent = getSingleComponent('case');

      if (cooling && caseComponent) {
        const coolerHeight = cooling.specifications?.['Height'];
        const maxCpuHeight = caseComponent.specifications?.['Max CPU Height'];

        if (coolerHeight && maxCpuHeight) {
          const coolerMm = parseInt(
            coolerHeight.toString().replace(/[^\d]/g, '')
          );
          const maxMm = parseInt(maxCpuHeight.toString().replace(/[^\d]/g, ''));
          if (!isNaN(coolerMm) && !isNaN(maxMm) && coolerMm > maxMm) {
            issues.push(
              `${t('configurator.compatibility.coolerTooTall')} (${coolerMm}mm > ${maxMm}mm)`
            );
          }
        }
      }
    }
    // Check CPU cooler and CPU socket compatibility
    if (hasComponent('cooling') && hasComponent('cpu')) {
      const cooling = getSingleComponent('cooling');
      const cpu = getSingleComponent('cpu');

      if (cooling && cpu) {
        const coolerSockets =
          cooling.specifications?.['Socket Support'] ||
          cooling.specifications?.['Socket Compatibility'] ||
          cooling.specifications?.['Compatible Sockets'];
        const cpuSocket = cpu.specifications?.['Socket'];

        if (coolerSockets && cpuSocket) {
          const supportedSockets = coolerSockets.toString().toLowerCase();
          const currentSocket = cpuSocket.toString().toLowerCase();

          // More flexible socket checking
          const isSocketSupported =
            supportedSockets.includes(currentSocket) ||
            supportedSockets.includes('universal') ||
            supportedSockets.includes('all');

          if (!isSocketSupported) {
            issues.push(
              `${t('configurator.compatibility.coolerSocketMismatch')} (${cpuSocket} not in ${coolerSockets})`
            );
          }
        }
      }
    }
    // Check CPU TDP vs cooler TDP rating
    if (hasComponent('cooling') && hasComponent('cpu')) {
      const cooling = getSingleComponent('cooling');
      const cpu = getSingleComponent('cpu');

      if (cooling && cpu) {
        const coolerMaxTdp = cooling.specifications?.['Max TDP'];
        const cpuTdp = cpu.specifications?.['TDP'];

        if (coolerMaxTdp && cpuTdp) {
          const coolerTdpNum = parseInt(
            coolerMaxTdp.toString().replace(/[^\d]/g, '')
          );
          const cpuTdpNum = parseInt(cpuTdp.toString().replace(/[^\d]/g, ''));
          if (
            !isNaN(coolerTdpNum) &&
            !isNaN(cpuTdpNum) &&
            cpuTdpNum > coolerTdpNum
          ) {
            issues.push(
              `${t('configurator.compatibility.coolerInsufficientTdp')} (${cpuTdpNum}W > ${coolerTdpNum}W)`
            );
          }
        }
      }
    }
    // Check PSU length in case
    if (hasComponent('psu') && hasComponent('case')) {
      const psu = getSingleComponent('psu');
      const caseComponent = getSingleComponent('case');

      if (psu && caseComponent) {
        const psuLength = psu.specifications?.['Length'];
        const maxPsuLength = caseComponent.specifications?.['Max PSU Length'];

        if (psuLength && maxPsuLength) {
          const psuMm = parseInt(psuLength.toString().replace(/[^\d]/g, ''));
          const maxMm = parseInt(maxPsuLength.toString().replace(/[^\d]/g, ''));
          if (!isNaN(psuMm) && !isNaN(maxMm) && psuMm > maxMm) {
            issues.push(
              `${t('configurator.compatibility.psuTooLong')} (${psuMm}mm > ${maxMm}mm)`
            );
          }
        }
      }
    }
    // Check radiator support for liquid cooling
    if (hasComponent('cooling') && hasComponent('case')) {
      const cooling = getSingleComponent('cooling');
      const caseComponent = getSingleComponent('case');

      if (cooling && caseComponent) {
        const coolerType = cooling.specifications?.['Type'];
        const radiatorSize = cooling.specifications?.['Radiator Size'];
        const caseRadiatorSupport =
          caseComponent.specifications?.['Radiator Support'];

        if (
          coolerType?.toString().toLowerCase().includes('liquid') &&
          radiatorSize &&
          caseRadiatorSupport
        ) {
          const radSize = parseInt(
            radiatorSize.toString().replace(/[^\d]/g, '')
          );
          const maxRadSize = parseInt(
            caseRadiatorSupport.toString().replace(/[^\d]/g, '')
          );
          if (!isNaN(radSize) && !isNaN(maxRadSize) && radSize > maxRadSize) {
            issues.push(
              `${t('configurator.compatibility.radiatorTooLarge')} (${radSize}mm > ${maxRadSize}mm)`
            );
          }
        }
      }
    } // Check if PSU is powerful enough
    if (hasComponent('psu') && totalWattage > 0) {
      const psu = getSingleComponent('psu');

      if (psu) {
        // Try multiple field names for PSU wattage from database
        const psuWattageStr =
          psu.specifications?.['wattage'] ||
          psu.specifications?.['Wattage'] ||
          psu.specifications?.['Power'] ||
          psu.specifications?.['power'] ||
          psu.specifications?.['watts'] ||
          psu.specifications?.['Watts'];

        let psuWattage = 0;
        if (psuWattageStr) {
          // Extract numeric value from wattage field (handle "850W", "850", etc.)
          const wattageMatch = psuWattageStr.toString().match(/(\d+)/);
          if (wattageMatch) {
            psuWattage = parseInt(wattageMatch[1], 10);
          }
        }

        if (psuWattage > 0) {
          const recommendedWattage = Math.ceil(totalWattage * 1.3); // 30% headroom
          const minWattage = Math.ceil(totalWattage * 1.1); // 10% minimum headroom

          if (psuWattage < totalWattage) {
            issues.push(
              `${t('configurator.compatibility.psuCriticallyUnderpowered')} (${psuWattage}W < ${totalWattage}W)`
            );
          } else if (psuWattage < minWattage) {
            issues.push(
              `${t('configurator.compatibility.psuDangerouslyUnderpowered')} (${psuWattage}W < ${minWattage}W minimum)`
            );
          } else if (psuWattage < recommendedWattage) {
            issues.push(
              `${t('configurator.compatibility.psuUnderpowered')} (${psuWattage}W < ${recommendedWattage}W recommended)`
            );
          }
        } else {
          // If we can't determine PSU wattage, show a warning
          issues.push(
            `${t('configurator.compatibility.psuWattageUnknown')} (${totalWattage}W required)`
          );
        }

        // Check PSU efficiency rating vs system requirements
        const efficiency =
          psu.specifications?.['efficiency'] ||
          psu.specifications?.['Efficiency'];
        if (totalWattage > 500 && efficiency) {
          const efficiencyStr = efficiency.toString().toLowerCase();
          const has80Plus =
            efficiencyStr.includes('80 plus') ||
            efficiencyStr.includes('80+') ||
            efficiencyStr.includes('80plus');

          if (!has80Plus) {
            issues.push(
              `${t('configurator.compatibility.psuLowEfficiency')} (High power system needs 80 PLUS rated PSU)`
            );
          }
        }

        // Check PSU form factor compatibility with case
        const psuFormFactor =
          psu.specifications?.['Form Factor'] ||
          psu.specifications?.['form_factor'];
        if (psuFormFactor && hasComponent('case')) {
          const caseComponent = getSingleComponent('case');
          if (caseComponent) {
            const caseFormFactor =
              caseComponent.specifications?.['PSU Form Factor'] ||
              caseComponent.specifications?.[' PSU Support'];
            if (
              caseFormFactor &&
              !caseFormFactor
                .toString()
                .toLowerCase()
                .includes(psuFormFactor.toString().toLowerCase())
            ) {
              issues.push(
                `${t('configurator.compatibility.psuFormFactorIncompatible')} (${psuFormFactor} not supported by case)`
              );
            }
          }
        }
      }
    }
    // Check storage interface compatibility with motherboard
    if (hasComponent('storage') && hasComponent('motherboard')) {
      const storage = getSingleComponent('storage');
      const motherboard = getSingleComponent('motherboard');

      if (storage && motherboard) {
        const storageType = storage.specifications?.['Type'];
        const storageInterface = storage.specifications?.['Interface'];
        const mbM2Slots = motherboard.specifications?.['M.2 Slots'];
        const mbSataConnectors =
          motherboard.specifications?.['SATA Connectors'];

        if (
          storageType &&
          (storageType.includes('NVMe') || storageType.includes('M.2'))
        ) {
          const m2Slots = parseInt(mbM2Slots?.toString() || '0');
          if (m2Slots === 0) {
            issues.push(`${t('configurator.compatibility.noM2Slots')}`);
          }
        } else if (
          storageInterface?.includes('SATA') ||
          storageType?.includes('SATA')
        ) {
          const sataConnectors = parseInt(mbSataConnectors?.toString() || '0');
          if (sataConnectors === 0) {
            issues.push(`${t('configurator.compatibility.noSataConnectors')}`);
          }
        }
      }
    }
    // Check motherboard memory slot capacity
    if (hasComponent('ram') && hasComponent('motherboard')) {
      const ram = getSingleComponent('ram');
      const motherboard = getSingleComponent('motherboard');

      if (ram && motherboard) {
        const ramModules =
          ram.specifications?.['Modules'] ||
          ram.specifications?.['Module Count'];
        const mbMemorySlots =
          motherboard.specifications?.['Memory Slots'] ||
          motherboard.specifications?.['RAM Slots'];

        if (ramModules && mbMemorySlots) {
          const moduleCount = parseInt(
            ramModules.toString().replace(/[^\d]/g, '')
          );
          const slotCount = parseInt(
            mbMemorySlots.toString().replace(/[^\d]/g, '')
          );
          if (
            !isNaN(moduleCount) &&
            !isNaN(slotCount) &&
            moduleCount > slotCount
          ) {
            issues.push(
              `${t('configurator.compatibility.motherboardMemorySlotInsufficient')} (${moduleCount} modules > ${slotCount} slots)`
            );
          }
        }
      }
    }
    // Check GPU power connector compatibility
    if (hasComponent('gpu') && hasComponent('psu')) {
      const gpu = getSingleComponent('gpu');
      const psu = getSingleComponent('psu');

      if (gpu && psu) {
        const gpuPowerConnectors =
          gpu.specifications?.['Power Connectors'] ||
          gpu.specifications?.['Power Requirements'];
        const psuConnectors =
          psu.specifications?.['GPU Connectors'] ||
          psu.specifications?.['PCIe Connectors'];

        if (gpuPowerConnectors && psuConnectors) {
          // Extract 8-pin and 6-pin connector requirements
          const gpu8pin = (
            gpuPowerConnectors.toString().match(/8[\s-]*pin/gi) || []
          ).length;
          const gpu6pin = (
            gpuPowerConnectors.toString().match(/6[\s-]*pin/gi) || []
          ).length;
          const psu8pin = (psuConnectors.toString().match(/8[\s-]*pin/gi) || [])
            .length;
          const psu6pin = (psuConnectors.toString().match(/6[\s-]*pin/gi) || [])
            .length;

          if (gpu8pin > psu8pin || gpu6pin > psu6pin) {
            issues.push(
              `${t('configurator.compatibility.insufficientPowerConnectors')} (GPU needs ${gpu8pin}x8pin + ${gpu6pin}x6pin)`
            );
          }
        }
      }
    }
    // Check CPU cooler mounting conflicts
    if (
      hasComponent('cooling') &&
      hasComponent('ram') &&
      hasComponent('motherboard')
    ) {
      const cooling = getSingleComponent('cooling');
      const ram = getSingleComponent('ram');

      if (cooling && ram) {
        const coolerType = cooling.specifications?.['Type'];
        const ramHeight =
          ram.specifications?.['Height'] || ram.specifications?.['Profile'];

        if (coolerType && ramHeight) {
          const isTowerCooler =
            coolerType.toString().toLowerCase().includes('tower') ||
            coolerType.toString().toLowerCase().includes('air');
          const isHighProfileRam =
            ramHeight.toString().toLowerCase().includes('high') ||
            parseInt(ramHeight.toString().replace(/[^\d]/g, '')) > 40;

          if (isTowerCooler && isHighProfileRam) {
            issues.push(
              `${t('configurator.compatibility.cpuCoolerMountingConflict')} (Tower cooler + High profile RAM)`
            );
          }
        }
      }
    }

    setCompatibilityIssues(issues);
    setShowCompatibilityModal(issues.length > 0);
  }, [selectedComponents, t]);

  // Calculate recommended PSU wattage
  const getRecommendedPsuWattage = useCallback(() => {
    // Add 30% headroom to the total power consumption
    const recommendedWattage = Math.max(
      450,
      Math.ceil(totalPowerConsumption * 1.3)
    );

    // Round up to the nearest common PSU wattage
    if (recommendedWattage <= 500) return '500W';
    if (recommendedWattage <= 600) return '600W';
    if (recommendedWattage <= 650) return '650W';
    if (recommendedWattage <= 750) return '750W';
    if (recommendedWattage <= 850) return '850W';
    if (recommendedWattage <= 1000) return '1000W';
    return '1200W+';
  }, [totalPowerConsumption]); // Handle component selection
  const handleSelectComponent = useCallback(
    (component: Component) => {
      setSelectedComponents(prev => {
        if (activeCategory === 'services') {
          // For services, handle multiple selections
          const currentServices = prev[activeCategory];
          if (Array.isArray(currentServices)) {
            // Check if component is already selected
            const existingIndex = currentServices.findIndex(
              c => c.id === component.id
            );
            if (existingIndex >= 0) {
              // Remove if already selected
              const newServices = currentServices.filter(
                c => c.id !== component.id
              );
              if (newServices.length === 0) {
                // Remove the services key entirely if no services left
                const { services, ...rest } = prev;
                return rest;
              }
              return {
                ...prev,
                [activeCategory]: newServices,
              };
            } else {
              // Add to existing services
              return {
                ...prev,
                [activeCategory]: [...currentServices, component],
              };
            }
          } else {
            // First service selection or replace single component
            return {
              ...prev,
              [activeCategory]: [component],
            };
          }
        } else {
          // For all other categories, single selection
          return {
            ...prev,
            [activeCategory]: component,
          };
        }
      });
    },
    [activeCategory]
  ); // Handle quick filter change - converts quick filters to regular filters
  const handleQuickCpuFilterChange = useCallback(
    (filterType: string | null) => {
      if (filterType === null) {
        setQuickCpuFilter(null);
        // Clear all active filters when quick filter is cleared
        setActiveFilters({});
        return;
      }

      setQuickCpuFilter(filterType);

      // Convert quick filter to regular filter format
      const newActiveFilters: Record<string, boolean> = {};
      // Handle brand-only filters
      if (['intel', 'amd', 'nvidia'].includes(filterType)) {
        const brand = filterType.charAt(0).toUpperCase() + filterType.slice(1);
        newActiveFilters[`Brand=${brand}`] = true;
      } // Handle CPU-specific filters
      else if (filterType.startsWith('intel-core-')) {
        newActiveFilters['Brand=Intel'] = true;
        const series = filterType.split('intel-core-')[1];
        newActiveFilters[`Series=Core ${series}`] = true;
      } else if (filterType.startsWith('amd-ryzen-')) {
        newActiveFilters['Brand=AMD'] = true;
        const series = filterType.split('amd-ryzen-')[1];
        newActiveFilters[`Series=Ryzen ${series}`] = true;
      } else if (filterType === 'amd-threadripper') {
        newActiveFilters['Brand=AMD'] = true;
        newActiveFilters['Series=Threadripper'] = true;
      }
      // Handle GPU-specific filters
      else if (filterType.startsWith('nvidia-rtx-')) {
        newActiveFilters['Brand=NVIDIA'] = true;
        const model = filterType.split('nvidia-rtx-')[1];
        newActiveFilters[
          `Series=RTX ${model.replace('-', ' ').toUpperCase()}`
        ] = true;
      } else if (filterType.startsWith('amd-rx-')) {
        newActiveFilters['Brand=AMD'] = true;
        const model = filterType.split('amd-rx-')[1];
        newActiveFilters[`Series=RX ${model.replace('-', ' ').toUpperCase()}`] =
          true;
      } else if (filterType.startsWith('intel-a')) {
        newActiveFilters['Brand=Intel'] = true;
        const model = filterType.split('intel-')[1];
        newActiveFilters[`Series=Arc ${model.toUpperCase()}`] = true;
      }
      // Handle RAM-specific filters
      else if (['ddr4', 'ddr5'].includes(filterType)) {
        newActiveFilters[`Type=${filterType.toUpperCase()}`] = true;
      } else if (
        ['16gb', '32gb', '64gb', '128gb', '256gb'].includes(filterType)
      ) {
        const capacity = filterType.replace('gb', ' GB');
        newActiveFilters[`Capacity=${capacity}`] = true;
      }
      // Handle storage-specific filters
      else if (filterType === 'nvme') {
        newActiveFilters['Type=NVMe SSD'] = true;
      } else if (filterType === 'sata-ssd') {
        newActiveFilters['Type=SATA SSD'] = true;
      } else if (filterType === 'hdd') {
        newActiveFilters['Type=HDD'] = true;
      }
      // Handle motherboard-specific filters
      else if (['atx', 'micro-atx', 'mini-itx'].includes(filterType)) {
        const formFactor =
          filterType === 'micro-atx'
            ? 'Micro ATX'
            : filterType === 'mini-itx'
              ? 'Mini ITX'
              : 'ATX';
        newActiveFilters[`Form Factor=${formFactor}`] = true;
      } else if (filterType === 'intel-compatible') {
        newActiveFilters['Socket=LGA1700'] = true;
      } else if (filterType === 'amd-compatible') {
        newActiveFilters['Socket=AM5'] = true;
      }
      // Handle case-specific filters
      else if (filterType === 'eatx') {
        newActiveFilters['Form Factor=E-ATX'] = true;
      }
      // Handle cooling-specific filters
      else if (filterType === 'air') {
        newActiveFilters['Type=Air'] = true;
      } else if (filterType === 'fluid') {
        newActiveFilters['Type=Liquid'] = true;
      }
      // Handle PSU-specific filters
      else if (filterType.includes('80+')) {
        const certification = filterType.replace(/\+/g, '+ ').toUpperCase();
        newActiveFilters[`Certification=${certification}`] = true;
      }
      // Handle services-specific filters
      else if (filterType === 'windows') {
        newActiveFilters['OS=Windows'] = true;
      } else if (filterType === 'wifi+bluetooth') {
        newActiveFilters['Connectivity=WiFi+Bluetooth'] = true;
      } else if (filterType === '4gpu') {
        newActiveFilters['Purpose=GPU Support'] = true;
      } else if (filterType === 'sound') {
        newActiveFilters['Type=Sound Card'] = true;
      } else if (filterType === 'capture') {
        newActiveFilters['Type=Capture Card'] = true;
      }

      // Update active filters
      setActiveFilters(newActiveFilters);
    },
    []
  );
  // Helper function to check if a quick filter matches current active filters
  const isQuickFilterActive = useCallback(
    (filterType: string) => {
      // If no active filters, no quick filter is active
      if (Object.keys(activeFilters).length === 0) {
        return false;
      }

      // Create expected filters for this quick filter type
      const expectedFilters: Record<string, boolean> = {};

      // Handle brand-only filters
      if (['intel', 'amd', 'nvidia'].includes(filterType)) {
        const brand = filterType.charAt(0).toUpperCase() + filterType.slice(1);
        expectedFilters[`Brand=${brand}`] = true;
      } // Handle CPU-specific filters
      else if (filterType.startsWith('intel-core-')) {
        expectedFilters['Brand=Intel'] = true;
        const series = filterType.split('intel-core-')[1];
        expectedFilters[`Series=Core ${series}`] = true;
      } else if (filterType.startsWith('amd-ryzen-')) {
        expectedFilters['Brand=AMD'] = true;
        const series = filterType.split('amd-ryzen-')[1];
        expectedFilters[`Series=Ryzen ${series}`] = true;
      } else if (filterType === 'amd-threadripper') {
        expectedFilters['Brand=AMD'] = true;
        expectedFilters['Series=Threadripper'] = true;
      }
      // Handle GPU-specific filters
      else if (filterType.startsWith('nvidia-rtx-')) {
        expectedFilters['subBrand=NVIDIA'] = true;
        const model = filterType.split('nvidia-rtx-')[1];
        expectedFilters[
          `architecture=RTX ${model.replace('-', ' ').toUpperCase()}`
        ] = true;
      } else if (filterType.startsWith('amd-rx-')) {
        expectedFilters['subBrand=AMD'] = true;
        const model = filterType.split('amd-rx-')[1];
        expectedFilters[
          `architecture=RX ${model.replace('-', ' ').toUpperCase()}`
        ] = true;
      } else if (filterType.startsWith('intel-a')) {
        expectedFilters['subBrand=Intel'] = true;
        const model = filterType.split('intel-')[1];
        expectedFilters[`architecture=Arc ${model.toUpperCase()}`] = true;
      }
      // Handle RAM-specific filters
      else if (['ddr4', 'ddr5'].includes(filterType)) {
        expectedFilters[`Type=${filterType.toUpperCase()}`] = true;
      } else if (
        ['16gb', '32gb', '64gb', '128gb', '256gb'].includes(filterType)
      ) {
        const capacity = filterType.replace('gb', ' GB');
        expectedFilters[`Capacity=${capacity}`] = true;
      }
      // Handle storage-specific filters
      else if (filterType === 'nvme') {
        expectedFilters['Type=NVMe SSD'] = true;
      } else if (filterType === 'sata-ssd') {
        expectedFilters['Type=SATA SSD'] = true;
      } else if (filterType === 'hdd') {
        expectedFilters['Type=HDD'] = true;
      }
      // Handle motherboard-specific filters
      else if (['atx', 'micro-atx', 'mini-itx'].includes(filterType)) {
        const formFactor =
          filterType === 'micro-atx'
            ? 'Micro ATX'
            : filterType === 'mini-itx'
              ? 'Mini ITX'
              : 'ATX';
        expectedFilters[`Form Factor=${formFactor}`] = true;
      } else if (filterType === 'intel-compatible') {
        expectedFilters['Socket=LGA1700'] = true;
      } else if (filterType === 'amd-compatible') {
        expectedFilters['Socket=AM5'] = true;
      }
      // Handle case-specific filters
      else if (filterType === 'eatx') {
        expectedFilters['Form Factor=E-ATX'] = true;
      }
      // Handle cooling-specific filters
      else if (filterType === 'air') {
        expectedFilters['Type=Air'] = true;
      } else if (filterType === 'fluid') {
        expectedFilters['Type=Liquid'] = true;
      } // Handle PSU-specific filters
      else if (filterType.includes('80+')) {
        // Convert "80+bronze" to "80+ Bronze", "80+gold" to "80+ Gold", etc.
        const level = filterType.replace('80+', ''); // Extract "bronze", "gold", etc.
        const capitalizedLevel = level.charAt(0).toUpperCase() + level.slice(1); // "Bronze", "Gold", etc.
        expectedFilters[`Energy Efficiency=80+ ${capitalizedLevel}`] = true;
      }
      // Handle services-specific filters
      else if (filterType === 'windows') {
        expectedFilters['OS=Windows'] = true;
      } else if (filterType === 'wifi+bluetooth') {
        expectedFilters['Connectivity=WiFi+Bluetooth'] = true;
      } else if (filterType === '4gpu') {
        expectedFilters['Purpose=GPU Support'] = true;
      } else if (filterType === 'sound') {
        expectedFilters['Type=Sound Card'] = true;
      } else if (filterType === 'capture') {
        expectedFilters['Type=Capture Card'] = true;
      }

      // Check if current active filters match expected filters exactly
      const activeFilterKeys = Object.keys(activeFilters).filter(
        key => activeFilters[key]
      );
      const expectedFilterKeys = Object.keys(expectedFilters);
      const isActive =
        activeFilterKeys.length === expectedFilterKeys.length &&
        expectedFilterKeys.every(key => activeFilters[key] === true);

      return isActive;
    },
    [activeFilters]
  );

  // ...existing code...
  // Handle search query change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle price range change
  const handlePriceChange = useCallback((range: [number, number]) => {
    setPriceRange(range);
  }, []); // Handle save configuration
  const handleSaveConfiguration = useCallback(async () => {
    // Check if user is authenticated for saving drafts
    if (!isAuthenticated) {
      alert(
        t('configurator.actions.errors.loginToSave', {
          defaultMessage: 'You must be logged in to save a configuration',
        })
      );
      return;
    }

    try {
      // Get case image URL if a case is selected and convert to full URL
      const caseComponent = getSingleComponent('case');
      let caseImageUrl = caseComponent?.imageUrl;
      if (caseImageUrl && !caseImageUrl.startsWith('http')) {
        caseImageUrl = `${window.location.origin}${caseImageUrl}`;
      }

      // Prepare configuration data
      const configData = {
        name: configName,
        imageUrl: caseImageUrl,
        components: Object.entries(selectedComponents).flatMap(
          ([key, component]) => {
            if (Array.isArray(component)) {
              // Handle services (array of components)
              return component.map(c => ({
                id: c.id,
                quantity: 1,
              }));
            } else {
              // Handle single component
              return [
                {
                  id: component.id,
                  quantity: 1,
                },
              ];
            }
          }
        ),
      };

      // Save configuration to database as draft for logged-in users
      const saveResponse = await fetch('/api/configurations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      });
      if (saveResponse.ok) {
        const result = await saveResponse.json();
        alert(t('configurator.actions.saved', { name: configName }));
      } else {
        const errorData = await saveResponse.json();
        console.error('❌ Save failed:', {
          status: saveResponse.status,
          statusText: saveResponse.statusText,
          errorData,
        });
        throw new Error(
          errorData.error || t('configurator.actions.errors.saveFailed')
        );
      }
    } catch (error) {
      console.error('🚨 Failed to save configuration:', error);
      alert(t('configurator.actions.errors.saveFailed'));
    }
  }, [configName, selectedComponents, t, isAuthenticated]); // Handle submit configuration
  const handleSubmitConfiguration = useCallback(async () => {
    try {
      // Get case image URL if a case is selected and convert to full URL
      const caseComponent = getSingleComponent('case');
      let caseImageUrl = caseComponent?.imageUrl;
      if (caseImageUrl && !caseImageUrl.startsWith('http')) {
        caseImageUrl = `${window.location.origin}${caseImageUrl}`;
      }

      // First save the configuration
      const saveResponse = await fetch('/api/configurations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: configName,
          imageUrl: caseImageUrl,
          components: Object.entries(selectedComponents).flatMap(
            ([key, component]) => {
              if (Array.isArray(component)) {
                // Handle services (array of components)
                return component.map(c => ({
                  id: c.id,
                  quantity: 1,
                }));
              } else {
                // Handle single component
                return [
                  {
                    id: component.id,
                    quantity: 1,
                  },
                ];
              }
            }
          ),
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(
          errorData.error || t('configurator.actions.errors.saveFailed')
        );
      }

      const savedConfig = await saveResponse.json();

      // Then create an order with this configuration
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configurationId: savedConfig.configuration.id,
          totalAmount: totalPrice,
        }),
      });

      if (orderResponse.ok) {
        // Redirect to checkout page
        window.location.href = '/checkout';
      } else {
        const errorData = await orderResponse.json();
        throw new Error(
          errorData.error || t('configurator.actions.errors.orderFailed')
        );
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      alert(t('configurator.actions.errors.orderFailed'));
    }
  }, [configName, selectedComponents, totalPrice, t]);
  // Handle add to cart
  const handleAddToCart = useCallback(async () => {
    try {
      // First check if we have all required components
      const missingCategories = componentCategories
        .filter(cat =>
          ['cpu', 'motherboard', 'ram', 'storage'].includes(cat.id)
        )
        .filter(cat => !selectedComponents[cat.id])
        .map(cat => cat.name);

      if (missingCategories.length > 0) {
        alert(
          t('configurator.actions.errors.missingComponents', {
            components: missingCategories.join(', '),
          })
        );
        return;
      } // For authenticated users, save as draft AND add to cart
      if (isAuthenticated) {
        try {
          // Get case image URL if a case is selected and convert to full URL
          const caseComponent = getSingleComponent('case');
          let caseImageUrl = caseComponent?.imageUrl;
          if (caseImageUrl && !caseImageUrl.startsWith('http')) {
            caseImageUrl = `${window.location.origin}${caseImageUrl}`;
          }

          // Save configuration to database as draft
          const configData = {
            name: configName || 'Custom Build',
            description: 'Custom configuration created in configurator',
            imageUrl: caseImageUrl,
            components: Object.entries(selectedComponents).flatMap(
              ([key, component]) => {
                if (Array.isArray(component)) {
                  // Handle services (array of components)
                  return component.map(c => ({
                    id: c.id,
                    quantity: 1,
                  }));
                } else {
                  // Handle single component
                  return [
                    {
                      id: component.id,
                      quantity: 1,
                    },
                  ];
                }
              }
            ),
          };

          await fetch('/api/configurations/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(configData),
          });
        } catch (error) {
          console.warn('Failed to save draft configuration:', error);
          // Don't block cart addition if draft save fails
        }
      }

      // Add individual components to cart (works for both auth and guest users)
      Object.entries(selectedComponents).forEach(([key, component]) => {
        if (Array.isArray(component)) {
          // Handle services (array of components)
          component.forEach(c => {
            addItem(
              {
                id: c.id,
                type: 'component',
                name: c.name,
                price: c.price,
                imageUrl: c.imageUrl || '',
              },
              1
            );
          });
        } else {
          // Handle single component
          addItem(
            {
              id: component.id,
              type: 'component',
              name: component.name,
              price: component.price,
              imageUrl: component.imageUrl || '',
            },
            1
          );
        }
      });

      alert(t('configurator.actions.addedToCart'));

      // Dispatch an event to update cart count in header
      const cartUpdateEvent = new CustomEvent('cartUpdated');
      window.dispatchEvent(cartUpdateEvent);
    } catch (error) {
      console.error('Failed to add configuration to cart:', error);
      alert(t('configurator.actions.errors.addToCartFailed'));
    }
  }, [
    selectedComponents,
    componentCategories,
    configName,
    t,
    isAuthenticated,
    addItem,
  ]);

  // Define filter groups based on active category and available specifications
  const getFilterGroups = useCallback(() => {
    // Category-specific filter group creation
    switch (activeCategory) {
      case 'cpu':
        return createCpuFilterGroups(components, t);
      case 'gpu':
        return createGpuFilterGroups(components);
      case 'ram':
        return createRamFilterGroups(components);
      case 'motherboard':
        return createMotherboardFilterGroups(components);
      case 'storage':
        return createStorageFilterGroups(components);
      case 'psu':
        return createPsuFilterGroups(components);
      case 'case':
        return createCaseFilterGroups(components);
      case 'cooling':
        return createCoolingFilterGroups(components);
      default:
        return [];
    }
  }, [activeCategory, components, t]);
  const handleFiltersChange = useCallback(
    (filters: Record<string, boolean>) => {
      setActiveFilters(filters);
      // Clear quick filter when regular filters are manually changed to prevent conflicts
      setQuickCpuFilter(null);
    },
    []
  );

  return (
    <ConfiguratorLayout>
      {/* Show loading overlay when loading configuration */}
      {isLoadingConfiguration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-stone-950 p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div
                className={`animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 ${
                  theme === 'dark'
                    ? 'border-brand-red-500'
                    : 'border-brand-blue-500'
                }`}
              ></div>
              <span className="text-neutral-900 dark:text-white">
                Loading configuration...
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        <div className="flex space-x-0">
          {/* Left sidebar - Category list */}
          <div className="flex space-x-[1px]">
            <CategoryList
              categories={componentCategories}
              activeCategory={activeCategory}
              selectedComponents={selectedComponents}
              onSetActiveCategory={setActiveCategory}
            />
            <FilterSection
              filterGroups={getFilterGroups()}
              activeFilters={activeFilters}
              onFiltersChange={handleFiltersChange}
              priceRange={priceRange}
              onPriceChange={handlePriceChange}
              activeCategory={activeCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </div>
        </div>

        {/* Middle content area */}
        <div className="flex-grow mx-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center bg-white/5 dark:bg-stone-950/50 mt-2 backdrop-blur-lg px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800">
              <span className="text-brand-blue-600 dark:text-brand-red-400 font-medium mr-2">
                {t('configurator.performance')}
              </span>
              <div className="flex items-center">
                <span className="font-bold text-neutral-900 dark:text-white text-lg">
                  {Object.keys(selectedComponents).length}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  /10
                </span>
              </div>
            </div>

            {Object.keys(selectedComponents).length > 0 && (
              <div className="bg-white/5 dark:bg-stone-950/50 backdrop-blur-lg px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800">
                <span className="text-brand-blue-600 dark:text-brand-red-400">
                  {t('configurator.totalPower')}:
                  <span className="text-neutral-900 dark:text-white font-bold ml-1">
                    {totalPowerConsumption}W
                  </span>
                </span>
              </div>
            )}
          </div>
          {/* CPU quick filter buttons - fixed at top of component list */}
          <div className="sticky top-0 z-10 bg-white dark:bg-stone-950 py-3 rounded-t-lg border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              {' '}
              <div className="flex-1">
                <QuickFilters
                  activeFilter={quickCpuFilter}
                  onFilterChange={handleQuickCpuFilterChange}
                  activeCategory={activeCategory}
                  isQuickFilterActive={isQuickFilterActive}
                  activeFilters={activeFilters}
                />
              </div>
              {/* Clear filters button - only show when filters are active */}
              {(quickCpuFilter ||
                Object.keys(activeFilters).some(key => activeFilters[key])) && (
                <button
                  onClick={() => {
                    setQuickCpuFilter(null);
                    setActiveFilters({});
                  }}
                  className={`ml-4 px-3 py-1 text-sm rounded-md border transition-colors ${
                    theme === 'dark'
                      ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                      : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  {t('configurator.clearFilters')}
                </button>
              )}
            </div>
          </div>
          {/* Component list */}
          <div
            className="bg-white dark:bg-stone-950 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800 flex flex-col"
            style={{ maxHeight: 'calc(100vh - 160px)' }}
          >
            <div className="mb-4 relative p-4 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-neutral-400 dark:text-neutral-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t('common.search')}
                  className="w-full pl-10 p-3 bg-neutral-50 dark:bg-stone-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 dark:focus:ring-brand-red-500 focus:border-transparent transition-colors"
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
            {!loading && components.length === 0 && (
              <div className="p-8 text-center">
                <div className="text-neutral-600 dark:text-neutral-400">
                  {t('configurator.noComponentsFound')}
                </div>{' '}
                <button
                  className="mt-4 text-brand-blue-600 dark:text-brand-red-400 hover:text-brand-blue-700 dark:hover:text-brand-red-300 underline transition-colors"
                  onClick={() => {
                    setSearchQuery('');
                    setPriceRange([minPrice, maxPrice]);
                    setActiveFilters({});
                    setQuickCpuFilter(null);
                  }}
                >
                  {t('configurator.clearAllFilters', {
                    defaultMessage: 'Clear all filters',
                  })}
                </button>
              </div>
            )}{' '}
            <div className="overflow-y-auto scrollbar-hide flex-grow">
              <div
                className={`${theme === 'dark' ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'}`}
                style={{ height: '100%', overflowY: 'auto' }}
              >
                <ComponentSelectionGrid
                  components={components}
                  activeCategory={activeCategory}
                  loading={loading}
                  selectedComponents={selectedComponents}
                  onSelectComponent={handleSelectComponent}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - Selected components & summary */}
        <div className="bg-white dark:bg-stone-950 shadow-lg rounded-lg">
          <SelectedComponentsList
            selectedComponents={selectedComponents}
            componentCategories={componentCategories}
            configName={configName}
            setConfigName={setConfigName}
            totalPrice={totalPrice}
            compatibilityIssues={compatibilityIssues}
            loading={loading}
            onSetActiveCategory={setActiveCategory}
            onSaveConfiguration={handleSaveConfiguration}
            onSubmitConfiguration={handleSubmitConfiguration}
            onAddToCart={handleAddToCart}
            totalPowerConsumption={totalPowerConsumption}
            getRecommendedPsuWattage={getRecommendedPsuWattage}
          />
        </div>

        {/* Compatibility issues modal */}
        {showCompatibilityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-stone-950 p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">
                {t('configurator.compatibility.title')}
              </h2>
              <ul className="list-disc list-inside text-red-600 mb-4">
                {compatibilityIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => setShowCompatibilityModal(false)}
              >
                {t('common.close', { defaultMessage: 'Close' })}
              </button>
            </div>
          </div>
        )}
      </div>
    </ConfiguratorLayout>
  );
};

export default ConfiguratorPage;
