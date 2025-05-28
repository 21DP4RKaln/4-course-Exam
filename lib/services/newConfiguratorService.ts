import { prisma } from '@/lib/prismaService'

export interface Component {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string | null
  categoryId: string
  categoryName: string
  specifications?: Record<string, string>
}

/**
 * Get all component categories
 */
export async function getAllComponentCategories() {
  try {
    const categories = await prisma.componentCategory.findMany({
      where: {
        type: 'component' // Only get computer component categories
      },
      orderBy: {
        displayOrder: 'asc' // Order by display order
      }
    })
    
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    }))
  } catch (error) {
    console.error('Error fetching component categories:', error)
    return []
  }
}

/**
 * Get components by category slug
 */
export async function getComponentsByCategorySlug(slug: string): Promise<Component[]> {
  try {
    const category = await prisma.componentCategory.findUnique({
      where: { slug }
    })
    
    if (!category) {
      return []
    }
    
    const components = await prisma.component.findMany({
      where: {
        categoryId: category.id,
        stock: { gt: 0 } // Only get in-stock components
      },
      include: {
        category: true,
        specValues: {
          include: {
            specKey: true
          }
        }
      },
      orderBy: { price: 'asc' } // Order by price ascending
    })
    
    return components.map(component => {
      // Extract specifications
      const specifications: Record<string, string> = {}
      
      // Add specs from JSON field if exists
      if (component.specifications) {
        if (typeof component.specifications === 'object') {
          Object.entries(component.specifications as object).forEach(([key, value]) => {
            specifications[key] = String(value)
          })
        }
      }
      
      // Add specs from specValues
      component.specValues.forEach(spec => {
        specifications[spec.specKey.name] = spec.value
      })
      
      return {
        id: component.id,
        name: component.name,
        description: component.description || '',
        price: component.price,
        stock: component.stock,
        imageUrl: component.imageUrl,
        categoryId: component.categoryId,
        categoryName: component.category.name,
        specifications
      }
    })
  } catch (error) {
    console.error(`Error fetching components for category slug ${slug}:`, error)
    return []
  }
}

/**
 * Get component by ID
 */
export async function getComponentById(id: string): Promise<Component | null> {
  try {
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
    })
    
    if (!component) {
      return null
    }
    
    // Extract specifications
    const specifications: Record<string, string> = {}
    
    // Add specs from JSON field if exists
    if (component.specifications) {
      if (typeof component.specifications === 'object') {
        Object.entries(component.specifications as object).forEach(([key, value]) => {
          specifications[key] = String(value)
        })
      }
    }
    
    // Add specs from specValues
    component.specValues.forEach(spec => {
      specifications[spec.specKey.name] = spec.value
    })
    
    return {
      id: component.id,
      name: component.name,
      description: component.description || '',
      price: component.price,
      stock: component.stock,
      imageUrl: component.imageUrl,
      categoryId: component.categoryId,
      categoryName: component.category.name,
      specifications
    }
  } catch (error) {
    console.error(`Error fetching component with ID ${id}:`, error)
    return null
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
    
    // Calculate total price based on component prices
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
      // Create the configuration
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
      }    })
    
    console.log('✅ Configuration created successfully:', { id: configuration.id, name: configuration.name });
    return configuration
  } catch (error) {
    console.error('🚨 Error creating configuration:', error)
    throw error
  }
}
