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
          quantity: {
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
        stock: component.quantity,
        imageUrl: component.imagesUrl,
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
  
  /**
   * Save configuration
   */
  export async function saveConfiguration(userId: string, data: {
    name: string
    description?: string
    imageUrl?: string
    components: { id: string, quantity: number }[]
  }) {
    try {
      console.log('🔍 Save configuration service called:', { userId, data });
      
      const componentIds = data.components.map(c => c.id)
      console.log('📝 Component IDs:', componentIds);
      
      const components = await prisma.component.findMany({
        where: { id: { in: componentIds } }
      })
      
      console.log('✅ Found components:', components.map(c => ({ id: c.id, name: c.name, price: c.price })));
      
      const totalPrice = data.components.reduce((total, item) => {
        const component = components.find(c => c.id === item.id)
        return total + (component?.price || 0) * item.quantity
      }, 0)
      
      console.log('💰 Total price calculated:', totalPrice);
      
      const configuration = await prisma.configuration.create({
        data: {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          totalPrice,
          userId,
          status: 'DRAFT',
          isTemplate: false,
          isPublic: false,
          components: {
            create: data.components.map(item => ({
              componentId: item.id,
              quantity: item.quantity
            }))
          }
        },
        include: {
          components: {
            include: {
              component: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      })
      
      console.log('✅ Configuration saved successfully:', { id: configuration.id, name: configuration.name });
      return configuration
    } catch (error) {
      console.error('🚨 Error saving configuration:', error)
      throw error
    }
  }