'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import ConfiguratorLayout from './ConfiguratorLayout';
import CategoryList from './CategoryList';
import FilterSection from './FilterSection';
import { createCpuFilterGroups } from './filter/cpuFilters';
import QuickFilters from './QuickFilters';
import ComponentSelectionGrid from './ComponentSelectionGrid';
import SelectedComponentsList from './SelectedComponentsList';
import { checkFormFactorCompatibility } from './compatibility';

import { useAuth } from '@/app/contexts/AuthContext';
import { useCart } from '@/app/contexts/CartContext';

import { Component, Category } from './types';
import { getConfigurationById } from '@/lib/services/dashboardService';

const ConfiguratorPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { addItem } = useCart();
  
  const searchParams = useSearchParams();
  
  const [activeCategory, setActiveCategory] = useState<string>('cpu');
  const [quickCpuFilter, setQuickCpuFilter] = useState<string | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<Record<string, Component>>({});
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
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({});
  const [availableSpecifications, setAvailableSpecifications] = useState<any[]>([]);
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

  // Update price range when components change and min/max prices are calculated
  useEffect(() => {
    if (components.length > 0) {
      // Only update if the current range is still the default or outside the actual bounds
      const currentMin = priceRange[0];
      const currentMax = priceRange[1];
      
      // Update if current range is the default values or outside actual component price bounds
      if ((currentMin === 0 && currentMax === 50000) || 
          currentMin < minPrice || currentMax > maxPrice ||
          (currentMin === 0 && minPrice > 0) || 
          (currentMax === 50000 && maxPrice < 50000)) {
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
        
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          const mappedCategories = data.categories.map((cat: any) => ({
            id: cat.slug,
            name: cat.name,
            slug: cat.slug,
            iconName: getIconNameForCategory(cat.slug)
          }));
          setCategories(mappedCategories);
          
          // If no active category is set, set it to the first category
          if (mappedCategories.length > 0) {
            // Set the active category, but prevent circular dependency 
            // by not including activeCategory in the dependency array
            setActiveCategory(prevCategory => 
              prevCategory || mappedCategories[0].id
            );
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use fallback categories defined below if API fails
      }
    };    fetchCategories();
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
                  'Processors': 'cpu',
                  'Graphics Cards': 'gpu', 
                  'Motherboards': 'motherboard',
                  'Memory': 'ram',
                  'Storage': 'storage',
                  'Cooling': 'cooling',
                  'Cases': 'case',
                  'Power Supplies': 'psu',
                  'Services': 'services'
                };
                
                const categoryId = categoryMap[component.category] || component.category.toLowerCase();
                
                loadedComponents[categoryId] = {
                  id: fullComponent.id,
                  name: fullComponent.name,
                  description: fullComponent.description || '',
                  price: fullComponent.price,
                  imageUrl: fullComponent.imageUrl,
                  categoryId: fullComponent.categoryId,
                  specifications: fullComponent.specifications || {}
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
      'processors': 'cpu',
      'graphics-cards': 'gpu',
      'motherboards': 'motherboard',
      'memory': 'ram',
      'storage': 'storage',
      'cooling': 'cooling',
      'cases': 'case',
      'power-supplies': 'psu',
      'services': 'services'
    };
    return categoryIcons[slug] || slug;
  };
  
  // Default fallback categories (static)
  const fallbackCategories: Category[] = useMemo(() => [
    { id: 'cpu', name: t('categories.cpu'), slug: 'processors', iconName: 'cpu' },
    { id: 'gpu', name: t('categories.gpu'), slug: 'graphics-cards', iconName: 'gpu' },
    { id: 'motherboard', name: t('categories.motherboard'), slug: 'motherboards', iconName: 'motherboard' },
    { id: 'ram', name: t('categories.ram'), slug: 'memory', iconName: 'ram' },
    { id: 'storage', name: t('categories.storage'), slug: 'storage', iconName: 'storage' },
    { id: 'cooling', name: t('categories.cooling'), slug: 'cooling', iconName: 'cooling' },
    { id: 'case', name: t('categories.case'), slug: 'cases', iconName: 'case' },
    { id: 'psu', name: t('categories.psu'), slug: 'power-supplies', iconName: 'psu' },
    { id: 'services', name: t('categories.services'), slug: 'services', iconName: 'services' },
  ], [t]);
  
  const rawCategories = categories.length > 0 ? categories : fallbackCategories;
  const componentCategories: Category[] = useMemo(
    () => rawCategories.filter(cat => cat.slug !== 'networking' && cat.slug !== 'sound-cards'),
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
  }, [activeCategory]);

  // Load components based on active category and apply filters
  useEffect(() => {
    const loadComponents = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        // Add category filter
        const currentSlug = componentCategories.find(cat => cat.id === activeCategory)?.slug || '';
        queryParams.append('category', currentSlug);
        // Handle quick filters
        if (quickCpuFilter) {
          if (['intel','amd','nvidia'].includes(quickCpuFilter)) {
            queryParams.append('spec', `brand=${quickCpuFilter}`);
          } else if (currentSlug === 'processors') {
            if (quickCpuFilter.startsWith('intel-core-')) {
              queryParams.append('spec', 'brand=intel');
              queryParams.append('spec', `model=core-${quickCpuFilter.split('intel-core-')[1]}`);
            } else if (quickCpuFilter.startsWith('amd-ryzen-')) {
              queryParams.append('spec', 'brand=amd');
              queryParams.append('spec', `model=ryzen-${quickCpuFilter.split('amd-ryzen-')[1]}`);
            }
          } else if (currentSlug === 'graphics-cards') {
            if (quickCpuFilter.startsWith('nvidia-')) {
              queryParams.append('spec', 'brand=nvidia');
              queryParams.append('spec', `model=${quickCpuFilter.split('nvidia-')[1]}`);
            } else if (quickCpuFilter.startsWith('amd-rx-')) {
              queryParams.append('spec', 'brand=amd');
              queryParams.append('spec', `model=${quickCpuFilter.split('amd-')[1]}`);
            }
          } else if (currentSlug === 'memory') {
            if (['ddr4', 'ddr5'].includes(quickCpuFilter)) {
              queryParams.append('spec', `type=${quickCpuFilter.toUpperCase()}`);
            } else if (['16gb', '32gb', '64gb'].includes(quickCpuFilter)) {
              queryParams.append('spec', `capacity=${quickCpuFilter.toUpperCase()}`);
            }
          } else if (currentSlug === 'storage') {
            if (quickCpuFilter === 'nvme') queryParams.append('spec', 'type=NVMe SSD');
            else if (quickCpuFilter === 'sata-ssd') queryParams.append('spec', 'type=SATA SSD');
            else if (quickCpuFilter === 'hdd') queryParams.append('spec', 'type=HDD');
          } else if (currentSlug === 'motherboards') {
            if (['atx', 'micro-atx', 'mini-itx'].includes(quickCpuFilter)) {
              queryParams.append('spec', `form_factor=${quickCpuFilter.toUpperCase()}`);
            } else if (quickCpuFilter === 'intel-compatible') queryParams.append('spec', 'cpu_socket=LGA');
            else if (quickCpuFilter === 'amd-compatible') queryParams.append('spec', 'cpu_socket=AM');
          } else if (currentSlug === 'cases') {
            queryParams.append('spec', `form_factor=${quickCpuFilter.toUpperCase()}`);
          } else if (currentSlug === 'cooling') {
            if (quickCpuFilter === 'air') queryParams.append('spec', 'type=Air');
            else if (quickCpuFilter === 'fluid') queryParams.append('spec', 'type=Liquid');
          } else if (currentSlug === 'power-supplies') {
            queryParams.append('spec', `certification=${quickCpuFilter.toUpperCase()}`);
          }
        }        // Add price and other filters
        if (priceRange[0] > minPrice) queryParams.append('minPrice', String(priceRange[0]));
        if (priceRange[1] < maxPrice) queryParams.append('maxPrice', String(priceRange[1]));
        Object.entries(activeFilters).forEach(([key,active]) => {
          if (active) queryParams.append('spec', key.startsWith('intel')||key.startsWith('amd')||key.startsWith('nvidia')? `brand=${key}` : key);
        });
        if (searchQuery) queryParams.append('q', searchQuery);
        const res = await fetch(`/api/components?${queryParams}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        let fetched = data.components || [];
        // Simplified client-side filtering for CPU quick filters
        if (quickCpuFilter && getCurrentCategorySlug() === 'processors') {
          const filterTerm = quickCpuFilter.toLowerCase();
          if (['intel', 'amd', 'nvidia'].includes(filterTerm)) {
            fetched = (fetched as Component[]).filter((component: Component) =>
              component.name.toLowerCase().includes(filterTerm)
            );
          } else {
            // Series filters (e.g., 'intel-core-i9' or 'amd-ryzen-5')
            const searchTerm = filterTerm.replace(/-/g, ' ');
            fetched = (fetched as Component[]).filter((component: Component) =>
              component.name.toLowerCase().includes(searchTerm)
            );
          }
        }
        // Filter incompatible motherboards and cases
        const filtered = fetched.filter((component: Component) => {
          // If loading motherboards and a case is selected, filter by form factor
          if (activeCategory === 'motherboard' && selectedComponents.case) {
            const caseForm = selectedComponents.case.specifications?.['Form Factor']
                            || selectedComponents.case.specifications?.['Motherboard Support']
                            || '';
            return checkFormFactorCompatibility(caseForm, component.specifications?.['Form Factor'] || '');
          }
          // If loading cases and a motherboard is selected, filter by form factor
          if (activeCategory === 'case' && selectedComponents.motherboard) {
            const mbForm = selectedComponents.motherboard.specifications?.['Form Factor'];
            const caseForm = component.specifications?.['Form Factor']
                              || component.specifications?.['Motherboard Support']
                              || '';
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
  }, [activeCategory, quickCpuFilter, searchQuery, priceRange, activeFilters, componentCategories, getCurrentCategorySlug, selectedComponents]);

  // Calculate total price when selected components change
  useEffect(() => {
    // Calculate total price from all selected components
    const total = Object.values(selectedComponents).reduce((sum, component) => {
      return sum + (component.price || 0);
    }, 0);

    setTotalPrice(total);
    
    // Calculate total power consumption
    let totalWattage = 0;
    
    // CPU power consumption
    if (selectedComponents.cpu) {
      const cpuTDP = parseInt(selectedComponents.cpu.specifications?.["TDP"] || "65", 10);
      totalWattage += isNaN(cpuTDP) ? 65 : cpuTDP;
    }
    
    // GPU power consumption
    if (selectedComponents.gpu) {
      const gpuTDP = parseInt(selectedComponents.gpu.specifications?.["Power Consumption"] || "150", 10);
      totalWattage += isNaN(gpuTDP) ? 150 : gpuTDP;
    }
    
    // Other components (estimate)
    if (selectedComponents.motherboard) totalWattage += 30;
    if (selectedComponents.ram) totalWattage += 10;
    if (selectedComponents.storage) totalWattage += 15;
    if (selectedComponents.cooling && selectedComponents.cooling.specifications?.["Type"] === "Liquid") totalWattage += 20;
    
    setTotalPowerConsumption(totalWattage);
    // Check for compatibility issues
    const issues: string[] = [];
    
    // Check CPU and motherboard compatibility
    if (selectedComponents.cpu && selectedComponents.motherboard) {
      const cpuSocket = selectedComponents.cpu.specifications?.["Socket"];
      const mbSocket = selectedComponents.motherboard.specifications?.["CPU Socket"] || 
                      selectedComponents.motherboard.specifications?.["Socket"];
      
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        issues.push(`${t('configurator.compatibility.cpuSocketMismatch')} (${cpuSocket} ≠ ${mbSocket})`);
      }
      
      // Check CPU brand and motherboard chipset compatibility
      const cpuBrand = selectedComponents.cpu.specifications?.["Brand"] || 
                       selectedComponents.cpu.specifications?.["manufacturer"] ||
                       (selectedComponents.cpu.name.toLowerCase().includes('intel') ? 'Intel' : 
                        selectedComponents.cpu.name.toLowerCase().includes('amd') ? 'AMD' : '');
      const chipset = selectedComponents.motherboard.specifications?.["Chipset"];
      
      if (cpuBrand && chipset) {
        const isIntelCpu = cpuBrand.toLowerCase().includes('intel');
        const isAmdCpu = cpuBrand.toLowerCase().includes('amd');
        const isIntelChipset = ['Z790', 'Z690', 'H770', 'H670', 'B760', 'B660', 'H610'].includes(chipset);
        const isAmdChipset = ['X670E', 'X670', 'B650E', 'B650', 'A620', 'X570', 'B550', 'A520', 'B450', 'X470'].includes(chipset);
        
        if ((isIntelCpu && isAmdChipset) || (isAmdCpu && isIntelChipset)) {
          issues.push(`${t('configurator.compatibility.warnings.cpuMotherboardIncompatible.' + (isAmdCpu ? 'amd' : 'intel'))}`);
        }
      }
    }
      // Check RAM and motherboard compatibility
    if (selectedComponents.ram && selectedComponents.motherboard) {
      const ramType = selectedComponents.ram.specifications?.["Type"] || 
                      selectedComponents.ram.specifications?.["Memory Type"];
      const mbRamType = selectedComponents.motherboard.specifications?.["Memory Type"] ||
                        selectedComponents.motherboard.specifications?.["Memory Support"];
      
      if (ramType && mbRamType && !mbRamType.includes(ramType)) {
        issues.push(`${t('configurator.compatibility.ramTypeMismatch')} (${ramType} ≠ ${mbRamType})`);
      }
      
      // Check RAM capacity vs motherboard support
      const ramCapacity = selectedComponents.ram.specifications?.["Capacity"];
      const maxMemory = selectedComponents.motherboard.specifications?.["Max Memory"] ||
                        selectedComponents.motherboard.specifications?.["Maximum Memory"];
      if (ramCapacity && maxMemory) {
        const ramGb = parseInt(ramCapacity.replace(/[^\d]/g, ''));
        const maxGb = parseInt(maxMemory.toString());
        if (!isNaN(ramGb) && !isNaN(maxGb) && ramGb > maxGb) {
          issues.push(`${t('configurator.compatibility.ramCapacityExceeded')} (${ramGb}GB > ${maxGb}GB)`);
        }
      }
      
      // Check RAM speed compatibility
      const ramSpeed = selectedComponents.ram.specifications?.["Speed"];
      const mbMaxRamSpeed = selectedComponents.motherboard.specifications?.["Memory Speed"] ||
                           selectedComponents.motherboard.specifications?.["Max Memory Speed"];
      if (ramSpeed && mbMaxRamSpeed) {
        const ramSpeedMhz = parseInt(ramSpeed.toString().replace(/[^\d]/g, ''));
        const maxSpeedMhz = parseInt(mbMaxRamSpeed.toString().replace(/[^\d]/g, ''));
        if (!isNaN(ramSpeedMhz) && !isNaN(maxSpeedMhz) && ramSpeedMhz > maxSpeedMhz) {
          issues.push(`${t('configurator.compatibility.ramSpeedTooHigh')} (${ramSpeedMhz}MHz > ${maxSpeedMhz}MHz)`);
        }
      }
    }
    
    // Check case and motherboard form factor compatibility
    if (selectedComponents.case && selectedComponents.motherboard) {
      const caseFormFactor = selectedComponents.case.specifications?.["Form Factor"] || 
                            selectedComponents.case.specifications?.["Motherboard Support"];
      const mbFormFactor = selectedComponents.motherboard.specifications?.["Form Factor"];
      
      if (caseFormFactor && mbFormFactor) {
        const isCompatible = checkFormFactorCompatibility(caseFormFactor, mbFormFactor);
        if (!isCompatible) {
          issues.push(`${t('configurator.compatibility.caseMotherboardIncompatible')} (${mbFormFactor} in ${caseFormFactor})`);
        }
      }
    }
      // Check GPU clearance in case
    if (selectedComponents.gpu && selectedComponents.case) {
      const gpuLength = selectedComponents.gpu.specifications?.["Length"] ||
                        selectedComponents.gpu.specifications?.["Card Length"];
      const maxGpuLength = selectedComponents.case.specifications?.["Max GPU Length"] ||
                           selectedComponents.case.specifications?.["Maximum GPU Length"] ||
                           selectedComponents.case.specifications?.["GPU Clearance"];
      
      if (gpuLength && maxGpuLength) {
        const gpuMm = parseInt(gpuLength.toString().replace(/[^\d]/g, ''));
        const maxMm = parseInt(maxGpuLength.toString().replace(/[^\d]/g, ''));
        if (!isNaN(gpuMm) && !isNaN(maxMm) && gpuMm > maxMm) {
          issues.push(`${t('configurator.compatibility.gpuTooLong')} (${gpuMm}mm > ${maxMm}mm)`);
        }
      }
      
      // Check GPU width/height compatibility
      const gpuHeight = selectedComponents.gpu.specifications?.["Height"];
      const maxSlots = selectedComponents.case.specifications?.["Expansion Slots"] ||
                       selectedComponents.case.specifications?.["GPU Slots"];
      const gpuSlots = selectedComponents.gpu.specifications?.["Slot Width"] ||
                       selectedComponents.gpu.specifications?.["Slots Required"];
      
      if (gpuSlots && maxSlots) {
        const gpuSlotsNum = parseInt(gpuSlots.toString().replace(/[^\d]/g, ''));
        const maxSlotsNum = parseInt(maxSlots.toString().replace(/[^\d]/g, ''));
        if (!isNaN(gpuSlotsNum) && !isNaN(maxSlotsNum) && gpuSlotsNum > maxSlotsNum) {
          issues.push(`${t('configurator.compatibility.gpuTooWide')} (${gpuSlotsNum} slots > ${maxSlotsNum} slots)`);
        }
      }
    }
    
    // Check CPU cooler clearance in case
    if (selectedComponents.cooling && selectedComponents.case) {
      const coolerHeight = selectedComponents.cooling.specifications?.["Height"];
      const maxCpuHeight = selectedComponents.case.specifications?.["Max CPU Height"];
      
      if (coolerHeight && maxCpuHeight) {
        const coolerMm = parseInt(coolerHeight.toString().replace(/[^\d]/g, ''));
        const maxMm = parseInt(maxCpuHeight.toString().replace(/[^\d]/g, ''));
        if (!isNaN(coolerMm) && !isNaN(maxMm) && coolerMm > maxMm) {
          issues.push(`${t('configurator.compatibility.coolerTooTall')} (${coolerMm}mm > ${maxMm}mm)`);
        }
      }
    }
      // Check CPU cooler and CPU socket compatibility
    if (selectedComponents.cooling && selectedComponents.cpu) {
      const coolerSockets = selectedComponents.cooling.specifications?.["Socket Support"] ||
                           selectedComponents.cooling.specifications?.["Socket Compatibility"] ||
                           selectedComponents.cooling.specifications?.["Compatible Sockets"];
      const cpuSocket = selectedComponents.cpu.specifications?.["Socket"];
      
      if (coolerSockets && cpuSocket) {
        const supportedSockets = coolerSockets.toString().toLowerCase();
        const currentSocket = cpuSocket.toString().toLowerCase();
        
        // More flexible socket checking
        const isSocketSupported = supportedSockets.includes(currentSocket) ||
                                 supportedSockets.includes('universal') ||
                                 supportedSockets.includes('all');
        
        if (!isSocketSupported) {
          issues.push(`${t('configurator.compatibility.coolerSocketMismatch')} (${cpuSocket} not in ${coolerSockets})`);
        }
      }
    }
    
    // Check CPU TDP vs cooler TDP rating
    if (selectedComponents.cooling && selectedComponents.cpu) {
      const coolerMaxTdp = selectedComponents.cooling.specifications?.["Max TDP"];
      const cpuTdp = selectedComponents.cpu.specifications?.["TDP"];
      
      if (coolerMaxTdp && cpuTdp) {
        const coolerTdpNum = parseInt(coolerMaxTdp.toString().replace(/[^\d]/g, ''));
        const cpuTdpNum = parseInt(cpuTdp.toString().replace(/[^\d]/g, ''));
        if (!isNaN(coolerTdpNum) && !isNaN(cpuTdpNum) && cpuTdpNum > coolerTdpNum) {
          issues.push(`${t('configurator.compatibility.coolerInsufficientTdp')} (${cpuTdpNum}W > ${coolerTdpNum}W)`);
        }
      }
    }
    
    // Check PSU length in case
    if (selectedComponents.psu && selectedComponents.case) {
      const psuLength = selectedComponents.psu.specifications?.["Length"];
      const maxPsuLength = selectedComponents.case.specifications?.["Max PSU Length"];
      
      if (psuLength && maxPsuLength) {
        const psuMm = parseInt(psuLength.toString().replace(/[^\d]/g, ''));
        const maxMm = parseInt(maxPsuLength.toString().replace(/[^\d]/g, ''));
        if (!isNaN(psuMm) && !isNaN(maxMm) && psuMm > maxMm) {
          issues.push(`${t('configurator.compatibility.psuTooLong')} (${psuMm}mm > ${maxMm}mm)`);
        }
      }
    }
    
    // Check radiator support for liquid cooling
    if (selectedComponents.cooling && selectedComponents.case) {
      const coolerType = selectedComponents.cooling.specifications?.["Type"];
      const radiatorSize = selectedComponents.cooling.specifications?.["Radiator Size"];
      const caseRadiatorSupport = selectedComponents.case.specifications?.["Radiator Support"];
      
      if (coolerType?.toString().toLowerCase().includes('liquid') && radiatorSize && caseRadiatorSupport) {
        const radSize = parseInt(radiatorSize.toString().replace(/[^\d]/g, ''));
        const maxRadSize = parseInt(caseRadiatorSupport.toString().replace(/[^\d]/g, ''));
        if (!isNaN(radSize) && !isNaN(maxRadSize) && radSize > maxRadSize) {
          issues.push(`${t('configurator.compatibility.radiatorTooLarge')} (${radSize}mm > ${maxRadSize}mm)`);
        }
      }
    }      // Check if PSU is powerful enough
    if (selectedComponents.psu && totalWattage > 0) {
      // Try multiple field names for PSU wattage from database
      const psuWattageStr = selectedComponents.psu.specifications?.["wattage"] || 
                           selectedComponents.psu.specifications?.["Wattage"] || 
                           selectedComponents.psu.specifications?.["Power"] ||
                           selectedComponents.psu.specifications?.["power"] ||
                           selectedComponents.psu.specifications?.["watts"] ||
                           selectedComponents.psu.specifications?.["Watts"];
      
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
          issues.push(`${t('configurator.compatibility.psuCriticallyUnderpowered')} (${psuWattage}W < ${totalWattage}W)`);
        } else if (psuWattage < minWattage) {
          issues.push(`${t('configurator.compatibility.psuDangerouslyUnderpowered')} (${psuWattage}W < ${minWattage}W minimum)`);
        } else if (psuWattage < recommendedWattage) {
          issues.push(`${t('configurator.compatibility.psuUnderpowered')} (${psuWattage}W < ${recommendedWattage}W recommended)`);
        }
      } else {
        // If we can't determine PSU wattage, show a warning
        issues.push(`${t('configurator.compatibility.psuWattageUnknown')} (${totalWattage}W required)`);
      }
      
      // Check PSU efficiency rating vs system requirements
      const efficiency = selectedComponents.psu.specifications?.["efficiency"] ||
                         selectedComponents.psu.specifications?.["Efficiency"];
      if (totalWattage > 500 && efficiency) {
        const efficiencyStr = efficiency.toString().toLowerCase();
        const has80Plus = efficiencyStr.includes('80 plus') || 
                         efficiencyStr.includes('80+') || 
                         efficiencyStr.includes('80plus');
        
        if (!has80Plus) {
          issues.push(`${t('configurator.compatibility.psuLowEfficiency')} (High power system needs 80 PLUS rated PSU)`);
        }
      }
      
      // Check PSU form factor compatibility with case
      const psuFormFactor = selectedComponents.psu.specifications?.["Form Factor"] ||
                           selectedComponents.psu.specifications?.["form_factor"];
      if (psuFormFactor && selectedComponents.case) {
        const caseFormFactor = selectedComponents.case.specifications?.["PSU Form Factor"] ||
                              selectedComponents.case.specifications?.[" PSU Support"];
        if (caseFormFactor && !caseFormFactor.toString().toLowerCase().includes(psuFormFactor.toString().toLowerCase())) {
          issues.push(`${t('configurator.compatibility.psuFormFactorIncompatible')} (${psuFormFactor} not supported by case)`);
        }
      }
    }
    
    // Check storage interface compatibility with motherboard
    if (selectedComponents.storage && selectedComponents.motherboard) {
      const storageType = selectedComponents.storage.specifications?.["Type"];
      const storageInterface = selectedComponents.storage.specifications?.["Interface"];
      const mbM2Slots = selectedComponents.motherboard.specifications?.["M.2 Slots"];
      const mbSataConnectors = selectedComponents.motherboard.specifications?.["SATA Connectors"];
      
      if (storageType && (storageType.includes('NVMe') || storageType.includes('M.2'))) {
        const m2Slots = parseInt(mbM2Slots?.toString() || "0");
        if (m2Slots === 0) {
          issues.push(`${t('configurator.compatibility.noM2Slots')}`);
        }
      } else if (storageInterface?.includes('SATA') || storageType?.includes('SATA')) {
        const sataConnectors = parseInt(mbSataConnectors?.toString() || "0");
        if (sataConnectors === 0) {
          issues.push(`${t('configurator.compatibility.noSataConnectors')}`);
        }      }
    }
    
    // Check motherboard memory slot capacity
    if (selectedComponents.ram && selectedComponents.motherboard) {
      const ramModules = selectedComponents.ram.specifications?.["Modules"] ||
                        selectedComponents.ram.specifications?.["Module Count"];
      const mbMemorySlots = selectedComponents.motherboard.specifications?.["Memory Slots"] ||
                           selectedComponents.motherboard.specifications?.["RAM Slots"];
      
      if (ramModules && mbMemorySlots) {
        const moduleCount = parseInt(ramModules.toString().replace(/[^\d]/g, ''));
        const slotCount = parseInt(mbMemorySlots.toString().replace(/[^\d]/g, ''));
        if (!isNaN(moduleCount) && !isNaN(slotCount) && moduleCount > slotCount) {
          issues.push(`${t('configurator.compatibility.motherboardMemorySlotInsufficient')} (${moduleCount} modules > ${slotCount} slots)`);
        }
      }
    }
    
    // Check GPU power connector compatibility
    if (selectedComponents.gpu && selectedComponents.psu) {
      const gpuPowerConnectors = selectedComponents.gpu.specifications?.["Power Connectors"] ||
                                selectedComponents.gpu.specifications?.["Power Requirements"];
      const psuConnectors = selectedComponents.psu.specifications?.["GPU Connectors"] ||
                           selectedComponents.psu.specifications?.["PCIe Connectors"];
      
      if (gpuPowerConnectors && psuConnectors) {
        // Extract 8-pin and 6-pin connector requirements
        const gpu8pin = (gpuPowerConnectors.toString().match(/8[\s-]*pin/gi) || []).length;
        const gpu6pin = (gpuPowerConnectors.toString().match(/6[\s-]*pin/gi) || []).length;
        const psu8pin = (psuConnectors.toString().match(/8[\s-]*pin/gi) || []).length;
        const psu6pin = (psuConnectors.toString().match(/6[\s-]*pin/gi) || []).length;
        
        if (gpu8pin > psu8pin || gpu6pin > psu6pin) {
          issues.push(`${t('configurator.compatibility.insufficientPowerConnectors')} (GPU needs ${gpu8pin}x8pin + ${gpu6pin}x6pin)`);
        }
      }
    }
    
    // Check CPU cooler mounting conflicts
    if (selectedComponents.cooling && selectedComponents.ram && selectedComponents.motherboard) {
      const coolerType = selectedComponents.cooling.specifications?.["Type"];
      const ramHeight = selectedComponents.ram.specifications?.["Height"] ||
                       selectedComponents.ram.specifications?.["Profile"];
      
      if (coolerType && ramHeight) {
        const isTowerCooler = coolerType.toString().toLowerCase().includes('tower') ||
                             coolerType.toString().toLowerCase().includes('air');
        const isHighProfileRam = ramHeight.toString().toLowerCase().includes('high') ||
                                parseInt(ramHeight.toString().replace(/[^\d]/g, '')) > 40;
        
        if (isTowerCooler && isHighProfileRam) {
          issues.push(`${t('configurator.compatibility.cpuCoolerMountingConflict')} (Tower cooler + High profile RAM)`);
        }
      }
    }
    
    setCompatibilityIssues(issues);
    setShowCompatibilityModal(issues.length > 0);
  }, [selectedComponents, t]);
  
  // Calculate recommended PSU wattage
  const getRecommendedPsuWattage = useCallback(() => {
    // Add 30% headroom to the total power consumption
    const recommendedWattage = Math.max(450, Math.ceil(totalPowerConsumption * 1.3));
    
    // Round up to the nearest common PSU wattage
    if (recommendedWattage <= 500) return '500W';
    if (recommendedWattage <= 600) return '600W';
    if (recommendedWattage <= 650) return '650W';
    if (recommendedWattage <= 750) return '750W';
    if (recommendedWattage <= 850) return '850W';
    if (recommendedWattage <= 1000) return '1000W';
    return '1200W+';
  }, [totalPowerConsumption]);
  
  // Handle component selection
  const handleSelectComponent = useCallback((component: Component) => {
    setSelectedComponents(prev => ({
      ...prev,
      [activeCategory]: component
    }));
  }, [activeCategory]);
  
  // Handle quick filter change
  const handleQuickCpuFilterChange = useCallback((filterType: string | null) => {
    if (filterType === null) {
      setQuickCpuFilter(null);
      return;
    }

    setQuickCpuFilter(filterType);
  }, []);
  
  // Handle search query change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  // Handle price range change
  const handlePriceChange = useCallback((range: [number, number]) => {
    setPriceRange(range);
  }, []);  // Handle save configuration
  const handleSaveConfiguration = useCallback(async () => {
    console.log('🔍 Starting save configuration...', { isAuthenticated, user, configName });
    
    // Check if user is authenticated for saving drafts
    if (!isAuthenticated) {
      alert(t('configurator.actions.errors.loginToSave', { defaultMessage: 'You must be logged in to save a configuration' }));
      return;
    }

    try {
      // Get case image URL if a case is selected and convert to full URL
      let caseImageUrl = selectedComponents.case?.imageUrl;
      if (caseImageUrl && !caseImageUrl.startsWith('http')) {
        caseImageUrl = `${window.location.origin}${caseImageUrl}`;
      }
      
      // Prepare configuration data
      const configData = {
        name: configName,
        imageUrl: caseImageUrl,
        components: Object.values(selectedComponents).map(component => ({
          id: component.id,
          quantity: 1
        }))
      };

      console.log('📝 Configuration data to save:', configData);

      // Save configuration to database as draft for logged-in users
      const saveResponse = await fetch('/api/configurations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      });      if (saveResponse.ok) {
        const result = await saveResponse.json();
        console.log('✅ Save successful:', result);
        alert(t('configurator.actions.saved', { name: configName }));
      } else {
        const errorData = await saveResponse.json();
        console.error('❌ Save failed:', { status: saveResponse.status, statusText: saveResponse.statusText, errorData });
        throw new Error(errorData.error || t('configurator.actions.errors.saveFailed'));
      }
    } catch (error) {
      console.error('🚨 Failed to save configuration:', error);
      alert(t('configurator.actions.errors.saveFailed'));
    }
  }, [configName, selectedComponents, t, isAuthenticated]);    // Handle submit configuration
  const handleSubmitConfiguration = useCallback(async () => {
    try {
      // Get case image URL if a case is selected and convert to full URL
      let caseImageUrl = selectedComponents.case?.imageUrl;
      if (caseImageUrl && !caseImageUrl.startsWith('http')) {
        caseImageUrl = `${window.location.origin}${caseImageUrl}`;
      }
      
      // First save the configuration
      const saveResponse = await fetch('/api/configurations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: configName,
          imageUrl: caseImageUrl,
          components: Object.values(selectedComponents).map(component => ({
            id: component.id,
            quantity: 1
          }))
        })
      });
      
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || t('configurator.actions.errors.saveFailed'));
      }
      
      const savedConfig = await saveResponse.json();
      
      // Then create an order with this configuration
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          configurationId: savedConfig.configuration.id,
          totalAmount: totalPrice
        })
      });
      
      if (orderResponse.ok) {
        // Redirect to checkout page
        window.location.href = '/checkout';
      } else {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || t('configurator.actions.errors.orderFailed'));
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
        .filter(cat => ['cpu', 'motherboard', 'ram', 'storage'].includes(cat.id))
        .filter(cat => !selectedComponents[cat.id])
        .map(cat => cat.name);

      if (missingCategories.length > 0) {
        alert(t('configurator.actions.errors.missingComponents', { components: missingCategories.join(', ') }));
        return;
      }      // For authenticated users, save as draft AND add to cart
      if (isAuthenticated) {
        try {
          // Get case image URL if a case is selected and convert to full URL
          let caseImageUrl = selectedComponents.case?.imageUrl;
          if (caseImageUrl && !caseImageUrl.startsWith('http')) {
            caseImageUrl = `${window.location.origin}${caseImageUrl}`;
          }
          
          // Save configuration to database as draft
          const configData = {
            name: configName || 'Custom Build',
            description: 'Custom configuration created in configurator',
            imageUrl: caseImageUrl,
            components: Object.values(selectedComponents).map(component => ({
              id: component.id,
              quantity: 1
            }))
          };

          await fetch('/api/configurations/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(configData)
          });
        } catch (error) {
          console.warn('Failed to save draft configuration:', error);
          // Don't block cart addition if draft save fails
        }
      }

      // Add individual components to cart (works for both auth and guest users)
      Object.values(selectedComponents).forEach(component => {
        addItem({
          id: component.id,
          type: 'component',
          name: component.name,
          price: component.price,
          imageUrl: component.imageUrl || ''
        }, 1);
      });

      alert(t('configurator.actions.addedToCart'));
      
      // Dispatch an event to update cart count in header
      const cartUpdateEvent = new CustomEvent('cartUpdated');
      window.dispatchEvent(cartUpdateEvent);

    } catch (error) {
      console.error('Failed to add configuration to cart:', error);
      alert(t('configurator.actions.errors.addToCartFailed'));
    }
  }, [selectedComponents, componentCategories, configName, t, isAuthenticated, addItem]);
  
  // Define filter groups based on active category and available specifications
  const getFilterGroups = useCallback(() => {
    // Category-specific filter group creation
    switch (activeCategory) {
      case 'cpu':
        return createCpuFilterGroups(components);
      // TODO: Add cases for other categories e.g., gpu, motherboard, ram, etc.
      default:
        return [];
    }
  }, [activeCategory, components]);
  
  const handleFiltersChange = useCallback((filters: Record<string, boolean>) => {
    setActiveFilters(filters);
  }, []);
    return (
    <ConfiguratorLayout>
      {/* Show loading overlay when loading configuration */}
      {isLoadingConfiguration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-stone-950 p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 dark:border-red-500"></div>
              <span className="text-neutral-900 dark:text-white">Loading configuration...</span>
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
                <span className="text-neutral-500 dark:text-neutral-400">/10</span>
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
            <QuickFilters 
              activeFilter={quickCpuFilter} 
              onFilterChange={handleQuickCpuFilterChange}
              activeCategory={activeCategory} 
            />
          </div>
          
          {/* Component list */}
          <div className="bg-white dark:bg-stone-950 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800">
            <div className="mb-4 relative p-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t('common.search')}
                  className="w-full pl-10 p-3 bg-neutral-50 dark:bg-stone-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 dark:focus:ring-brand-red-500 focus:border-transparent transition-colors"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
            
            {!loading && components.length === 0 && (
              <div className="p-8 text-center">
                <div className="text-neutral-600 dark:text-neutral-400">
                  {t('configurator.noComponentsFound')}
                </div>                <button 
                  className="mt-4 text-brand-blue-600 dark:text-brand-red-400 hover:text-brand-blue-700 dark:hover:text-brand-red-300 underline transition-colors"
                  onClick={() => {
                    setSearchQuery('');
                    setPriceRange([minPrice, maxPrice]);
                    setActiveFilters({});
                    setQuickCpuFilter(null);
                  }}
                >
                  {t('configurator.clearAllFilters', {defaultMessage: 'Clear all filters'})}
                </button>
              </div>
            )}
            
            <ComponentSelectionGrid
              components={components}
              activeCategory={activeCategory}
              loading={loading}
              selectedComponents={selectedComponents}
              onSelectComponent={handleSelectComponent}
            />
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
              <h2 className="text-xl font-semibold mb-4">{t('configurator.compatibility.title')}</h2>
              <ul className="list-disc list-inside text-red-600 mb-4">
                {compatibilityIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => setShowCompatibilityModal(false)}
              >{t('common.close', { defaultMessage: 'Close' })}</button>
            </div>
          </div>
        )}
      </div>
    </ConfiguratorLayout>
  );
};

export default ConfiguratorPage;
