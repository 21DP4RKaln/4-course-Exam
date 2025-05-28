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
  return Array.from(brandMap.entries()).map(([brand, name]) => {    const id = brand.startsWith('brand=') ? brand : `brand=${brand}`;
    return createFilterOption(id, name, 'manufacturer');
  });
};

// Helper function to create filter options for switch types
const createSwitchTypeOptions = (switchMap: Map<string, string>): FilterOption[] => {
  return Array.from(switchMap.entries()).map(([id, name]) => 
    createFilterOption(`switch_type=${id}`, name, 'switchTypes')
  );
};

// Helper function to create filter options for layouts 
const createLayoutOptions = (layoutMap: Map<string, string>): FilterOption[] => {
  return Array.from(layoutMap.entries()).map(([id, name]) => 
    createFilterOption(`layout=${id}`, name, 'layouts')
  );
};

// Helper function to create filter options for lighting
const createLightingOptions = (lightingMap: Map<string, string>): FilterOption[] => {
  return Array.from(lightingMap.entries()).map(([id, name]) => 
    createFilterOption(`lighting=${id}`, name, 'lighting')
  );
};

// Helper function to create filter options for connectivity
const createConnectivityOptions = (connectivityMap: Map<string, string>): FilterOption[] => {
  return Array.from(connectivityMap.entries()).map(([id, name]) => 
    createFilterOption(`connectivity=${id}`, name, 'connectivity')
  );
};

// Helper function to create filter options for form factors
const createFormFactorOptions = (formFactorMap: Map<string, string>): FilterOption[] => {
  return Array.from(formFactorMap.entries()).map(([id, name]) => 
    createFilterOption(`form_factor=${id}`, name, 'formFactors')
  );
};

export const createKeyboardFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating Keyboard filter groups directly from components");
  
  // Initialize Keyboard filter groups
  const filterGroups: FilterGroup[] = [];
    // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const switchTypeOptions = new Map<string, string>();
  const layoutOptions = new Map<string, string>();
  const lightingOptions = new Map<string, string>();
  const connectivityOptions = new Map<string, string>();
  const formFactorOptions = new Map<string, string>();
    // Process components to extract Keyboard specs
  components.forEach(component => {
    if (!component.specifications) return;
    
    // Extract specs from component properties
    Object.entries(component.specifications).forEach(([key, value]) => {
      if (!value || value === '') return;
      
      const keyLower = key.toLowerCase();
      const valueStr = String(value).trim();

      // Extract switch type information
      if (keyLower.includes('switch') || keyLower.includes('mechanical') || keyLower === 'type') {
        switchTypeOptions.set(valueStr, valueStr);
      }
      
      // Extract keyboard layout information
      else if (keyLower.includes('layout') || keyLower.includes('format') || keyLower.includes('language')) {
        layoutOptions.set(valueStr, valueStr);
      }
      
      // Extract lighting information
      else if (keyLower.includes('rgb') || keyLower.includes('backlight') || keyLower.includes('lighting') || keyLower.includes('led')) {
        lightingOptions.set(valueStr, valueStr);
      }
      
      // Extract connectivity information
      else if (keyLower.includes('connectivity') || keyLower.includes('connection') || keyLower.includes('wireless') || keyLower.includes('bluetooth')) {
        connectivityOptions.set(valueStr, valueStr);
      }
      
      // Extract form factor information
      else if (keyLower.includes('form') || keyLower.includes('size') || keyLower.includes('tkl') || keyLower.includes('tenkeyless') || keyLower.includes('full size') || keyLower.includes('60%') || keyLower.includes('compact')) {
        formFactorOptions.set(valueStr, valueStr);
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
  
  // Add switch type filter group
  if (switchTypeOptions.size > 0) {
    filterGroups.push({
      title: 'Switch Type',
      titleTranslationKey: 'filterGroups.switchType',
      type: 'switch_type',
      options: createSwitchTypeOptions(switchTypeOptions)
    });
  }
  
  // Add layout filter group
  if (layoutOptions.size > 0) {
    filterGroups.push({
      title: 'Keyboard Layout',
      titleTranslationKey: 'filterGroups.layout',
      type: 'layout',
      options: createLayoutOptions(layoutOptions)
    });
  }
  
  // Add lighting filter group
  if (lightingOptions.size > 0) {
    filterGroups.push({
      title: 'Lighting',
      titleTranslationKey: 'filterGroups.lighting',
      type: 'lighting',
      options: createLightingOptions(lightingOptions)
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
  
  // Add form factor filter group
  if (formFactorOptions.size > 0) {
    filterGroups.push({
      title: 'Form Factor',
      titleTranslationKey: 'filterGroups.formFactor',
      type: 'form_factor',
      options: createFormFactorOptions(formFactorOptions)
    });
  }
  
  console.log("Created Keyboard filter groups:", filterGroups);
  return filterGroups;
};
