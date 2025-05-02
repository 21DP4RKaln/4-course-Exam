import { prisma } from '@/lib/prismaService'

export interface ProductCommonProps {
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
  related?: Product[];
}

export interface ConfigurationProduct extends ProductCommonProps {
  type: 'configuration';
  components: any[];
}

export interface ComponentProduct extends ProductCommonProps {
  type: 'component';
  category: string;
  specifications: Record<string, string>;
}

export interface PeripheralProduct extends ProductCommonProps {
  type: 'peripheral';
  category: string;
  specifications: Record<string, string>;
}

type Product = ConfigurationProduct | ComponentProduct | PeripheralProduct;

/**
 * Get product by ID - This is a universal function that will fetch product details
 * regardless of whether it's a configuration, component, or peripheral
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    // First check if it's a PC configuration
    const configuration = await prisma.configuration.findUnique({
      where: {
        id,
        isTemplate: true, 
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

    if (configuration) {
      const components = configuration.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      }));
      
      const discountPrice = configuration.isPublic ? Math.round(configuration.totalPrice * 0.9 * 100) / 100 : null;

      const relatedConfigurations = await prisma.configuration.findMany({
        where: {
          isTemplate: true,
          id: { not: id },
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
        take: 3, 
      });
    
      const relatedProducts = relatedConfigurations.map((config) => {
        return {
          id: config.id,
          type: 'configuration' as const,
          name: config.name,
          description: config.description || '',
          price: config.totalPrice,
          discountPrice: config.isPublic ? Math.round(config.totalPrice * 0.9 * 100) / 100 : null,
          imageUrl: null,
          stock: 10,
          ratings: {
            average: 4.5,
            count: 15,
          },
          components: config.components.map(item => ({
            id: item.component.id,
            name: item.component.name,
            category: item.component.category.name,
            price: item.component.price,
            quantity: item.quantity,
          })),
        };
      });
    
      return {
        id: configuration.id,
        type: 'configuration',
        name: configuration.name,
        description: configuration.description || '',
        longDescription: configuration.description || '', 
        price: configuration.totalPrice,
        discountPrice,
        imageUrl: null,
        stock: 10,
        ratings: {
          average: 4.5,
          count: 15,
        },
        components,
        related: relatedProducts,
      };
    }

    const component = await prisma.component.findUnique({
      where: {
        id,
      },
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
      const specifications: Record<string, string> = { ...(component.specifications as any || {}) };

      for (const specValue of component.specValues) {
        specifications[specValue.specKey.name] = specValue.value;
      }
 
      const isPeripheral = component.category.type === 'peripheral';
      const productType = isPeripheral ? 'peripheral' : 'component';

      const relatedComponents = await prisma.component.findMany({
        where: {
          categoryId: component.categoryId,
          id: { not: id },
        },
        include: {
          category: true,
          specValues: {
            include: {
              specKey: true
            }
          }
        },
        take: 3,
      });

      const relatedProducts = relatedComponents.map((relComp) => {
        const relSpecs: Record<string, string> = { ...(relComp.specifications as any || {}) };
        
        for (const specValue of relComp.specValues) {
          relSpecs[specValue.specKey.name] = specValue.value;
        }

        return {
          id: relComp.id,
          type: productType as 'component' | 'peripheral',
          name: relComp.name,
          category: relComp.category.name,
          description: relComp.description || '',
          specifications: relSpecs,
          price: relComp.price,
          discountPrice: null, 
          imageUrl: relComp.imageUrl,
          stock: relComp.stock,
          ratings: {
            average: 4.2,
            count: 12,
          },
        };
      });

      return {
        id: component.id,
        type: productType as 'component' | 'peripheral',
        name: component.name,
        category: component.category.name,
        description: component.description || '',
        specifications,
        price: component.price,
        discountPrice: null, 
        imageUrl: component.imageUrl,
        stock: component.stock,
        ratings: {
          average: 4.3,
          count: 18,
        },
        related: relatedProducts,
      };
    }

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
        imageUrl: null,
        stock: userConfiguration.status === 'APPROVED' ? 10 : 0,
        ratings: {
          average: 0,
          count: 0,
        },
        components,
        related: [], 
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get all products - returns configurations, components, and peripherals
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const products: Product[] = [];

    // Get PC configurations
    const configurations = await prisma.configuration.findMany({
      where: {
        isTemplate: true, 
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

    for (const config of configurations) {
      const components = config.components.map(item => ({
        id: item.component.id,
        name: item.component.name,
        category: item.component.category.name,
        price: item.component.price,
        quantity: item.quantity,
      }));
      
      const discountPrice = config.isPublic ? Math.round(config.totalPrice * 0.9 * 100) / 100 : null;
  
      products.push({
        id: config.id,
        type: 'configuration',
        name: config.name,
        description: config.description || '',
        price: config.totalPrice,
        discountPrice,
        imageUrl: null,
        stock: 10,
        ratings: {
          average: 4.5,
          count: 15,
        },
        components,
      });
    }

    const components = await prisma.component.findMany({
      include: {
        category: true,
        specValues: {
          include: {
            specKey: true
          }
        }
      },
      where: {
        stock: {
          gt: 0
        }
      },
      take: 50 
    });

    for (const component of components) {
      const specifications: Record<string, string> = { ...(component.specifications as any || {}) };

      for (const specValue of component.specValues) {
        specifications[specValue.specKey.name] = specValue.value;
      }

      const isPeripheral = component.category.type === 'peripheral';
      const productType = isPeripheral ? 'peripheral' : 'component';

      products.push({
        id: component.id,
        type: productType as 'component' | 'peripheral',
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
      });
    }

    return products;
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

/**
 * Get products by category (like 'gaming', 'workstation', 'cpu', 'gpu', etc.)
 */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    const products: Product[] = [];

    // First, find the category
    const category = await prisma.componentCategory.findUnique({
      where: {
        slug: categorySlug,
      },
    });

    if (!category) {
      if (['gaming', 'workstation', 'office', 'budget'].includes(categorySlug)) {
        const configurations = await prisma.configuration.findMany({
          where: {
            isTemplate: true,
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

        const filteredConfigs = configurations.filter(config => {
          const hasRTX = config.components.some(item => 
            item.component.name.toLowerCase().includes('rtx')
          );
          const hasRyzen9 = config.components.some(item => 
            item.component.name.toLowerCase().includes('ryzen 9')
          );
          
          if (categorySlug === 'gaming' && hasRTX) return true;
          if (categorySlug === 'workstation' && hasRyzen9) return true;
          if (categorySlug === 'budget' && config.totalPrice < 1000) return true;
          if (categorySlug === 'office' && !hasRTX && !hasRyzen9 && config.totalPrice < 1500) return true;
          
          return false;
        });

        for (const config of filteredConfigs) {
          const components = config.components.map(item => ({
            id: item.component.id,
            name: item.component.name,
            category: item.component.category.name,
            price: item.component.price,
            quantity: item.quantity,
          }));
          
          const discountPrice = config.isPublic ? Math.round(config.totalPrice * 0.9 * 100) / 100 : null;
      
          products.push({
            id: config.id,
            type: 'configuration',
            name: config.name,
            description: config.description || '',
            price: config.totalPrice,
            discountPrice,
            imageUrl: null,
            stock: 10,
            ratings: {
              average: 4.5,
              count: 15,
            },
            components,
          });
        }
      }
    } else {
      const components = await prisma.component.findMany({
        where: {
          categoryId: category.id,
          stock: {
            gt: 0
          }
        },
        include: {
          category: true,
          specValues: {
            include: {
              specKey: true
            }
          }
        }
      });
  
      for (const component of components) {
        const specifications: Record<string, string> = { ...(component.specifications as any || {}) };
 
        for (const specValue of component.specValues) {
          specifications[specValue.specKey.name] = specValue.value;
        }

        const isPeripheral = component.category.type === 'peripheral';
        const productType = isPeripheral ? 'peripheral' : 'component';

        products.push({
          id: component.id,
          type: productType as 'component' | 'peripheral',
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
        });
      }
    }

    return products;
  } catch (error) {
    console.error(`Error fetching products for category ${categorySlug}:`, error);
    return [];
  }
}