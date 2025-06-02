import { Component } from '../types'
import { FilterGroup, FilterOption } from '../filterInterfaces'

/**
 * Generate filter groups for PSU components dynamically based on component specifications.
 * Excludes Certification filters as they are handled by Quick Filters.
 */
export const createPsuFilterGroups = (components: Component[]): FilterGroup[] => {
  const groups: FilterGroup[] = []

  // Wattage filter
  const wattageSet = new Set<string>()
  components.forEach(c => {
    const wattage = c.specifications?.['Wattage'] || c.specifications?.['wattage'] || c.specifications?.['Power']
    if (wattage) {
      wattageSet.add(String(wattage))
    }
  })
  if (wattageSet.size > 0) {
    // Sort wattage values numerically
    const sortedWattage = Array.from(wattageSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''))
      const numB = parseInt(b.replace(/\D/g, ''))
      return numA - numB
    })
    
    const options: FilterOption[] = sortedWattage.map(val => ({ 
      id: `wattage=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.wattage',
      titleTranslationKey: 'filterGroups.wattage',
      type: 'wattage',
      options 
    })
  }

  // Modularity filter
  const modularitySet = new Set<string>()
  components.forEach(c => {
    const modularity = c.specifications?.['Modularity'] || c.specifications?.['modularity'] || c.specifications?.['Modular']
    if (modularity) {
      modularitySet.add(String(modularity))
    }
  })
  if (modularitySet.size > 0) {
    const options: FilterOption[] = Array.from(modularitySet)
      .sort()
      .map(val => ({ 
        id: `modularity=${val}`, 
        name: val 
      }))
    groups.push({ 
      title: 'specs.modularity',
      titleTranslationKey: 'filterGroups.modularity',
      type: 'modularity',
      options 
    })
  }

  return groups
}

/**
 * Filter PSU components based on selected filters.
 */
export const filterPsuComponents = (components: Component[], activeFilters: Record<string, boolean>): Component[] => {
  return components.filter(component => {
    for (const [filterId, isActive] of Object.entries(activeFilters)) {
      if (!isActive) continue

      const [filterType, filterValue] = filterId.split('=')
      
      switch (filterType) {
        case 'wattage':
          const wattage = component.specifications?.['Wattage'] || component.specifications?.['wattage'] || component.specifications?.['Power']
          if (wattage && String(wattage) !== filterValue) return false
          break
        case 'modularity':
          const modularity = component.specifications?.['Modularity'] || component.specifications?.['modularity'] || component.specifications?.['Modular']
          if (modularity && String(modularity) !== filterValue) return false
          break
      }
    }
    
    return true
  })
}