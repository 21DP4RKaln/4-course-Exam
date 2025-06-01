import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from './filterInterfaces'

/**
 * Generate filter groups for Storage components dynamically based on component specifications.
 */
export const createStorageFilterGroups = (components: Component[]): FilterGroup[] => {
  const groups: FilterGroup[] = []

  // Brand filter
  const brandOptions = extractBrandOptions(components)
  if (brandOptions.size > 0) {
    const options: FilterOption[] = Array.from(brandOptions.entries()).map(([id, name]) => ({ 
      id, 
      name 
    }))
    groups.push({ 
      title: 'manufacturer',
      titleTranslationKey: 'filterGroups.manufacturer',
      options 
    })
  }

  // Capacity
  const capacitySet = new Set<string>()
  components.forEach(c => {
    const capacity = c.specifications?.['Capacity'] || c.specifications?.['capacity'] || 
                    c.specifications?.['Size'] || c.specifications?.['size']
    if (capacity) capacitySet.add(String(capacity))
  })
  if (capacitySet.size > 0) {
    // Sort capacities
    const sortedCapacity = Array.from(capacitySet).sort((a, b) => {
      // Convert to GB for comparison
      const getGB = (val: string) => {
        const num = parseFloat(val.replace(/[^\d.]/g, ''))
        return val.toLowerCase().includes('tb') ? num * 1024 : num
      }
      return getGB(a) - getGB(b)
    })
    
    const options: FilterOption[] = sortedCapacity.map(val => ({ 
      id: `capacity=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.capacity',
      titleTranslationKey: 'filterGroups.capacity', 
      options 
    })
  }

  // Interface (SATA, PCIe, etc.)
  const interfaceSet = new Set<string>()
  components.forEach(c => {
    const iface = c.specifications?.['Interface'] || c.specifications?.['interface']
    if (iface) interfaceSet.add(String(iface))
  })
  if (interfaceSet.size > 0) {
    const options: FilterOption[] = Array.from(interfaceSet).map(val => ({ 
      id: `interface=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.interface',
      titleTranslationKey: 'filterGroups.interface', 
      options 
    })
  }

  // Form Factor (3.5", 2.5", M.2, etc.)
  const formFactorSet = new Set<string>()
  components.forEach(c => {
    const formFactor = c.specifications?.['Form Factor'] || c.specifications?.['FormFactor'] || 
                      c.specifications?.['form factor'] || c.specifications?.['formFactor']
    if (formFactor) formFactorSet.add(String(formFactor))
  })
  if (formFactorSet.size > 0) {
    const options: FilterOption[] = Array.from(formFactorSet).map(val => ({ 
      id: `formFactor=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.formFactor',
      titleTranslationKey: 'filterGroups.formFactor', 
      options 
    })
  }

  // Rotation Speed (RPM) - mainly for HDD
  const rpmSet = new Set<string>()
  components.forEach(c => {
    const rpm = c.specifications?.['RPM'] || c.specifications?.['Speed'] || 
              c.specifications?.['Rotation Speed'] || c.specifications?.['rotationSpeed']
    if (rpm) rpmSet.add(String(rpm))
  })
  if (rpmSet.size > 0) {
    const options: FilterOption[] = Array.from(rpmSet).map(val => ({ 
      id: `rpm=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.rpm',
      titleTranslationKey: 'filterGroups.rotationSpeed', 
      options 
    })
  }

  // Cache Size
  const cacheSet = new Set<string>()
  components.forEach(c => {
    const cache = c.specifications?.['Cache'] || c.specifications?.['cache'] || 
                c.specifications?.['Buffer Size'] || c.specifications?.['bufferSize']
    if (cache) cacheSet.add(String(cache))
  })
  if (cacheSet.size > 0) {
    const options: FilterOption[] = Array.from(cacheSet).map(val => ({ 
      id: `cache=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.cache',
      titleTranslationKey: 'filterGroups.cacheSize', 
      options 
    })
  }

  // Read Speed
  const readSpeedSet = new Set<string>()
  components.forEach(c => {
    const readSpeed = c.specifications?.['Read Speed'] || c.specifications?.['readSpeed'] || 
                     c.specifications?.['Sequential Read'] || c.specifications?.['sequentialRead']
    if (readSpeed) readSpeedSet.add(String(readSpeed))
  })
  if (readSpeedSet.size > 0) {
    const options: FilterOption[] = Array.from(readSpeedSet).map(val => ({ 
      id: `readSpeed=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.readSpeed',
      titleTranslationKey: 'filterGroups.readSpeed', 
      options 
    })
  }

  // Write Speed
  const writeSpeedSet = new Set<string>()
  components.forEach(c => {
    const writeSpeed = c.specifications?.['Write Speed'] || c.specifications?.['writeSpeed'] || 
                      c.specifications?.['Sequential Write'] || c.specifications?.['sequentialWrite']
    if (writeSpeed) writeSpeedSet.add(String(writeSpeed))
  })
  if (writeSpeedSet.size > 0) {
    const options: FilterOption[] = Array.from(writeSpeedSet).map(val => ({ 
      id: `writeSpeed=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.writeSpeed',
      titleTranslationKey: 'filterGroups.writeSpeed', 
      options 
    })
  }

  // TBW (Total Bytes Written) for SSDs
  const tbwSet = new Set<string>()
  components.forEach(c => {
    const tbw = c.specifications?.['TBW'] || c.specifications?.['tbw'] || 
               c.specifications?.['Endurance'] || c.specifications?.['endurance']
    if (tbw) tbwSet.add(String(tbw))
  })
  if (tbwSet.size > 0) {
    const options: FilterOption[] = Array.from(tbwSet).map(val => ({ 
      id: `tbw=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.tbw',
      titleTranslationKey: 'filterGroups.tbw', 
      options 
    })
  }

  return groups
}
