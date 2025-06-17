// Consolidated filter configurations for all component types
import { Component, FilterGroup, FilterOption } from './types';

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
    const specs = component.specifications;
    if (specs['Manufacturer'] || specs['manufacturer'] || specs['brand']) {
      const brand =
        specs['Manufacturer'] || specs['manufacturer'] || specs['brand'];
      if (brand) brandOptions.set(`brand=${brand}`, brand as string);
    }
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

/**
 * Get all available specification keys from components, excluding quick filter specifications
 */
const getAvailableSpecifications = (
  components: Component[],
  quickFilterSpecs: string[] = []
): Set<string> => {
  const specKeys = new Set<string>();

  components.forEach(component => {
    if (component.specifications) {
      Object.keys(component.specifications).forEach(key => {
        // Skip quick filter specifications and common metadata fields
        if (
          !quickFilterSpecs.includes(key.toLowerCase()) &&
          !['brand', 'manufacturer', 'series', 'model', 'name'].includes(
            key.toLowerCase()
          )
        ) {
          specKeys.add(key);
        }
      });
    }
  });

  return specKeys;
};

/**
 * Create a filter group for a specific specification key
 */
const createSpecificationFilterGroup = (
  components: Component[],
  specKey: string,
  t?: (key: string) => string
): FilterGroup | null => {
  const valueSet = new Set<string>();

  components.forEach(c => {
    const value = c.specifications?.[specKey];
    if (value && String(value).trim()) {
      valueSet.add(String(value).trim());
    }
  });

  if (valueSet.size === 0) return null;

  // Convert spec key to filter ID format
  const filterId = specKey.replace(/\s+/g, '').toLowerCase();

  // Sort values appropriately (numeric vs alphabetic)
  const sortedValues = Array.from(valueSet).sort((a, b) => {
    // Try numeric sort first
    const numA = parseFloat(a.replace(/[^\d.-]/g, ''));
    const numB = parseFloat(b.replace(/[^\d.-]/g, ''));

    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    // Fall back to alphabetic sort
    return a.localeCompare(b);
  });

  const options: FilterOption[] = sortedValues.map(val => ({
    id: `${filterId}=${val}`,
    name: val,
  }));

  return {
    title: `specs.${filterId}`,
    titleTranslationKey: `filterGroups.${filterId}`,
    options,
  };
};

/**
 * Generate filter groups for CPU components dynamically based on ALL component specifications.
 * Excludes Brand and Series filters as they are handled by Quick Filters.
 */
export const createCpuFilterGroups = (
  components: Component[],
  t?: (key: string) => string
): FilterGroup[] => {
  const groups: FilterGroup[] = [];

  // Quick filter specifications that should be excluded
  const quickFilterSpecs = ['intel', 'amd', 'core', 'ryzen', 'threadripper'];

  // Get all available specifications
  const availableSpecs = getAvailableSpecifications(
    components,
    quickFilterSpecs
  );

  // Create filter groups for each specification
  availableSpecs.forEach(specKey => {
    const filterGroup = createSpecificationFilterGroup(components, specKey, t);
    if (filterGroup) {
      groups.push(filterGroup);
    }
  });

  return groups;
};

/**
 * Generate filter groups for GPU components dynamically based on ALL component specifications.
 * Excludes Brand and Series filters as they are handled by Quick Filters.
 */
export const createGpuFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const groups: FilterGroup[] = [];

  // Quick filter specifications that should be excluded
  const quickFilterSpecs = [
    'nvidia',
    'amd',
    'intel',
    'rtx',
    'gtx',
    'rx',
    'arc',
  ];

  // Get all available specifications
  const availableSpecs = getAvailableSpecifications(
    components,
    quickFilterSpecs
  );

  // Create filter groups for each specification
  availableSpecs.forEach(specKey => {
    const filterGroup = createSpecificationFilterGroup(components, specKey);
    if (filterGroup) {
      groups.push(filterGroup);
    }
  });

  return groups;
};

/**
 * Generate filter groups for RAM components dynamically based on ALL component specifications.
 * Excludes Type and Capacity filters as they are handled by Quick Filters.
 */
export const createRamFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const groups: FilterGroup[] = [];

  // Quick filter specifications that should be excluded
  const quickFilterSpecs = [
    'ddr4',
    'ddr5',
    '16gb',
    '32gb',
    '64gb',
    '128gb',
    '256gb',
    '512gb',
  ];

  // Get all available specifications
  const availableSpecs = getAvailableSpecifications(
    components,
    quickFilterSpecs
  );

  // Create filter groups for each specification
  availableSpecs.forEach(specKey => {
    const filterGroup = createSpecificationFilterGroup(components, specKey);
    if (filterGroup) {
      groups.push(filterGroup);
    }
  });

  return groups;
};

/**
 * Generate filter groups for Motherboard components dynamically based on ALL component specifications.
 * Excludes Form Factor and Compatibility filters as they are handled by Quick Filters.
 */
export const createMotherboardFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const groups: FilterGroup[] = [];

  // Quick filter specifications that should be excluded
  const quickFilterSpecs = [
    'atx',
    'microatx',
    'matx',
    'miniitx',
    'mitx',
    'eatx',
    'intel',
    'amd',
  ];

  // Get all available specifications
  const availableSpecs = getAvailableSpecifications(
    components,
    quickFilterSpecs
  );

  // Create filter groups for each specification
  availableSpecs.forEach(specKey => {
    const filterGroup = createSpecificationFilterGroup(components, specKey);
    if (filterGroup) {
      groups.push(filterGroup);
    }
  });

  return groups;
};

/**
 * Generate filter groups for Storage components dynamically based on ALL component specifications.
 * Excludes Type filters as they are handled by Quick Filters.
 */
export const createStorageFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const groups: FilterGroup[] = [];

  // Quick filter specifications that should be excluded
  const quickFilterSpecs = ['hdd', 'nvme', 'sata', 'ssd'];

  // Get all available specifications
  const availableSpecs = getAvailableSpecifications(
    components,
    quickFilterSpecs
  );

  // Create filter groups for each specification
  availableSpecs.forEach(specKey => {
    const filterGroup = createSpecificationFilterGroup(components, specKey);
    if (filterGroup) {
      groups.push(filterGroup);
    }
  });

  return groups;
};

/**
 * Generate filter groups for PSU components dynamically based on ALL component specifications.
 * Excludes Efficiency filters as they are handled by Quick Filters.
 */
export const createPsuFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const groups: FilterGroup[] = [];

  // Quick filter specifications that should be excluded
  const quickFilterSpecs = ['80plus', 'bronze', 'gold', 'platinum', 'titanium'];

  // Get all available specifications
  const availableSpecs = getAvailableSpecifications(
    components,
    quickFilterSpecs
  );

  // Create filter groups for each specification
  availableSpecs.forEach(specKey => {
    const filterGroup = createSpecificationFilterGroup(components, specKey);
    if (filterGroup) {
      groups.push(filterGroup);
    }
  });

  return groups;
};

/**
 * Generate filter groups for Case components dynamically based on ALL component specifications.
 * Excludes Form Factor filters as they are handled by Quick Filters.
 */
export const createCaseFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const groups: FilterGroup[] = [];

  // Quick filter specifications that should be excluded
  const quickFilterSpecs = [
    'atx',
    'microatx',
    'matx',
    'miniitx',
    'mitx',
    'eatx',
  ];

  // Get all available specifications
  const availableSpecs = getAvailableSpecifications(
    components,
    quickFilterSpecs
  );

  // Create filter groups for each specification
  availableSpecs.forEach(specKey => {
    const filterGroup = createSpecificationFilterGroup(components, specKey);
    if (filterGroup) {
      groups.push(filterGroup);
    }
  });

  return groups;
};

/**
 * Generate filter groups for Cooling components dynamically based on ALL component specifications.
 * Excludes Type filters as they are handled by Quick Filters.
 */
export const createCoolingFilterGroups = (
  components: Component[]
): FilterGroup[] => {
  const groups: FilterGroup[] = [];

  // Quick filter specifications that should be excluded
  const quickFilterSpecs = ['liquid', 'air', 'aio', 'tower'];

  // Get all available specifications
  const availableSpecs = getAvailableSpecifications(
    components,
    quickFilterSpecs
  );

  // Create filter groups for each specification
  availableSpecs.forEach(specKey => {
    const filterGroup = createSpecificationFilterGroup(components, specKey);
    if (filterGroup) {
      groups.push(filterGroup);
    }
  });

  return groups;
};

// Quick Filters functionality
export interface QuickFilter {
  id: string;
  name: string;
  translationKey?: string;
  category?: string;
}

// Complete Quick Filters configuration
export const filters: Record<string, QuickFilter[]> = {
  cpu: [
    // Intel
    { id: 'intel', name: 'Intel', category: 'cpu' },
    { id: 'intel-core-i3', name: 'Core i3', category: 'cpu' },
    { id: 'intel-core-i5', name: 'Core i5', category: 'cpu' },
    { id: 'intel-core-i7', name: 'Core i7', category: 'cpu' },
    { id: 'intel-core-i9', name: 'Core i9', category: 'cpu' },
    // AMD series
    { id: 'amd', name: 'AMD', category: 'cpu' },
    { id: 'amd-ryzen-3', name: 'Ryzen 3', category: 'cpu' },
    { id: 'amd-ryzen-5', name: 'Ryzen 5', category: 'cpu' },
    { id: 'amd-ryzen-7', name: 'Ryzen 7', category: 'cpu' },
    { id: 'amd-ryzen-9', name: 'Ryzen 9', category: 'cpu' },
    { id: 'amd-threadripper', name: 'Threadripper', category: 'cpu' },
  ],
  gpu: [
    // Nvidia
    { id: 'nvidia', name: 'Nvidia', category: 'gpu' },
    { id: 'rtx-50', name: 'RTX 50', category: 'gpu' },
    { id: 'rtx-40', name: 'RTX 40', category: 'gpu' },
    // AMD
    { id: 'amd', name: 'AMD', category: 'gpu' },
    { id: 'rx-8000', name: 'RX 8000', category: 'gpu' },
    { id: 'rx-7000', name: 'RX 7000', category: 'gpu' },
    { id: 'rx-6000', name: 'RX 6000', category: 'gpu' },
    { id: 'rx-5000', name: 'RX 5000', category: 'gpu' },
    // Intel
    { id: 'intel', name: 'Intel', category: 'gpu' },
    { id: 'arc-a', name: 'Arc A', category: 'gpu' },
  ],
  motherboard: [
    // Form factors
    { id: 'micro-atx', name: 'Micro-ATX', category: 'motherboard' },
    { id: 'mini-itx', name: 'Mini-ITX', category: 'motherboard' },
    { id: 'atx', name: 'ATX', category: 'motherboard' },
    { id: 'e-atx', name: 'E-ATX', category: 'motherboard' },
    // Brand compatibility
    { id: 'intel-compatible', name: 'Intel', category: 'motherboard' },
    { id: 'amd-compatible', name: 'AMD', category: 'motherboard' },
  ],
  ram: [
    // Capacities
    { id: '16gb', name: '16GB', category: 'ram' },
    { id: '32gb', name: '32GB', category: 'ram' },
    { id: '64gb', name: '64GB', category: 'ram' },
    { id: '128gb', name: '128GB', category: 'ram' },
    { id: '256gb', name: '256GB', category: 'ram' },
    { id: '512gb', name: '512GB', category: 'ram' },
    // Types
    { id: 'ddr4', name: 'DDR4', category: 'ram' },
    { id: 'ddr5', name: 'DDR5', category: 'ram' },
  ],
  storage: [
    // Types
    { id: 'hdd', name: 'HDD', category: 'storage' },
    { id: 'nvme', name: 'NVMe', category: 'storage' },
    { id: 'sata', name: 'SATA', category: 'storage' },
  ],
  psu: [
    // Efficiency ratings
    { id: '80plus-bronze', name: '80+ Bronze', category: 'psu' },
    { id: '80plus-gold', name: '80+ Gold', category: 'psu' },
    { id: '80plus-platinum', name: '80+ Platinum', category: 'psu' },
    { id: '80plus-titanium', name: '80+ Titanium', category: 'psu' },
  ],
  case: [
    // Form factors
    { id: 'micro-atx', name: 'Micro-ATX', category: 'case' },
    { id: 'mini-itx', name: 'Mini-ITX', category: 'case' },
    { id: 'atx', name: 'ATX', category: 'case' },
    { id: 'e-atx', name: 'E-ATX', category: 'case' },
  ],
  cooling: [
    // Types
    { id: 'liquid', name: 'Liquid', category: 'cooling' },
    { id: 'air', name: 'Air', category: 'cooling' },
  ],
  services: [
    // Services
    { id: 'windows', name: 'Windows', category: 'services' },
    { id: 'wifi+bluetooth', name: 'WiFi + Bluetooth', category: 'services' },
    { id: '4gpu', name: 'For GPU', category: 'services' },
    { id: 'sound', name: 'Sound Card', category: 'services' },
    { id: 'capture', name: 'Capture Card', category: 'services' },
  ],
};
