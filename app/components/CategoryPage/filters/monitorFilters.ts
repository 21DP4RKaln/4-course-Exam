// Monitor-specific filter groups
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

export const createMonitorFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating Monitor filter groups directly from components");
  
  // Initialize Monitor filter groups
  const filterGroups: FilterGroup[] = [];
    // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const resolutionOptions = new Map<string, string>();
  const refreshRateOptions = new Map<string, string>();
  const panelTypeOptions = new Map<string, string>();
  const sizeOptions = new Map<string, string>();
  const hdrOptions = new Map<string, string>();
  const syncOptions = new Map<string, string>();
    // Process components to extract Monitor specs
  components.forEach(component => {
    if (!component.specifications) return;
    
    // Extract specs from component properties
    Object.entries(component.specifications).forEach(([key, value]) => {
      if (!value || value === '') return;
      
      const keyLower = key.toLowerCase();
      const valueStr = String(value).trim();

      // Extract resolution information
      if (keyLower.includes('resolution')) {
        resolutionOptions.set(valueStr, valueStr);
      }
      
      // Extract refresh rate information
      else if (keyLower.includes('refresh') || keyLower.includes('hz')) {
        refreshRateOptions.set(valueStr, valueStr);
      }
      
      // Extract panel type information
      else if (keyLower.includes('panel') || keyLower.includes('display type')) {
        panelTypeOptions.set(valueStr, valueStr);
      }
      
      // Extract size information
      else if (keyLower.includes('size') || keyLower.includes('inch')) {
        sizeOptions.set(valueStr, valueStr);
      }
      
      // Extract HDR information
      else if (keyLower.includes('hdr') || keyLower.includes('high dynamic range')) {
        hdrOptions.set(valueStr, valueStr);
      }
      
      // Extract sync technology information
      else if (keyLower.includes('sync') || keyLower.includes('g-sync') || 
               keyLower.includes('freesync') || keyLower.includes('adaptive')) {
        syncOptions.set(valueStr, valueStr);
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
  
  // Add resolution filter group
  if (resolutionOptions.size > 0) {
    filterGroups.push({
      title: 'Resolution',
      titleTranslationKey: 'filterGroups.resolution',
      type: 'resolution',
      options: Array.from(resolutionOptions.entries()).map(([id, name]) => createFilterOption(`resolution=${id}`, name))
    });
  }
  
  // Add refresh rate filter group
  if (refreshRateOptions.size > 0) {
    filterGroups.push({
      title: 'Refresh Rate',
      titleTranslationKey: 'filterGroups.refreshRate',
      type: 'refresh_rate',
      options: Array.from(refreshRateOptions.entries()).map(([id, name]) => createFilterOption(`refresh_rate=${id}`, name))
    });
  }
  
  // Add panel type filter group
  if (panelTypeOptions.size > 0) {
    filterGroups.push({
      title: 'Panel Type',
      titleTranslationKey: 'filterGroups.panelType',
      type: 'panel_type',
      options: Array.from(panelTypeOptions.entries()).map(([id, name]) => createFilterOption(`panel_type=${id}`, name))
    });
  }
  
  // Add size filter group
  if (sizeOptions.size > 0) {
    filterGroups.push({
      title: 'Size',
      titleTranslationKey: 'filterGroups.size',
      type: 'size',
      options: Array.from(sizeOptions.entries()).map(([id, name]) => createFilterOption(`size=${id}`, name))
    });
  }
  
  // Add HDR filter group
  if (hdrOptions.size > 0) {
    filterGroups.push({
      title: 'HDR',
      titleTranslationKey: 'filterGroups.hdr',
      type: 'hdr',
      options: Array.from(hdrOptions.entries()).map(([id, name]) => createFilterOption(`hdr=${id}`, name))
    });
  }
  
  // Add sync technology filter group
  if (syncOptions.size > 0) {
    filterGroups.push({
      title: 'Sync Technology',
      titleTranslationKey: 'filterGroups.syncTech',
      type: 'sync_tech',
      options: Array.from(syncOptions.entries()).map(([id, name]) => createFilterOption(`sync_tech=${id}`, name))
    });
  }
  
  console.log("Created Monitor filter groups:", filterGroups);
  return filterGroups;
};
