// RAM-specific filter groups
import { Component } from '../types';
import { FilterOption, FilterGroup, extractBrandOptions } from '../filterInterfaces';

// Helper function to create filter option
const createFilterOption = (id: string, name: string, category?: string): FilterOption => {
  return {
    id,
    name
  };
};

// Helper function to create filter options for brands
const createBrandOptions = (brandMap: Map<string, string>): FilterOption[] => {
  return Array.from(brandMap.entries()).map(([brand, name]) => {
    const id = brand.startsWith('brand=') ? brand : `brand=${brand}`;
    return createFilterOption(id, name, 'brands');
  });
};

export const createRamFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating RAM filter groups from components");
  
  // Initialize RAM filter groups
  const filterGroups: FilterGroup[] = [];
  
  // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const capacityOptions = new Map<string, string>();
  const speedOptions = new Map<string, string>();
  const typeOptions = new Map<string, string>();
  const moduleOptions = new Map<string, string>();
  const timingOptions = new Map<string, string>();
  
  // Process components to extract RAM specs
  components.forEach(component => {
    try {
      const name = component.name.toLowerCase();
      
      // Extract capacity from name (e.g., 16GB, 32GB)
      const capacityMatch = name.match(/(\d+)(?:\s*x\s*\d+)?\s*gb/i);
      if (capacityMatch) {
        let capacity = capacityMatch[1];
        
        // Handle multi-module kits (e.g., "2 x 8GB")
        const multiModuleMatch = name.match(/(\d+)\s*x\s*(\d+)\s*gb/i);
        if (multiModuleMatch) {
          const modules = parseInt(multiModuleMatch[1]);
          const sizePerModule = parseInt(multiModuleMatch[2]);
          capacity = String(modules * sizePerModule);
        }
        
        capacityOptions.set(`capacity=${capacity}GB`, `${capacity}GB`);
      }
      
      // Extract speed from name (e.g., 3200MHz)
      const speedMatch = name.match(/(\d{3,5})\s*mhz/i);
      if (speedMatch) {
        const speed = speedMatch[1];
        speedOptions.set(`speed=${speed}MHz`, `${speed}MHz`);
      }
      
      // Extract type from name (e.g., DDR4, DDR5)
      const typeMatch = name.match(/(ddr\d)/i);
      if (typeMatch) {
        const type = typeMatch[1].toUpperCase();
        typeOptions.set(`type=${type}`, type);
      }
      
      // Extract number of modules from name (e.g., "2 x 8GB")
      const moduleMatch = name.match(/(\d+)\s*x\s*\d+\s*gb/i);
      if (moduleMatch) {
        const moduleCount = moduleMatch[1];
        moduleOptions.set(`modules=${moduleCount}`, `${moduleCount} Modules`);
      }
      
      // Extract specs from the component specifications
      if (component.specifications) {
        Object.entries(component.specifications).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') return;
          
          const keyLower = key.toLowerCase().trim();
          const valueStr = String(value).trim();
          
          // Capacity
          if (keyLower.includes('capacity') || keyLower.includes('size')) {
            // Extract numeric part and ensure GB is appended
            const capacityNum = valueStr.match(/(\d+)/);
            if (capacityNum) {
              const capacity = `${capacityNum[1]}GB`;
              capacityOptions.set(`capacity=${capacity}`, capacity);
            } else {
              capacityOptions.set(`capacity=${valueStr}`, valueStr);
            }
          }
          
          // Speed
          if (keyLower.includes('speed') || keyLower.includes('frequency') || keyLower.includes('mhz')) {
            const speedNum = valueStr.match(/(\d{3,5})/);
            if (speedNum) {
              const speed = `${speedNum[1]}MHz`;
              speedOptions.set(`speed=${speed}`, speed);
            } else {
              speedOptions.set(`speed=${valueStr}`, valueStr);
            }
          }
          
          // Type
          if (keyLower.includes('type') && (valueStr.toLowerCase().includes('ddr') || keyLower.includes('ddr'))) {
            const type = valueStr.toUpperCase().match(/(DDR\d)/);
            if (type) {
              typeOptions.set(`type=${type[1]}`, type[1]);
            } else {
              typeOptions.set(`type=${valueStr}`, valueStr);
            }
          }
          
          // Module count
          if (keyLower.includes('modules') || keyLower.includes('sticks') || keyLower.includes('x')) {
            const moduleNum = valueStr.match(/(\d+)/);
            if (moduleNum) {
              moduleOptions.set(`modules=${moduleNum[1]}`, `${moduleNum[1]} Modules`);
            } else {
              moduleOptions.set(`modules=${valueStr}`, valueStr);
            }
          }
          
          // Timing/Latency
          if (keyLower.includes('timing') || keyLower.includes('latency') || keyLower.includes('cl')) {
            // Extract CL timing (e.g., CL16)
            const timingMatch = valueStr.match(/cl(\d+)/i);
            if (timingMatch) {
              timingOptions.set(`timing=CL${timingMatch[1]}`, `CL${timingMatch[1]}`);
            } else {
              // Try to extract just the number
              const numberMatch = valueStr.match(/(\d+)/);
              if (numberMatch) {
                timingOptions.set(`timing=CL${numberMatch[1]}`, `CL${numberMatch[1]}`);
              } else {
                timingOptions.set(`timing=${valueStr}`, valueStr);
              }
            }
          }
        });
      }
    } catch (error) {
      console.error("Error processing RAM component:", error);
    }
  });
    // Create filter groups
  if (brandOptions.size > 0) {
    filterGroups.push({
      title: 'Manufacturer',
      titleTranslationKey: 'filterGroups.manufacturer',
      type: 'manufacturer',
      options: createBrandOptions(brandOptions)
    });
  }
  
  if (capacityOptions.size > 0) {
    filterGroups.push({
      title: 'Capacity',
      titleTranslationKey: 'filterGroups.capacity',
      type: 'capacity',
      options: Array.from(capacityOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  if (typeOptions.size > 0) {
    filterGroups.push({
      title: 'Memory Type',
      titleTranslationKey: 'filterGroups.memoryType',
      type: 'memory_type',
      options: Array.from(typeOptions.entries()).map(([id, name]) => createFilterOption(id, name, 'memoryTypes'))
    });
  }
  
  if (speedOptions.size > 0) {
    filterGroups.push({
      title: 'Speed',
      titleTranslationKey: 'filterGroups.speed',
      type: 'speed',
      options: Array.from(speedOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  if (moduleOptions.size > 0) {
    filterGroups.push({
      title: 'Number of Modules',
      titleTranslationKey: 'filterGroups.modules',
      type: 'modules',
      options: Array.from(moduleOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  if (timingOptions.size > 0) {
    filterGroups.push({
      title: 'CL Timing',
      titleTranslationKey: 'filterGroups.timing',
      type: 'timing',
      options: Array.from(timingOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  console.log("Created RAM filter groups:", filterGroups);
  return filterGroups;
};
