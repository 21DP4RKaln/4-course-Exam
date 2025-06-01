import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from '../filterInterfaces'

export const createCoolerFilterGroups = (components: Component[]): FilterGroup[] => {
  const brandMap = extractBrandOptions(components)
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(([value, label]) => ({
    id: `manufacturer=${value}`,
    name: label
  }))

  // Type options (Air vs Liquid)
  const typeSet = new Set<string>()
  components.forEach(c => {
    const typeSpec = c.specifications?.['type'] || c.specifications?.['Type'] || 
                    c.specifications?.['coolerType'] || c.specifications?.['Cooler Type']
    if (typeSpec) typeSet.add(String(typeSpec))
  })
  const typeOptions: FilterOption[] = Array.from(typeSet).map(t => ({ id: `type=${t}`, name: t }))

  // Socket compatibility options
  const socketSet = new Set<string>()
  components.forEach(c => {
    if (c.cooling?.socket) {
      const sockets = c.cooling.socket.split('/').map(s => s.trim())
      sockets.forEach(s => socketSet.add(s))
    }
    
    const socketSpec = c.specifications?.['socket'] || c.specifications?.['Socket'] || 
                      c.specifications?.['socketCompatibility'] || c.specifications?.['Socket Compatibility']
    if (socketSpec) {
      const socketsStr = String(socketSpec)
      const sockets = socketsStr.split(/[,\/]/).map(s => s.trim())
      sockets.forEach(s => socketSet.add(s))
    }
  })
  const socketOptions: FilterOption[] = Array.from(socketSet).map(s => ({ id: `socket=${s}`, name: s }))

  // Fan size/diameter options
  const fanSizeSet = new Set<number>()
  components.forEach(c => {
    if (c.cooling?.fanDiameter) fanSizeSet.add(c.cooling.fanDiameter)
    
    const sizeSpec = c.specifications?.['fanSize'] || c.specifications?.['Fan Size'] || 
                     c.specifications?.['fanDiameter'] || c.specifications?.['Fan Diameter']
    if (sizeSpec) {
      const sizeValue = parseInt(String(sizeSpec).replace(/[^\d]/g, ''), 10)
      if (!isNaN(sizeValue)) fanSizeSet.add(sizeValue)
    }
  })
  const fanSizeOptions: FilterOption[] = Array.from(fanSizeSet)
    .sort((a, b) => a - b)
    .map(s => ({ id: `fanDiameter=${s}`, name: `${s} mm` }))

  // TDP rating options
  const tdpSet = new Set<number>()
  components.forEach(c => {
    const tdpSpec = c.specifications?.['tdp'] || c.specifications?.['TDP'] || 
                   c.specifications?.['maxTdp'] || c.specifications?.['Max TDP']
    if (tdpSpec) {
      const tdpValue = parseInt(String(tdpSpec).replace(/[^\d]/g, ''), 10)
      if (!isNaN(tdpValue)) tdpSet.add(tdpValue)
    }
  })
  const tdpOptions: FilterOption[] = Array.from(tdpSet)
    .sort((a, b) => a - b)
    .map(t => ({ id: `tdp=${t}`, name: `${t}W` }))

  // RGB lighting options
  const rgbSet = new Set<string>()
  components.forEach(c => {
    const rgbSpec = c.specifications?.['rgb'] || c.specifications?.['RGB'] || 
                   c.specifications?.['lighting'] || c.specifications?.['Lighting']
    if (rgbSpec) {
      const rgbValue = String(rgbSpec).toLowerCase()
      if (rgbValue === 'true' || rgbValue === 'yes' || rgbValue.includes('rgb')) rgbSet.add('Yes')
      else if (rgbValue === 'false' || rgbValue === 'no') rgbSet.add('No')
      else rgbSet.add(String(rgbSpec))
    }
  })
  const rgbOptions: FilterOption[] = Array.from(rgbSet).map(r => ({ id: `rgb=${r}`, name: r }))

  const filterGroups: FilterGroup[] = [
    { title: 'Brand', type: 'manufacturer', options: brandOptions }
  ]
  
  if (typeOptions.length > 0) {
    filterGroups.push({ title: 'Cooler Type', type: 'type', options: typeOptions })
  }
  
  if (socketOptions.length > 0) {
    filterGroups.push({ title: 'Socket Compatibility', type: 'socket', options: socketOptions })
  }
  
  if (fanSizeOptions.length > 0) {
    filterGroups.push({ title: 'Fan Size', type: 'fanDiameter', options: fanSizeOptions })
  }
  
  if (tdpOptions.length > 0) {
    filterGroups.push({ title: 'TDP Rating', type: 'tdp', options: tdpOptions })
  }
  
  if (rgbOptions.length > 0) {
    filterGroups.push({ title: 'RGB Lighting', type: 'rgb', options: rgbOptions })
  }

  return filterGroups
}
