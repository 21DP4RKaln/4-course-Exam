import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from '../filterInterfaces'

export const createGpuFilterGroups = (components: Component[]): FilterGroup[] => {
  const brandMap = extractBrandOptions(components)
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(([value]) => ({ id: `manufacturer=${value}`, name: value }))

  // Video memory capacity options
  const memSet = new Set<number>()
  components.forEach(c => { if (c.gpu?.videoMemoryCapacity) memSet.add(c.gpu.videoMemoryCapacity) })
  const memOptions: FilterOption[] = Array.from(memSet).map(m => ({ id: `video_memory=${m}`, name: `${m} GB` }))

  // Memory type options
  const typeSet = new Set<string>()
  components.forEach(c => { if (c.gpu?.memoryType) typeSet.add(c.gpu.memoryType) })
  const typeOptions: FilterOption[] = Array.from(typeSet).map(t => ({ id: `memory_type=${t}`, name: t }))

  return [
    { title: 'Brand', type: 'manufacturer', options: brandOptions },
    { title: 'Video Memory', type: 'video_memory', options: memOptions },
    { title: 'Memory Type', type: 'memory_type', options: typeOptions }
  ]
}
