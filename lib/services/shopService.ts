import { prisma } from '@/lib/prismaService'

export interface PC {
    id: string;
    name: string;
    category: string;
    description: string;
    specs: Record<string, string>;
    price: number;
    discountPrice: number | null;
    imageUrl: string | null;
    featured: boolean;
    stock: number;
    ratings?: {
      average: number;
      count: number;
    };
    longDescription?: string;
    related?: string[] | PC[];
  }
  
  export interface PCWithRelated extends PC {
    related: PC[];
  }
  
  /**
   * Gets all ready-made PCs from the database
   */
  export async function getReadyMadePCs(): Promise<PC[]> {
    try {
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
  
      return configurations.map((config) => {
        const specs: Record<string, string> = {};
        config.components.forEach((configItem) => {
          const categoryName = configItem.component.category.name.toLowerCase();
          specs[categoryName] = configItem.component.name;
        });
  
        const discountPrice = config.isPublic ? Math.round(config.totalPrice * 0.9 * 100) / 100 : null;
  
        return {
          id: config.id,
          name: config.name,
          category: getConfigCategory(specs),
          description: config.description || '',
          specs,
          price: config.totalPrice,
          discountPrice,
          imageUrl: null, // Could be updated to fetch actual image URLs
          featured: config.isPublic,
          stock: 10, // This should come from actual inventory data
          ratings: {
            average: 4.5, // This should come from actual ratings
            count: 15,
          },
        };
      });
    } catch (error) {
      console.error('Error fetching ready-made PCs:', error);
      return [];
    }
  }
  
  /**
   * Gets a specific PC by ID with related PCs
   */
  export async function getPCById(id: string): Promise<PCWithRelated | null> {
    try {
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
  
      if (!configuration) {
        return null;
      }
  
      const specs: Record<string, string> = {};
      configuration.components.forEach((configItem) => {
        const categoryName = configItem.component.category.name.toLowerCase();
        specs[categoryName] = configItem.component.name;
      });
   
      const discountPrice = configuration.isPublic ? Math.round(configuration.totalPrice * 0.9 * 100) / 100 : null;
  
      const category = getConfigCategory(specs);
  
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
   
      const relatedPCs = relatedConfigurations.map((config) => {
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
          featured: config.isPublic,
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
        featured: configuration.isPublic,
        stock: 10,
        ratings: {
          average: 4.5,
          count: 15,
        },
        related: relatedPCs,
      };
    } catch (error) {
      console.error(`Error fetching PC with ID ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Determine category based on component specs
   */
  function getConfigCategory(specs: Record<string, string>): string {
    if (specs.gpu && specs.gpu.toLowerCase().includes('rtx')) {
      return 'gaming';
    } else if (specs.cpu && specs.cpu.toLowerCase().includes('ryzen 9')) {
      return 'workstation';
    } else if (specs.cpu && specs.cpu.toLowerCase().includes('i3')) {
      return 'budget';
    } else {
      return 'office';
    }
  }
  