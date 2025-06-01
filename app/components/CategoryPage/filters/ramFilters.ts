import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from '../filterInterfaces'

export const createRamFilterGroups = (components: Component[]): FilterGroup[] => {
  const brandMap = extractBrandOptions(components)
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(([value]) => ({ id: `manufacturer=${value}`, name: value }))

  // Memory type options
  const typeSet = new Set<string>()
  components.forEach(c => { if (c.ram?.memoryType) typeSet.add(c.ram.memoryType) })
  const typeOptions: FilterOption[] = Array.from(typeSet).map(t => ({ id: `memory_type=${t}`, name: t }))

  // Module count options
  const countSet = new Set<number>()
  components.forEach(c => { if (typeof c.ram?.moduleCount === 'number') countSet.add(c.ram.moduleCount) })
  const countOptions: FilterOption[] = Array.from(countSet).map(n => ({ id: `module_count=${n}`, name: `${n} module${n>1?'s':''}` }))

  // Frequency options
  const freqSet = new Set<number>()
  components.forEach(c => { if (c.ram?.maxFrequency) freqSet.add(c.ram.maxFrequency) })
  const freqOptions: FilterOption[] = Array.from(freqSet).map(f => ({ id: `frequency=${f}`, name: `${f} MHz` }))

  return [
    { title: 'Brand', type: 'manufacturer', options: brandOptions },
    { title: 'Memory Type', type: 'memory_type', options: typeOptions },
    { title: 'Module Count', type: 'module_count', options: countOptions },
    { title: 'Max Frequency', type: 'frequency', options: freqOptions }
  ]
}
