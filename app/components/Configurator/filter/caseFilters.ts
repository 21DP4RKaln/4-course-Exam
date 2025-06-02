import { Component } from '../types'
import { FilterGroup, FilterOption, extractBrandOptions } from './filterInterfaces'

/**
 * Generate filter groups for Case components dynamically based on component specifications.
 * Excludes Form Factor filters as they are handled by Quick Filters.
 */
export const createCaseFilterGroups = (components: Component[]): FilterGroup[] => {
  const groups: FilterGroup[] = []

  // Case Type (Mid Tower, Full Tower, etc.)
  const typeSet = new Set<string>()
  components.forEach(c => {
    const type = c.specifications?.['Type'] || 
                c.specifications?.['type'] || 
                c.specifications?.['Case Type'] || 
                c.specifications?.['caseType']
    if (type) typeSet.add(String(type))
  })
  if (typeSet.size > 0) {
    const options: FilterOption[] = Array.from(typeSet)
      .sort()
      .map(val => ({ 
        id: `caseType=${val}`, 
        name: val 
      }))
    groups.push({ 
      title: 'specs.caseType',
      titleTranslationKey: 'filterGroups.caseType', 
      options 
    })
  }

  // PSU Included
  const psuIncludedSet = new Set<string>()
  components.forEach(c => {
    const psuIncluded = c.specifications?.['PSU Included'] || 
                       c.specifications?.['psuIncluded'] ||
                       c.specifications?.['Power Supply Included'] ||
                       c.specifications?.['powerSupplyIncluded']
    if (psuIncluded) psuIncludedSet.add(String(psuIncluded))
  })
  if (psuIncludedSet.size > 0) {
    const options: FilterOption[] = Array.from(psuIncludedSet)
      .sort()
      .map(val => ({ 
        id: `psuIncluded=${val}`, 
        name: val 
      }))
    groups.push({ 
      title: 'specs.psuIncluded',
      titleTranslationKey: 'filterGroups.psuIncluded', 
      options 
    })
  }

  // Color
  const colorSet = new Set<string>()
  components.forEach(c => {
    const color = c.specifications?.['Color'] || c.specifications?.['color']
    if (color) colorSet.add(String(color))
  })
  if (colorSet.size > 0) {
    const options: FilterOption[] = Array.from(colorSet)
      .sort()
      .map(val => ({ 
        id: `color=${val}`, 
        name: val 
      }))
    groups.push({ 
      title: 'specs.color',
      titleTranslationKey: 'filterGroups.color', 
      options 
    })
  }

  // Material
  const materialSet = new Set<string>()
  components.forEach(c => {
    const material = c.specifications?.['Material'] || c.specifications?.['material']
    if (material) materialSet.add(String(material))
  })
  if (materialSet.size > 0) {
    const options: FilterOption[] = Array.from(materialSet)
      .sort()
      .map(val => ({ 
        id: `material=${val}`, 
        name: val 
      }))
    groups.push({ 
      title: 'specs.material',
      titleTranslationKey: 'filterGroups.material', 
      options 
    })
  }

  // Audio In
  const audioInSet = new Set<string>()
  components.forEach(c => {
    const audioIn = c.specifications?.['Audio In'] || c.specifications?.['audioIn']
    if (audioIn) audioInSet.add(String(audioIn))
  })
  if (audioInSet.size > 0) {
    const options: FilterOption[] = Array.from(audioInSet).map(val => ({ 
      id: `audioIn=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.audioIn',
      titleTranslationKey: 'filterGroups.audioIn', 
      options 
    })
  }

  // Audio Out
  const audioOutSet = new Set<string>()
  components.forEach(c => {
    const audioOut = c.specifications?.['Audio Out'] || c.specifications?.['audioOut']
    if (audioOut) audioOutSet.add(String(audioOut))
  })
  if (audioOutSet.size > 0) {
    const options: FilterOption[] = Array.from(audioOutSet).map(val => ({ 
      id: `audioOut=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.audioOut',
      titleTranslationKey: 'filterGroups.audioOut', 
      options 
    })
  }

  // USB 2.0 Ports
  const usb20PortsSet = new Set<string>()
  components.forEach(c => {
    const usb20Ports = c.specifications?.['USB 2.0 Ports'] || 
                      c.specifications?.['usb20Ports'] ||
                      c.specifications?.['configurator.specs.USB 2.0 Ports']
    if (usb20Ports) usb20PortsSet.add(String(usb20Ports))
  })
  if (usb20PortsSet.size > 0) {
    const options: FilterOption[] = Array.from(usb20PortsSet).map(val => ({ 
      id: `usb20Ports=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.usb20Ports',
      titleTranslationKey: 'filterGroups.usb20Ports', 
      options 
    })
  }

  // USB 3.0 Ports
  const usb30PortsSet = new Set<string>()
  components.forEach(c => {
    const usb30Ports = c.specifications?.['USB 3.0 Ports'] || 
                      c.specifications?.['usb30Ports'] ||
                      c.specifications?.['configurator.specs.USB 3.0 Ports']
    if (usb30Ports) usb30PortsSet.add(String(usb30Ports))
  })
  if (usb30PortsSet.size > 0) {
    const options: FilterOption[] = Array.from(usb30PortsSet).map(val => ({ 
      id: `usb30Ports=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.usb30Ports',
      titleTranslationKey: 'filterGroups.usb30Ports', 
      options 
    })
  }

  // USB 3.2 Ports
  const usb32PortsSet = new Set<string>()
  components.forEach(c => {
    const usb32Ports = c.specifications?.['USB 3.2 Ports'] || 
                      c.specifications?.['usb32Ports'] ||
                      c.specifications?.['configurator.specs.USB 3.2 Ports']
    if (usb32Ports) usb32PortsSet.add(String(usb32Ports))
  })
  if (usb32PortsSet.size > 0) {
    const options: FilterOption[] = Array.from(usb32PortsSet).map(val => ({ 
      id: `usb32Ports=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.usb32Ports',
      titleTranslationKey: 'filterGroups.usb32Ports', 
      options 
    })
  }

  // USB Type-C Ports
  const usbTypeCPortsSet = new Set<string>()
  components.forEach(c => {
    const usbTypeCPorts = c.specifications?.['USB Type-C Ports'] || 
                         c.specifications?.['usbTypeCPorts'] ||
                         c.specifications?.['USB-C Ports'] ||
                         c.specifications?.['usbCPorts']
    if (usbTypeCPorts) usbTypeCPortsSet.add(String(usbTypeCPorts))
  })
  if (usbTypeCPortsSet.size > 0) {
    const options: FilterOption[] = Array.from(usbTypeCPortsSet).map(val => ({ 
      id: `usbTypeCPorts=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.usbTypeCPorts',
      titleTranslationKey: 'filterGroups.usbTypeCPorts', 
      options 
    })
  }

  // 5.25" Slots
  const slots525Set = new Set<string>()
  components.forEach(c => {
    const slots525 = c.specifications?.['5.25" Slots'] || 
                    c.specifications?.['slots525'] ||
                    c.specifications?.['configurator.specs.slots525']
    if (slots525) slots525Set.add(String(slots525))
  })
  if (slots525Set.size > 0) {
    const options: FilterOption[] = Array.from(slots525Set).map(val => ({ 
      id: `slots525=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.slots525',
      titleTranslationKey: 'filterGroups.slots525', 
      options 
    })
  }

  // 3.5" Slots
  const slots35Set = new Set<string>()
  components.forEach(c => {
    const slots35 = c.specifications?.['3.5" Slots'] || 
                   c.specifications?.['slots35'] ||
                   c.specifications?.['configurator.specs.slots35']
    if (slots35) slots35Set.add(String(slots35))
  })
  if (slots35Set.size > 0) {
    const options: FilterOption[] = Array.from(slots35Set).map(val => ({ 
      id: `slots35=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.slots35',
      titleTranslationKey: 'filterGroups.slots35', 
      options 
    })
  }

  // 2.5" Slots
  const slots25Set = new Set<string>()
  components.forEach(c => {
    const slots25 = c.specifications?.['2.5" Slots'] || 
                   c.specifications?.['slots25'] ||
                   c.specifications?.['configurator.specs.slots25']
    if (slots25) slots25Set.add(String(slots25))
  })
  if (slots25Set.size > 0) {
    const options: FilterOption[] = Array.from(slots25Set).map(val => ({ 
      id: `slots25=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.slots25',
      titleTranslationKey: 'filterGroups.slots25', 
      options 
    })
  }

  // Water Cooling Support
  const waterCoolingSet = new Set<string>()
  components.forEach(c => {
    const waterCooling = c.specifications?.['Water Cooling'] || 
                        c.specifications?.['waterCooling'] ||
                        c.specifications?.['Water Cooling Support'] ||
                        c.specifications?.['waterCoolingSupport']
    if (waterCooling) waterCoolingSet.add(String(waterCooling))
  })
  if (waterCoolingSet.size > 0) {
    const options: FilterOption[] = Array.from(waterCoolingSet).map(val => ({ 
      id: `waterCooling=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.waterCooling',
      titleTranslationKey: 'filterGroups.waterCooling', 
      options 
    })
  }

  // RGB Support
  const rgbSet = new Set<string>()
  components.forEach(c => {
    // Check for RGB in specifications or name/description
    const hasRgb = 
      c.specifications?.['RGB'] || 
      c.specifications?.['rgb'] ||
      (c.name?.toLowerCase().includes('rgb')) ||
      (c.description?.toLowerCase().includes('rgb'))
    
    if (hasRgb) {
      rgbSet.add('RGB')
    }
  })
  if (rgbSet.size > 0) {
    const options: FilterOption[] = Array.from(rgbSet).map(val => ({ 
      id: `rgb=true`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.rgb',
      titleTranslationKey: 'filterGroups.rgb', 
      options 
    })
  }

  // Side Panel (Glass, Acrylic, etc.)
  const panelSet = new Set<string>()
  components.forEach(c => {
    const panel = c.specifications?.['Side Panel'] || 
                 c.specifications?.['sidePanel'] ||
                 c.specifications?.['Window']
    if (panel) panelSet.add(String(panel))
    else {
      // Try to extract from name/description
      const text = (c.name + ' ' + (c.description || '')).toLowerCase()
      if (text.includes('tempered glass')) {
        panelSet.add('Tempered Glass')
      } else if (text.includes('acrylic')) {
        panelSet.add('Acrylic')
      } else if (text.includes('mesh')) {
        panelSet.add('Mesh')
      }
    }
  })
  if (panelSet.size > 0) {
    const options: FilterOption[] = Array.from(panelSet).map(val => ({ 
      id: `sidePanel=${val}`, 
      name: val 
    }))
    groups.push({ 
      title: 'specs.sidePanel',
      titleTranslationKey: 'filterGroups.sidePanel', 
      options 
    })
  }

  return groups
}
