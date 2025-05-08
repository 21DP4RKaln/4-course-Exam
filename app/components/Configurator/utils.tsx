import { 
  Cpu, 
  Monitor, 
  HardDrive, 
  Layers, 
  Fan, 
  Zap, 
  Server
} from 'lucide-react'
import React from 'react'

/**
 * Gets the appropriate icon for a component category
 */
export function getCategoryIcon(categoryId: string): React.ReactNode {
  const iconClass = "text-gray-600 dark:text-gray-400";
  
  switch(categoryId.toLowerCase()) {
    case 'cpu': return <Cpu size={20} className={iconClass} />
    case 'motherboard': return <Server size={20} className={iconClass} />
    case 'gpu': return <Monitor size={20} className={iconClass} />
    case 'ram':
    case 'memory': return <HardDrive size={20} className={iconClass} />
    case 'storage': return <HardDrive size={20} className={iconClass} />
    case 'case': return <Layers size={20} className={iconClass} />
    case 'cooling': return <Fan size={20} className={iconClass} />
    case 'psu': return <Zap size={20} className={iconClass} />
    default: return <Cpu size={20} className={iconClass} />
  }
}

/**
 * Extract wattage from a PSU name string
 */
export function extractWattage(name: string): number {
  const match = name.match(/(\d+)\s*w/i)
  if (match && match[1]) {
    return parseInt(match[1], 10)
  }
  return 0
}

/**
 * Calculate recommended PSU wattage based on power consumption
 */
export function getRecommendedPsuWattage(totalPowerConsumption: number): string {
  if (totalPowerConsumption === 0) return 'N/A'

  if (totalPowerConsumption <= 300) return '450W'
  if (totalPowerConsumption <= 400) return '550W'
  if (totalPowerConsumption <= 500) return '650W'
  if (totalPowerConsumption <= 650) return '750W'
  if (totalPowerConsumption <= 800) return '850W'
  return '1000W+'
}

/**
 * Format price with currency
 */
export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}

/**
 * Translate component specifications
 */
export function translateSpec(specKey: string, value: string, t: any): string {
  const specTranslations: Record<string, string> = {
    'tdp': 'TDP',
    'cores': t('configurator.specs.cores'),
    'threads': t('configurator.specs.threads'),
    'speed': t('configurator.specs.speed'),
    'memory': t('configurator.specs.memory'),
    'form_factor': t('configurator.specs.formFactor'),
    'socket': t('configurator.specs.socket'),
    'capacity': t('configurator.specs.capacity'),
    'bandwidth': t('configurator.specs.bandwidth'),
    'vram': t('configurator.specs.vram'),
    'wattage': t('configurator.specs.wattage'),
    'efficiency': t('configurator.specs.efficiency'),
    'cooling_type': t('configurator.specs.coolingType'),
    'rgb': t('configurator.specs.rgb'),
  };

  return specTranslations[specKey.toLowerCase()] || specKey;
}