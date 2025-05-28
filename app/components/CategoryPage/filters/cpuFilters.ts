// CPU-specific filter groups
import { Component } from '../types';
import { FilterOption, FilterGroup, extractBrandOptions } from '../filterInterfaces';

// Helper function to create filter option
const createFilterOption = (id: string, name: string): FilterOption => {
  return {
    id,
    name,
  };
};

// Helper function to create filter options for brands
const createBrandOptions = (brandMap: Map<string, string>): FilterOption[] => {
  return Array.from(brandMap.entries()).map(([brand, name]) => {
    // Derive raw brand value without prefix
    const value = brand.startsWith('brand=') ? brand.split('=')[1] : brand;
    const id = `brand=${value}`;
    return createFilterOption(id, name);
  });
};

// Helper function to create filter options for CPU series
const createSeriesOptions = (seriesMap: Map<string, string>): FilterOption[] => {
  return Array.from(seriesMap.entries()).map(([id, name]) => 
    createFilterOption(id, name)
  );
};

// Helper function to create filter options for sockets
const createSocketOptions = (socketMap: Map<string, string>): FilterOption[] => {
  return Array.from(socketMap.entries()).map(([id, name]) => 
    createFilterOption(id, name)
  );
};

export const createCpuFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating CPU filter groups from components");
  
  // Initialize CPU filter groups
  const filterGroups: FilterGroup[] = [];
  
  // Create maps to collect filter options
  // Extract and normalize brand options to ensure unique prefixed keys
  const brandMap = extractBrandOptions(components);
  const brandOptions = new Map<string, string>();
  brandMap.forEach((name, brand) => {
    const value = brand.startsWith('brand=') ? brand.split('=')[1] : brand;
    brandOptions.set(`brand=${value}`, name);
  });
  const socketOptions = new Map<string, string>();
  const coreOptions = new Map<string, string>();
  const threadOptions = new Map<string, string>();
  const seriesOptions = new Map<string, string>();
  const tdpOptions = new Map<string, string>();
  
  // Process components to extract CPU specs
  components.forEach(component => {
    try {
      // Extract CPU brand and series from name
      const name = component.name.toLowerCase();
      
      // Detect Intel CPUs
      if (name.includes('intel') || name.includes('core i')) {
        // Using DB-provided manufacturer; manual override removed
        
        // Extract series
        if (name.includes('i9') || name.includes('i-9')) {
          seriesOptions.set('series=Core i9', 'Core i9');
        } else if (name.includes('i7') || name.includes('i-7')) {
          seriesOptions.set('series=Core i7', 'Core i7');
        } else if (name.includes('i5') || name.includes('i-5')) {
          seriesOptions.set('series=Core i5', 'Core i5');
        } else if (name.includes('i3') || name.includes('i-3')) {
          seriesOptions.set('series=Core i3', 'Core i3');
        } else if (name.includes('pentium')) {
          seriesOptions.set('series=Pentium', 'Pentium');
        } else if (name.includes('celeron')) {
          seriesOptions.set('series=Celeron', 'Celeron');
        }
      }
      
      // Detect AMD CPUs
      if (name.includes('amd') || name.includes('ryzen')) {
        // Using DB-provided manufacturer; manual override removed
        
        // Extract series
        if (name.includes('ryzen 9') || name.includes('r9')) {
          seriesOptions.set('series=Ryzen 9', 'Ryzen 9');
        } else if (name.includes('ryzen 7') || name.includes('r7')) {
          seriesOptions.set('series=Ryzen 7', 'Ryzen 7');
        } else if (name.includes('ryzen 5') || name.includes('r5')) {
          seriesOptions.set('series=Ryzen 5', 'Ryzen 5');
        } else if (name.includes('ryzen 3') || name.includes('r3')) {
          seriesOptions.set('series=Ryzen 3', 'Ryzen 3');
        } else if (name.includes('threadripper')) {
          seriesOptions.set('series=Threadripper', 'Threadripper');
        } else if (name.includes('athlon')) {
          seriesOptions.set('series=Athlon', 'Athlon');
        }
      }
      
      // Extract cores from name
      const coreMatch = name.match(/(\d+)[ -]?core/i);
      if (coreMatch) {
        const cores = coreMatch[1];
        coreOptions.set(`cores=${cores}`, `${cores} Cores`);
      }
      
      // Extract threads from name
      const threadMatch = name.match(/(\d+)[ -]?thread/i);
      if (threadMatch) {
        const threads = threadMatch[1];
        threadOptions.set(`threads=${threads}`, `${threads} Threads`);
      }
      
      // Extract specs from the component specifications
      if (component.specifications) {
        Object.entries(component.specifications).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') return;
          
          const keyLower = key.toLowerCase().trim();
          const valueStr = String(value).trim();
          
          // Socket
          if (keyLower.includes('socket')) {
            socketOptions.set(`socket=${valueStr}`, valueStr);
          }
          
          // Cores
          if (keyLower.includes('core') && !keyLower.includes('clock')) {
            const coreNum = valueStr.match(/(\d+)/);
            if (coreNum) {
              coreOptions.set(`cores=${coreNum[1]}`, `${coreNum[1]} Cores`);
            }
          }
          
          // Threads
          if (keyLower.includes('thread')) {
            const threadNum = valueStr.match(/(\d+)/);
            if (threadNum) {
              threadOptions.set(`threads=${threadNum[1]}`, `${threadNum[1]} Threads`);
            }
          }
          
          // TDP
          if (keyLower.includes('tdp') || (keyLower.includes('power') && keyLower.includes('watt'))) {
            // Extract numeric part for consistent formatting
            const tdpValue = valueStr.match(/(\d+)/);
            if (tdpValue) {
              tdpOptions.set(`tdp=${tdpValue[1]}W`, `${tdpValue[1]}W`);
            } else {
              tdpOptions.set(`tdp=${valueStr}`, valueStr);
            }
          }
          
          // Series (from specs)
          if (keyLower.includes('series') || keyLower.includes('family')) {
            if (valueStr.toLowerCase().includes('ryzen')) {
              if (valueStr.includes('9')) {
                seriesOptions.set('series=Ryzen 9', 'Ryzen 9');
              } else if (valueStr.includes('7')) {
                seriesOptions.set('series=Ryzen 7', 'Ryzen 7');
              } else if (valueStr.includes('5')) {
                seriesOptions.set('series=Ryzen 5', 'Ryzen 5');
              } else if (valueStr.includes('3')) {
                seriesOptions.set('series=Ryzen 3', 'Ryzen 3');
              } else {
                seriesOptions.set(`series=${valueStr}`, valueStr);
              }
            } else if (valueStr.toLowerCase().includes('core')) {
              if (valueStr.includes('i9') || valueStr.includes('i-9')) {
                seriesOptions.set('series=Core i9', 'Core i9');
              } else if (valueStr.includes('i7') || valueStr.includes('i-7')) {
                seriesOptions.set('series=Core i7', 'Core i7');
              } else if (valueStr.includes('i5') || valueStr.includes('i-5')) {
                seriesOptions.set('series=Core i5', 'Core i5');
              } else if (valueStr.includes('i3') || valueStr.includes('i-3')) {
                seriesOptions.set('series=Core i3', 'Core i3');
              } else {
                seriesOptions.set(`series=${valueStr}`, valueStr);
              }
            } else {
              seriesOptions.set(`series=${valueStr}`, valueStr);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error processing CPU component:", error);
    }
  });
    // Create filter groups
  if (brandOptions.size > 0) {
    filterGroups.push({
      title: 'Manufacturer',
      titleTranslationKey: 'categoryPage.filterGroups.manufacturer',
      type: 'manufacturer',
      options: createBrandOptions(brandOptions)
    });
  }

  if (seriesOptions.size > 0) {
    filterGroups.push({
      title: 'Series',
      titleTranslationKey: 'categoryPage.filterGroups.series',
      type: 'cpu_series',
      options: createSeriesOptions(seriesOptions)
    });
  }
  
  if (socketOptions.size > 0) {
    filterGroups.push({
      title: 'Socket',
      titleTranslationKey: 'categoryPage.filterGroups.socket',
      type: 'socket',
      options: createSocketOptions(socketOptions)
    });
  }
  
  if (coreOptions.size > 0) {
    filterGroups.push({
      title: 'Cores',
      titleTranslationKey: 'categoryPage.filterGroups.cores',
      type: 'cores',
      options: Array.from(coreOptions.entries()).map(([id, name]) => ({ id, name }))
    });
  }
  
  if (threadOptions.size > 0) {
    filterGroups.push({
      title: 'Threads',
      titleTranslationKey: 'categoryPage.filterGroups.threads',
      type: 'threads',
      options: Array.from(threadOptions.entries()).map(([id, name]) => ({ id, name }))
    });
  }

  if (tdpOptions.size > 0) {
    filterGroups.push({
      title: 'TDP',
      titleTranslationKey: 'categoryPage.filterGroups.tdp',
      type: 'tdp',
      options: Array.from(tdpOptions.entries()).map(([id, name]) => ({ id, name }))
    });
  }
  
  console.log("Created CPU filter groups:", filterGroups);
  return filterGroups;
};
