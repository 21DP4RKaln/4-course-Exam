import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from '../filterInterfaces'

export const createPsuFilterGroups = (components: Component[]): FilterGroup[] => {
  const brandMap = extractBrandOptions(components)
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(([value, label]) => ({
    id: `manufacturer=${value}`,
    name: label
  }))

  // Wattage options
  const wattageSet = new Set<number>()
  components.forEach(c => {
    if (c.psu?.power) wattageSet.add(c.psu.power)
    const powerSpec = c.specifications?.['power'] || c.specifications?.['Power'] || 
                      c.specifications?.['wattage'] || c.specifications?.['Wattage']
    if (powerSpec) {
      const wattValue = parseInt(String(powerSpec).replace(/[^\d]/g, ''), 10)
      if (!isNaN(wattValue)) wattageSet.add(wattValue)
    }
  })
  const wattageOptions: FilterOption[] = Array.from(wattageSet)
    .sort((a, b) => a - b)
    .map(w => ({ id: `power=${w}`, name: `${w} W` }))

  // Certification options (80+ Bronze, Gold, etc.)
  const certSet = new Set<string>()
  components.forEach(c => {
    const certSpec = c.specifications?.['certification'] || c.specifications?.['Certification'] || 
                     c.specifications?.['80Plus'] || c.specifications?.['80 PLUS']
    if (certSpec) certSet.add(String(certSpec))
  })
  const certOptions: FilterOption[] = Array.from(certSet).map(c => ({ id: `certification=${c}`, name: c }))

  // Modular options (Non-modular, Semi-modular, Fully modular)
  const modularSet = new Set<string>()
  components.forEach(c => {
    const modSpec = c.specifications?.['modular'] || c.specifications?.['Modular'] || 
                   c.specifications?.['cableType'] || c.specifications?.['Cable Type']
    if (modSpec) modularSet.add(String(modSpec))
  })
  const modularOptions: FilterOption[] = Array.from(modularSet).map(m => ({ id: `modular=${m}`, name: m }))

  // Form factor options (ATX, SFX, etc.)
  const formFactorSet = new Set<string>()
  components.forEach(c => {
    const formSpec = c.specifications?.['formFactor'] || c.specifications?.['Form Factor']
    if (formSpec) formFactorSet.add(String(formSpec))
  })
  const formFactorOptions: FilterOption[] = Array.from(formFactorSet).map(f => ({ id: `formFactor=${f}`, name: f }))

  const filterGroups: FilterGroup[] = [
    { title: 'Brand', type: 'manufacturer', options: brandOptions }
  ]

  if (wattageOptions.length > 0) {
    filterGroups.push({ title: 'Power Rating', type: 'power', options: wattageOptions })
  }

  if (certOptions.length > 0) {
    filterGroups.push({ title: 'Certification', type: 'certification', options: certOptions })
  }

  if (modularOptions.length > 0) {
    filterGroups.push({ title: 'Modularity', type: 'modular', options: modularOptions })
  }

  if (formFactorOptions.length > 0) {
    filterGroups.push({ title: 'Form Factor', type: 'formFactor', options: formFactorOptions })
  }

  return filterGroups
}
