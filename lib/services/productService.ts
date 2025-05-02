import { prisma } from '@/lib/prismaService'

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  specs: Record<string, string>;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  stock: number;
  ratings?: {
    average: number;
    count: number;
  };
  longDescription?: string;
  related?: string[] | Product[];
}

export interface ProductWithRelated extends Product {
  related: Product[];
}

/**
 * Helper to determine PC category based on component specs
 */
function getConfigCategory(specs: Record<string, string>): string {
  // Improved category detection logic
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
 * Get a product by ID with related products
 */
export async function getProductById(id: string): Promise<ProductWithRelated | null> {
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
      const specs: Record<string, string> = {};
      configuration.components.forEach((configItem) => {
        const categoryName = configItem.component.category.name.toLowerCase();
        specs[categoryName] = configItem.component.name;
      });
    
      const discountPrice = configuration.isPublic ? Math.round(configuration.totalPrice * 0.9 * 100) / 100 : null;
  
      const category = getConfigCategory(specs);
  
      // Get related configurations
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
        const relatedSpecs: Record<string, string> = {};
        config.components.forEach((configItem) => {
          const categoryName = configItem.component.category.name.toLowerCase();
          relatedSpecs[categoryName] = configItem.component.name;
        });
  
        return {
          id: config.id,
          name: config.name,
          category: getConfigCategory(relatedSpecs),
          description: config.description || '',
          specs: relatedSpecs,
          price: config.totalPrice,
          discountPrice: config.isPublic ? Math.round(config.totalPrice * 0.9 * 100) / 100 : null,
          imageUrl: null,
          stock: 10,
          ratings: {
            average: 4.5,
            count: 15,
          },
        };
      });
    
      return {
        id: configuration.id,
        name: configuration.name,
        category,
        description: configuration.description || '',
        longDescription: configuration.description || '', 
        specs,
        price: configuration.totalPrice,
        discountPrice,
        imageUrl: null,
        stock: 10,
        ratings: {
          average: 4.5,
          count: 15,
        },
        related: relatedProducts,
      };
    }

    // If not a PC configuration, check if it's a component
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
      // Build specs object
      const specs: Record<string, string> = { ...(component.specifications as any || {}) };
      
      // Add component specs from the specValues
      for (const specValue of component.specValues) {
        specs[specValue.specKey.name] = specValue.value;
      }

      // Find related components (in same category)
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
          name: relComp.name,
          category: relComp.category.name,
          description: relComp.description || '',
          specs: relSpecs,
          price: relComp.price,
          discountPrice: null, // Could calculate discount if needed
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
        name: component.name,
        category: component.category.name,
        description: component.description || '',
        specs,
        price: component.price,
        discountPrice: null, // Could calculate discount if needed
        imageUrl: component.imageUrl,
        stock: component.stock,
        ratings: {
          average: 4.3,
          count: 18,
        },
        related: relatedProducts,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get all products (both PCs and components)
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

    // Convert configurations to products
    for (const config of configurations) {
      const specs: Record<string, string> = {};
      config.components.forEach((configItem) => {
        const categoryName = configItem.component.category.name.toLowerCase();
        specs[categoryName] = configItem.component.name;
      });
    
      const discountPrice = config.isPublic ? Math.round(config.totalPrice * 0.9 * 100) / 100 : null;
  
      products.push({
        id: config.id,
        name: config.name,
        category: getConfigCategory(specs),
        description: config.description || '',
        specs,
        price: config.totalPrice,
        discountPrice,
        imageUrl: null,
        stock: 10,
        ratings: {
          average: 4.5,
          count: 15,
        },
      });
    }

    // Get components
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
      take: 20 // Limit to avoid overloading
    });

    // Convert components to products
    for (const component of components) {
      const specs: Record<string, string> = { ...(component.specifications as any || {}) };
      
      // Add component specs from the specValues
      for (const specValue of component.specValues) {
        specs[specValue.specKey.name] = specValue.value;
      }

      products.push({
        id: component.id,
        name: component.name,
        category: component.category.name,
        description: component.description || '',
        specs,
        price: component.price,
        discountPrice: null, // Could calculate discount if needed
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
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const products: Product[] = [];

    if (category === 'pc' || category === 'gaming' || category === 'workstation' || category === 'office' || category === 'budget') {
      // Get PC configurations in the specified category
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

      // Convert configurations to products and filter by category
      for (const config of configurations) {
        const specs: Record<string, string> = {};
        config.components.forEach((configItem) => {
          const categoryName = configItem.component.category.name.toLowerCase();
          specs[categoryName] = configItem.component.name;
        });
        
        const configCategory = getConfigCategory(specs);
        
        // Only include if it matches the requested category
        if (category === 'pc' || configCategory.toLowerCase() === category.toLowerCase()) {
          const discountPrice = config.isPublic ? Math.round(config.totalPrice * 0.9 * 100) / 100 : null;
      
          products.push({
            id: config.id,
            name: config.name,
            category: configCategory,
            description: config.description || '',
            specs,
            price: config.totalPrice,
            discountPrice,
            imageUrl: null,
            stock: 10,
            ratings: {
              average: 4.5,
              count: 15,
            },
          });
        }
      }
    } else {
      // Get components in the specified category
      const components = await prisma.component.findMany({
        where: {
          category: {
            // First try to match by slug, then by name
            OR: [
              { slug: category },
              { name: category }
            ]
          },
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

      // Convert components to products
      for (const component of components) {
        const specs: Record<string, string> = { ...(component.specifications as any || {}) };
        
        // Add component specs from the specValues
        for (const specValue of component.specValues) {
          specs[specValue.specKey.name] = specValue.value;
        }

        products.push({
          id: component.id,
          name: component.name,
          category: component.category.name,
          description: component.description || '',
          specs,
          price: component.price,
          discountPrice: null, // Could calculate discount if needed
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
    console.error(`Error fetching products for category ${category}:`, error);
    return [];
  }
}