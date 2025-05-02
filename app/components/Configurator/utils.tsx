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
    switch(categoryId.toLowerCase()) {
      case 'cpu': return <Cpu size={20} />
      case 'motherboard': return <Server size={20} />
      case 'gpu': return <Monitor size={20} />
      case 'ram': return <HardDrive size={20} />
      case 'storage': return <HardDrive size={20} />
      case 'case': return <Layers size={20} />
      case 'cooling': return <Fan size={20} />
      case 'psu': return <Zap size={20} />
      default: return <Cpu size={20} />
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
    
    // Round up to nearest standard PSU wattage
    if (totalPowerConsumption <= 300) return '450W'
    if (totalPowerConsumption <= 400) return '550W'
    if (totalPowerConsumption <= 500) return '650W'
    if (totalPowerConsumption <= 650) return '750W'
    if (totalPowerConsumption <= 800) return '850W'
    return '1000W+'
  }