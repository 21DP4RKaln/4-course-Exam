import { prisma } from '@/lib/prismaService'

export interface Component {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    categoryId: string;
    categoryName: string;
  }
  
  /**
   * Gets all components by category
   */
  export async function getComponentsByCategory(categoryId: string): Promise<Component[]> {
    try {
      const components = await prisma.component.findMany({
        where: {
          categoryId,
          stock: {
            gt: 0
          }
        },
        include: {
          category: true
        },
        orderBy: {
          price: 'asc'
        }
      });
  
      return components.map(component => ({
        id: component.id,
        name: component.name,
        description: component.description || '',
        price: component.price,
        stock: component.stock,
        imageUrl: component.imageUrl,
        categoryId: component.categoryId,
        categoryName: component.category.name
      }));
    } catch (error) {
      console.error(`Error fetching components for category ${categoryId}:`, error);
      return [];
    }
  }
  
  /**
   * Gets all component categories
   */
  export async function getAllCategories() {
    try {
      const categories = await prisma.componentCategory.findMany({
        orderBy: {
          name: 'asc'
        }
      });
  
      return categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description
      }));
    } catch (error) {
      console.error('Error fetching component categories:', error);
      return [];
    }
  }