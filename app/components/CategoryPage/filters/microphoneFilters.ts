// Microphone-specific filter groups
import { Component } from '../types';
import { FilterOption, FilterGroup, extractBrandOptions } from '../filterInterfaces';

// Helper function to create filter option
const createFilterOption = (id: string, name: string, category?: string): FilterOption => {
  return {
    id,
    name
  };
};

// Helper function to create brand options
const createBrandOptions = (brandMap: Map<string, string>): FilterOption[] => {
  return Array.from(brandMap.entries()).map(([brand, name]) => {
    const id = brand.startsWith('brand=') ? brand : `brand=${brand}`;
    return createFilterOption(id, name, 'brands');
  });
};

// Helper function to create filter options for microphone types
const createTypeOptions = (typeMap: Map<string, string>): FilterOption[] => {
  return Array.from(typeMap.entries()).map(([id, name]) => 
    createFilterOption(`type=${id}`, name, 'microphoneTypes')
  );
};

// Helper function to create filter options for pickup patterns
const createPatternOptions = (patternMap: Map<string, string>): FilterOption[] => {
  return Array.from(patternMap.entries()).map(([id, name]) => 
    createFilterOption(`pattern=${id}`, name, 'pickupPatterns')
  );
};

// Helper function to create filter options for connections
const createConnectionOptions = (connectionMap: Map<string, string>): FilterOption[] => {
  return Array.from(connectionMap.entries()).map(([id, name]) => 
    createFilterOption(`connection=${id}`, name, 'connectivity')
  );
};

export const createMicrophoneFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating Microphone filter groups directly from components");
  
  // Initialize Microphone filter groups
  const filterGroups: FilterGroup[] = [];
  
  // Create maps to collect filter options  
  const typeOptions = new Map<string, string>();
  const patternOptions = new Map<string, string>();
  const connectionOptions = new Map<string, string>();
  
  // Process components to extract Microphone specs
  components.forEach(component => {
    if (!component.specifications) return;
    
    // Extract specs from component properties
    Object.entries(component.specifications).forEach(([key, value]) => {
      if (!value || value === '') return;
      
      const keyLower = key.toLowerCase();
      const valueStr = String(value).trim();

      // Extract microphone type information
      if (keyLower.includes('type') || keyLower.includes('condenser') || keyLower.includes('dynamic')) {
        typeOptions.set(valueStr, valueStr);
      }
      
      // Extract pickup pattern information
      else if (keyLower.includes('pattern') || keyLower.includes('pickup') || 
               keyLower.includes('directional') || keyLower.includes('cardioid')) {
        patternOptions.set(valueStr, valueStr);
      }
      
      // Extract connection information
      else if (keyLower.includes('connection') || keyLower.includes('interface') || 
               keyLower.includes('usb') || keyLower.includes('xlr')) {
        connectionOptions.set(valueStr, valueStr);
      }
        });
  });
  // Add brand/manufacturer filter group
  const brandOptions = extractBrandOptions(components);
  if (brandOptions.size > 0) {
    filterGroups.push({
      title: 'Manufacturer',
      titleTranslationKey: 'filterGroups.manufacturer',
      type: 'manufacturer',
      options: createBrandOptions(brandOptions)
    });
  }
  
  // Add microphone type filter group
  if (typeOptions.size > 0) {
    filterGroups.push({
      title: 'Type',
      titleTranslationKey: 'filterGroups.type',
      type: 'type',
      options: createTypeOptions(typeOptions)
    });
  }
  
  // Add pickup pattern filter group
  if (patternOptions.size > 0) {
    filterGroups.push({
      title: 'Pickup Pattern', 
      titleTranslationKey: 'filterGroups.pickupPattern',
      type: 'pattern',
      options: createPatternOptions(patternOptions)
    });
  }
  
  // Add connection filter group
  if (connectionOptions.size > 0) {
    filterGroups.push({
      title: 'Connection',
      titleTranslationKey: 'filterGroups.connectivity',
      type: 'connection', 
      options: createConnectionOptions(connectionOptions)
    });
  }
  
  console.log("Created Microphone filter groups:", filterGroups);
  return filterGroups;
};
