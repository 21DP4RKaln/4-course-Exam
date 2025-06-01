import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from '../filterInterfaces'

export const createCpuFilterGroups = (components: Component[]): FilterGroup[] => {
  const brandMap = extractBrandOptions(components)
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(([value, label]) => ({ 
    id: `Brand=${value}`, 
    name: label 
  }))

  // Series options
  const seriesSet = new Set<string>()
  components.forEach(c => { 
    if (c.cpu?.series) seriesSet.add(c.cpu.series) 
    const seriesSpec = c.specifications?.['series'] || c.specifications?.['Series']
    if (seriesSpec) seriesSet.add(String(seriesSpec))
  })
  const seriesOptions: FilterOption[] = Array.from(seriesSet).map(s => ({ id: `cpu_series=${s}`, name: s }))

  // Core count options
  const coresSet = new Set<number>()
  components.forEach(c => { 
    if (typeof c.cpu?.cores === 'number') coresSet.add(c.cpu.cores)
    const coresSpec = c.specifications?.['cores'] || c.specifications?.['Cores']
    if (coresSpec) {
      const coreCount = parseInt(String(coresSpec), 10)
      if (!isNaN(coreCount)) coresSet.add(coreCount)
    }
  })
  const coresOptions: FilterOption[] = Array.from(coresSet)
    .sort((a, b) => a - b)
    .map(n => ({ id: `cores=${n}`, name: `${n} cores` }))

  // Socket options
  const socketSet = new Set<string>()
  components.forEach(c => {
    if (c.cpu?.socket) socketSet.add(c.cpu.socket)
    const socketSpec = c.specifications?.['socket'] || c.specifications?.['Socket']
    if (socketSpec) socketSet.add(String(socketSpec))
  })
  const socketOptions: FilterOption[] = Array.from(socketSet).map(s => ({ id: `socket=${s}`, name: s }))

  // Frequency/Clock Speed options
  const frequencySet = new Set<number>()
  components.forEach(c => {
    if (typeof c.cpu?.frequency === 'number') frequencySet.add(c.cpu.frequency)
    const freqSpec = c.specifications?.['frequency'] || c.specifications?.['Frequency'] || 
                    c.specifications?.['baseFrequency'] || c.specifications?.['Base Clock']
    if (freqSpec) {
      const freqValue = parseFloat(String(freqSpec).replace(/[^\d.]/g, ''))
      if (!isNaN(freqValue)) frequencySet.add(freqValue)
    }
  })
  const frequencyOptions: FilterOption[] = Array.from(frequencySet)
    .sort((a, b) => a - b)
    .map(f => ({ id: `frequency=${f}`, name: `${f} GHz` }))

  // Multithreading options
  const mtSet = new Set<string>()
  components.forEach(c => {
    if (c.cpu?.multithreading !== undefined) {
      mtSet.add(c.cpu.multithreading ? 'Yes' : 'No')
    }
    const mtSpec = c.specifications?.['multithreading'] || c.specifications?.['hyperthreading'] || 
                  c.specifications?.['Multithreading']
    if (mtSpec !== undefined) {
      const isMultithreading = String(mtSpec).toLowerCase()
      if (isMultithreading === 'true' || isMultithreading === 'yes') mtSet.add('Yes')
      else if (isMultithreading === 'false' || isMultithreading === 'no') mtSet.add('No')
    }
  })
  const mtOptions: FilterOption[] = Array.from(mtSet).map(mt => ({ 
    id: `multithreading=${mt.toLowerCase() === 'yes' ? 'true' : 'false'}`,
    name: mt
  }))

  // Integrated GPU options
  const igpuSet = new Set<string>()
  components.forEach(c => {
    if (c.cpu?.integratedGpu !== undefined) {
      igpuSet.add(c.cpu.integratedGpu ? 'Yes' : 'No')
    }
    const igpuSpec = c.specifications?.['integratedGpu'] || c.specifications?.['integrated_graphics']
    if (igpuSpec !== undefined) {
      const hasIgpu = String(igpuSpec).toLowerCase()
      if (hasIgpu === 'true' || hasIgpu === 'yes') igpuSet.add('Yes')
      else if (hasIgpu === 'false' || hasIgpu === 'no') igpuSet.add('No')
    }
  })
  const igpuOptions: FilterOption[] = Array.from(igpuSet).map(ig => ({ 
    id: `integratedGpu=${ig.toLowerCase() === 'yes' ? 'true' : 'false'}`,
    name: ig
  }))

  const filterGroups: FilterGroup[] = [
    { title: 'Brand', type: 'Brand', options: brandOptions }
  ]

  if (seriesOptions.length > 0) {
    filterGroups.push({ title: 'Series', type: 'cpu_series', options: seriesOptions })
  }

  if (socketOptions.length > 0) {
    filterGroups.push({ title: 'Socket', type: 'socket', options: socketOptions })
  }

  if (coresOptions.length > 0) {
    filterGroups.push({ title: 'Cores', type: 'cores', options: coresOptions })
  }

  if (frequencyOptions.length > 0) {
    filterGroups.push({ title: 'Base Frequency', type: 'frequency', options: frequencyOptions })
  }

  if (mtOptions.length > 0) {
    filterGroups.push({ title: 'Multithreading', type: 'multithreading', options: mtOptions })
  }  if (igpuOptions.length > 0) {
    filterGroups.push({ title: 'Integrated Graphics', type: 'integratedGpu', options: igpuOptions })
  }

  return filterGroups
}
