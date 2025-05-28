// Storage-specific filter groups
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

export const createStorageFilterGroups = (components: Component[]): FilterGroup[] => {
  console.log("Creating Storage filter groups from components");
  
  // Initialize Storage filter groups
  const filterGroups: FilterGroup[] = [];
  
  // Create maps to collect filter options
  const brandOptions = extractBrandOptions(components);
  const capacityOptions = new Map<string, string>();
  const typeOptions = new Map<string, string>();
  const formFactorOptions = new Map<string, string>();
  const interfaceOptions = new Map<string, string>();
  
  // Process components to extract Storage specs
  components.forEach(component => {
    try {
      const name = component.name.toLowerCase();
      
      // Extract capacity from name (e.g., 1TB, 500GB)
      const capacityMatch = name.match(/(\d+)\s*(tb|gb)/i);
      if (capacityMatch) {
        let capacity = capacityMatch[1];
        const unit = capacityMatch[2].toLowerCase();
        
        // Normalize to GB or TB
        if (unit === 'gb' && parseInt(capacity) >= 1000) {
          capacity = (parseInt(capacity) / 1000).toString();
          capacityOptions.set(`capacity=${capacity}TB`, `${capacity}TB`);
        } else {
          capacityOptions.set(`capacity=${capacity}${unit.toUpperCase()}`, `${capacity}${unit.toUpperCase()}`);
        }
      }
      
      // Extract type from name (SSD vs HDD)
      if (name.includes('ssd')) {
        typeOptions.set('type=SSD', 'SSD');
        
        // Check for NVMe
        if (name.includes('nvme')) {
          typeOptions.set('type=NVMe SSD', 'NVMe SSD');
        } else if (name.includes('sata')) {
          typeOptions.set('type=SATA SSD', 'SATA SSD');
        }
      } else if (name.includes('hdd')) {
        typeOptions.set('type=HDD', 'HDD');
      }
      
      // Extract form factor from name (2.5", 3.5", M.2)
      if (name.includes('2.5"') || name.includes('2.5in') || name.includes('2.5 in')) {
        formFactorOptions.set('form_factor=2.5"', '2.5"');
      } else if (name.includes('3.5"') || name.includes('3.5in') || name.includes('3.5 in')) {
        formFactorOptions.set('form_factor=3.5"', '3.5"');
      } else if (name.includes('m.2') || name.includes('m2')) {
        formFactorOptions.set('form_factor=M.2', 'M.2');
      }
      
      // Extract specs from the component specifications
      if (component.specifications) {
        Object.entries(component.specifications).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') return;
          
          const keyLower = key.toLowerCase().trim();
          const valueStr = String(value).trim().toLowerCase();
          
          // Capacity
          if (keyLower.includes('capacity') || keyLower.includes('size')) {
            // Extract numeric part and unit
            const capacityMatch = valueStr.match(/(\d+)\s*(tb|gb)/i);
            if (capacityMatch) {
              let capacity = capacityMatch[1];
              const unit = capacityMatch[2].toLowerCase();
              
              // Normalize to GB or TB
              if (unit === 'gb' && parseInt(capacity) >= 1000) {
                capacity = (parseInt(capacity) / 1000).toString();
                capacityOptions.set(`capacity=${capacity}TB`, `${capacity}TB`);
              } else {
                capacityOptions.set(`capacity=${capacity}${unit.toUpperCase()}`, `${capacity}${unit.toUpperCase()}`);
              }
            } else {
              capacityOptions.set(`capacity=${valueStr}`, valueStr);
            }
          }
          
          // Type
          if (keyLower.includes('type')) {
            if (valueStr.includes('ssd')) {
              if (valueStr.includes('nvme')) {
                typeOptions.set('type=NVMe SSD', 'NVMe SSD');
              } else if (valueStr.includes('sata')) {
                typeOptions.set('type=SATA SSD', 'SATA SSD');
              } else {
                typeOptions.set('type=SSD', 'SSD');
              }
            } else if (valueStr.includes('hdd')) {
              typeOptions.set('type=HDD', 'HDD');
            } else {
              typeOptions.set(`type=${valueStr}`, valueStr);
            }
          }
          
          // Form Factor
          if (keyLower.includes('form factor') || keyLower.includes('form-factor') || keyLower === 'form') {
            if (valueStr.includes('2.5')) {
              formFactorOptions.set('form_factor=2.5"', '2.5"');
            } else if (valueStr.includes('3.5')) {
              formFactorOptions.set('form_factor=3.5"', '3.5"');
            } else if (valueStr.includes('m.2') || valueStr.includes('m2')) {
              formFactorOptions.set('form_factor=M.2', 'M.2');
            } else {
              formFactorOptions.set(`form_factor=${valueStr}`, valueStr);
            }
          }
          
          // Interface
          if (keyLower.includes('interface') || keyLower.includes('connection')) {
            if (valueStr.includes('sata')) {
              interfaceOptions.set('interface=SATA', 'SATA');
            } else if (valueStr.includes('pcie') || valueStr.includes('pci-e') || valueStr.includes('pci express')) {
              interfaceOptions.set('interface=PCIe', 'PCIe');
            } else if (valueStr.includes('usb')) {
              interfaceOptions.set('interface=USB', 'USB');
            } else {
              interfaceOptions.set(`interface=${valueStr}`, valueStr);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error processing Storage component:", error);
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
  
  if (typeOptions.size > 0) {
    filterGroups.push({
      title: 'Type',
      titleTranslationKey: 'filterGroups.storageType',
      type: 'storage_type',
      options: Array.from(typeOptions.entries()).map(([id, name]) => createFilterOption(id, name, 'storageTypes'))
    });
  }
  
  if (capacityOptions.size > 0) {
    filterGroups.push({
      title: 'Capacity',
      titleTranslationKey: 'filterGroups.capacity',
      type: 'capacity',
      options: Array.from(capacityOptions.entries()).map(([id, name]) => createFilterOption(id, name))
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
  
  if (interfaceOptions.size > 0) {
    filterGroups.push({
      title: 'Interface',
      titleTranslationKey: 'filterGroups.interface',
      type: 'interface',
      options: Array.from(interfaceOptions.entries()).map(([id, name]) => createFilterOption(id, name))
    });
  }
  
  console.log("Created Storage filter groups:", filterGroups);
  return filterGroups;
};
