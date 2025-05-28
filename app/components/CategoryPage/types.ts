export interface Component {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  specifications: Record<string, string>;
  sku: string;
  brand?: string;
  manufacturer?: string;
}

export interface Specification {
  id: string;
  name: string;
  displayName: string;
  values: string[];
  multiSelect?: boolean; 
}

export interface CategoryPageProps {
  params: Promise<{ category?: string }>;
  type: 'peripheral' | 'component';
}