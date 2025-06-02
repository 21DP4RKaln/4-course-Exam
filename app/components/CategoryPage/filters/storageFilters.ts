import { Component } from '../types'
import { FilterGroup, FilterOption } from '../filterInterfaces'

/**
 * Generate filter groups for Storage components dynamically based on component specifications.
 * Excludes Type filters as they are handled by Quick Filters.
 */
export const createStorageFilterGroups = (components: Component[]): FilterGroup[] => {
  const groups: FilterGroup[] = []

  // Capacity filter
  const capacitySet = new Set<string>()
  components.forEach(c => {
    const capacity = c.specifications?.['Capacity'] || c.specifications?.['capacity'] || c.specifications?.['Storage']
    if (capacity) {
      capacitySet.add(String(capacity))
    }
  })
  if (capacitySet.size > 0) {
    // Sort capacity values numerically
    const sortedCapacity = Array.from(capacitySet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''))
      const numB = parseInt(b.replace(/\D/g, ''))
      return numA - numB
    })
      const options: FilterOption[] = sortedCapacity.map(val => ({ 
      id: `capacity=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.capacity',
      titleTranslationKey: 'filterGroups.capacity',
      type: 'capacity',
      options 
    })
  }

  // Interface filter
  const interfaceSet = new Set<string>()
  components.forEach(c => {
    const interfaceType = c.specifications?.['Interface'] || c.specifications?.['interface'] || c.specifications?.['Connection']
    if (interfaceType) {
      interfaceSet.add(String(interfaceType))
    }
  })
  if (interfaceSet.size > 0) {
    const options: FilterOption[] = Array.from(interfaceSet)
      .sort()
      .map(val => ({ 
        id: `interface=${val}`, 
        name: val      }))
    groups.push({ 
      title: 'specs.interface',
      titleTranslationKey: 'filterGroups.interface',
      type: 'interface',
      options 
    })
  }

  return groups
}

/**
 * Filter Storage components based on selected filters.
 */
export const filterStorageComponents = (components: Component[], activeFilters: Record<string, boolean>): Component[] => {
  return components.filter(component => {
    for (const [filterId, isActive] of Object.entries(activeFilters)) {
      if (!isActive) continue

      const [filterType, filterValue] = filterId.split('=')
      
      switch (filterType) {
        case 'capacity':
          const capacity = component.specifications?.['Capacity'] || component.specifications?.['capacity'] || component.specifications?.['Storage']
          if (capacity && String(capacity) !== filterValue) return false
          break
        case 'interface':
          const interfaceType = component.specifications?.['Interface'] || component.specifications?.['interface'] || component.specifications?.['Connection']
          if (interfaceType && String(interfaceType) !== filterValue) return false
          break
      }
    }
    
    return true
  })
}