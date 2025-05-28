// filepath: c:\Users\sitva\Desktop\projekts\exam-project---Copy\app\components\Configurator\filter\cpuFilters.ts
import { Component } from '../types'
import { FilterGroup, FilterOption } from './filterInterfaces'

/**
 * Generate filter groups for CPU components dynamically based on component specifications.
 */
export const createCpuFilterGroups = (components: Component[]): FilterGroup[] => {
  const groups: FilterGroup[] = []

  // Cores group
  const coresSet = new Set<string>()
  components.forEach(c => {
    const cores = c.specifications?.['Cores'] || c.specifications?.['cores']
    if (cores) coresSet.add(String(cores))
  })
  if (coresSet.size) {
    const options: FilterOption[] = Array.from(coresSet).map(val => ({ id: `cores=${val}`, name: `${val}` }))
    groups.push({ title: 'specs.cores', options })
  }

  // Threads group
  const threadsSet = new Set<string>()
  components.forEach(c => {
    const threads = c.specifications?.['Threads'] || c.specifications?.['threads']
    if (threads) threadsSet.add(String(threads))
  })
  if (threadsSet.size) {
    const options: FilterOption[] = Array.from(threadsSet).map(val => ({ id: `threads=${val}`, name: `${val}` }))
    groups.push({ title: 'specs.threads', options })
  }

  // Socket group
  const socketSet = new Set<string>()
  components.forEach(c => {
    const socket = c.specifications?.['Socket'] || c.specifications?.['socket']
    if (socket) socketSet.add(String(socket))
  })
  if (socketSet.size) {
    const options: FilterOption[] = Array.from(socketSet).map(val => ({ id: `socket=${val}`, name: val }))
    groups.push({ title: 'specs.socket', options })
  }

  // Clock Speed group
  const speedSet = new Set<string>()
  components.forEach(c => {
    const speed = c.specifications?.['Speed'] || c.specifications?.['speed']
    if (speed) speedSet.add(String(speed))
  })
  if (speedSet.size) {
    const options: FilterOption[] = Array.from(speedSet).map(val => ({ id: `speed=${val}`, name: val }))
    groups.push({ title: 'specs.speed', options })
  }

  // Base Clock group
  const baseClockSet = new Set<string>()
  components.forEach(c => {
    const base = c.specifications?.['Base_Clock'] || c.specifications?.['baseClock']
    if (base) baseClockSet.add(String(base))
  })
  if (baseClockSet.size) {
    const options: FilterOption[] = Array.from(baseClockSet).map(val => ({ id: `baseClock=${val}`, name: val }))
    groups.push({ title: 'specs.baseClock', options })
  }

  // Boost Clock group
  const boostClockSet = new Set<string>()
  components.forEach(c => {
    const boost = c.specifications?.['Boost_Clock'] || c.specifications?.['boostClock']
    if (boost) boostClockSet.add(String(boost))
  })
  if (boostClockSet.size) {
    const options: FilterOption[] = Array.from(boostClockSet).map(val => ({ id: `boostClock=${val}`, name: val }))
    groups.push({ title: 'specs.boostClock', options })
  }

  // Cache group
  const cacheSet = new Set<string>()
  components.forEach(c => {
    const cache = c.specifications?.['Cache'] || c.specifications?.['cacheSize'] || c.specifications?.['cache']
    if (cache) cacheSet.add(String(cache))
  })
  if (cacheSet.size) {
    const options: FilterOption[] = Array.from(cacheSet).map(val => ({ id: `cache=${val}`, name: val }))
    groups.push({ title: 'specs.Cache', options })
  }

  // TDP group
  const tdpSet = new Set<string>()
  components.forEach(c => {
    const tdp = c.specifications?.['TDP'] || c.specifications?.['tdp']
    if (tdp) tdpSet.add(String(tdp))
  })
  if (tdpSet.size) {
    const options: FilterOption[] = Array.from(tdpSet).map(val => ({ id: `tdp=${val}`, name: val }))
    groups.push({ title: 'specs.tdp', options })
  }

  // Architecture group
  const archSet = new Set<string>()
  components.forEach(c => {
    const arch = c.specifications?.['architecture']
    if (arch) archSet.add(String(arch))
  })
  if (archSet.size) {
    const options: FilterOption[] = Array.from(archSet).map(val => ({ id: `architecture=${val}`, name: val }))
    groups.push({ title: 'specs.architecture', options })
  }

  // Integrated GPU group
  const igpuSet = new Set<string>()
  components.forEach(c => {
    const igpu = c.specifications?.['integratedGpu']
    if (igpu !== undefined) igpuSet.add(String(igpu))
  })
  if (igpuSet.size) {
    const options: FilterOption[] = Array.from(igpuSet).map(val => ({ id: `integratedGpu=${val}`, name: val }))
    groups.push({ title: 'specs.integratedGpu', options })
  }

  return groups
}
