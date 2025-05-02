"use client"

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { useCart } from '@/app/contexts/CartContext'

// Import components
import CategoryList from './CategoryList'
import ComponentSelectionGrid from './ComponentSelectionGrid'
import SelectedComponentsList from './SelectedComponentsList'
import QuickFilters from './QuickFilters'
import CompatibilityChecker from './CompatibilityChecker'

// Import types from interface file
import { Component, Category } from './interfaces'

export default function ConfiguratorPage() {
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const locale = pathname.split('/')[1]
  
  // Component selection state
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [selectedComponents, setSelectedComponents] = useState<Record<string, Component | undefined>>({})
  const [configName, setConfigName] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Component data state
  const [componentCategories, setComponentCategories] = useState<Category[]>([])
  const [currentComponents, setCurrentComponents] = useState<Component[]>([])
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([])
  const [isLoadingComponents, setIsLoadingComponents] = useState(false)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [quickCpuFilter, setQuickCpuFilter] = useState<string | null>(null)
  
  // Power consumption state
  const [totalPowerConsumption, setTotalPowerConsumption] = useState(0)
  
  // Compatibility state
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([])

  // Fetch component categories on mount
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

  // Fetch components when active category changes
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
    
    // Apply quick CPU filter if we're on CPU category
    if (activeCategory === 'cpu' && quickCpuFilter) {
      setActiveFilters([quickCpuFilter])
    }
  }, [activeCategory, quickCpuFilter])

  // Get recommended PSU wattage based on power consumption
  const getRecommendedPsuWattage = useCallback(() => {
    if (totalPowerConsumption === 0) return 'N/A'
    
    // Round up to nearest standard PSU wattage
    if (totalPowerConsumption <= 300) return '450W'
    if (totalPowerConsumption <= 400) return '550W'
    if (totalPowerConsumption <= 500) return '650W'
    if (totalPowerConsumption <= 650) return '750W'
    if (totalPowerConsumption <= 800) return '850W'
    return '1000W+'
  }, [totalPowerConsumption])

  // Extract wattage from PSU name
  const extractWattage = useCallback((name: string): number => {
    const match = name.match(/(\d+)\s*w/i)
    if (match && match[1]) {
      return parseInt(match[1], 10)
    }
    return 0
  }, [])

  // Filter components based on search, filters, and compatibility
  useEffect(() => {
    if (currentComponents.length === 0) return
    
    let result = [...currentComponents]
 
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(component => 
        component.name.toLowerCase().includes(query) || 
        (component.description && component.description.toLowerCase().includes(query))
      )
    }

    // Apply tag filters
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
              // Apply CPU compatibility filter for motherboards
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
              // Apply power consumption filter
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
    
    // Apply additional compatibility filters
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
    
    // Filter for PSU based on power consumption
    if (activeCategory === 'psu' && totalPowerConsumption > 0) {
      result = result.filter(psu => {
        const wattage = extractWattage(psu.name.toLowerCase())
        return wattage >= totalPowerConsumption
      })
    }
    
    setFilteredComponents(result)
  }, [currentComponents, searchQuery, activeFilters, activeCategory, extractWattage, totalPowerConsumption, selectedComponents.cpu])

  // Calculate total price
  const totalPrice = Object.values(selectedComponents).reduce(
    (sum, component) => sum + (component?.price || 0),
    0
  )

  // Calculate power consumption based on selected components
  useEffect(() => {
    // Initial approach: Extract power data from specifications
    // Fallback to estimation based on component types
    let totalPower = 0;
    
    // Process each component for power consumption
    Object.entries(selectedComponents).forEach(([key, component]) => {
      if (!component) return;
      
      // Use specification if available
      const specs = component.specifications || {};
      if (specs.tdp) {
        const tdpMatch = String(specs.tdp).match(/(\d+)/);
        if (tdpMatch) {
          totalPower += parseInt(tdpMatch[1], 10);
          return;
        }
      }
      
      // Fallback to component-specific estimation
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
          totalPower += 75; // Default CPU power
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
          totalPower += 150; // Default GPU power
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
    
    // Add 10% overhead for efficiency
    totalPower = Math.ceil(totalPower * 1.1);
    
    setTotalPowerConsumption(totalPower);
  }, [selectedComponents]);

  // Check compatibility whenever selected components change
  useEffect(() => {
    const issues: string[] = [];
    
    // CPU and Motherboard compatibility
    if (selectedComponents.cpu && selectedComponents.motherboard) {
      const cpuName = selectedComponents.cpu.name.toLowerCase();
      const motherboardName = selectedComponents.motherboard.name.toLowerCase();
      
      const isAmdCpu = cpuName.includes('ryzen') || cpuName.includes('amd');
      const isIntelCpu = cpuName.includes('intel') || cpuName.includes('core i');
      
      if (isAmdCpu && !motherboardName.includes('am4') && !motherboardName.includes('am5') && 
          !motherboardName.includes('amd') && !motherboardName.includes('b550') && 
          !motherboardName.includes('x570') && !motherboardName.includes('b650') && 
          !motherboardName.includes('x670')) {
        issues.push('CPU and motherboard may be incompatible. AMD CPUs require AMD compatible motherboards.');
      }
      
      if (isIntelCpu && !motherboardName.includes('intel') && !motherboardName.includes('z690') && 
          !motherboardName.includes('z790') && !motherboardName.includes('b660') && 
          !motherboardName.includes('b760') && !motherboardName.includes('lga1700')) {
        issues.push('CPU and motherboard may be incompatible. Intel CPUs require Intel compatible motherboards.');
      }
    }
    
    // Case and Motherboard compatibility
    if (selectedComponents.case && selectedComponents.motherboard) {
      const caseName = selectedComponents.case.name.toLowerCase();
      const motherboardName = selectedComponents.motherboard.name.toLowerCase();
      
      const isMicroAtxMotherboard = motherboardName.includes('micro-atx') || motherboardName.includes('matx') || motherboardName.includes('m-atx');
      const isMiniItxMotherboard = motherboardName.includes('mini-itx') || motherboardName.includes('itx');
      const isAtxMotherboard = !isMicroAtxMotherboard && !isMiniItxMotherboard && (motherboardName.includes('atx') || !motherboardName.includes('form factor'));
      
      const isMiniItxCase = caseName.includes('mini-itx') || caseName.includes('itx');
      const isMicroAtxCase = caseName.includes('micro-atx') || caseName.includes('matx');
      
      if (isAtxMotherboard && isMiniItxCase) {
        issues.push('Case is too small for the selected motherboard. ATX motherboards need at least a mid-tower case.');
      }
      
      if (isAtxMotherboard && isMicroAtxCase && !caseName.includes('atx support')) {
        issues.push('Case may be too small for the ATX motherboard. Check if it supports ATX form factor.');
      }
    }
    
    // PSU wattage check
    if (selectedComponents.psu && totalPowerConsumption > 0) {
      const psuName = selectedComponents.psu.name.toLowerCase();
      let psuWattage = 0;
      
      // Extract wattage from PSU name
      const wattageMatch = psuName.match(/(\d+)\s*w/i);
      if (wattageMatch && wattageMatch[1]) {
        psuWattage = parseInt(wattageMatch[1], 10);
      }
      
      if (psuWattage > 0 && psuWattage < totalPowerConsumption) {
        issues.push(`PSU wattage (${psuWattage}W) may be insufficient for your system. Recommended: at least ${totalPowerConsumption}W.`);
      }
    }
    
    setCompatibilityIssues(issues);
  }, [selectedComponents, totalPowerConsumption]);

  // Handle component selection
  const handleSelectComponent = useCallback((component: Component) => {
    setSelectedComponents(current => ({
      ...current,
      [activeCategory]: component
    }));
  }, [activeCategory]);

  // Handle saving configuration
  const handleSaveConfiguration = useCallback(async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    const configNameToUse = configName.trim() || "My Configuration";
    setConfigName(configNameToUse);

    setLoading(true);
    try {
      // Make API call to save configuration to database
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
      alert('Configuration saved as draft!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [configName, isAuthenticated, router, locale, selectedComponents]);

  // Handle submitting configuration for review
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
      alert(`Please select the following components: ${missingComponents.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // Make API call to submit configuration for review
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
      alert('Configuration submitted for review!');
    } catch (error) {
      console.error('Error submitting configuration:', error);
      alert('Failed to submit configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [configName, isAuthenticated, router, locale, componentCategories, selectedComponents]);

  // Handle filter changes
  const handleFiltersChange = useCallback((filterType: string | null) => {
    setQuickCpuFilter(filterType);

    if (filterType) {
      setActiveFilters([filterType]);
    } else {
      setActiveFilters([]);
    }
  }, []);

  // Handle search changes
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  // Handle CPU quick filter changes
  const handleQuickCpuFilterChange = useCallback((filterType: string | null) => {
    setQuickCpuFilter(filterType);
    
    // If we're on the CPU category, immediately apply the filter
    if (activeCategory === 'cpu') {
      if (filterType) {
        setActiveFilters([filterType]);
      } else {
        setActiveFilters([]);
      }
    }
    
    // If no CPU category is active, set it to CPU
    if (activeCategory !== 'cpu' && filterType) {
      setActiveCategory('cpu');
    }
  }, [activeCategory]);
  
  // Add configuration to cart
  const addConfigToCart = useCallback(() => {
    const allComponents = Object.values(selectedComponents).filter(Boolean);
    
    if (allComponents.length === 0) {
      alert('Please select at least one component before adding to cart');
      return;
    }
    
    // Add entire configuration as a custom PC to cart
    addItem({
      id: `custom-config-${Date.now()}`,
      type: 'configuration',
      name: configName || 'Custom PC Configuration',
      price: totalPrice,
      imageUrl: ''
    });
    
    alert('Configuration added to cart!');
  }, [addItem, configName, selectedComponents, totalPrice]);

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('configurator.title')}
      </h1>
      
      {/* CPU quick filter buttons */}
      <QuickFilters 
        activeFilter={quickCpuFilter} 
        onFilterChange={handleQuickCpuFilterChange}
        activeCategory={activeCategory} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Category selection - Left column */}
        <div className="lg:col-span-2">
          <CategoryList 
            categories={componentCategories}
            activeCategory={activeCategory}
            selectedComponents={selectedComponents}
            onSetActiveCategory={setActiveCategory}
          />
        </div>

        {/* Component selection - Middle column */}
        <div className="lg:col-span-7 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('configurator.selectComponent')}
            </h2>
            
            {/* Display power consumption info */}
            <CompatibilityChecker 
              totalPowerConsumption={totalPowerConsumption}
              compatibilityIssues={compatibilityIssues}
            />
          </div>
          
          <div className="grid grid-cols-6 gap-4">
            {/* Components grid - left side (col span 4) */}
            <div className="col-span-4">
              <ComponentSelectionGrid 
                components={filteredComponents}
                selectedComponent={selectedComponents[activeCategory]}
                onSelectComponent={handleSelectComponent}
                activeCategory={activeCategory}
                isLoading={isLoadingComponents}
              />
            </div>
          </div>
        </div>

        {/* Selected components & details - Right column */}
        <div className="lg:col-span-3">
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
            onAddToCart={addConfigToCart}
            totalPowerConsumption={totalPowerConsumption}
            getRecommendedPsuWattage={getRecommendedPsuWattage}
          />
        </div>
      </div>
    </div>
  )
}