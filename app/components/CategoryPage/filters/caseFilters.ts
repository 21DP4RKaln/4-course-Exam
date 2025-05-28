// Case-specific filter groups
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

export const createCaseFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating Case filter groups from components");
  
  // Initialize Case filter groups
  const filterGroups: FilterGroup[] = [];
  
  // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const formFactorOptions = new Map<string, string>();
  const colorOptions = new Map<string, string>();
  const sideWindowOptions = new Map<string, string>();
  const materialOptions = new Map<string, string>();
  
  // Process components to extract Case specs
  components.forEach(component => {
    try {
      const name = component.name.toLowerCase();
      
      // Extract form factor from name
      if (name.includes('atx')) {
        formFactorOptions.set('form_factor=ATX', 'ATX');
      }
      if (name.includes('micro-atx') || name.includes('micro atx') || name.includes('matx') || name.includes('m-atx')) {
        formFactorOptions.set('form_factor=Micro-ATX', 'Micro-ATX');
      }
      if (name.includes('mini-itx') || name.includes('mini itx') || name.includes('mitx')) {
        formFactorOptions.set('form_factor=Mini-ITX', 'Mini-ITX');
      }
      if (name.includes('e-atx') || name.includes('eatx')) {
        formFactorOptions.set('form_factor=E-ATX', 'E-ATX');
      }
      
      // Extract color from name
      const commonColors = ['black', 'white', 'red', 'blue', 'green', 'silver', 'rgb', 'gray', 'grey'];
      for (const color of commonColors) {
        if (name.includes(color)) {
          // Capitalize first letter
          const formattedColor = color.charAt(0).toUpperCase() + color.slice(1);
          colorOptions.set(`color=${formattedColor}`, formattedColor);
        }
      }
      
      // Check for side window/panel
      if (name.includes('glass') || name.includes('window') || name.includes('tempered') || name.includes('transparent')) {
        sideWindowOptions.set('side_window=Yes', 'With Window');
      }
      
      // Extract specs from the component specifications
      if (component.specifications) {
        Object.entries(component.specifications).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') return;
          
          const keyLower = key.toLowerCase().trim();
          const valueStr = String(value).trim().toLowerCase();
          
          // Form Factor
          if (keyLower.includes('form factor') || keyLower === 'form' || keyLower.includes('motherboard')) {
            if (valueStr.includes('atx') && !valueStr.includes('micro') && !valueStr.includes('mini') && !valueStr.includes('e-atx')) {
              formFactorOptions.set('form_factor=ATX', 'ATX');
            }
            if (valueStr.includes('micro-atx') || valueStr.includes('micro atx') || valueStr.includes('matx') || valueStr.includes('m-atx')) {
              formFactorOptions.set('form_factor=Micro-ATX', 'Micro-ATX');
            }
            if (valueStr.includes('mini-itx') || valueStr.includes('mini itx') || valueStr.includes('mitx')) {
              formFactorOptions.set('form_factor=Mini-ITX', 'Mini-ITX');
            }
            if (valueStr.includes('e-atx') || valueStr.includes('eatx')) {
              formFactorOptions.set('form_factor=E-ATX', 'E-ATX');
            }
          }
          
          // Color
          if (keyLower.includes('color')) {
            // Capitalize first letter
            const formattedColor = valueStr.charAt(0).toUpperCase() + valueStr.slice(1);
            colorOptions.set(`color=${formattedColor}`, formattedColor);
          }
          
          // Side Window/Panel
          if (keyLower.includes('window') || keyLower.includes('panel') || keyLower.includes('glass')) {
            if (valueStr === 'yes' || valueStr.includes('glass') || valueStr.includes('window') || valueStr.includes('transparent')) {
              sideWindowOptions.set('side_window=Yes', 'With Window');
            } else if (valueStr === 'no' || valueStr.includes('solid') || valueStr.includes('closed')) {
              sideWindowOptions.set('side_window=No', 'No Window');
            }
          }
          
          // Material
          if (keyLower.includes('material')) {
            if (valueStr.includes('steel')) {
              materialOptions.set('material=Steel', 'Steel');
            } else if (valueStr.includes('aluminum') || valueStr.includes('aluminium')) {
              materialOptions.set('material=Aluminum', 'Aluminum');
            } else if (valueStr.includes('plastic')) {
              materialOptions.set('material=Plastic', 'Plastic');
            } else if (valueStr.includes('glass')) {
              materialOptions.set('material=Glass', 'Glass');
            } else {
              // Capitalize first letter
              const formattedMaterial = valueStr.charAt(0).toUpperCase() + valueStr.slice(1);
              materialOptions.set(`material=${formattedMaterial}`, formattedMaterial);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error processing Case component:", error);
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
  
  if (formFactorOptions.size > 0) {
    filterGroups.push({
      title: 'Form Factor',
      titleTranslationKey: 'filterGroups.formFactor',
      type: 'form_factor',
      options: Array.from(formFactorOptions.entries()).map(([id, name]) => createFilterOption(id, name, 'formFactors'))
    });
  }
  
  if (colorOptions.size > 0) {
    filterGroups.push({
      title: 'Color',
      titleTranslationKey: 'filterGroups.color',
      type: 'color',
      options: Array.from(colorOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  if (materialOptions.size > 0) {
    filterGroups.push({
      title: 'Material',
      titleTranslationKey: 'filterGroups.material',
      type: 'material',
      options: Array.from(materialOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  if (sideWindowOptions.size > 0) {
    filterGroups.push({
      title: 'Side Panel',
      titleTranslationKey: 'filterGroups.sidePanel',
      type: 'side_panel',
      options: Array.from(sideWindowOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  console.log("Created Case filter groups:", filterGroups);
  return filterGroups;
};
