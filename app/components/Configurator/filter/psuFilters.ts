import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from './filterInterfaces'

/**
 * Generate filter groups for PSU (Power Supply) components dynamically based on component specifications.
 */
export const createPsuFilterGroups = (components: Component[]): FilterGroup[] => {
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

  // Wattage
  const wattageSet = new Set<string>()
  components.forEach(c => {
    // Look for wattage in specification or try to extract from name
    let wattage = c.specifications?.['Wattage'] || 
                  c.specifications?.['wattage'] ||
                  c.specifications?.['Power'] || 
                  c.specifications?.['power']
    
    // Try to extract from name if not found in specifications
    if (!wattage && c.name) {
      const wattMatch = c.name.match(/(\d+)\s*W/i)
      if (wattMatch) {
        wattage = wattMatch[1] + 'W'
      }
    }
    
    if (wattage) wattageSet.add(String(wattage))
  })
  if (wattageSet.size > 0) {
    // Sort wattages numerically
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
      options 
    })
  }

  // Modularity (Full, Semi, Non-modular)
  const modSet = new Set<string>()
  components.forEach(c => {
    const modularity = c.specifications?.['Modularity'] || c.specifications?.['modularity']
    if (modularity) {
      modSet.add(String(modularity))
    } else if (c.name || c.description) {
      const text = (c.name + ' ' + (c.description || '')).toLowerCase()
      if (text.includes('fully modular') || text.includes('full modular')) {
        modSet.add('Fully Modular')
      } else if (text.includes('semi modular') || text.includes('semi-modular')) {
        modSet.add('Semi-Modular')
      } else if (text.includes('non modular') || text.includes('non-modular')) {
        modSet.add('Non-Modular')
      }
    }
  })
  if (modSet.size > 0) {    
    const options: FilterOption[] = Array.from(modSet).map(val => ({ 
      id: `modularity=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.modularity',
      titleTranslationKey: 'filterGroups.modular', 
      options 
    })
  }

  // SATA Connections
  const sataConnectionsSet = new Set<string>()
  components.forEach(c => {
    const sataConnections = c.specifications?.['SATA Connections'] || 
                           c.specifications?.['sataConnections'] ||
                           c.specifications?.['SATA']
    if (sataConnections) sataConnectionsSet.add(String(sataConnections))
  })
  if (sataConnectionsSet.size > 0) {
    // Sort numerically
    const sortedSata = Array.from(sataConnectionsSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''))
      const numB = parseInt(b.replace(/\D/g, ''))
      return numA - numB
    })
    
    const options: FilterOption[] = sortedSata.map(val => ({ 
      id: `sataConnections=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.sataConnections',
      titleTranslationKey: 'filterGroups.sataConnections', 
      options 
    })
  }

  // PCIe Connections
  const pcieConnectionsSet = new Set<string>()
  components.forEach(c => {
    const pcieConnections = c.specifications?.['PCIe Connections'] || 
                           c.specifications?.['pcieConnections'] ||
                           c.specifications?.['PCIe']
    if (pcieConnections) pcieConnectionsSet.add(String(pcieConnections))
  })
  if (pcieConnectionsSet.size > 0) {
    // Sort numerically
    const sortedPcie = Array.from(pcieConnectionsSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''))
      const numB = parseInt(b.replace(/\D/g, ''))
      return numA - numB
    })
    
    const options: FilterOption[] = sortedPcie.map(val => ({ 
      id: `pcieConnections=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.pcieConnections',
      titleTranslationKey: 'filterGroups.pcieConnections', 
      options 
    })
  }

  // Molex/PATA Connections
  const molexConnectionsSet = new Set<string>()
  components.forEach(c => {
    const molexConnections = c.specifications?.['Molex/PATA Connections'] || 
                            c.specifications?.['molexConnections'] ||
                            c.specifications?.['Molex'] ||
                            c.specifications?.['PATA']
    if (molexConnections) molexConnectionsSet.add(String(molexConnections))
  })
  if (molexConnectionsSet.size > 0) {
    // Sort numerically
    const sortedMolex = Array.from(molexConnectionsSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''))
      const numB = parseInt(b.replace(/\D/g, ''))
      return numA - numB
    })
    
    const options: FilterOption[] = sortedMolex.map(val => ({ 
      id: `molexConnections=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.molexConnections',
      titleTranslationKey: 'filterGroups.molexConnections', 
      options 
    })
  }

  // PFC (Power Factor Correction)
  const pfcSet = new Set<string>()
  components.forEach(c => {
    const pfc = c.specifications?.['PFC'] || c.specifications?.['pfc']
    if (pfc) pfcSet.add(String(pfc))
  })
  if (pfcSet.size > 0) {
    const options: FilterOption[] = Array.from(pfcSet).map(val => ({ 
      id: `pfc=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.pfc',
      titleTranslationKey: 'filterGroups.pfc', 
      options 
    })
  }

  // Fan
  const fanSet = new Set<string>()
  components.forEach(c => {
    const fan = c.specifications?.['Fan'] || c.specifications?.['fan']
    if (fan) fanSet.add(String(fan))
    else if (typeof c.specifications?.['Fan'] === 'boolean' && c.specifications?.['Fan'] === true ||
             typeof c.specifications?.['fan'] === 'boolean' && c.specifications?.['fan'] === true) {
      fanSet.add('Yes')
    } else if (typeof c.specifications?.['Fan'] === 'boolean' && c.specifications?.['Fan'] === false ||
               typeof c.specifications?.['fan'] === 'boolean' && c.specifications?.['fan'] === false) {
      fanSet.add('No')
    }
  })
  if (fanSet.size > 0) {
    const options: FilterOption[] = Array.from(fanSet).map(val => ({ 
      id: `fan=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.fan',
      titleTranslationKey: 'filterGroups.fan', 
      options 
    })
  }

  return groups
}
