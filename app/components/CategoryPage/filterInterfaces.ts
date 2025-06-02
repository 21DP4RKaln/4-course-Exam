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
  
  // Series names that shouldn't be treated as brands for CPUs
  const cpuSeriesToExclude = ['ryzen', 'core', 'athlon', 'fx', 'pentium', 'celeron', 'xeon'];
  
  components.forEach(component => {
    const brands = new Set<string>();
    
    // 1. Check component-specific brand fields
    if (component.cpu?.brand) {
      brands.add(component.cpu.brand);
    }
    if (component.gpu?.brand) {
      brands.add(component.gpu.brand);
    }
    if (component.motherboard?.brand) {
      brands.add(component.motherboard.brand);
    }
    if (component.ram?.brand) {
      brands.add(component.ram.brand);
    }
    if (component.storage?.brand) {
      brands.add(component.storage.brand);
    }
    if (component.psu?.brand) {
      brands.add(component.psu.brand);
    }
    if (component.cooling?.brand) {
      brands.add(component.cooling.brand);
    }
    if (component.caseModel?.brand) {
      brands.add(component.caseModel.brand);
    }
    
    // 2. Check general brand/manufacturer fields
    if (component.brand) {
      brands.add(component.brand);
    }
    if (component.manufacturer) {
      brands.add(component.manufacturer);
    }
    
    // 3. Check specifications for brand information
    if (component.specifications) {
      Object.entries(component.specifications).forEach(([key, value]) => {
        if (!value || value === '') return;
        
        const keyLower = key.toLowerCase();
        const brandKeys = [
          'brand', 'manufacturer', 'make', 'company', 'vendor',
          'chipset_manufacturer', 'gpu_manufacturer', 'memory_manufacturer'
        ];
        
        if (brandKeys.some(brandKey => keyLower.includes(brandKey))) {
          brands.add(String(value));
        }
      });
    }
    
    // 4. Special handling for CPUs - derive brand from series if no explicit brand
    if (component.cpu && brands.size === 0) {
      const series = component.cpu.series?.toLowerCase() || '';
      if (series.includes('ryzen') || series.includes('athlon') || series.includes('fx') || series.includes('threadripper')) {
        brands.add('AMD');
      } else if (series.includes('core') || series.includes('pentium') || series.includes('celeron') || series.includes('xeon')) {
        brands.add('Intel');
      }
    }
    
    // 5. Extract brand from component name as fallback
    if (brands.size === 0 && component.name) {
      const commonBrands = [
        'ASUS', 'MSI', 'Gigabyte', 'ASRock', 'EVGA', 'Corsair', 'Seasonic', 'Cooler Master', 
        'NZXT', 'Fractal Design', 'Lian Li', 'Thermaltake', 'be quiet!', 'Noctua', 'Arctic',
        'Samsung', 'Crucial', 'Western Digital', 'Seagate', 'Kingston', 'G.Skill', 'Team',
        'NVIDIA', 'AMD', 'Intel', 'Sapphire', 'XFX', 'PowerColor', 'Zotac', 'Palit',
        'Phanteks', 'Silverstone', 'Antec', 'DeepCool', 'Scythe', 'Zalman'
      ];
      
      const nameLower = component.name.toLowerCase();
      for (const brand of commonBrands) {
        if (nameLower.includes(brand.toLowerCase())) {
          brands.add(brand);
          break; // Only take the first match to avoid conflicts
        }
      }
    }
    
    // Add all found brands to the final set, excluding CPU series names
    brands.forEach(brand => {
      const brandLower = brand.toLowerCase().trim();
      if (brandLower && !cpuSeriesToExclude.includes(brandLower)) {
        brandOptions.set(brand.trim(), brand.trim());
      }
    });
  });
  
  return brandOptions;
};
