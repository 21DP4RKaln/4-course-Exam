// Headphones-specific filter groups
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

export const createHeadphonesFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating Headphones filter groups directly from components");
  
  // Initialize Headphones filter groups
  const filterGroups: FilterGroup[] = [];
    // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const typeOptions = new Map<string, string>();
  const connectivityOptions = new Map<string, string>();
  const microphoneOptions = new Map<string, string>();
  const noiseOptions = new Map<string, string>();
  const surroundOptions = new Map<string, string>();
    // Process components to extract Headphones specs
  components.forEach(component => {
    if (!component.specifications) return;
    
    // Extract specs from component properties
    Object.entries(component.specifications).forEach(([key, value]) => {
      if (!value || value === '') return;
      
      const keyLower = key.toLowerCase();
      const valueStr = String(value).trim();

      // Extract audio type information
      if (keyLower.includes('type') || keyLower.includes('driver') || keyLower.includes('sound')) {
        typeOptions.set(valueStr, valueStr);
      }
      
      // Extract connectivity information
      else if (keyLower.includes('connectivity') || keyLower.includes('connection') || 
               keyLower.includes('wireless') || keyLower.includes('bluetooth')) {
        connectivityOptions.set(valueStr, valueStr);
      }
      
      // Extract microphone information
      else if (keyLower.includes('microphone') || keyLower.includes('mic')) {
        microphoneOptions.set(valueStr, valueStr);
      }
      
      // Extract noise cancellation information
      else if (keyLower.includes('noise') || keyLower.includes('anc') || keyLower.includes('cancellation')) {
        noiseOptions.set(valueStr, valueStr);
      }
      
      // Extract surround sound information
      else if (keyLower.includes('surround') || keyLower.includes('spatial') || keyLower.includes('7.1') || keyLower.includes('5.1')) {
        surroundOptions.set(valueStr, valueStr);
      }
    });
  });
    // Add brand/manufacturer filter group
  if (brandOptions.size > 0) {
    filterGroups.push({
      title: 'Manufacturer',
      titleTranslationKey: 'filterGroups.manufacturer',
      type: 'manufacturer',
      options: createBrandOptions(brandOptions)
    });
  }
  
  // Add type filter group
  if (typeOptions.size > 0) {
    filterGroups.push({
      title: 'Type',
      titleTranslationKey: 'filterGroups.type',
      type: 'type',
      options: Array.from(typeOptions.entries()).map(([id, name]) => createFilterOption(`type=${id}`, name))
    });
  }
  
  // Add connectivity filter group
  if (connectivityOptions.size > 0) {
    filterGroups.push({
      title: 'Connectivity',
      titleTranslationKey: 'filterGroups.connectivity',
      type: 'connectivity',
      options: Array.from(connectivityOptions.entries()).map(([id, name]) => createFilterOption(`connectivity=${id}`, name, 'connectivity'))
    });
  }
  
  // Add microphone filter group
  if (microphoneOptions.size > 0) {
    filterGroups.push({
      title: 'Microphone',
      titleTranslationKey: 'filterGroups.microphone',
      type: 'microphone',
      options: Array.from(microphoneOptions.entries()).map(([id, name]) => createFilterOption(`microphone=${id}`, name))
    });
  }
  
  // Add noise cancellation filter group
  if (noiseOptions.size > 0) {
    filterGroups.push({
      title: 'Noise Cancellation',
      titleTranslationKey: 'filterGroups.noiseCancellation',
      type: 'noise_cancellation',
      options: Array.from(noiseOptions.entries()).map(([id, name]) => createFilterOption(`noise_cancellation=${id}`, name))
    });
  }
  
  // Add surround sound filter group
  if (surroundOptions.size > 0) {
    filterGroups.push({
      title: 'Surround Sound',
      titleTranslationKey: 'filterGroups.surroundSound',
      type: 'surround',
      options: Array.from(surroundOptions.entries()).map(([id, name]) => createFilterOption(`surround=${id}`, name))
    });
  }
  
  console.log("Created Headphones filter groups:", filterGroups);
  return filterGroups;
};
