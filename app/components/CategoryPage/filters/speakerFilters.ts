import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from '../filterInterfaces'

export const createSpeakerFilterGroups = (components: Component[]): FilterGroup[] => {
  const brandMap = extractBrandOptions(components)
  const brandOptions: FilterOption[] = Array.from(brandMap.entries()).map(([value, label]) => ({
    id: `manufacturer=${value}`,
    name: label
  }))

  // Speaker type options (bookshelf, tower, subwoofer, etc.)
  const typeSet = new Set<string>()
  components.forEach(c => {
    const type = c.specifications['type'] || c.specifications['speakerType'] || c.specifications['configuration']
    if (type) typeSet.add(type)
  })
  const typeOptions: FilterOption[] = Array.from(typeSet).map(v => ({ id: `type=${v}`, name: v }))

  // Power/wattage options
  const powerSet = new Set<string>()
  components.forEach(c => {
    const power = c.specifications['power'] || c.specifications['wattage'] || c.specifications['maxPower']
    if (power) powerSet.add(power)
  })
  const powerOptions: FilterOption[] = Array.from(powerSet).map(v => ({ id: `power=${v}`, name: v }))

  // Connectivity options
  const connectionSet = new Set<string>()
  components.forEach(c => {
    const connection = c.specifications['connection'] || c.specifications['connectivity'] || c.specifications['input']
    if (connection) connectionSet.add(connection)
  })
  const connectionOptions: FilterOption[] = Array.from(connectionSet).map(v => ({ id: `connection=${v}`, name: v }))

  // Frequency response options
  const frequencySet = new Set<string>()
  components.forEach(c => {
    const frequency = c.specifications['frequencyResponse'] || c.specifications['frequency'] || c.specifications['range']
    if (frequency) frequencySet.add(frequency)
  })
  const frequencyOptions: FilterOption[] = Array.from(frequencySet).map(v => ({ id: `frequency=${v}`, name: v }))

  // Driver size options
  const driverSet = new Set<string>()
  components.forEach(c => {
    const driver = c.specifications['driverSize'] || c.specifications['driver'] || c.specifications['wooferSize']
    if (driver) driverSet.add(driver)
  })
  const driverOptions: FilterOption[] = Array.from(driverSet).map(v => ({ id: `driver=${v}`, name: v }))

  // Wireless support options
  const wirelessSet = new Set<string>()
  components.forEach(c => {
    const wireless = c.specifications['wireless'] || c.specifications['bluetooth'] || c.specifications['wifi']
    if (wireless) wirelessSet.add(wireless)
  })
  const wirelessOptions: FilterOption[] = Array.from(wirelessSet).map(v => ({ id: `wireless=${v}`, name: v }))

  const filterGroups: FilterGroup[] = [
    { title: 'Brand', type: 'manufacturer', options: brandOptions }
  ]

  if (typeOptions.length > 0) {
    filterGroups.push({ title: 'Speaker Type', type: 'type', options: typeOptions })
  }

  if (powerOptions.length > 0) {
    filterGroups.push({ title: 'Power', type: 'power', options: powerOptions })
  }

  if (connectionOptions.length > 0) {
    filterGroups.push({ title: 'Connection', type: 'connection', options: connectionOptions })
  }

  if (frequencyOptions.length > 0) {
    filterGroups.push({ title: 'Frequency Response', type: 'frequency', options: frequencyOptions })
  }

  if (driverOptions.length > 0) {
    filterGroups.push({ title: 'Driver Size', type: 'driver', options: driverOptions })
  }

  if (wirelessOptions.length > 0) {
    filterGroups.push({ title: 'Wireless', type: 'wireless', options: wirelessOptions })
  }

  return filterGroups
}
