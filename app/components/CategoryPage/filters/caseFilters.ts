import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from '../filterInterfaces'

export const createCaseFilterGroups = (components: Component[]): FilterGroup[] => {
  const brandMap = extractBrandOptions(components)
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(([value, label]) => ({
    id: `manufacturer=${value}`,
    name: label
  }))

  // Form factor options (ATX, mATX, ITX, etc.)
  const formFactorSet = new Set<string>()
  components.forEach(c => {
    const formSpec = c.specifications?.['formFactor'] || c.specifications?.['Form Factor'] ||
                     c.specifications?.['format'] || c.specifications?.['size']
    if (formSpec) formFactorSet.add(String(formSpec))
  })
  const formFactorOptions: FilterOption[] = Array.from(formFactorSet).map(f => ({ id: `formFactor=${f}`, name: f }))

  // Color options
  const colorSet = new Set<string>()
  components.forEach(c => {
    const colorSpec = c.specifications?.['color'] || c.specifications?.['Color']
    if (colorSpec) colorSet.add(String(colorSpec))
  })
  const colorOptions: FilterOption[] = Array.from(colorSet).map(c => ({ id: `color=${c}`, name: c }))

  // Side panel options (Tempered Glass, Acrylic, etc.)
  const panelSet = new Set<string>()
  components.forEach(c => {
    const panelSpec = c.specifications?.['sidePanel'] || c.specifications?.['Side Panel'] || 
                      c.specifications?.['windowType'] || c.specifications?.['Window Type']
    if (panelSpec) panelSet.add(String(panelSpec))
  })
  const panelOptions: FilterOption[] = Array.from(panelSet).map(p => ({ id: `sidePanel=${p}`, name: p }))

  // Motherboard support options
  const mbSupportSet = new Set<string>()
  components.forEach(c => {
    const mbSpec = c.specifications?.['motherboardSupport'] || c.specifications?.['Motherboard Support'] ||
                   c.specifications?.['compatibleMotherboards'] || c.specifications?.['Compatible Motherboards']
    
    if (mbSpec) {
      const formats = String(mbSpec).split(/[,\/]/).map(f => f.trim())
      formats.forEach(f => mbSupportSet.add(f))
    }
  })
  const mbSupportOptions: FilterOption[] = Array.from(mbSupportSet).map(m => ({ id: `motherboardSupport=${m}`, name: m }))

  // RGB lighting options
  const rgbSet = new Set<string>()
  components.forEach(c => {
    const rgbSpec = c.specifications?.['rgb'] || c.specifications?.['RGB'] || 
                    c.specifications?.['lighting'] || c.specifications?.['Lighting']
    if (rgbSpec) {
      const value = String(rgbSpec)
      if (value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || 
          value.toLowerCase().includes('rgb')) {
        rgbSet.add('Yes') 
      } 
      else if (value.toLowerCase() === 'false' || value.toLowerCase() === 'no') {
        rgbSet.add('No')
      }
      else rgbSet.add(value)
    }
  })
  const rgbOptions: FilterOption[] = Array.from(rgbSet).map(r => ({ id: `rgb=${r}`, name: r }))

  const filterGroups: FilterGroup[] = [
    { title: 'Brand', type: 'manufacturer', options: brandOptions }
  ]
  
  if (formFactorOptions.length > 0) {
    filterGroups.push({ title: 'Form Factor', type: 'formFactor', options: formFactorOptions })
  }
  
  if (colorOptions.length > 0) {
    filterGroups.push({ title: 'Color', type: 'color', options: colorOptions })
  }
  
  if (panelOptions.length > 0) {
    filterGroups.push({ title: 'Side Panel', type: 'sidePanel', options: panelOptions })
  }
  
  if (mbSupportOptions.length > 0) {
    filterGroups.push({ title: 'Motherboard Support', type: 'motherboardSupport', options: mbSupportOptions })
  }
  
  if (rgbOptions.length > 0) {
    filterGroups.push({ title: 'RGB Lighting', type: 'rgb', options: rgbOptions })
  }

  return filterGroups
}
