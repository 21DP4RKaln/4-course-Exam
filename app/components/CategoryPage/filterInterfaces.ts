// Common filter interfaces
import { Component } from '../../types';

export interface FilterOption {
  id: string;
  name: string;
  translationKey?: string;
}

export interface FilterGroup {
  title: string;
  type: string;
  options: FilterOption[];
  titleTranslationKey?: string;
}

// Helper function to extract brand options from components
export const extractBrandOptions = (components: Component[]): Map<string, string> => {
  const brandOptions = new Map<string, string>();
  
  components.forEach(component => {
    if (!component.specifications) return;
    
    // Add manufacturer/brand
    if (component.brand || component.manufacturer) {
      const brand = component.brand || component.manufacturer || '';
      if (brand) {
        brandOptions.set(brand, brand);
      }
    }
    
    // Also check specifications for brand info
    Object.entries(component.specifications).forEach(([key, value]) => {
      if (!value || value === '') return;
      
      const keyLower = key.toLowerCase();
      if (keyLower.includes('brand') || keyLower.includes('manufacturer') || keyLower === 'make') {
        brandOptions.set(String(value), String(value));
      }
    });
  });
  
  return brandOptions;
};
