// GPU-specific filter groups
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

export const createGpuFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating GPU filter groups directly from components");
  
  // Initialize GPU filter groups
  const filterGroups: FilterGroup[] = [];
    // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const memoryOptions = new Map<string, string>();
  const modelOptions = new Map<string, string>();
  const gpuTypeOptions = new Map<string, string>();
  
  // Process components to extract GPU specs
  components.forEach(component => {
    try {      // Extract brand from name
      const name = component.name.toLowerCase();
      if (name.includes('nvidia') || name.includes('geforce')) {
        brandOptions.set('brand=NVIDIA', 'NVIDIA');
      } else if (name.includes('amd') || name.includes('radeon')) {
        brandOptions.set('brand=AMD', 'AMD');
      }
      
      // Extract memory from name
      const memoryMatch = name.match(/(\d+)\s*gb/i);
      if (memoryMatch) {
        const memSize = memoryMatch[1];
        memoryOptions.set(`memory=${memSize}GB`, `${memSize}GB`);
      }
      
      // Extract GPU model
      const rtxMatch = name.match(/(rtx\s*\d{4})\s*(ti|super)?/i);
      const gtxMatch = name.match(/(gtx\s*\d{3,4})\s*(ti|super)?/i);
      const rxMatch = name.match(/(rx\s*\d{3,4})\s*(xt)?/i);
      
      if (rtxMatch) {
        const model = (rtxMatch[1] + (rtxMatch[2] ? ' ' + rtxMatch[2] : '')).toUpperCase();
        modelOptions.set(`model=${model}`, model);
        gpuTypeOptions.set('type=RTX', 'RTX Series');
      } else if (gtxMatch) {
        const model = (gtxMatch[1] + (gtxMatch[2] ? ' ' + gtxMatch[2] : '')).toUpperCase();
        modelOptions.set(`model=${model}`, model);
        gpuTypeOptions.set('type=GTX', 'GTX Series');
      } else if (rxMatch) {
        const model = (rxMatch[1] + (rxMatch[2] ? ' ' + rxMatch[2] : '')).toUpperCase();
        modelOptions.set(`model=${model}`, model);
        gpuTypeOptions.set('type=RX', 'RX Series');
      }
      
      // Extract specs from the component specifications
      if (component.specifications) {
        Object.entries(component.specifications).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') return;
          
          const keyLower = key.toLowerCase().trim();
          const valueStr = String(value).trim();
          
          // Brand
          if (keyLower.includes('brand') || keyLower.includes('manufacturer')) {
            if (valueStr.toLowerCase().includes('nvidia')) {
              brandOptions.set('brand=NVIDIA', 'NVIDIA');
            } else if (valueStr.toLowerCase().includes('amd')) {
              brandOptions.set('brand=AMD', 'AMD');
            } else {
              brandOptions.set(`brand=${valueStr}`, valueStr);
            }
          }
          
          // Memory
          if (keyLower.includes('memory') || keyLower.includes('vram')) {
            memoryOptions.set(`memory=${valueStr}`, valueStr);
          }
          
          // Model
          if (keyLower.includes('model') || keyLower.includes('chip') || keyLower.includes('gpu')) {
            modelOptions.set(`model=${valueStr}`, valueStr);
          }
        });
      }
    } catch (error) {
      console.error("Error processing GPU component:", error);
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
  
  if (gpuTypeOptions.size > 0) {
    filterGroups.push({
      title: 'Series',
      titleTranslationKey: 'filterGroups.series',
      type: 'gpu_series',
      options: Array.from(gpuTypeOptions.entries()).map(([id, name]) => createFilterOption(id, name, 'gpuSeries'))
    });
  }
  
  if (modelOptions.size > 0) {
    filterGroups.push({
      title: 'GPU Model',
      titleTranslationKey: 'filterGroups.gpuModel',
      type: 'gpu_model',
      options: Array.from(modelOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  if (memoryOptions.size > 0) {
    filterGroups.push({
      title: 'Video Memory (VRAM)',
      titleTranslationKey: 'filterGroups.vram',
      type: 'vram',
      options: Array.from(memoryOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  console.log("Created GPU filter groups:", filterGroups);
  return filterGroups;
};
