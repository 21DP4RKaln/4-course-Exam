// filepath: c:\Users\sitva\Desktop\projekts\exam-project---Copy\app\components\Configurator\filter\filterInterfaces.ts
import { Component } from '../types';

// Defines a single filter option
export interface FilterOption {
  id: string;
  name: string;
  translationKey?: string;
}

// Defines a filter group with a title and options
export interface FilterGroup {
  title: string;
  titleTranslationKey?: string;
  options: FilterOption[];
}

/**
 * Extract unique brand/manufacturer options from components' specifications
 * @param components Array of components
 * @returns Map of spec key to display name
 */
export const extractBrandOptions = (
  components: Component[]
): Map<string, string> => {
  const brandOptions = new Map<string, string>();
  components.forEach(component => {
    if (!component.specifications) return;
    // Check manufacturer field or specification keys
    const specs = component.specifications;
    if (specs['Manufacturer'] || specs['manufacturer'] || specs['brand']) {
      const brand =
        specs['Manufacturer'] || specs['manufacturer'] || specs['brand'];
      if (brand) brandOptions.set(`brand=${brand}`, brand as string);
    }
    // Also scan specification entries for 'manufacturer' or 'brand'
    Object.entries(specs).forEach(([key, value]) => {
      if (!value) return;
      const keyLower = key.toLowerCase();
      if (
        keyLower.includes('brand') ||
        keyLower.includes('manufacturer') ||
        keyLower === 'make'
      ) {
        brandOptions.set(`brand=${value}`, String(value));
      }
    });
  });
  return brandOptions;
};
