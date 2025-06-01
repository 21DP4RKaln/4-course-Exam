// Component and Category types for the configurator

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

// Type for selected components - services can have multiple items
export type SelectedComponentsType = Record<string, Component | Component[]>;
