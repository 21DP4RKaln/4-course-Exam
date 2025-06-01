import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from '../filterInterfaces'

export const createStorageFilterGroups = (components: Component[]): FilterGroup[] => {
  const brandMap = extractBrandOptions(components)
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(([value]) => ({ id: `manufacturer=${value}`, name: value }))

  // Storage type options
  const typeSet = new Set<string>()
  components.forEach(c => { if (c.storage?.type) typeSet.add(c.storage.type) })
  const typeOptions: FilterOption[] = Array.from(typeSet).map(t => ({ id: `type=${t}`, name: t }))

  // Volume options (converted to string with GB/TB)
  const volumeSet = new Set<number>()
  components.forEach(c => { if (c.storage?.volume) volumeSet.add(c.storage.volume) })
  const volumeOptions: FilterOption[] = Array.from(volumeSet).map(v => {
    const name = v >= 1024 ? `${v/1024} TB` : `${v} GB`
    return { id: `volume=${v}`, name }
  })

  return [
    { title: 'Brand', type: 'manufacturer', options: brandOptions },
    { title: 'Type', type: 'type', options: typeOptions },
    { title: 'Volume', type: 'volume', options: volumeOptions }
  ]
}
