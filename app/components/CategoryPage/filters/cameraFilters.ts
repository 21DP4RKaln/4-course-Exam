// Camera-specific filter groups
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

// Helper function to create filter options for resolution
const createResolutionOptions = (resolutionMap: Map<string, string>): FilterOption[] => {
  return Array.from(resolutionMap.entries()).map(([id, name]) => 
    createFilterOption(`resolution=${id}`, name, 'resolution')
  );
};

// Helper function to create filter options for frame rates
const createFpsOptions = (fpsMap: Map<string, string>): FilterOption[] => {
  return Array.from(fpsMap.entries()).map(([id, name]) => 
    createFilterOption(`fps=${id}`, name, 'frameRates')
  );
};

// Helper function to create filter options for connections
const createConnectionOptions = (connectionMap: Map<string, string>): FilterOption[] => {
  return Array.from(connectionMap.entries()).map(([id, name]) => 
    createFilterOption(`connection=${id}`, name, 'connectivity')
  );
};

// Helper function to create filter options for focus types
const createFocusOptions = (focusMap: Map<string, string>): FilterOption[] => {
  return Array.from(focusMap.entries()).map(([id, name]) => 
    createFilterOption(`focus=${id}`, name, 'focusTypes')
  );
};

// Helper function to create filter options for field of view
const createFovOptions = (fovMap: Map<string, string>): FilterOption[] => {
  return Array.from(fovMap.entries()).map(([id, name]) => 
    createFilterOption(`fov=${id}`, name, 'fieldOfView')
  );
};

// Helper function to create filter options for microphones
const createMicrophoneOptions = (microphoneMap: Map<string, string>): FilterOption[] => {
  return Array.from(microphoneMap.entries()).map(([id, name]) => 
    createFilterOption(`microphone=${id}`, name, 'microphones')
  );
};

export const createCameraFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating Camera filter groups directly from components");
  
  // Initialize Camera filter groups
  const filterGroups: FilterGroup[] = [];
  
  // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const resolutionOptions = new Map<string, string>();
  const fpsOptions = new Map<string, string>();
  const connectionOptions = new Map<string, string>();
  const focusOptions = new Map<string, string>();
  const fieldOfViewOptions = new Map<string, string>();
  const microphoneOptions = new Map<string, string>();
  
  // Process components to extract Camera specs
  components.forEach(component => {
    if (!component.specifications) return;
    
    // Extract specs from component properties
    Object.entries(component.specifications).forEach(([key, value]) => {
      if (!value || value === '') return;
      
      const keyLower = key.toLowerCase();
      const valueStr = String(value).trim();

      // Extract resolution information
      if (keyLower.includes('resolution') || keyLower.includes('video quality') || keyLower.includes('pixel')) {
        resolutionOptions.set(valueStr, valueStr);
      }
      
      // Extract frame rate information
      else if (keyLower.includes('fps') || keyLower.includes('frame') || keyLower.includes('framerate')) {
        fpsOptions.set(valueStr, valueStr);
      }
      
      // Extract connection type information
      else if (keyLower.includes('connection') || keyLower.includes('interface') || 
               keyLower.includes('usb') || keyLower.includes('wireless')) {
        connectionOptions.set(valueStr, valueStr);
      }
      
      // Extract focus type information
      else if (keyLower.includes('focus') || keyLower.includes('autofocus') || keyLower.includes('manual focus')) {
        focusOptions.set(valueStr, valueStr);
      }
      
      // Extract field of view information
      else if (keyLower.includes('fov') || keyLower.includes('field of view') || keyLower.includes('angle')) {
        fieldOfViewOptions.set(valueStr, valueStr);
      }
      
      // Extract microphone information
      else if (keyLower.includes('microphone') || keyLower.includes('mic') || keyLower.includes('audio')) {
        microphoneOptions.set(valueStr, valueStr);
      }
    });
  });
  // Add brand/manufacturer filter group first (Most important filter)
  if (brandOptions.size > 0) {
    filterGroups.unshift({
      title: 'Manufacturer',
      titleTranslationKey: 'filterGroups.manufacturer',
      type: 'manufacturer',
      options: createBrandOptions(brandOptions)
    });
  }
  
  // Add resolution filter group
  if (resolutionOptions.size > 0) {
    filterGroups.push({
      title: 'Resolution',
      titleTranslationKey: 'filterGroups.resolution',
      type: 'resolution',
      options: createResolutionOptions(resolutionOptions)
    });
  }
  
  // Add frame rate filter group
  if (fpsOptions.size > 0) {
    filterGroups.push({
      title: 'Frame Rate',
      titleTranslationKey: 'filterGroups.frameRate',
      type: 'fps',
      options: createFpsOptions(fpsOptions)
    });
  }
  
  // Add connection filter group
  if (connectionOptions.size > 0) {
    filterGroups.push({
      title: 'Connection',
      titleTranslationKey: 'filterGroups.connection',
      type: 'connection',
      options: createConnectionOptions(connectionOptions)
    });
  }
  
  // Add focus filter group
  if (focusOptions.size > 0) {
    filterGroups.push({
      title: 'Focus Type',
      titleTranslationKey: 'filterGroups.focusType',
      type: 'focus',
      options: createFocusOptions(focusOptions)
    });
  }
  
  // Add field of view filter group
  if (fieldOfViewOptions.size > 0) {
    filterGroups.push({
      title: 'Field of View',
      titleTranslationKey: 'filterGroups.fieldOfView',
      type: 'fov',
      options: createFovOptions(fieldOfViewOptions)
    });
  }
  
  // Add microphone filter group
  if (microphoneOptions.size > 0) {
    filterGroups.push({
      title: 'Microphone',
      titleTranslationKey: 'filterGroups.microphone',
      type: 'microphone',
      options: createMicrophoneOptions(microphoneOptions)
    });
  }
  
  console.log("Created Camera filter groups:", filterGroups);
  return filterGroups;
};
