// Motherboard-specific filter groups
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

export const createMotherboardFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating Motherboard filter groups from components");
  
  // Initialize Motherboard filter groups
  const filterGroups: FilterGroup[] = [];
  
  // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const chipsetOptions = new Map<string, string>();
  const socketOptions = new Map<string, string>();
  const formFactorOptions = new Map<string, string>();
  const memoryTypeOptions = new Map<string, string>();
  const wifiOptions = new Map<string, string>();
  
  // Process components to extract Motherboard specs
  components.forEach(component => {
    try {
      // Extract specs from the component specifications
      if (component.specifications) {
        Object.entries(component.specifications).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') return;
          
          const keyLower = key.toLowerCase().trim();
          const valueStr = String(value).trim();
          
          // Chipset
          if (keyLower.includes('chipset')) {
            chipsetOptions.set(`chipset=${valueStr}`, valueStr);
          }
          
          // Socket
          if (keyLower.includes('socket') || keyLower.includes('cpu socket')) {
            socketOptions.set(`socket=${valueStr}`, valueStr);
          }
          
          // Form Factor
          if (keyLower.includes('form factor') || keyLower.includes('form-factor') || keyLower === 'form') {
            formFactorOptions.set(`form_factor=${valueStr}`, valueStr);
          }
          
          // Memory Type
          if (keyLower.includes('memory type') || (keyLower.includes('ram') && keyLower.includes('type'))) {
            memoryTypeOptions.set(`memory_type=${valueStr}`, valueStr);
          }
          
          // WiFi
          if (keyLower.includes('wifi') || keyLower.includes('wireless')) {
            // Check if the value indicates presence of WiFi
            if (valueStr.toLowerCase() === 'yes' || 
                valueStr.toLowerCase() === 'true' || 
                valueStr.toLowerCase().includes('built-in') ||
                valueStr.toLowerCase().includes('integrated')) {
              wifiOptions.set('wifi=yes', 'With WiFi');
            } else if (valueStr.toLowerCase() === 'no' || valueStr.toLowerCase() === 'false') {
              wifiOptions.set('wifi=no', 'Without WiFi');
            } else {
              wifiOptions.set(`wifi=${valueStr}`, valueStr);
            }
          }
        });
      }
      
      // Extract from name for common motherboard characteristics
      const name = component.name.toLowerCase();
      
      // Socket from name
      const socketMatch = name.match(/(am4|am5|lga1151|lga1200|lga1700|lga1155|lga2066|tr4)/i);
      if (socketMatch) {
        socketOptions.set(`socket=${socketMatch[1].toUpperCase()}`, socketMatch[1].toUpperCase());
      }
      
      // Form factor from name
      const formFactorMatch = name.match(/(atx|micro atx|mitx|mini-itx|eatx|e-atx|mini itx|matx|m-atx)/i);
      if (formFactorMatch) {
        let formFactor = formFactorMatch[1].toUpperCase();
        // Normalize form factors
        if (formFactor === 'MITX' || formFactor === 'MINI-ITX' || formFactor === 'MINI ITX') {
          formFactor = 'Mini-ITX';
        } else if (formFactor === 'MATX' || formFactor === 'M-ATX' || formFactor === 'MICRO ATX') {
          formFactor = 'Micro-ATX';
        } else if (formFactor === 'EATX' || formFactor === 'E-ATX') {
          formFactor = 'E-ATX';
        } else {
          formFactor = 'ATX';
        }
        formFactorOptions.set(`form_factor=${formFactor}`, formFactor);
      }
      
      // Chipset from name
      const chipsetMatch = name.match(/(x570|b550|z690|z790|b660|b450|z590)/i);
      if (chipsetMatch) {
        chipsetOptions.set(`chipset=${chipsetMatch[1].toUpperCase()}`, chipsetMatch[1].toUpperCase());
      }
      
      // WiFi from name
      if (name.includes('wifi')) {
        wifiOptions.set('wifi=yes', 'With WiFi');
      }
      
      // Memory type from name
      const memoryTypeMatch = name.match(/(ddr4|ddr5)/i);
      if (memoryTypeMatch) {
        memoryTypeOptions.set(`memory_type=${memoryTypeMatch[1].toUpperCase()}`, memoryTypeMatch[1].toUpperCase());
      }
      
    } catch (error) {
      console.error("Error processing Motherboard component:", error);
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
  
  if (socketOptions.size > 0) {
    filterGroups.push({
      title: 'Socket',
      titleTranslationKey: 'filterGroups.socket',
      type: 'socket',
      options: Array.from(socketOptions.entries()).map(([id, name]) => createFilterOption(id, name, 'sockets'))
    });
  }
  
  if (chipsetOptions.size > 0) {
    filterGroups.push({
      title: 'Chipset',
      titleTranslationKey: 'filterGroups.chipset',
      type: 'chipset',
      options: Array.from(chipsetOptions.entries()).map(([id, name]) => createFilterOption(id, name, 'chipsets'))
    });
  }
  
  if (formFactorOptions.size > 0) {
    filterGroups.push({
      title: 'Form Factor',
      titleTranslationKey: 'filterGroups.formFactor',
      type: 'form_factor',
      options: Array.from(formFactorOptions.entries()).map(([id, name]) => createFilterOption(id, name, 'formFactors'))
    });
  }
  
  if (memoryTypeOptions.size > 0) {
    filterGroups.push({
      title: 'Memory Type',
      titleTranslationKey: 'filterGroups.memoryType',
      type: 'memory_type',
      options: Array.from(memoryTypeOptions.entries()).map(([id, name]) => createFilterOption(id, name, 'memoryTypes'))
    });
  }
  
  if (wifiOptions.size > 0) {
    filterGroups.push({
      title: 'WiFi',
      titleTranslationKey: 'filterGroups.wifi',
      type: 'wifi',
      options: Array.from(wifiOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  console.log("Created Motherboard filter groups:", filterGroups);
  return filterGroups;
};
