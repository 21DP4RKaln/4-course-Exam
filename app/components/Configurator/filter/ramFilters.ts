import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from './filterInterfaces'

/**
 * Generate filter groups for RAM components dynamically based on component specifications.
 * Excludes Type and Capacity filters as they are handled by Quick Filters.
 */
export const createRamFilterGroups = (components: Component[]): FilterGroup[] => {
  const groups: FilterGroup[] = []

  // Frequency (MHz)
  const freqSet = new Set<string>()
  components.forEach(c => {
    const freq = c.specifications?.['Frequency'] || c.specifications?.['frequency'] || 
                c.specifications?.['Speed'] || c.specifications?.['speed'] ||
                c.specifications?.['Max Frequency']
    if (freq) freqSet.add(String(freq))
  })
  if (freqSet.size > 0) {
    // Sort the frequency values numerically
    const sortedFreq = Array.from(freqSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''))
      const numB = parseInt(b.replace(/\D/g, ''))
      return numA - numB
    })

    const options: FilterOption[] = sortedFreq.map(val => ({ 
      id: `frequency=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.frequency',
      titleTranslationKey: 'filterGroups.frequency', 
      options 
    })
  }

  // Module Count
  const moduleCountSet = new Set<string>()
  components.forEach(c => {
    const moduleCount = c.specifications?.['Module Count'] || 
                      c.specifications?.['Modules'] || 
                      c.specifications?.['moduleCount'] ||
                      c.specifications?.['module_count']
    if (moduleCount) moduleCountSet.add(String(moduleCount))
  })
  if (moduleCountSet.size > 0) {
    // Sort module count numerically
    const sortedModuleCount = Array.from(moduleCountSet)
      .map(val => Number(val))
      .sort((a, b) => a - b)
      .map(String)
      .map(val => ({
        id: `moduleCount=${val}`,
        name: val
      }))

    groups.push({ 
      title: 'specs.moduleCount',
      titleTranslationKey: 'filterGroups.moduleCount', 
      options: sortedModuleCount
    })
  }

  // Voltage
  const voltageSet = new Set<string>()
  components.forEach(c => {
    const voltage = c.specifications?.['Voltage'] || 
                  c.specifications?.['voltage']
    if (voltage) voltageSet.add(String(voltage))
  })
  if (voltageSet.size > 0) {
    // Sort voltage values numerically
    const sortedVoltage = Array.from(voltageSet).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.]/g, ''))
      const numB = parseFloat(b.replace(/[^\d.]/g, ''))
      return numA - numB
    })

    const options: FilterOption[] = sortedVoltage.map(val => ({ 
      id: `voltage=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.voltage',
      titleTranslationKey: 'filterGroups.voltage', 
      options 
    })
  }

  // CAS Latency
  const casLatencySet = new Set<string>()
  components.forEach(c => {
    const casLatency = c.specifications?.['CAS Latency'] || 
                     c.specifications?.['CL'] ||
                     c.specifications?.['casLatency'] ||
                     c.specifications?.['cas_latency']
    if (casLatency) casLatencySet.add(String(casLatency))
  })
  if (casLatencySet.size > 0) {
    // Sort CAS Latency numerically
    const sortedCasLatency = Array.from(casLatencySet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''))
      const numB = parseInt(b.replace(/\D/g, ''))
      return numA - numB
    })

    const options: FilterOption[] = sortedCasLatency.map(val => ({ 
      id: `casLatency=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.casLatency',
      titleTranslationKey: 'filterGroups.cas', 
      options 
    })
  }

  // RGB Lighting
  const rgbSet = new Set<string>()
  components.forEach(c => {
    // Check various RGB indicators in specs or name
    const hasRgb = 
      c.specifications?.['RGB'] || 
      c.specifications?.['rgb'] ||
      c.specifications?.['RGB Lighting'] ||
      (c.name.toLowerCase().includes('rgb')) ||
      (c.description?.toLowerCase().includes('rgb'))
    
    if (hasRgb) {
      rgbSet.add('RGB')
    }
  })
  if (rgbSet.size > 0) {
    const options: FilterOption[] = Array.from(rgbSet).map(val => ({ 
      id: `rgb=true`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.rgb',
      titleTranslationKey: 'filterGroups.rgb', 
      options 
    })
  }

  // Heat Spreader
  const heatspreaderSet = new Set<string>()
  components.forEach(c => {
    // Check for heat spreader info in specs
    const hasHeatspreader = 
      c.specifications?.['Heat Spreader'] ||
      c.specifications?.['Heatsink'] ||
      c.specifications?.['heatSpreader'] ||
      c.specifications?.['heat_spreader'] ||
      (c.name.toLowerCase().includes('heatsink')) ||
      (c.description?.toLowerCase().includes('heat spreader'))
    
    if (hasHeatspreader) {
      heatspreaderSet.add('Heat Spreader')
    }
  })
  if (heatspreaderSet.size > 0) {
    const options: FilterOption[] = Array.from(heatspreaderSet).map(val => ({ 
      id: `heatSpreader=true`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.heatSpreader',
      titleTranslationKey: 'filterGroups.heatSpreader', 
      options 
    })
  }

  return groups
}
