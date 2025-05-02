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