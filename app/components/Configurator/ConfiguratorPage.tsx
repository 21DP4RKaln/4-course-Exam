"use client"

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { useCart } from '@/app/contexts/CartContext'
import { FilterGroup } from './AdvancedFilter'
import Image from 'next/image'
import Link from 'next/link'

import CategoryList from './CategoryList'
import ComponentSelectionGrid from './ComponentSelectionGrid'
import SelectedComponentsList from './SelectedComponentsList'
import QuickFilters from './QuickFilters'
import CompatibilityChecker from './CompatibilityChecker'
import AdvancedFilter from './AdvancedFilter'

import { Component, Category } from './interfaces'
import { Filter, Search, X, ChevronDown, Check } from 'lucide-react'

export default function ConfiguratorPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const locale = pathname.split('/')[1]
  
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [selectedComponents, setSelectedComponents] = useState<Record<string, Component | undefined>>({})
  const [configName, setConfigName] = useState('')
  const [loading, setLoading] = useState(false)
  const [componentCategories, setComponentCategories] = useState<Category[]>([])
  const [currentComponents, setCurrentComponents] = useState<Component[]>([])
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([])
  const [isLoadingComponents, setIsLoadingComponents] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [quickCpuFilter, setQuickCpuFilter] = useState<string | null>(null)
  const [totalPowerConsumption, setTotalPowerConsumption] = useState(0)
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/components')
        if (!response.ok) throw new Error('Failed to fetch component categories')
        
        const data = await response.json()
        const categoriesMap = new Map()
        
        data.categories.forEach((cat: any) => {
          if (!categoriesMap.has(cat.id)) {
            categoriesMap.set(cat.id, {
              id: cat.id,
              name: cat.name,
              slug: cat.slug
            })
          }
        })

        const uniqueCategories = Array.from(categoriesMap.values())
        
        setComponentCategories(uniqueCategories)
  
        if (!activeCategory && uniqueCategories.length > 0) {
          setActiveCategory(uniqueCategories[0].id)
        }
        
      } catch (error) {
        console.error('Error fetching component categories:', error)
      }
    }
    
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!activeCategory) return
    
    const fetchComponents = async () => {
      setIsLoadingComponents(true)
      try {
        const response = await fetch(`/api/components?category=${activeCategory}`)
        if (!response.ok) throw new Error('Failed to fetch components')
        
        const data = await response.json()
        setCurrentComponents(data.components || [])
      } catch (error) {
        console.error('Error fetching components:', error)
      } finally {
        setIsLoadingComponents(false)
      }
    }
    
    fetchComponents()

    setSearchQuery('')
    setActiveFilters([])
 
    if (activeCategory === 'cpu' && quickCpuFilter) {
      setActiveFilters([quickCpuFilter])
    }
  }, [activeCategory, quickCpuFilter])
  
  const getRecommendedPsuWattage = useCallback(() => {
    if (totalPowerConsumption === 0) return 'N/A'

    if (totalPowerConsumption <= 300) return '450W'
    if (totalPowerConsumption <= 400) return '550W'
    if (totalPowerConsumption <= 500) return '650W'
    if (totalPowerConsumption <= 650) return '750W'
    if (totalPowerConsumption <= 800) return '850W'
    return '1000W+'
  }, [totalPowerConsumption])

  const extractWattage = useCallback((name: string): number => {
    const match = name.match(/(\d+)\s*w/i)
    if (match && match[1]) {
      return parseInt(match[1], 10)
    }
    return 0
  }, [])

  useEffect(() => {
    if (currentComponents.length === 0) return
    
    let result = [...currentComponents]
 
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(component => 
        component.name.toLowerCase().includes(query) || 
        (component.description && component.description.toLowerCase().includes(query))
      )
    }
 
    if (activeFilters.length > 0) {
      result = result.filter(component => {
        const componentNameLower = component.name.toLowerCase()
        const componentDescription = (component.description || '').toLowerCase()
        const specs = component.specifications || {}
        
        return activeFilters.some(filter => {
          switch (activeCategory) {
            case 'cpu':
              switch (filter) {
                case 'intel-core-i9': return componentNameLower.includes('i9') || componentNameLower.includes('intel core i9')
                case 'intel-core-i7': return componentNameLower.includes('i7') || componentNameLower.includes('intel core i7')
                case 'intel-core-i5': return componentNameLower.includes('i5') || componentNameLower.includes('intel core i5')
                case 'intel-core-i3': return componentNameLower.includes('i3') || componentNameLower.includes('intel core i3')
                case 'amd-ryzen-9': return componentNameLower.includes('ryzen 9')
                case 'amd-ryzen-7': return componentNameLower.includes('ryzen 7')
                case 'amd-ryzen-5': return componentNameLower.includes('ryzen 5')
                case 'amd-ryzen-3': return componentNameLower.includes('ryzen 3')
                default: return false
              }
              
            case 'motherboard':
              if (selectedComponents.cpu) {
                const cpuName = selectedComponents.cpu.name.toLowerCase()
                if ((cpuName.includes('intel') || cpuName.includes('core i')) && 
                    (filter === 'intel-compatible' || filter === 'z690' || filter === 'z790' || 
                     filter === 'b660' || filter === 'b760' || filter === 'lga1700')) {
                  return componentNameLower.includes('intel') || 
                         componentNameLower.includes('z690') ||
                         componentNameLower.includes('z790') ||
                         componentNameLower.includes('b660') ||
                         componentNameLower.includes('b760') ||
                         componentNameLower.includes('lga1700')
                }
                if ((cpuName.includes('amd') || cpuName.includes('ryzen')) && 
                    (filter === 'amd-compatible' || filter === 'am4' || filter === 'am5' || 
                     filter === 'b550' || filter === 'x570' || filter === 'b650' || 
                     filter === 'x670')) {
                  return componentNameLower.includes('amd') || 
                         componentNameLower.includes('am4') ||
                         componentNameLower.includes('am5') ||
                         componentNameLower.includes('b550') ||
                         componentNameLower.includes('x570') ||
                         componentNameLower.includes('b650') ||
                         componentNameLower.includes('x670')
                }
              }
              
              switch (filter) {
                case 'atx': 
                  return componentNameLower.includes('atx') && 
                         !componentNameLower.includes('micro') && 
                         !componentNameLower.includes('m-atx')
                case 'micro-atx': 
                  return componentNameLower.includes('micro-atx') || 
                         componentNameLower.includes('matx') || 
                         componentNameLower.includes('m-atx')
                case 'mini-itx': 
                  return componentNameLower.includes('mini-itx') || 
                         componentNameLower.includes('itx')
                default: return false
              }
              
            case 'gpu':
              switch (filter) {
                case 'nvidia-rtx-40': return componentNameLower.includes('rtx 40') || componentNameLower.includes('rtx40')
                case 'nvidia-rtx-30': return componentNameLower.includes('rtx 30') || componentNameLower.includes('rtx30')
                case 'nvidia-gtx-16': return componentNameLower.includes('gtx 16') || componentNameLower.includes('gtx16')
                case 'amd-rx-7000': return componentNameLower.includes('rx 7') || componentNameLower.includes('radeon rx 7')
                case 'amd-rx-6000': return componentNameLower.includes('rx 6') || componentNameLower.includes('radeon rx 6')
                case 'intel-arc': return componentNameLower.includes('intel arc') || componentNameLower.includes('arc')
                default: return false
              }
              
            case 'case':
              switch (filter) {
                case 'atx': 
                  return (componentNameLower.includes('atx') && !componentNameLower.includes('micro') && !componentNameLower.includes('m-atx')) ||
                         componentDescription.includes('atx') ||
                         (specs.motherboardSupport && specs.motherboardSupport.includes('ATX'))
                case 'micro-atx': 
                  return componentNameLower.includes('micro-atx') || 
                         componentNameLower.includes('matx') || 
                         componentNameLower.includes('m-atx') ||
                         (specs.motherboardSupport && specs.motherboardSupport.includes('M-ATX'))
                case 'mini-itx': 
                  return componentNameLower.includes('mini-itx') || 
                         componentNameLower.includes('itx') ||
                         (specs.motherboardSupport && specs.motherboardSupport.includes('ITX'))
                default: return false
              }
              
            case 'psu':
              if (totalPowerConsumption > 0) {
                const wattage = extractWattage(componentNameLower)
                if (filter === 'recommended-wattage') {
                  return wattage >= totalPowerConsumption
                }
              }
                
              switch (filter) {
                case '1000w+': return extractWattage(componentNameLower) >= 1000
                case '850w-999w': return extractWattage(componentNameLower) >= 850 && extractWattage(componentNameLower) < 1000
                case '750w-849w': return extractWattage(componentNameLower) >= 750 && extractWattage(componentNameLower) < 850
                case '650w-749w': return extractWattage(componentNameLower) >= 650 && extractWattage(componentNameLower) < 750
                case 'below-650w': return extractWattage(componentNameLower) < 650
                default: return false
              }
              
            default:
              return componentNameLower.includes(filter) || componentDescription.includes(filter)
          }
        })
      })
    }
 
    if (activeCategory === 'motherboard' && selectedComponents.cpu) {
      const cpuName = selectedComponents.cpu.name.toLowerCase()
      const isAmdCpu = cpuName.includes('ryzen') || cpuName.includes('amd')
      const isIntelCpu = cpuName.includes('intel') || cpuName.includes('core i')
      
      if (isAmdCpu) {
        result = result.filter(motherboard => {
          const mbName = motherboard.name.toLowerCase()
          return mbName.includes('amd') || mbName.includes('am4') || mbName.includes('am5') ||
                 mbName.includes('b550') || mbName.includes('x570') || mbName.includes('b650') || 
                 mbName.includes('x670')
        })
      } else if (isIntelCpu) {
        result = result.filter(motherboard => {
          const mbName = motherboard.name.toLowerCase()
          return mbName.includes('intel') || mbName.includes('z690') || mbName.includes('z790') ||
                 mbName.includes('b660') || mbName.includes('b760') || mbName.includes('lga1700')
        })
      }
    }

    if (activeCategory === 'psu' && totalPowerConsumption > 0) {
      result = result.filter(psu => {
        const wattage = extractWattage(psu.name.toLowerCase())
        return wattage >= totalPowerConsumption
      })
    }
    
    setFilteredComponents(result)
  }, [currentComponents, searchQuery, activeFilters, activeCategory, extractWattage, totalPowerConsumption, selectedComponents.cpu])
  
  const totalPrice = Object.values(selectedComponents).reduce(
    (sum, component) => sum + (component?.price || 0),
    0
  )

  useEffect(() => {
    let totalPower = 0;
 
    Object.entries(selectedComponents).forEach(([key, component]) => {
      if (!component) return;
     
      const specs = component.specifications || {};
      if (specs.tdp) {
        const tdpMatch = String(specs.tdp).match(/(\d+)/);
        if (tdpMatch) {
          totalPower += parseInt(tdpMatch[1], 10);
          return;
        }
      }
   
      const componentName = component.name.toLowerCase();
      const categoryId = component.categoryId.toLowerCase();
      
      if (categoryId === 'cpu') {
        if (componentName.includes('i9')) {
          totalPower += 125;
        } else if (componentName.includes('i7')) {
          totalPower += 95;
        } else if (componentName.includes('i5')) {
          totalPower += 65;
        } else if (componentName.includes('i3')) {
          totalPower += 50;
        } else if (componentName.includes('ryzen 9')) {
          totalPower += 105;
        } else if (componentName.includes('ryzen 7')) {
          totalPower += 95;
        } else if (componentName.includes('ryzen 5')) {
          totalPower += 65;
        } else if (componentName.includes('ryzen 3')) {
          totalPower += 45;
        } else {
          totalPower += 75; 
        }
      } else if (categoryId === 'gpu') {
        if (componentName.includes('rtx 40')) {
          totalPower += 320;
        } else if (componentName.includes('rtx 30')) {
          totalPower += 260;
        } else if (componentName.includes('rtx 20')) {
          totalPower += 200;
        } else if (componentName.includes('gtx 16')) {
          totalPower += 120;
        } else if (componentName.includes('rx 7')) {
          totalPower += 300;
        } else if (componentName.includes('rx 6')) {
          totalPower += 230;
        } else {
          totalPower += 150; 
        }
      } else if (categoryId === 'motherboard') {
        totalPower += 50;
      } else if (categoryId === 'ram') {
        totalPower += 10;
      } else if (categoryId === 'storage') {
        totalPower += 10;
      } else if (categoryId === 'cooling') {
        if (componentName.includes('aio')) {
          totalPower += 15;
        } else {
          totalPower += 5;
        }
      }
    });
  
    totalPower = Math.ceil(totalPower * 1.1);
    
    setTotalPowerConsumption(totalPower);
  }, [selectedComponents]);

  useEffect(() => {
    const issues: string[] = [];
   
    if (selectedComponents.cpu && selectedComponents.motherboard) {
      const cpuName = selectedComponents.cpu.name.toLowerCase();
      const motherboardName = selectedComponents.motherboard.name.toLowerCase();
      
      const isAmdCpu = cpuName.includes('ryzen') || cpuName.includes('amd');
      const isIntelCpu = cpuName.includes('intel') || cpuName.includes('core i');
      
      if (isAmdCpu && !motherboardName.includes('am4') && !motherboardName.includes('am5') && 
          !motherboardName.includes('amd') && !motherboardName.includes('b550') && 
          !motherboardName.includes('x570') && !motherboardName.includes('b650') && 
          !motherboardName.includes('x670')) {
        issues.push(t('configurator.compatibility.warnings.cpuMotherboardIncompatible.amd'));
      }
      
      if (isIntelCpu && !motherboardName.includes('intel') && !motherboardName.includes('z690') && 
          !motherboardName.includes('z790') && !motherboardName.includes('b660') && 
          !motherboardName.includes('b760') && !motherboardName.includes('lga1700')) {
        issues.push(t('configurator.compatibility.warnings.cpuMotherboardIncompatible.intel'));
      }
    }
   
    if (selectedComponents.case && selectedComponents.motherboard) {
      const caseName = selectedComponents.case.name.toLowerCase();
      const motherboardName = selectedComponents.motherboard.name.toLowerCase();
      
      const isMicroAtxMotherboard = motherboardName.includes('micro-atx') || motherboardName.includes('matx') || motherboardName.includes('m-atx');
      const isMiniItxMotherboard = motherboardName.includes('mini-itx') || motherboardName.includes('itx');
      const isAtxMotherboard = !isMicroAtxMotherboard && !isMiniItxMotherboard && (motherboardName.includes('atx') || !motherboardName.includes('form factor'));
      
      const isMiniItxCase = caseName.includes('mini-itx') || caseName.includes('itx');
      const isMicroAtxCase = caseName.includes('micro-atx') || caseName.includes('matx');
      
      if (isAtxMotherboard && isMiniItxCase) {
        issues.push(t('configurator.compatibility.warnings.caseMotherboardIncompatible.tooSmall'));
      }
      
      if (isAtxMotherboard && isMicroAtxCase && !caseName.includes('atx support')) {
        issues.push(t('configurator.compatibility.warnings.caseMotherboardIncompatible.mayBeSmall'));
      }
    }

    if (selectedComponents.psu && totalPowerConsumption > 0) {
      const psuName = selectedComponents.psu.name.toLowerCase();
      let psuWattage = 0;
 
      const wattageMatch = psuName.match(/(\d+)\s*w/i);
      if (wattageMatch && wattageMatch[1]) {
        psuWattage = parseInt(wattageMatch[1], 10);
      }
      
      if (psuWattage > 0 && psuWattage < totalPowerConsumption) {
        const issueMessage = t('configurator.compatibility.warnings.psuInsufficient', { 
          psuWattage: psuWattage, 
          requiredWattage: totalPowerConsumption 
        });
        issues.push(issueMessage);
      }
    }
    
    setCompatibilityIssues(issues);
  }, [selectedComponents, totalPowerConsumption, t]);

  const handleSelectComponent = useCallback((component: Component) => {
    setSelectedComponents(current => ({
      ...current,
      [activeCategory]: component
    }));
  }, [activeCategory]);

  const handleSaveConfiguration = useCallback(async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    const configNameToUse = configName.trim() || "My Configuration";
    setConfigName(configNameToUse);

    setLoading(true);
    try {
      const response = await fetch('/api/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: configNameToUse,
          components: Object.entries(selectedComponents)
            .filter(([_, component]) => component !== undefined)
            .map(([_, component]) => ({
              id: component!.id,
              quantity: 1
            }))
        }),
      });

      if (!response.ok) throw new Error('Failed to save configuration');
      
      const data = await response.json();
      alert(t('configurator.actions.saved'));
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert(t('configurator.actions.errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  }, [configName, isAuthenticated, router, locale, selectedComponents, t]);

  const handleSubmitConfiguration = useCallback(async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    const configNameToUse = configName.trim() || "My Configuration";
    setConfigName(configNameToUse);

    const requiredCategories = componentCategories
      .filter(cat => ['cpu', 'motherboard', 'ram', 'storage', 'psu'].includes(cat.id))
      .map(cat => cat.id);
    
    const missingComponents = requiredCategories.filter(cat => !selectedComponents[cat]);

    if (missingComponents.length > 0) {
      const missingComponentsNames = missingComponents.map(cat => t(`components.${cat}`)).join(', ');
      alert(t('configurator.actions.errors.missingComponents', { components: missingComponentsNames }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/configurations/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: configNameToUse,
          components: Object.entries(selectedComponents)
            .filter(([_, component]) => component !== undefined)
            .map(([_, component]) => ({
              id: component!.id,
              quantity: 1
            }))
        }),
      });

      if (!response.ok) throw new Error('Failed to submit configuration');
      
      const data = await response.json();
      alert(t('configurator.actions.submitted'));
    } catch (error) {
      console.error('Error submitting configuration:', error);
      alert(t('configurator.actions.errors.submitFailed'));
    } finally {
      setLoading(false);
    }
  }, [configName, isAuthenticated, router, locale, componentCategories, selectedComponents, t]);

  const handleFiltersChange = useCallback((filters: Record<string, any>) => {
    const filterArray = Object.keys(filters);
    setActiveFilters(filterArray);
    if (filterArray.length === 1 && activeCategory === 'cpu') {
      setQuickCpuFilter(filterArray[0]);
    } else {
      setQuickCpuFilter(null);
    }
  }, [activeCategory]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  const handleQuickCpuFilterChange = useCallback((filterType: string | null) => {
    setQuickCpuFilter(filterType);
   
    if (activeCategory === 'cpu') {
      if (filterType) {
        setActiveFilters([filterType]);
      } else {
        setActiveFilters([]);
      }
    }
   
    if (activeCategory !== 'cpu' && filterType) {
      setActiveCategory('cpu');
    }
  }, [activeCategory]);
  
  const addConfigToCart = useCallback(() => {
    const allComponents = Object.values(selectedComponents).filter(Boolean);
    
    if (allComponents.length === 0) {
      alert(t('configurator.actions.errors.emptyConfiguration'));
      return;
    }
    
    addItem({
      id: `custom-config-${Date.now()}`,
      type: 'configuration',
      name: configName || 'Custom PC Configuration',
      price: totalPrice,
      imageUrl: ''
    });
    
    alert(t('configurator.actions.addedToCart'));
  }, [addItem, configName, selectedComponents, totalPrice, t]);

  const toggleFilterSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getFilterGroups = useCallback((): FilterGroup[] => {
    switch (activeCategory) {
      case 'cpu':
        return [
          {
            title: t('configurator.filters.cpuBrand'),
            type: 'radio' as const,
            options: [
              { id: 'intel', name: 'Intel' },
              { id: 'amd', name: 'AMD' }
            ]
          },
          {
            title: t('configurator.filters.cpuSeries'),
            type: 'checkbox' as const,
            options: [
              { id: 'intel-core-i9', name: 'Intel Core i9' },
              { id: 'intel-core-i7', name: 'Intel Core i7' },
              { id: 'intel-core-i5', name: 'Intel Core i5' },
              { id: 'intel-core-i3', name: 'Intel Core i3' },
              { id: 'amd-ryzen-9', name: 'AMD Ryzen 9' },
              { id: 'amd-ryzen-7', name: 'AMD Ryzen 7' },
              { id: 'amd-ryzen-5', name: 'AMD Ryzen 5' }
            ]
          }
        ]
      case 'gpu':
        return [
          {
            title: t('configurator.filters.gpuBrand'),
            type: 'radio' as const,
            options: [
              { id: 'nvidia', name: 'NVIDIA' },
              { id: 'amd', name: 'AMD' }
            ]
          },
          {
            title: t('configurator.filters.gpuSeries'),
            type: 'checkbox' as const,
            options: [
              { id: 'rtx-40', name: 'RTX 40 Series' },
              { id: 'rtx-30', name: 'RTX 30 Series' },
              { id: 'gtx-16', name: 'GTX 16 Series' },
              { id: 'rx-7000', name: 'RX 7000 Series' },
              { id: 'rx-6000', name: 'RX 6000 Series' }
            ]
          },
          {
            title: t('configurator.filters.vram'),
            type: 'checkbox' as const,
            options: [
              { id: '16gb', name: '16GB' },
              { id: '12gb', name: '12GB' },
              { id: '8gb', name: '8GB' },
              { id: '6gb', name: '6GB' }
            ]
          }
        ]
      case 'motherboard':
        return [
          {
            title: t('configurator.filters.formFactor'),
            type: 'radio' as const,
            options: [
              { id: 'atx', name: 'ATX' },
              { id: 'micro-atx', name: 'Micro-ATX' },
              { id: 'mini-itx', name: 'Mini-ITX' }
            ]
          },
          {
            title: t('configurator.filters.chipset'),
            type: 'checkbox' as const,
            options: [
              { id: 'z790', name: 'Intel Z790' },
              { id: 'z690', name: 'Intel Z690' },
              { id: 'b760', name: 'Intel B760' },
              { id: 'b660', name: 'Intel B660' },
              { id: 'x670', name: 'AMD X670' },
              { id: 'b650', name: 'AMD B650' },
              { id: 'x570', name: 'AMD X570' },
              { id: 'b550', name: 'AMD B550' }
            ]
          }
        ]
      case 'ram':
        return [
          {
            title: t('configurator.filters.memoryType'),
            type: 'radio' as const,
            options: [
              { id: 'ddr5', name: 'DDR5' },
              { id: 'ddr4', name: 'DDR4' }
            ]
          },
          {
            title: t('configurator.filters.capacity'),
            type: 'checkbox' as const,
            options: [
              { id: '128gb', name: '128GB' },
              { id: '64gb', name: '64GB' },
              { id: '32gb', name: '32GB' },
              { id: '16gb', name: '16GB' }
            ]
          }
        ]
      case 'storage':
        return [
          {
            title: t('configurator.filters.type'),
            type: 'radio' as const,
            options: [
              { id: 'nvme', name: 'NVMe SSD' },
              { id: 'sata-ssd', name: 'SATA SSD' },
              { id: 'hdd', name: 'HDD' }
            ]
          },
          {
            title: t('configurator.filters.capacity'),
            type: 'checkbox' as const,
            options: [
              { id: '4tb', name: '4TB+' },
              { id: '2tb', name: '2TB' },
              { id: '1tb', name: '1TB' },
              { id: '500gb', name: '500GB' }
            ]
          }
        ]
      case 'case':
        return [
          {
            title: t('configurator.filters.size'),
            type: 'radio' as const,
            options: [
              { id: 'full-tower', name: 'Full Tower' },
              { id: 'mid-tower', name: 'Mid Tower' },
              { id: 'mini-tower', name: 'Mini Tower' }
            ]
          },
          {
            title: t('configurator.filters.features'),
            type: 'checkbox' as const,
            options: [
              { id: 'tempered-glass', name: 'Tempered Glass' },
              { id: 'rgb', name: 'RGB' },
              { id: 'mesh', name: 'Mesh Front' }
            ]
          }
        ]
      case 'psu':
        return [
          {
            title: t('configurator.filters.wattage'),
            type: 'checkbox' as const,
            options: [
              { id: '1000w+', name: '1000W+' },
              { id: '850w+', name: '850W+' },
              { id: '750w+', name: '750W+' },
              { id: '650w+', name: '650W+' }
            ]
          },
          {
            title: t('configurator.filters.certification'),
            type: 'checkbox' as const,
            options: [
              { id: '80plus-titanium', name: '80+ Titanium' },
              { id: '80plus-platinum', name: 'Platinum' },
              { id: '80plus-gold', name: 'Gold' },
              { id: '80plus-bronze', name: 'Bronze' }
            ]
          }
        ]
      case 'cooling':
        return [
          {
            title: t('configurator.filters.type'),
            type: 'radio' as const,
            options: [
              { id: 'air', name: 'Air Cooling' },
              { id: 'aio', name: 'AIO Liquid' },
              { id: 'custom', name: 'Custom Loop' }
            ]
          },
          {
            title: t('configurator.filters.features'),
            type: 'checkbox' as const,
            options: [
              { id: 'rgb', name: 'RGB' },
              { id: 'lcd', name: 'LCD Screen' }
            ]
          }
        ]
      case 'peripherals':
        return [
          {
            title: t('configurator.filters.type'),
            type: 'radio' as const,
            options: [
              { id: 'keyboard', name: 'Keyboard' },
              { id: 'mouse', name: 'Mouse' },
              { id: 'monitor', name: 'Monitor' },
              { id: 'headset', name: 'Headset' }
            ]
          },
          {
            title: t('configurator.filters.features'),
            type: 'checkbox' as const,
            options: [
              { id: 'wireless', name: 'Wireless' },
              { id: 'rgb', name: 'RGB' },
              { id: 'mechanical', name: 'Mechanical' }
            ]
          }
        ]
      default:
        return []
    }
  }, [activeCategory, t])

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Galvene */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <Link href={`/${locale}`}>
            <Image
              src="/images/logo-removebg.png"
              alt="Logo"
              width={150}
              height={50}
              className="h-10 w-auto"
            />
          </Link>
        </div>
      </div>

      {/* Galvenais saturs */}
      <div className="container mx-auto p-4 lg:p-6">
        {/* Mobilā skatu pārslēgšana */}
        <div className="lg:hidden mb-4">
          <select 
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            {[...componentCategories, { id: 'peripherals', name: 'Peripherals', slug: 'peripherals' }].map((category: Category) => (
              <option key={category.id} value={category.id}>
                {t(`components.${category.id}`)}
                {selectedComponents[category.id] ? ' ✓' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Kreisā puse - kategorijas un filtri */}
          <div className="hidden lg:flex flex-col gap-6" style={{ width: '320px' }}>
            {/* Kategoriju saraksts */}
            <CategoryList 
              categories={[
                ...componentCategories,
                { id: 'peripherals', name: 'Peripherals', slug: 'peripherals' }
              ]}
              activeCategory={activeCategory}
              selectedComponents={selectedComponents}
              onSetActiveCategory={setActiveCategory}
            />

            {/* Advanced filtri */}
            <AdvancedFilter
              onFilterChange={handleFiltersChange}
              onSearchChange={handleSearchChange}
              activeCategory={activeCategory}
              filterGroups={getFilterGroups()}
            />
          </div>

          {/* Labā puse - komponentes un detaļas */}
          <div className="flex-1">
            {/* Quick filtri */}
            <div className="mb-6">
              <QuickFilters 
                activeFilter={quickCpuFilter} 
                onFilterChange={handleQuickCpuFilterChange}
                activeCategory={activeCategory} 
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Komponenšu saraksts */}
              <div className="flex-1">
                <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">
                      {t('configurator.selectComponent')}
                    </h2>
                    
                    <CompatibilityChecker 
                      totalPowerConsumption={totalPowerConsumption}
                      compatibilityIssues={compatibilityIssues}
                    />
                  </div>
                  
                  <ComponentSelectionGrid 
                    components={filteredComponents}
                    selectedComponent={selectedComponents[activeCategory]}
                    onSelectComponent={handleSelectComponent}
                    activeCategory={activeCategory}
                    isLoading={isLoadingComponents}
                  />
                </div>
              </div>

              {/* Izvēlētās komponentes */}
              <div className="lg:w-80">
                <div className="sticky top-6">
                  <SelectedComponentsList
                    selectedComponents={selectedComponents}
                    componentCategories={[
                      ...componentCategories,
                      { id: 'peripherals', name: 'Peripherals', slug: 'peripherals' }
                    ]}
                    configName={configName}
                    setConfigName={setConfigName}
                    totalPrice={totalPrice}
                    compatibilityIssues={compatibilityIssues}
                    loading={loading}
                    onSetActiveCategory={setActiveCategory}
                    onSaveConfiguration={handleSaveConfiguration}
                    onSubmitConfiguration={handleSubmitConfiguration}
                    onAddToCart={addConfigToCart}
                    totalPowerConsumption={totalPowerConsumption}
                    getRecommendedPsuWattage={getRecommendedPsuWattage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobilais filtru dialogs */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="fixed bottom-4 right-4 bg-indigo-600 dark:bg-brand-red-600 text-white p-4 rounded-full shadow-lg"
          >
            <Filter size={24} />
          </button>

          {isFilterOpen && (
            <div className="fixed inset-0 z-50 bg-gray-900/95 overflow-y-auto">
              <div className="min-h-screen px-4 py-8">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Filtri</h2>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <AdvancedFilter
                  onFilterChange={handleFiltersChange}
                  onSearchChange={handleSearchChange}
                  activeCategory={activeCategory}
                  filterGroups={getFilterGroups()}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}