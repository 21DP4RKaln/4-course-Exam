// Consolidated component and category types for the configurator

export interface Component {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  specifications?: Record<string, string>;
  stock?: number;
  sku?: string;
  type?: 'component' | 'peripheral';
  rating?: number;
  ratingCount?: number;
  viewCount?: number;
  // Component-specific fields
  cpu?: any;
  gpu?: any;
  motherboard?: any;
  ram?: any;
  storage?: any;
  psu?: any;
  cooling?: any;
  caseModel?: any;
  // Power consumption for compatibility checking
  powerConsumption?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
  componentCount?: number;
}

// Filter interfaces
export interface FilterOption {
  id: string;
  name: string;
  value?: string;
  label?: string;
  translationKey?: string;
}

export interface FilterGroup {
  title: string;
  titleTranslationKey?: string;
  options: FilterOption[];
}

// Component types for compatibility checking
export type ComponentType = keyof typeof ComponentTypes;

export const ComponentTypes = {
  cpu: 'cpu',
  motherboard: 'motherboard',
  gpu: 'gpu',
  ram: 'ram',
  storage: 'storage',
  case: 'case',
  cooling: 'cooling',
  psu: 'psu',
} as const;

export interface CompatibilityRule {
  from: ComponentType;
  to: ComponentType;
  rule: (fromComponent: Component, toComponent: Component) => boolean;
  errorMessage: string;
}

// Type for selected components - services can have multiple items
export type SelectedComponentsType = Record<string, Component | Component[]>;
