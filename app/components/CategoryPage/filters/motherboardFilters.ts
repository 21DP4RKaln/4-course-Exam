import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from '../filterInterfaces'

export const createMotherboardFilterGroups = (components: Component[]): FilterGroup[] => {
  const brandMap = extractBrandOptions(components)
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(([value]) => ({ id: `manufacturer=${value}`, name: value }))

  // Socket type options
  const socketSet = new Set<string>()
  components.forEach(c => { if (c.motherboard?.socket) socketSet.add(c.motherboard.socket) })
  const socketOptions: FilterOption[] = Array.from(socketSet).map(s => ({ id: `socket=${s}`, name: s }))

  return [
    { title: 'Brand', type: 'manufacturer', options: brandOptions },
    { title: 'Socket', type: 'socket', options: socketOptions }
  ]
}
