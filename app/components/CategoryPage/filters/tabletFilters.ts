import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from '../filterInterfaces'

export const createTabletFilterGroups = (components: Component[]): FilterGroup[] => {
  const brandMap = extractBrandOptions(components)
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(([value, label]) => ({
    id: `manufacturer=${value}`,
    name: label
  }))  // Tablet type/subtype options
  const typeSet = new Set<string>()
  components.forEach(c => {
    const subType = c.specifications?.['subType'] || c.specifications?.['type'] || c.specifications?.['category']
    if (subType) typeSet.add(subType)
  })
  const typeOptions: FilterOption[] = Array.from(typeSet).map(type => ({
    id: `type=${type}`,
    name: type
  }))

  // Screen size options
  const sizeSet = new Set<string>()
  components.forEach(c => {
    const size = c.specifications?.['screenSize'] || c.specifications?.['size'] || c.specifications?.['displaySize']
    if (size) sizeSet.add(size)
  })
  const sizeOptions: FilterOption[] = Array.from(sizeSet).map(size => ({
    id: `size=${size}`,
    name: size
  }))

  // Pressure sensitivity levels
  const pressureSet = new Set<string>()
  components.forEach(c => {
    const pressure = c.specifications?.['pressureLevels'] || c.specifications?.['sensitivity'] || c.specifications?.['pressure']
    if (pressure) pressureSet.add(pressure)
  })
  const pressureOptions: FilterOption[] = Array.from(pressureSet).map(pressure => ({
    id: `pressure=${pressure}`,
    name: `${pressure} Levels`
  }))

  // Connectivity options
  const connectivitySet = new Set<string>()
  components.forEach(c => {
    const connectivity = c.specifications?.['connectivity'] || c.specifications?.['connection'] || c.specifications?.['interface']
    if (connectivity) connectivitySet.add(connectivity)
  })
  const connectivityOptions: FilterOption[] = Array.from(connectivitySet).map(conn => ({
    id: `connectivity=${conn}`,
    name: conn
  }))

  // Operating system options
  const osSet = new Set<string>()
  components.forEach(c => {
    const os = c.specifications?.['os'] || c.specifications?.['operatingSystem'] || c.specifications?.['platform']
    if (os) osSet.add(os)
  })
  const osOptions: FilterOption[] = Array.from(osSet).map(os => ({
    id: `os=${os}`,
    name: os
  }))

  // Pen/stylus support
  const penSet = new Set<string>()
  components.forEach(c => {
    const penSupport = c.specifications?.['penSupport'] || c.specifications?.['stylus'] || c.specifications?.['digitalPen']
    if (penSupport !== undefined) penSet.add(String(penSupport))
  })
  const penOptions: FilterOption[] = Array.from(penSet).map(pen => ({
    id: `pen=${pen}`,
    name: pen === 'true' ? 'Pen/Stylus Support' : 'No Pen Support'
  }))

  // Touch support
  const touchSet = new Set<string>()
  components.forEach(c => {
    const touch = c.specifications?.['touch'] || c.specifications?.['touchscreen'] || c.specifications?.['multiTouch']
    if (touch !== undefined) touchSet.add(String(touch))
  })
  const touchOptions: FilterOption[] = Array.from(touchSet).map(touch => ({
    id: `touch=${touch}`,
    name: touch === 'true' ? 'Touch Support' : 'No Touch'
  }))

  const filterGroups: FilterGroup[] = [
    { title: 'Brand', type: 'manufacturer', options: brandOptions }
  ]

  if (typeOptions.length > 0) {
    filterGroups.push({ title: 'Type', type: 'type', options: typeOptions })
  }

  if (sizeOptions.length > 0) {
    filterGroups.push({ title: 'Screen Size', type: 'size', options: sizeOptions })
  }

  if (pressureOptions.length > 0) {
    filterGroups.push({ title: 'Pressure Sensitivity', type: 'pressure', options: pressureOptions })
  }

  if (connectivityOptions.length > 0) {
    filterGroups.push({ title: 'Connectivity', type: 'connectivity', options: connectivityOptions })
  }

  if (osOptions.length > 0) {
    filterGroups.push({ title: 'Operating System', type: 'os', options: osOptions })
  }

  if (penOptions.length > 0) {
    filterGroups.push({ title: 'Pen Support', type: 'pen', options: penOptions })
  }

  if (touchOptions.length > 0) {
    filterGroups.push({ title: 'Touch Support', type: 'touch', options: touchOptions })
  }

  return filterGroups
}
