import { Component } from '../types'
import { FilterGroup, FilterOption } from '../filterInterfaces'

/**
 * Generate filter groups for Motherboard components dynamically based on component specifications.
 * Excludes Form Factor and Compatibility filters as they are handled by Quick Filters.
 */
export const createMotherboardFilterGroups = (components: Component[]): FilterGroup[] => {
  const groups: FilterGroup[] = []

  // Socket filter
  const socketSet = new Set<string>()
  components.forEach(c => {
    const socket = c.specifications?.['Socket'] || c.specifications?.['socket'] || c.specifications?.['CPU Socket']
    if (socket) {
      socketSet.add(String(socket))
    }
  })
  if (socketSet.size > 0) {
    const options: FilterOption[] = Array.from(socketSet)
      .sort()
      .map(val => ({ 
        id: `socket=${val}`, 
        name: val 
      }))
    groups.push({ 
      title: 'specs.socket',
      type: 'socket',
      titleTranslationKey: 'filterGroups.socket',
      options 
    })
  }

  // Chipset filter
  const chipsetSet = new Set<string>()
  components.forEach(c => {
    const chipset = c.specifications?.['Chipset'] || c.specifications?.['chipset']
    if (chipset) {
      chipsetSet.add(String(chipset))
    }
  })
  if (chipsetSet.size > 0) {
    const options: FilterOption[] = Array.from(chipsetSet)
      .sort()
      .map(val => ({ 
        id: `chipset=${val}`, 
        name: val 
      }))
    groups.push({ 
      title: 'specs.chipset',
      type: 'chipset',
      titleTranslationKey: 'filterGroups.chipset',
      options 
    })
  }

  // RAM Slots filter
  const ramSlotsSet = new Set<string>()
  components.forEach(c => {
    const ramSlots = c.specifications?.['RAM Slots'] || c.specifications?.['ramSlots'] || c.specifications?.['Memory Slots']
    if (ramSlots) {
      ramSlotsSet.add(String(ramSlots))
    }
  })
  if (ramSlotsSet.size > 0) {
    const options: FilterOption[] = Array.from(ramSlotsSet)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(val => ({ 
        id: `ramSlots=${val}`, 
        name: val 
      }))
    groups.push({ 
      title: 'specs.ramSlots',
      type: 'ramSlots',
      titleTranslationKey: 'filterGroups.ramSlots',
      options 
    })
  }

  return groups
}

/**
 * Filter Motherboard components based on selected filters.
 */
export const filterMotherboardComponents = (components: Component[], activeFilters: Record<string, boolean>): Component[] => {
  return components.filter(component => {
    for (const [filterId, isActive] of Object.entries(activeFilters)) {
      if (!isActive) continue

      const [filterType, filterValue] = filterId.split('=')
      
      switch (filterType) {
        case 'socket':
          const socket = component.specifications?.['Socket'] || component.specifications?.['socket'] || component.specifications?.['CPU Socket']
          if (socket && String(socket) !== filterValue) return false
          break
        case 'chipset':
          const chipset = component.specifications?.['Chipset'] || component.specifications?.['chipset']
          if (chipset && String(chipset) !== filterValue) return false
          break
        case 'ramSlots':
          const ramSlots = component.specifications?.['RAM Slots'] || component.specifications?.['ramSlots'] || component.specifications?.['Memory Slots']
          if (ramSlots && String(ramSlots) !== filterValue) return false
          break
      }
    }
    
    return true
  })
}