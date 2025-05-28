// Cooler-specific filter groups
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

export const createCoolerFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating Cooler filter groups from components");
  
  // Initialize Cooler filter groups
  const filterGroups: FilterGroup[] = [];
  
  // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const typeOptions = new Map<string, string>();
  const radiatorSizeOptions = new Map<string, string>();
  const tdpOptions = new Map<string, string>();
  const socketOptions = new Map<string, string>();
  
  // Process components to extract Cooler specs
  components.forEach(component => {
    try {
      const name = component.name.toLowerCase();
      
      // Determine cooler type from name
      if (name.includes('liquid') || name.includes('water') || name.includes('aio')) {
        typeOptions.set('type=Liquid', 'Liquid Cooling');
      } else if (name.includes('air')) {
        typeOptions.set('type=Air', 'Air Cooling');
      }
      
      // Extract radiator size from name for liquid coolers
      const radiatorMatch = name.match(/(\d{3}mm|\d{2,3}0mm)/i);
      if (radiatorMatch) {
        radiatorSizeOptions.set(`radiator_size=${radiatorMatch[1]}`, radiatorMatch[1]);
      }
      
      // Extract TDP rating from name
      const tdpMatch = name.match(/(\d+)w\s*tdp/i);
      if (tdpMatch) {
        tdpOptions.set(`tdp=${tdpMatch[1]}W`, `${tdpMatch[1]}W`);
      }
      
      // Extract socket compatibility from name
      const socketTypes = ['am4', 'am5', 'lga1700', 'lga1200', 'lga1151', 'tr4'];
      for (const socket of socketTypes) {
        if (name.includes(socket)) {
          socketOptions.set(`socket=${socket.toUpperCase()}`, socket.toUpperCase());
        }
      }
      
      // Extract specs from the component specifications
      if (component.specifications) {
        Object.entries(component.specifications).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') return;
          
          const keyLower = key.toLowerCase().trim();
          const valueStr = String(value).trim().toLowerCase();
          
          // Cooler Type
          if (keyLower.includes('type') || keyLower.includes('cooling')) {
            if (valueStr.includes('liquid') || valueStr.includes('water') || valueStr.includes('aio')) {
              typeOptions.set('type=Liquid', 'Liquid Cooling');
            } else if (valueStr.includes('air')) {
              typeOptions.set('type=Air', 'Air Cooling');
            } else {
              // Capitalize first letter
              const formattedType = valueStr.charAt(0).toUpperCase() + valueStr.slice(1);
              typeOptions.set(`type=${formattedType}`, formattedType);
            }
          }
          
          // Radiator Size
          if (keyLower.includes('radiator') || keyLower.includes('rad size')) {
            // Try to extract numeric part with mm
            const sizeMatch = valueStr.match(/(\d{3}|\d{2})(?:\s*mm)?/);
            if (sizeMatch) {
              radiatorSizeOptions.set(`radiator_size=${sizeMatch[1]}mm`, `${sizeMatch[1]}mm`);
            } else {
              radiatorSizeOptions.set(`radiator_size=${valueStr}`, valueStr);
            }
          }
          
          // TDP Rating
          if (keyLower.includes('tdp') || keyLower.includes('thermal design power')) {
            // Extract numeric part
            const tdpMatch = valueStr.match(/(\d+)/);
            if (tdpMatch) {
              tdpOptions.set(`tdp=${tdpMatch[1]}W`, `${tdpMatch[1]}W`);
            } else {
              tdpOptions.set(`tdp=${valueStr}`, valueStr);
            }
          }
          
          // Socket Compatibility
          if (keyLower.includes('socket') || keyLower.includes('compatibility')) {
            // Split by common separators and extract individual sockets
            const socketsList = valueStr.split(/[,\/\s]+/);
            socketsList.forEach(socket => {
              if (socket && socket !== '') {
                socket = socket.trim().toUpperCase();
                if (socket.match(/^(AM4|AM5|LGA\d{3,4}|TR4)$/i)) {
                  socketOptions.set(`socket=${socket}`, socket);
                }
              }
            });
          }
        });
      }
    } catch (error) {
      console.error("Error processing Cooler component:", error);
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
  
  if (typeOptions.size > 0) {
    filterGroups.push({
      title: 'Cooling Type',
      titleTranslationKey: 'filterGroups.coolingType',
      type: 'cooling_type',
      options: Array.from(typeOptions.entries()).map(([id, name]) => createFilterOption(id, name, 'coolingTypes'))
    });
  }
  
  if (radiatorSizeOptions.size > 0) {
    filterGroups.push({
      title: 'Radiator Size',
      titleTranslationKey: 'filterGroups.radiatorSize',
      type: 'radiator_size',
      options: Array.from(radiatorSizeOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  if (socketOptions.size > 0) {
    filterGroups.push({
      title: 'Socket Compatibility',
      titleTranslationKey: 'filterGroups.socketCompatibility',
      type: 'socket_compatibility',
      options: Array.from(socketOptions.entries()).map(([id, name]) => createFilterOption(id, name, 'sockets'))
    });
  }
  
  if (tdpOptions.size > 0) {
    filterGroups.push({
      title: 'TDP Rating',
      titleTranslationKey: 'filterGroups.tdp',
      type: 'tdp',
      options: Array.from(tdpOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  console.log("Created Cooler filter groups:", filterGroups);
  return filterGroups;
};
