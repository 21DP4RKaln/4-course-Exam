// Speaker-specific filter groups
import { Component } from '../types';
import { FilterOption, FilterGroup, extractBrandOptions } from '../filterInterfaces';

// Helper function to create filter option with translation key
const createFilterOption = (id: string, name: string, category?: string): FilterOption => {
  return {
    id,
    name,
    ...(category && { translationKey: `filterGroups.${category}` })
  };
};

// Helper function to create filter options for brands
const createBrandOptions = (brandMap: Map<string, string>): FilterOption[] => {
  return Array.from(brandMap.entries()).map(([brand, name]) => {
    const id = brand.startsWith('brand=') ? brand : `brand=${brand}`;
    return createFilterOption(id, name, 'manufacturer');
  });
};

// Helper function to create filter options for speaker types
const createTypeOptions = (typeMap: Map<string, string>): FilterOption[] => {
  return Array.from(typeMap.entries()).map(([id, name]) => 
    createFilterOption(`type=${id}`, name, 'speakerTypes')
  );
};

// Helper function to create filter options for power
const createPowerOptions = (powerMap: Map<string, string>): FilterOption[] => {
  return Array.from(powerMap.entries()).map(([id, name]) => 
    createFilterOption(`power=${id}`, name, 'power')
  );
};

// Helper function to create filter options for connectivity
const createConnectivityOptions = (connectivityMap: Map<string, string>): FilterOption[] => {
  return Array.from(connectivityMap.entries()).map(([id, name]) => 
    createFilterOption(`connectivity=${id}`, name, 'connectivity')
  );
};

// Helper function to create filter options for channels
const createChannelsOptions = (channelsMap: Map<string, string>): FilterOption[] => {
  return Array.from(channelsMap.entries()).map(([id, name]) => 
    createFilterOption(`channels=${id}`, name, 'channels')
  );
};

// Helper function to create filter options for frequency response
const createFrequencyOptions = (frequencyMap: Map<string, string>): FilterOption[] => {
  return Array.from(frequencyMap.entries()).map(([id, name]) => 
    createFilterOption(`frequency=${id}`, name, 'frequency')
  );
};

// Helper function to create filter options for RGB lighting
const createRgbOptions = (rgbMap: Map<string, string>): FilterOption[] => {
  return Array.from(rgbMap.entries()).map(([id, name]) => 
    createFilterOption(`rgb=${id}`, name, 'rgbLighting')
  );
};

export const createSpeakerFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating Speaker filter groups directly from components");
  
  // Initialize Speaker filter groups
  const filterGroups: FilterGroup[] = [];
  
  // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const typeOptions = new Map<string, string>();
  const powerOptions = new Map<string, string>();
  const connectivityOptions = new Map<string, string>();
  const channelsOptions = new Map<string, string>();
  const frequencyOptions = new Map<string, string>();
  const rgbOptions = new Map<string, string>();
  
  // Process components to extract Speaker specs
  components.forEach(component => {
    if (!component.specifications) return;
    
    // Extract specs from component properties
    Object.entries(component.specifications).forEach(([key, value]) => {
      if (!value || value === '') return;
      
      const keyLower = key.toLowerCase();
      const valueStr = String(value).trim();

      // Extract speaker type information
      if (keyLower.includes('type') || keyLower.includes('configuration') || 
          keyLower.includes('bookshelf') || keyLower.includes('tower')) {
        typeOptions.set(valueStr, valueStr);
      }
      
      // Extract power information
      else if (keyLower.includes('power') || keyLower.includes('watt') || keyLower.includes('rms')) {
        powerOptions.set(valueStr, valueStr);
      }
      
      // Extract connectivity information
      else if (keyLower.includes('connectivity') || keyLower.includes('connection') || 
               keyLower.includes('bluetooth') || keyLower.includes('wireless') || 
               keyLower.includes('usb') || keyLower.includes('aux')) {
        connectivityOptions.set(valueStr, valueStr);
      }
      
      // Extract channel information
      else if (keyLower.includes('channel') || keyLower.includes('2.0') || 
               keyLower.includes('2.1') || keyLower.includes('5.1') || keyLower.includes('7.1')) {
        channelsOptions.set(valueStr, valueStr);
      }
      
      // Extract frequency response information
      else if (keyLower.includes('frequency') || keyLower.includes('hz') || keyLower.includes('response')) {
        frequencyOptions.set(valueStr, valueStr);
      }
      
      // Extract RGB/lighting information
      else if (keyLower.includes('rgb') || keyLower.includes('lighting') || keyLower.includes('led')) {
        rgbOptions.set(valueStr, valueStr);
      }
    });
  });
  
  // Add brand/manufacturer filter group first
  if (brandOptions.size > 0) {
    filterGroups.unshift({
      title: 'Manufacturer',
      titleTranslationKey: 'filterGroups.manufacturer',
      type: 'manufacturer',
      options: createBrandOptions(brandOptions)
    });
  }
  
  // Add type filter group
  if (typeOptions.size > 0) {
    filterGroups.push({
      title: 'Speaker Type',
      titleTranslationKey: 'filterGroups.speakerType',
      type: 'type',
      options: createTypeOptions(typeOptions)
    });
  }
  
  // Add power filter group
  if (powerOptions.size > 0) {
    filterGroups.push({
      title: 'Power',
      titleTranslationKey: 'filterGroups.power',
      type: 'power',
      options: createPowerOptions(powerOptions)
    });
  }
  
  // Add connectivity filter group
  if (connectivityOptions.size > 0) {
    filterGroups.push({
      title: 'Connectivity',
      titleTranslationKey: 'filterGroups.connectivity',
      type: 'connectivity',
      options: createConnectivityOptions(connectivityOptions)
    });
  }
  
  // Add channels filter group
  if (channelsOptions.size > 0) {
    filterGroups.push({
      title: 'Channels',
      titleTranslationKey: 'filterGroups.channels',
      type: 'channels',
      options: createChannelsOptions(channelsOptions)
    });
  }
  
  // Add frequency response filter group
  if (frequencyOptions.size > 0) {
    filterGroups.push({
      title: 'Frequency Response',
      titleTranslationKey: 'filterGroups.frequencyResponse',
      type: 'frequency',
      options: createFrequencyOptions(frequencyOptions)
    });
  }
  
  // Add RGB/lighting filter group
  if (rgbOptions.size > 0) {
    filterGroups.push({
      title: 'RGB Lighting',
      titleTranslationKey: 'filterGroups.rgbLighting',
      type: 'rgb',
      options: createRgbOptions(rgbOptions)
    });
  }
  
  console.log("Created Speaker filter groups:", filterGroups);
  return filterGroups;
};
