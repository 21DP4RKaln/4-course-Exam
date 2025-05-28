import { prisma } from '@/lib/prismaService';
import { ProductType } from '@prisma/client';

export interface ProductBase {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  stock: number;
  ratings?: {
    average: number;
    count: number;
  };
  longDescription?: string;
}

export interface ConfigurationType extends ProductBase {
  type: 'configuration';
  components: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
}

export interface ComponentType extends ProductBase {
  type: 'component' | 'peripheral';
  category: string;
  specifications: Record<string, string>;
}

export type Product = ConfigurationType | ComponentType;

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
 * Calculate discount price for configurations
 */
export function calculateDiscountPrice(
  price: number, 
  discountData: boolean | number | null,
  discountExpiresAt?: Date | null
): number | null {
  if (typeof discountData === 'boolean') {
    // Handle legacy isPublic parameter - assume 10% discount if public
    return discountData ? price * 0.9 : null;
  } else {
    // Handle direct discount price
    return getDiscountPrice(price, discountData, discountExpiresAt || null);
  }
}

/**
 * Determine configuration category based on components
 */
export function getConfigCategory(specs: Record<string, string>): string {
  if (specs.gpu && (specs.gpu.toLowerCase().includes('rtx') || specs.gpu.toLowerCase().includes('geforce'))) {
    return 'gaming';
  } else if (specs.cpu && (specs.cpu.toLowerCase().includes('ryzen 9') || specs.cpu.toLowerCase().includes('i9'))) {
    return 'workstation';
  } else if (specs.cpu && (specs.cpu.toLowerCase().includes('i3') || specs.cpu.toLowerCase().includes('ryzen 3'))) {
    return 'budget';
  } else {
    return 'office';
  }
}

/**
 * Extract specifications from a component including its specValues
 */
export function extractComponentSpecifications(component: any): Record<string, string> {
  const specifications: Record<string, string> = {};
  
  // Extract specifications from JSON field
  if (component.specifications && typeof component.specifications === 'object') {
    Object.entries(component.specifications).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        specifications[key] = String(value);
      }
    });
  }
  
  // Add spec values
  if (component.specValues && Array.isArray(component.specValues)) {
    component.specValues.forEach((specValue: any) => {
      if (specValue.specKey && specValue.specKey.name) {
        specifications[specValue.specKey.name] = specValue.value;
      }
    });
  }
  
  return specifications;
}

/**
 * Get a product by ID - universal function that will fetch product details
 * regardless of whether it's a configuration, component, or peripheral
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    // Try to find as a configuration first
    const configuration = await prisma.configuration.findUnique({
      where: { id },
      include: {
        components: {
          include: {
            component: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (configuration) {
      const components = configuration.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      }));
        const specs: Record<string, string> = {};
      configuration.components.forEach(configItem => {
        const categoryName = configItem.component.category.name.toLowerCase();
        specs[categoryName] = configItem.component.name;
      });
        // Since configuration properties might be missing in some queries
      const discountPrice = 'discountPrice' in configuration && 'discountExpiresAt' in configuration ? 
        getDiscountPrice(
          configuration.totalPrice as number, 
          configuration.discountPrice as number, 
          configuration.discountExpiresAt as Date | null
        ) : null;

      return {
        id: configuration.id,
        type: 'configuration',
        name: configuration.name,
        description: configuration.description || '',
        longDescription: configuration.description || '',
        price: configuration.totalPrice,
        discountPrice,
        imageUrl: configuration.imageUrl,
        stock: 10, // Default stock for configurations
        ratings: {
          average: 4.5, // Mock data, should be replaced with actual reviews
          count: 15,
        },
        components,
      };
    }

    // Try to find as a component
    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        category: true,
        specValues: {
          include: {
            specKey: true
          }
        }
      }
    });

    if (component) {
      const specifications = extractComponentSpecifications(component);
      const isPeripheral = component.category.type === 'peripheral';

      return {        id: component.id,
        type: isPeripheral ? 'peripheral' as const : 'component' as const,
        name: component.name,
        category: component.category.name,
        description: component.description || '',
        specifications,
        price: component.price,
        discountPrice: null,
        imageUrl: component.imageUrl,
        stock: component.stock,
        ratings: {
          average: 4.3, // Mock data, should be replaced with actual reviews
          count: 18,
        },
      };
    }

    // Try to find as a user configuration
    const userConfiguration = await prisma.configuration.findUnique({
      where: {
        id,
        isTemplate: false,
      },
      include: {
        components: {
          include: {
            component: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (userConfiguration) {
      const components = userConfiguration.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      }));
      
      return {
        id: userConfiguration.id,
        type: 'configuration',
        name: userConfiguration.name,
        description: userConfiguration.description || '',
        longDescription: userConfiguration.description || '',
        price: userConfiguration.totalPrice,
        discountPrice: null,
        imageUrl: userConfiguration.imageUrl,
        stock: userConfiguration.status === 'APPROVED' ? 10 : 0,
        ratings: {
          average: 0,
          count: 0,
        },
        components,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get related products for a given product
 */
export async function getRelatedProducts(
  productId: string, 
  productType: 'configuration' | 'component' | 'peripheral',
  categoryId?: string,
  limit: number = 3
): Promise<Product[]> {
  try {
    if (productType === 'configuration') {
      const relatedConfigs = await prisma.configuration.findMany({
        where: {
          isTemplate: true,
          id: { not: productId },
        },
        include: {
          components: {
            include: {
              component: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        take: limit,      });
        return relatedConfigs.map((config: any) => {
        const components = config.components.map((item: any) => ({
          id: item.component.id,
          name: item.component.name,
          category: item.component.category.name,
          price: item.component.price,
          quantity: item.quantity,
        }));
        
        const specs: Record<string, string> = {};
        config.components.forEach((configItem: any) => {
          const categoryName = configItem.component.category.name.toLowerCase();
          specs[categoryName] = configItem.component.name;
        });
          const discountPrice = 'discountPrice' in config && 'discountExpiresAt' in config ?
          getDiscountPrice(config.totalPrice as number, config.discountPrice as number, config.discountExpiresAt as Date | null) :
          ((config as any).isPublic ? config.totalPrice as number * 0.9 : null);
        
        return {
          id: config.id,
          type: 'configuration',
          name: config.name,
          description: config.description || '',
          price: config.totalPrice,
          discountPrice,
          imageUrl: config.imageUrl,
          stock: 10,
          ratings: {
            average: 4.5,
            count: 15,
          },
          components,
        };
      });
    } else {
      if (!categoryId) {
        const product = await prisma.component.findUnique({
          where: { id: productId },
          select: { categoryId: true }
        });
        categoryId = product?.categoryId;
      }
      
      if (!categoryId) return [];
      
      const relatedComponents = await prisma.component.findMany({
        where: {
          categoryId,
          id: { not: productId },
        },
        include: {
          category: true,
          specValues: {
            include: {
              specKey: true
            }
          }
        },
        take: limit,
      });
      
      return relatedComponents.map(component => {
        const specifications = extractComponentSpecifications(component);
        const isPeripheral = component.category.type === 'peripheral';        return {
          id: component.id,
          type: (isPeripheral ? 'peripheral' : 'component') as 'peripheral' | 'component',
          name: component.name,
          category: component.category.name,
          description: component.description || '',
          specifications,
          price: component.price,
          discountPrice: null,
          imageUrl: component.imageUrl,
          stock: component.stock,
          ratings: {
            average: 4.2,
            count: 12,
          },
        };
      });
    }
  } catch (error) {
    console.error(`Error fetching related products for ${productId}:`, error);
    return [];
  }
}

/**
 * Get all products with pagination
 */
export async function getAllProducts(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  type?: 'configuration' | 'component' | 'peripheral';
  inStock?: boolean;
}): Promise<PaginatedProducts> {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category,
      type,
      inStock = false
    } = options;
    
    const skip = (page - 1) * limit;
    let products: Product[] = [];
    let total = 0;
    
    // Process configurations
    if (!type || type === 'configuration') {
      const configWhere: any = {
        isTemplate: true,
      };
      
      if (search) {
        configWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      // Adjust for category if needed - this is more complex for configurations
      // as we need to filter based on components
      
      const [configurations, configCount] = await prisma.$transaction([
        prisma.configuration.findMany({
          where: configWhere,
          include: {
            components: {
              include: {
                component: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
          skip: type ? skip : 0,
          take: type ? limit : Math.ceil(limit / 3), // Take fewer if fetching multiple types
        }),
        prisma.configuration.count({ where: configWhere })
      ]);
      
      if (type === 'configuration') {
        total = configCount;
      }
        products = [
        ...products,
        ...configurations.map((config: any) => {          const components = config.components.map((item: any) => ({
            id: item.component.id,
            name: item.component.name,
            category: item.component.category.name,
            price: item.component.price,
            quantity: item.quantity,
          }));
            const specs: Record<string, string> = {};
          config.components.forEach((configItem: any) => {
            const categoryName = configItem.component.category.name.toLowerCase();
            specs[categoryName] = configItem.component.name;
          });
          
          const discountPrice = 'discountPrice' in config && 'discountExpiresAt' in config ?
            getDiscountPrice(config.totalPrice as number, config.discountPrice as number, config.discountExpiresAt as Date | null) :
            ((config as any).isPublic ? config.totalPrice as number * 0.9 : null);
          
          return {
            id: config.id,
            type: 'configuration' as const,
            name: config.name,
            description: config.description || '',
            price: config.totalPrice,
            discountPrice,
            imageUrl: config.imageUrl,
            stock: 10,
            ratings: {
              average: 4.5,
              count: 15,
            },
            components,
          };
        })
      ];
    }
    
    // Process components and peripherals
    if (!type || type === 'component' || type === 'peripheral') {
      const componentWhere: any = {};
      
      if (type === 'component') {
        componentWhere.category = {
          type: 'component'
        };
      } else if (type === 'peripheral') {
        componentWhere.category = {
          type: 'peripheral'
        };
      }
      
      if (search) {
        componentWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      if (category) {
        componentWhere.category = {
          ...componentWhere.category,
          slug: category
        };
      }
      
      if (inStock) {
        componentWhere.stock = { gt: 0 };
      }
      
      const [components, componentCount] = await prisma.$transaction([
        prisma.component.findMany({
          where: componentWhere,
          include: {
            category: true,
            specValues: {
              include: {
                specKey: true
              }
            }
          },
          skip: type ? skip : products.length,
          take: type ? limit : Math.ceil(limit / 3),
        }),
        prisma.component.count({ where: componentWhere })
      ]);
      
      if (type === 'component' || type === 'peripheral') {
        total = componentCount;
      } else {
        total += componentCount;
      }      products = [
        ...products,
        ...components.map(component => {
          const specifications = extractComponentSpecifications(component);
          const isPeripheral = component.category.type === 'peripheral';
          const productType = isPeripheral ? 'peripheral' as const : 'component' as const;
          
          return {
            id: component.id,
            type: productType,
            name: component.name,
            category: component.category.name,
            description: component.description || '',
            specifications,
            price: component.price,
            discountPrice: null,
            imageUrl: component.imageUrl,
            stock: component.stock,
            ratings: {
              average: 4.2,
              count: 12,
            },
          };
        })
      ];
    }
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      products,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  categorySlug: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    inStock?: boolean;
  } = {}
): Promise<PaginatedProducts> {
  try {
    // Check if categorySlug is a PC type
    if (['gaming', 'workstation', 'office', 'budget'].includes(categorySlug)) {
      return getAllProducts({
        ...options,
        type: 'configuration',
        category: categorySlug
      });
    }
    
    // Otherwise, it's a component or peripheral category
    return getAllProducts({
      ...options,
      category: categorySlug
    });
  } catch (error) {
    console.error(`Error fetching products for category ${categorySlug}:`, error);
    throw error;
  }
}

/**
 * Increment view count for a product
 */
export async function incrementProductView(productId: string, productType: ProductType | string): Promise<void> {
  try {
    if (productType === 'CONFIGURATION' || productType === 'configuration') {
      await prisma.configuration.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } }
      });
    } else if (productType === 'COMPONENT' || productType === 'component') {
      await prisma.component.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } }
      });
    } else if (productType === 'PERIPHERAL' || productType === 'peripheral') {
      await prisma.peripheral.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } }
      });
    }
  } catch (error) {
    console.error(`Error incrementing view count for ${productType} ${productId}:`, error);
    // Don't throw here to prevent failure if view count increment fails
  }
}

/**
 * Reset all product view counts (typically called monthly)
 */
export async function resetViewCounts(): Promise<{ 
  success: boolean; 
  resetCounts: { 
    configurations: number; 
    components: number; 
    peripherals: number; 
  } 
}> {
  try {
    const [configurationsResult, componentsResult, peripheralsResult] = await prisma.$transaction([
      prisma.configuration.updateMany({
        data: { viewCount: 0 }
      }),
      prisma.component.updateMany({
        data: { viewCount: 0 }
      }),
      prisma.peripheral.updateMany({
        data: { viewCount: 0 }
      })
    ]);
    
    return {
      success: true,
      resetCounts: {
        configurations: configurationsResult.count,
        components: componentsResult.count,
        peripherals: peripheralsResult.count
      }
    };
  } catch (error) {
    console.error('Error resetting view counts:', error);
    throw error;
  }
}