// filepath: c:\Users\sitva\Desktop\projekts\exam-project---Copy\app\components\Configurator\filter\cpuFilters.ts
import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from './filterInterfaces'

/**
 * Generate filter groups for CPU components dynamically based on component specifications.
 * Excludes Brand and Series filters as they are handled by Quick Filters.
 */
export const createCpuFilterGroups = (components: Component[]): FilterGroup[] => {
  const groups: FilterGroup[] = []

  // Cores group
  const coresSet = new Set<string>()
  components.forEach(c => {
    const cores = c.specifications?.['Cores'] || c.specifications?.['cores']
    if (cores) coresSet.add(String(cores))
  })
  if (coresSet.size) {
    const options: FilterOption[] = Array.from(coresSet)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(val => ({ id: `cores=${val}`, name: `${val}` }))
    groups.push({ 
      title: 'specs.cores', 
      titleTranslationKey: 'filterGroups.cores',
      options 
    })
  }

  // Threads group
  const threadsSet = new Set<string>()
  components.forEach(c => {
    const threads = c.specifications?.['Threads'] || c.specifications?.['threads']
    if (threads) threadsSet.add(String(threads))
  })
  if (threadsSet.size) {
    const options: FilterOption[] = Array.from(threadsSet)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(val => ({ id: `threads=${val}`, name: `${val}` }))
    groups.push({ 
      title: 'specs.threads',
      titleTranslationKey: 'filterGroups.threads', 
      options 
    })
  }
  
  // Multithreading
  const multiThreadingSet = new Set<string>()
  components.forEach(c => {
    let multithreading = c.specifications?.['Multithreading'] || c.specifications?.['multithreading'] || 
                        c.specifications?.['HyperThreading'] || c.specifications?.['hyperThreading']
    
    // If not specified in specs, try to infer from cores/threads
    if (!multithreading) {
      const cores = c.specifications?.['Cores'] || c.specifications?.['cores']
      const threads = c.specifications?.['Threads'] || c.specifications?.['threads']
      if (cores && threads && parseInt(String(cores)) < parseInt(String(threads))) {
        multithreading = 'Yes'
      }
    }
    
    if (multithreading) multiThreadingSet.add(String(multithreading))
  })
  if (multiThreadingSet.size) {
    const options: FilterOption[] = Array.from(multiThreadingSet).map(val => ({ 
      id: `multithreading=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.multithreading',
      titleTranslationKey: 'filterGroups.multithreading',
      options 
    })
  }

  // Socket group
  const socketSet = new Set<string>()
  components.forEach(c => {
    const socket = c.specifications?.['Socket'] || c.specifications?.['socket']
    if (socket) socketSet.add(String(socket))
  })
  if (socketSet.size) {
    const options: FilterOption[] = Array.from(socketSet).map(val => ({ id: `socket=${val}`, name: val }))
    groups.push({ 
      title: 'specs.socket',
      titleTranslationKey: 'filterGroups.socket', 
      options 
    })
  }

  // Base Frequency group
  const baseFreqSet = new Set<string>()
  components.forEach(c => {
    const baseFreq = c.specifications?.['Base Frequency'] || c.specifications?.['baseFrequency'] || 
                   c.specifications?.['Base Clock'] || c.specifications?.['baseClock']
    if (baseFreq) baseFreqSet.add(String(baseFreq))
  })
  if (baseFreqSet.size) {
    // Sort frequencies numerically
    const sortedFreq = Array.from(baseFreqSet).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.]/g, ''))
      const numB = parseFloat(b.replace(/[^\d.]/g, ''))
      return numA - numB
    })
    
    const options: FilterOption[] = sortedFreq.map(val => ({ 
      id: `baseFrequency=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.baseFrequency',
      titleTranslationKey: 'filterGroups.baseClock',
      options 
    })
  }
  
  // Max RAM Capacity
  const maxRamCapacitySet = new Set<string>()
  components.forEach(c => {
    const maxRam = c.specifications?.['Max RAM Capacity'] || c.specifications?.['maxRamCapacity'] || 
                  c.specifications?.['Max Memory'] || c.specifications?.['maxMemory']
    if (maxRam) maxRamCapacitySet.add(String(maxRam))
  })
  if (maxRamCapacitySet.size) {
    // Sort capacity numerically
    const sortedCapacity = Array.from(maxRamCapacitySet).sort((a, b) => {
      const numA = parseInt(a.replace(/[^\d]/g, ''))
      const numB = parseInt(b.replace(/[^\d]/g, ''))
      return numA - numB
    })
    
    const options: FilterOption[] = sortedCapacity.map(val => ({ 
      id: `maxRamCapacity=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.maxRamCapacity',
      titleTranslationKey: 'filterGroups.maxMemory',
      options 
    })
  }
  
  // Max RAM Frequency
  const maxRamFreqSet = new Set<string>()
  components.forEach(c => {
    const maxRamFreq = c.specifications?.['Max RAM Frequency'] || c.specifications?.['maxRamFrequency'] || 
                      c.specifications?.['Memory Speed'] || c.specifications?.['memorySpeed']
    if (maxRamFreq) maxRamFreqSet.add(String(maxRamFreq))
  })
  if (maxRamFreqSet.size) {
    // Sort frequencies numerically
    const sortedFreq = Array.from(maxRamFreqSet).sort((a, b) => {
      const numA = parseInt(a.replace(/[^\d]/g, ''))
      const numB = parseInt(b.replace(/[^\d]/g, ''))
      return numA - numB
    })
    
    const options: FilterOption[] = sortedFreq.map(val => ({ 
      id: `maxRamFrequency=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.maxRamFrequency',
      titleTranslationKey: 'filterGroups.memorySpeed',
      options 
    })
  }

  // Integrated GPU group
  const igpuSet = new Set<string>()
  components.forEach(c => {
    let igpu = c.specifications?.['Integrated GPU'] || c.specifications?.['integratedGpu'] || 
              c.specifications?.['Graphics'] || c.specifications?.['graphics']
    
    // Normalize values to Yes/No for consistency
    if (igpu) {
      const igpuLower = String(igpu).toLowerCase()
      if (igpuLower === 'yes' || igpuLower === 'true' || igpuLower.includes('uhd') || igpuLower.includes('iris')) {
        igpu = 'Yes'
      } else if (igpuLower === 'no' || igpuLower === 'false' || igpuLower === 'none') {
        igpu = 'No'
      }
      igpuSet.add(String(igpu))
    }
  })
  if (igpuSet.size) {
    const options: FilterOption[] = Array.from(igpuSet).map(val => ({ 
      id: `integratedGpu=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.integratedGpu',
      titleTranslationKey: 'filterGroups.integratedGraphics',
      options 
    })
  }

  // Clock Speed group
  const speedSet = new Set<string>()
  components.forEach(c => {
    const speed = c.specifications?.['Speed'] || c.specifications?.['speed']
    if (speed) speedSet.add(String(speed))
  })
  if (speedSet.size) {
    const options: FilterOption[] = Array.from(speedSet).map(val => ({ id: `speed=${val}`, name: val }))
    groups.push({ 
      title: 'specs.speed',
      titleTranslationKey: 'filterGroups.speed', 
      options 
    })
  }

  // Boost Clock group
  const boostClockSet = new Set<string>()
  components.forEach(c => {
    const boost = c.specifications?.['Boost_Clock'] || c.specifications?.['boostClock']
    if (boost) boostClockSet.add(String(boost))
  })
  if (boostClockSet.size) {
    const options: FilterOption[] = Array.from(boostClockSet).map(val => ({ id: `boostClock=${val}`, name: val }))
    groups.push({ 
      title: 'specs.boostClock',
      titleTranslationKey: 'filterGroups.boostClock',
      options 
    })
  }

  // Cache group
  const cacheSet = new Set<string>()
  components.forEach(c => {
    const cache = c.specifications?.['Cache'] || c.specifications?.['cacheSize'] || c.specifications?.['cache']
    if (cache) cacheSet.add(String(cache))
  })
  if (cacheSet.size) {
    const options: FilterOption[] = Array.from(cacheSet).map(val => ({ id: `cache=${val}`, name: val }))
    groups.push({ 
      title: 'specs.Cache',
      titleTranslationKey: 'filterGroups.cache', 
      options 
    })
  }

  // TDP group
  const tdpSet = new Set<string>()
  components.forEach(c => {
    const tdp = c.specifications?.['TDP'] || c.specifications?.['tdp']
    if (tdp) tdpSet.add(String(tdp))
  })
  if (tdpSet.size) {
    const options: FilterOption[] = Array.from(tdpSet).map(val => ({ id: `tdp=${val}`, name: val }))
    groups.push({ 
      title: 'specs.tdp',
      titleTranslationKey: 'filterGroups.tdp', 
      options 
    })
  }

  // Architecture group
  const archSet = new Set<string>()
  components.forEach(c => {
    const arch = c.specifications?.['architecture'] || c.specifications?.['Architecture']
    if (arch) archSet.add(String(arch))
  })
  if (archSet.size) {
    const options: FilterOption[] = Array.from(archSet).map(val => ({ 
      id: `architecture=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.architecture',
      titleTranslationKey: 'filterGroups.architecture', 
      options 
    })
  }

  return groups
}
