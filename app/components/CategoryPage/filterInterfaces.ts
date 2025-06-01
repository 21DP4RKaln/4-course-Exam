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

export const extractBrandOptions = (components: Component[]): Map<string, string> => {
  const brandOptions = new Map<string, string>();
  
  const cpuSeriesToExclude = ['ryzen', 'core', 'athlon', 'fx', 'pentium', 'celeron', 'xeon'];
  
  components.forEach(component => {
    // For CPUs, use the dedicated brand field
    if (component.cpu?.brand) {
      brandOptions.set(component.cpu.brand, component.cpu.brand);
    }
    // Fallback: derive brand from series for CPUs without brand field (for backwards compatibility)
    else if (component.cpu?.series) {
      const series = component.cpu.series.toLowerCase();
      if (series.includes('ryzen') || series.includes('athlon') || series.includes('fx')) {
        brandOptions.set('AMD', 'AMD');
      } else if (series.includes('core') || series.includes('pentium') || series.includes('celeron') || series.includes('xeon')) {
        brandOptions.set('Intel', 'Intel');
      }
    }
    
    if (component.brand || component.manufacturer) {
      const brand = component.brand || component.manufacturer || '';
      if (brand && !cpuSeriesToExclude.includes(brand.toLowerCase())) {
        brandOptions.set(brand, brand);
      }
    }
    
    if (component.specifications) {
      Object.entries(component.specifications).forEach(([key, value]) => {
        if (!value || value === '') return;
        
        const keyLower = key.toLowerCase();
        if (keyLower.includes('brand') || keyLower.includes('manufacturer') || keyLower === 'make') {
          const brandValue = String(value);
          if (!cpuSeriesToExclude.includes(brandValue.toLowerCase())) {
            brandOptions.set(brandValue, brandValue);
          }
        }
      });
    }
  });
  
  return brandOptions;
};
