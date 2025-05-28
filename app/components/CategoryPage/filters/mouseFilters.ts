// Mouse-specific filter groups
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
    return createFilterOption(id, name, 'brands');
  });
};

export const createMouseFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating Mouse filter groups directly from components");
  
  // Initialize Mouse filter groups
  const filterGroups: FilterGroup[] = [];
    // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const dpiOptions = new Map<string, string>();
  const sensorOptions = new Map<string, string>();
  const buttonsOptions = new Map<string, string>();
  const connectivityOptions = new Map<string, string>();
  const weightOptions = new Map<string, string>();
  const ergonomicOptions = new Map<string, string>();
    // Process components to extract Mouse specs
  components.forEach(component => {
    if (!component.specifications) return;
    
    // Extract specs from component properties
    Object.entries(component.specifications).forEach(([key, value]) => {
      if (!value || value === '') return;
      
      const keyLower = key.toLowerCase();
      const valueStr = String(value).trim();

      // Extract DPI information
      if (keyLower.includes('dpi') || keyLower.includes('sensitivity')) {
        dpiOptions.set(valueStr, valueStr);
      }
      
      // Extract sensor type
      else if (keyLower.includes('sensor') || keyLower.includes('tracking')) {
        sensorOptions.set(valueStr, valueStr);
      }
      
      // Extract button count
      else if (keyLower.includes('button')) {
        buttonsOptions.set(valueStr, valueStr);
      }
      
      // Extract connectivity information
      else if (keyLower.includes('connectivity') || keyLower.includes('connection') || 
               keyLower.includes('wireless') || keyLower.includes('bluetooth')) {
        connectivityOptions.set(valueStr, valueStr);
      }
      
      // Extract weight information
      else if (keyLower.includes('weight')) {
        weightOptions.set(valueStr, valueStr);
      }
      
      // Extract ergonomic information
      else if (keyLower.includes('ergonomic') || keyLower.includes('shape') || 
               keyLower.includes('design') || keyLower.includes('grip')) {
        ergonomicOptions.set(valueStr, valueStr);
      }
    });
  });
  
  // Add brand/manufacturer filter group
  if (brandOptions.size > 0) {
    filterGroups.push({
      title: 'Manufacturer',
      type: 'manufacturer',
      options: Array.from(brandOptions.entries()).map(([id, name]) => ({ id: `brand=${id}`, name }))
    });
  }
    // Add brand filter group
  if (brandOptions.size > 0) {
    filterGroups.push({
      title: 'Manufacturer',
      titleTranslationKey: 'filterGroups.manufacturer',
      type: 'manufacturer',
      options: createBrandOptions(brandOptions)
    });
  }
  
  // Add DPI filter group
  if (dpiOptions.size > 0) {
    filterGroups.push({
      title: 'DPI',
      titleTranslationKey: 'filterGroups.dpi',
      type: 'dpi',
      options: Array.from(dpiOptions.entries()).map(([id, name]) => createFilterOption(`dpi=${id}`, name))
    });
  }
  
  // Add sensor type filter group
  if (sensorOptions.size > 0) {
    filterGroups.push({
      title: 'Sensor Type',
      titleTranslationKey: 'filterGroups.sensorType',
      type: 'sensor',
      options: Array.from(sensorOptions.entries()).map(([id, name]) => createFilterOption(`sensor=${id}`, name))
    });
  }
  
  // Add buttons filter group
  if (buttonsOptions.size > 0) {
    filterGroups.push({
      title: 'Buttons',
      titleTranslationKey: 'filterGroups.buttons',
      type: 'buttons',
      options: Array.from(buttonsOptions.entries()).map(([id, name]) => createFilterOption(`buttons=${id}`, name))
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
  
  // Add weight filter group
  if (weightOptions.size > 0) {
    filterGroups.push({
      title: 'Weight',
      titleTranslationKey: 'filterGroups.weight',
      type: 'weight',
      options: Array.from(weightOptions.entries()).map(([id, name]) => createFilterOption(`weight=${id}`, name))
    });
  }
  
  // Add ergonomic filter group
  if (ergonomicOptions.size > 0) {
    filterGroups.push({
      title: 'Design',
      titleTranslationKey: 'filterGroups.design',
      type: 'design',
      options: Array.from(ergonomicOptions.entries()).map(([id, name]) => createFilterOption(`design=${id}`, name))
    });
  }
  
  console.log("Created Mouse filter groups:", filterGroups);
  return filterGroups;
};
