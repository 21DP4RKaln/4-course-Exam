// PSU-specific filter groups
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

export const createPsuFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating PSU filter groups from components");
  
  // Initialize PSU filter groups
  const filterGroups: FilterGroup[] = [];
  
  // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const wattageOptions = new Map<string, string>();
  const efficiencyOptions = new Map<string, string>();
  const modularOptions = new Map<string, string>();
  
  // Process components to extract PSU specs
  components.forEach(component => {
    try {
      const name = component.name.toLowerCase();
      
      // Extract wattage from name
      const wattageMatch = name.match(/(\d+)\s*w/i);
      if (wattageMatch) {
        const wattage = wattageMatch[1];
        wattageOptions.set(`wattage=${wattage}W`, `${wattage}W`);
      }
      
      // Extract efficiency rating from name (80+ ratings)
      if (name.includes('80+') || name.includes('80 plus') || name.includes('80 +')) {
        if (name.includes('titanium')) {
          efficiencyOptions.set('efficiency=80+ Titanium', '80+ Titanium');
        } else if (name.includes('platinum')) {
          efficiencyOptions.set('efficiency=80+ Platinum', '80+ Platinum');
        } else if (name.includes('gold')) {
          efficiencyOptions.set('efficiency=80+ Gold', '80+ Gold');
        } else if (name.includes('silver')) {
          efficiencyOptions.set('efficiency=80+ Silver', '80+ Silver');
        } else if (name.includes('bronze')) {
          efficiencyOptions.set('efficiency=80+ Bronze', '80+ Bronze');
        } else if (name.includes('white')) {
          efficiencyOptions.set('efficiency=80+ White', '80+ White');
        } else {
          efficiencyOptions.set('efficiency=80+ Standard', '80+ Standard');
        }
      }
      
      // Extract modularity from name
      if (name.includes('full modular') || name.includes('fully modular')) {
        modularOptions.set('modular=Full', 'Fully Modular');
      } else if (name.includes('semi modular') || name.includes('semi-modular')) {
        modularOptions.set('modular=Semi', 'Semi Modular');
      } else if (name.includes('non modular') || name.includes('non-modular') || name.includes('not modular')) {
        modularOptions.set('modular=No', 'Non-Modular');
      }
      
      // Extract specs from the component specifications
      if (component.specifications) {
        Object.entries(component.specifications).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') return;
          
          const keyLower = key.toLowerCase().trim();
          const valueStr = String(value).trim().toLowerCase();
          
          // Wattage
          if (keyLower.includes('wattage') || keyLower.includes('watt') || keyLower.includes('power') || keyLower === 'w') {
            // Extract just the number
            const wattMatch = valueStr.match(/(\d+)/);
            if (wattMatch) {
              wattageOptions.set(`wattage=${wattMatch[1]}W`, `${wattMatch[1]}W`);
            } else {
              wattageOptions.set(`wattage=${valueStr}`, valueStr);
            }
          }
          
          // Efficiency
          if (keyLower.includes('efficiency') || keyLower.includes('80+') || keyLower.includes('80 plus')) {
            if (valueStr.includes('titanium')) {
              efficiencyOptions.set('efficiency=80+ Titanium', '80+ Titanium');
            } else if (valueStr.includes('platinum')) {
              efficiencyOptions.set('efficiency=80+ Platinum', '80+ Platinum');
            } else if (valueStr.includes('gold')) {
              efficiencyOptions.set('efficiency=80+ Gold', '80+ Gold');
            } else if (valueStr.includes('silver')) {
              efficiencyOptions.set('efficiency=80+ Silver', '80+ Silver');
            } else if (valueStr.includes('bronze')) {
              efficiencyOptions.set('efficiency=80+ Bronze', '80+ Bronze');
            } else if (valueStr.includes('white')) {
              efficiencyOptions.set('efficiency=80+ White', '80+ White');
            } else if (valueStr.includes('80+') || valueStr.includes('80 plus')) {
              efficiencyOptions.set('efficiency=80+ Standard', '80+ Standard');
            } else {
              efficiencyOptions.set(`efficiency=${valueStr}`, valueStr);
            }
          }
          
          // Modularity
          if (keyLower.includes('modular')) {
            if (valueStr.includes('full') || valueStr === 'yes' || valueStr === 'true') {
              modularOptions.set('modular=Full', 'Fully Modular');
            } else if (valueStr.includes('semi')) {
              modularOptions.set('modular=Semi', 'Semi Modular');
            } else if (valueStr === 'no' || valueStr === 'false' || valueStr.includes('non')) {
              modularOptions.set('modular=No', 'Non-Modular');
            } else {
              modularOptions.set(`modular=${valueStr}`, valueStr);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error processing PSU component:", error);
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
  
  if (wattageOptions.size > 0) {
    filterGroups.push({
      title: 'Wattage',
      titleTranslationKey: 'filterGroups.wattage',
      type: 'wattage',
      options: Array.from(wattageOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  if (efficiencyOptions.size > 0) {
    filterGroups.push({
      title: 'Efficiency',
      titleTranslationKey: 'filterGroups.efficiency',
      type: 'efficiency',
      options: Array.from(efficiencyOptions.entries()).map(([id, name]) => createFilterOption(id, name, 'psuEfficiency'))
    });
  }
  
  if (modularOptions.size > 0) {
    filterGroups.push({
      title: 'Modularity',
      titleTranslationKey: 'filterGroups.modularity',
      type: 'modularity',
      options: Array.from(modularOptions.entries()).map(([id, name]) => createFilterOption(id, name, 'psuModular'))
    });
  }
  
  console.log("Created PSU filter groups:", filterGroups);
  return filterGroups;
};
