import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from './filterInterfaces'

/**
 * Generate filter groups for Motherboard components dynamically based on component specifications.
 */
export const createMotherboardFilterGroups = (components: Component[]): FilterGroup[] => {
  const groups: FilterGroup[] = []

  // Brand filter
  const brandOptions = extractBrandOptions(components)
  if (brandOptions.size > 0) {
    const options: FilterOption[] = Array.from(brandOptions.entries()).map(([id, name]) => ({ 
      id, 
      name 
    }))
    groups.push({ 
      title: 'manufacturer',
      titleTranslationKey: 'filterGroups.manufacturer',
      options 
    })
  }

  // Socket
  const socketSet = new Set<string>()
  components.forEach(c => {
    const socket = c.specifications?.['Socket'] || c.specifications?.['socket']
    if (socket) socketSet.add(String(socket))
  })
  if (socketSet.size > 0) {
    const options: FilterOption[] = Array.from(socketSet).map(val => ({ 
      id: `socket=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.socket',
      titleTranslationKey: 'filterGroups.socket', 
      options 
    })
  }

  // Chipset
  const chipsetSet = new Set<string>()
  components.forEach(c => {
    const chipset = c.specifications?.['Chipset'] || c.specifications?.['chipset']
    if (chipset) chipsetSet.add(String(chipset))
  })
  if (chipsetSet.size > 0) {
    const options: FilterOption[] = Array.from(chipsetSet).map(val => ({ 
      id: `chipset=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.chipset',
      titleTranslationKey: 'filterGroups.chipset', 
      options 
    })
  }

  // Memory slots
  const memSlotsSet = new Set<string>()
  components.forEach(c => {
    const memSlots = c.specifications?.['Memory Slots'] || 
                    c.specifications?.['memorySlots'] ||
                    c.specifications?.['memory_slots']
    if (memSlots) memSlotsSet.add(String(memSlots))
  })
  if (memSlotsSet.size > 0) {
    // Convert to numbers for proper sorting, then back to strings
    const sortedOptions = Array.from(memSlotsSet)
      .map(val => Number(val))
      .sort((a, b) => a - b)
      .map(String)
      .map(val => ({ 
        id: `memorySlots=${val}`, 
        name: val 
      }))

    groups.push({ 
      title: 'specs.memorySlots',
      titleTranslationKey: 'filterGroups.memorySlots', 
      options: sortedOptions
    })
  }

  // Processor Support
  const processorSupportSet = new Set<string>()
  components.forEach(c => {
    const processorSupport = c.specifications?.['Processor Support'] || 
                          c.specifications?.['processorSupport'] ||
                          c.specifications?.['processor_support']
    if (processorSupport) processorSupportSet.add(String(processorSupport))
  })
  if (processorSupportSet.size > 0) {
    const options: FilterOption[] = Array.from(processorSupportSet).map(val => ({ 
      id: `processorSupport=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.processorSupport',
      titleTranslationKey: 'filterGroups.processorSupport', 
      options 
    })
  }

  // Memory Type
  const memTypeSet = new Set<string>()
  components.forEach(c => {
    const memType = c.specifications?.['Memory Type'] || 
                  c.specifications?.['memoryType'] ||
                  c.specifications?.['memory_type']
    if (memType) memTypeSet.add(String(memType))
  })
  if (memTypeSet.size > 0) {
    const options: FilterOption[] = Array.from(memTypeSet).map(val => ({ 
      id: `memoryType=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.memoryType',
      titleTranslationKey: 'filterGroups.memoryType', 
      options 
    })
  }

  // Max RAM Capacity
  const maxRamCapacitySet = new Set<string>()
  components.forEach(c => {
    const maxRam = c.specifications?.['Max RAM Capacity'] || 
                c.specifications?.['maxRamCapacity'] ||
                c.specifications?.['max_ram_capacity']
    if (maxRam) {
      // Normalize to GB format
      let ramValue = String(maxRam)
      if (!ramValue.includes('GB') && !ramValue.includes('gb')) {
        ramValue = `${ramValue} GB`
      }
      maxRamCapacitySet.add(ramValue)
    }
  })
  if (maxRamCapacitySet.size > 0) {
    // Sort by RAM capacity value
    const sortedOptions = Array.from(maxRamCapacitySet)
      .map(val => {
        const numVal = parseInt(val.replace(/[^0-9]/g, ''))
        return { val, numVal }
      })
      .sort((a, b) => a.numVal - b.numVal)
      .map(item => ({ 
        id: `maxRamCapacity=${item.val}`, 
        name: item.val 
      }))

    groups.push({ 
      title: 'specs.maxRamCapacity',
      titleTranslationKey: 'filterGroups.maxRamCapacity', 
      options: sortedOptions
    })
  }

  // Max Memory Frequency
  const maxMemFreqSet = new Set<string>()
  components.forEach(c => {
    const maxFreq = c.specifications?.['Max Memory Frequency'] || 
                  c.specifications?.['maxMemoryFrequency'] ||
                  c.specifications?.['max_memory_frequency']
    if (maxFreq) {
      // Normalize to MHz format
      let freqValue = String(maxFreq)
      if (!freqValue.includes('MHz') && !freqValue.includes('mhz')) {
        freqValue = `${freqValue} MHz`
      }
      maxMemFreqSet.add(freqValue)
    }
  })
  if (maxMemFreqSet.size > 0) {
    // Sort by frequency value
    const sortedOptions = Array.from(maxMemFreqSet)
      .map(val => {
        const numVal = parseInt(val.replace(/[^0-9]/g, ''))
        return { val, numVal }
      })
      .sort((a, b) => a.numVal - b.numVal)
      .map(item => ({ 
        id: `maxMemoryFrequency=${item.val}`, 
        name: item.val 
      }))

    groups.push({ 
      title: 'specs.maxMemoryFrequency',
      titleTranslationKey: 'filterGroups.maxMemoryFrequency', 
      options: sortedOptions
    })
  }

  // M.2 Slots
  const m2SlotsSet = new Set<string>()
  components.forEach(c => {
    const m2Slots = c.specifications?.['M.2 Slots'] || 
                  c.specifications?.['m2Slots'] ||
                  c.specifications?.['m2_slots']
    if (m2Slots) m2SlotsSet.add(String(m2Slots))
  })
  if (m2SlotsSet.size > 0) {
    // Convert to numbers for proper sorting, then back to strings
    const sortedOptions = Array.from(m2SlotsSet)
      .map(val => Number(val))
      .sort((a, b) => a - b)
      .map(String)
      .map(val => ({ 
        id: `m2Slots=${val}`, 
        name: val 
      }))

    groups.push({ 
      title: 'specs.m2Slots',
      titleTranslationKey: 'filterGroups.m2Slots', 
      options: sortedOptions
    })
  }

  // SATA Ports
  const sataPortsSet = new Set<string>()
  components.forEach(c => {
    const sataPorts = c.specifications?.['SATA Ports'] || 
                    c.specifications?.['sataPorts'] ||
                    c.specifications?.['sata_ports']
    if (sataPorts) sataPortsSet.add(String(sataPorts))
  })
  if (sataPortsSet.size > 0) {
    // Convert to numbers for proper sorting, then back to strings
    const sortedOptions = Array.from(sataPortsSet)
      .map(val => Number(val))
      .sort((a, b) => a - b)
      .map(String)
      .map(val => ({ 
        id: `sataPorts=${val}`, 
        name: val 
      }))

    groups.push({ 
      title: 'specs.sataPorts',
      titleTranslationKey: 'filterGroups.sataPorts', 
      options: sortedOptions
    })
  }

  // Max Video Cards
  const videoCardsSet = new Set<string>()
  components.forEach(c => {
    const videoCards = c.specifications?.['Max Video Cards'] || 
                     c.specifications?.['maxVideoCards'] ||
                     c.specifications?.['max_video_cards']
    if (videoCards) videoCardsSet.add(String(videoCards))
  })
  if (videoCardsSet.size > 0) {
    // Convert to numbers for proper sorting, then back to strings
    const sortedOptions = Array.from(videoCardsSet)
      .map(val => Number(val))
      .sort((a, b) => a - b)
      .map(String)
      .map(val => ({ 
        id: `maxVideoCards=${val}`, 
        name: val 
      }))

    groups.push({ 
      title: 'specs.maxVideoCards',
      titleTranslationKey: 'filterGroups.maxVideoCards', 
      options: sortedOptions
    })
  }

  // SLI/Crossfire Support
  const multiGpuSet = new Set<string>()
  components.forEach(c => {
    const multiGpu = c.specifications?.['SLI/Crossfire'] || 
                   c.specifications?.['sliCrossfire'] ||
                   c.specifications?.['sli_crossfire']
    if (multiGpu) multiGpuSet.add(String(multiGpu))
  })
  if (multiGpuSet.size > 0) {
    const options: FilterOption[] = Array.from(multiGpuSet).map(val => ({ 
      id: `sliCrossfire=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.sliCrossfire',
      titleTranslationKey: 'filterGroups.sliCrossfire', 
      options 
    })
  }

  // WiFi/Bluetooth
  const wirelessSet = new Set<string>()
  components.forEach(c => {
    const wireless = c.specifications?.['WiFi/Bluetooth'] || 
                   c.specifications?.['wifiBluetooth'] ||
                   c.specifications?.['wifi_bluetooth']
    if (wireless) wirelessSet.add(String(wireless))
  })
  if (wirelessSet.size > 0) {
    const options: FilterOption[] = Array.from(wirelessSet).map(val => ({ 
      id: `wifiBluetooth=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.wifiBluetooth',
      titleTranslationKey: 'filterGroups.wifiBluetooth', 
      options 
    })
  }

  // NVMe Support
  const nvmeSet = new Set<string>()
  components.forEach(c => {
    const nvme = c.specifications?.['NVMe Support'] || 
              c.specifications?.['nvmeSupport'] ||
              c.specifications?.['nvme_support']
    if (nvme) nvmeSet.add(String(nvme))
  })
  if (nvmeSet.size > 0) {
    const options: FilterOption[] = Array.from(nvmeSet).map(val => ({ 
      id: `nvmeSupport=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.nvmeSupport',
      titleTranslationKey: 'filterGroups.nvmeSupport', 
      options 
    })
  }

  return groups
}
