// MousePad-specific filter groups
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

export const createMousePadFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating MousePad filter groups directly from components");
  
  // Initialize MousePad filter groups
  const filterGroups: FilterGroup[] = [];
  
  // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const sizeOptions = new Map<string, string>();
  const materialOptions = new Map<string, string>();
  const surfaceOptions = new Map<string, string>();
  const thicknessOptions = new Map<string, string>();
  const rgbOptions = new Map<string, string>();
  
  // Process components to extract MousePad specs
  components.forEach(component => {
    if (!component.specifications) return;
    
    // Extract specs from component properties
    Object.entries(component.specifications).forEach(([key, value]) => {
      if (!value || value === '') return;
      
      const keyLower = key.toLowerCase();
      const valueStr = String(value).trim();

      // Extract size information
      if (keyLower.includes('size') || keyLower.includes('dimension') || keyLower.includes('width') || keyLower.includes('height')) {
        sizeOptions.set(valueStr, valueStr);
      }
      
      // Extract material information
      else if (keyLower.includes('material') || keyLower.includes('fabric') || keyLower.includes('cloth') || keyLower.includes('rubber')) {
        materialOptions.set(valueStr, valueStr);
      }
      
      // Extract surface type information
      else if (keyLower.includes('surface') || keyLower.includes('texture') || keyLower.includes('finish')) {
        surfaceOptions.set(valueStr, valueStr);
      }
      
      // Extract thickness information
      else if (keyLower.includes('thickness') || keyLower.includes('thick') || keyLower.includes('mm')) {
        thicknessOptions.set(valueStr, valueStr);
      }
      
      // Extract RGB/lighting information
      else if (keyLower.includes('rgb') || keyLower.includes('lighting') || keyLower.includes('led')) {
        rgbOptions.set(valueStr, valueStr);
      }
    });
  });
  
  // Add brand/manufacturer filter group
  if (brandOptions.size > 0) {
    filterGroups.push({
      title: 'Brands',
      titleTranslationKey: 'brands',
      type: 'manufacturer',
      options: createBrandOptions(brandOptions)
    });
  }
  
  // Add size filter group
  if (sizeOptions.size > 0) {
    filterGroups.push({
      title: 'Size',
      titleTranslationKey: 'filterGroups.size',
      type: 'size',
      options: Array.from(sizeOptions.entries()).map(([id, name]) => createFilterOption(`size=${id}`, name, 'size'))
    });
  }
  
  // Add material filter group
  if (materialOptions.size > 0) {
    filterGroups.push({
      title: 'Material',
      titleTranslationKey: 'filterGroups.material',
      type: 'material',
      options: Array.from(materialOptions.entries()).map(([id, name]) => createFilterOption(`material=${id}`, name, 'materials'))
    });
  }
  
  // Add surface filter group
  if (surfaceOptions.size > 0) {
    filterGroups.push({
      title: 'Surface Type',
      titleTranslationKey: 'filterGroups.surfaceType',
      type: 'surface',
      options: Array.from(surfaceOptions.entries()).map(([id, name]) => createFilterOption(`surface=${id}`, name, 'surfaceTypes'))
    });
  }
  
  // Add thickness filter group
  if (thicknessOptions.size > 0) {
    filterGroups.push({
      title: 'Thickness',
      titleTranslationKey: 'filterGroups.thickness',
      type: 'thickness',
      options: Array.from(thicknessOptions.entries()).map(([id, name]) => createFilterOption(`thickness=${id}`, name, 'thickness'))
    });
  }
  
  // Add RGB/lighting filter group
  if (rgbOptions.size > 0) {
    filterGroups.push({
      title: 'RGB Lighting',
      titleTranslationKey: 'filterGroups.rgbLighting',
      type: 'rgb',
      options: Array.from(rgbOptions.entries()).map(([id, name]) => createFilterOption(`rgb=${id}`, name, 'rgbLighting'))
    });
  }
  
  console.log("Created MousePad filter groups:", filterGroups);
  return filterGroups;
};
