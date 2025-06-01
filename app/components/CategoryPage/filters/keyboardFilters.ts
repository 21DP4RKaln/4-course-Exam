import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from '../filterInterfaces'

export const createKeyboardFilterGroups = (components: Component[]): FilterGroup[] => {
  const brandMap = extractBrandOptions(components)
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(([value]) => ({ id: `manufacturer=${value}`, name: value }))

  // Switch type options
  const switchSet = new Set<string>()
  components.forEach(c => {
    const val = c.specifications['switch'] || c.specifications['switchType']
    if (val) switchSet.add(val)
  })
  const switchOptions: FilterOption[] = Array.from(switchSet).map(v => ({ id: `switch=${v}`, name: v }))

  // Backlighting options
  const backlightSet = new Set<string>()
  components.forEach(c => {
    const val = c.specifications['backlight'] || c.specifications['lighting'] || c.specifications['backlighting']
    if (val) backlightSet.add(val)
  })
  const backlightOptions: FilterOption[] = Array.from(backlightSet).map(v => ({ id: `backlight=${v}`, name: v }))

  return [
    { title: 'Brand', type: 'manufacturer', options: brandOptions },
    { title: 'Switch Type', type: 'switch', options: switchOptions },
    { title: 'Backlighting', type: 'backlight', options: backlightOptions }
  ]
}
