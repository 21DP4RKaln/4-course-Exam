export interface Component {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  categoryId: string;
  specifications?: Record<string, string>;
  stock?: number;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

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
