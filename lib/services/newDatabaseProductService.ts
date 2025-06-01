import { prisma } from '../prismaService';

export interface Product {
  id: string;
  type: 'component' | 'peripheral';
  name: string;
  description: string;
  price: number;
  category?: string;
  stock: number;
  specifications?: Record<string, string>;
  imageUrl?: string | null;
  discountPrice?: number | null;
  ratings?: {
    average: number;
    count: number;
  };
}

/**
 * Get discount price if available and not expired
 */
export function getDiscountPrice(price: number, discountPrice: number | null, discountExpiresAt: Date | null): number | null {
  if (!discountPrice) return null;
  if (discountExpiresAt && new Date() > discountExpiresAt) return null;
  return discountPrice;
}

/**
 * Extract specifications from a component 
 */
export function extractComponentSpecifications(component: any): Record<string, string> {
  const specifications: Record<string, string> = {};
  
  if (component.specifications && typeof component.specifications === 'object') {
    Object.entries(component.specifications).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        specifications[key] = String(value);
      }
    });
  }
  
  return specifications;
}

/**
 * Get a product by ID from the new database
 */
export async function getProductById(id: string, type: 'component' | 'peripheral'): Promise<Product | null> {
  try {
    console.log(`getProductById called with ID: ${id}, type: ${type}`);
    if (type === 'component') {
      console.log("Searching for component with ID:", id);      const component = await prisma.component.findUnique({
        where: { id },
        include: {
          category: true
        }
      });
      
      console.log("Component search result:", component ? "Found" : "Not found");

      if (!component) return null;

      const specifications = extractComponentSpecifications(component);

      return {
        id: component.id,
        type: 'component',
        name: component.name,
        category: component.category.name,
        description: component.description || '',
        specifications,
        price: component.price,
        discountPrice: getDiscountPrice(component.price, component.discountPrice, component.discountExpiresAt),
        stock: component.quantity, 
        imageUrl: component.imagesUrl, 
        ratings: await getProductRatings(id, 'COMPONENT')
      };    
    } else {
      console.log("Searching for peripheral with ID:", id);      const peripheral = await prisma.peripheral.findUnique({
        where: { id },
        include: {
          category: true
        }
      });
      
      console.log("Peripheral search result:", peripheral ? "Found" : "Not found");

      if (!peripheral) return null;

      const specifications = extractComponentSpecifications(peripheral);

      return {
        id: peripheral.id,
        type: 'peripheral',
        name: peripheral.name,
        category: peripheral.category.name,
        description: peripheral.description || '',
        specifications,
        price: peripheral.price,
        discountPrice: getDiscountPrice(peripheral.price, peripheral.discountPrice, peripheral.discountExpiresAt),
        stock: peripheral.quantity, 
        imageUrl: peripheral.imagesUrl, 
        ratings: await getProductRatings(id, 'PERIPHERAL')
      };
    }
  } catch (error) {
    console.error(`Error fetching ${type} with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get product ratings
 */
async function getProductRatings(productId: string, productType: 'COMPONENT' | 'PERIPHERAL') {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        productType,
      },
    });

    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    return {
      average: Number(average.toFixed(1)),
      count: reviews.length,
    };
  } catch (error) {
    console.error(`Error fetching ratings for ${productType} ${productId}:`, error);
    return { average: 0, count: 0 };
  }
}

/**
 * Increment product view count
 */
export async function incrementProductView(productId: string, productType: 'component' | 'peripheral'): Promise<void> {
  try {
    if (productType === 'component') {
      await prisma.component.update({
        where: { id: productId },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });
    } else {
      await prisma.peripheral.update({
        where: { id: productId },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });
    }
  } catch (error) {
    console.error(`Failed to increment view count for ${productType} ${productId}:`, error);
  }
}

/**
 * Reset view counts for all products
 */
export async function resetViewCounts() {
  try {
    const componentsResult = await prisma.component.updateMany({
      data: {
        viewCount: 0
      }
    });

    const peripheralsResult = await prisma.peripheral.updateMany({
      data: {
        viewCount: 0
      }
    });

    return {
      success: true,
      resetCounts: {
        components: componentsResult.count,
        peripherals: peripheralsResult.count,
        total: componentsResult.count + peripheralsResult.count
      }
    };
  } catch (error) {
    console.error('Error resetting view counts:', error);
    throw error;
  }
}
