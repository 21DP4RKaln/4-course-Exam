import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search') || ''
    const specFilters = searchParams.getAll('spec') || []
    const type = searchParams.get('type') || 'components' 

    const categories = await getCategories(type)

    let components: any[] = [] 
    let featuredProducts: any[] = []
    let availableSpecifications: any[] = []

    if (category) {
      const whereClause: any = {
        category: {
          slug: category
        }
      }
      
      if (type === 'peripherals') {
        whereClause.category.type = 'peripheral'
      } else if (type === 'components') {
        whereClause.category.type = 'component'
      }

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }      const fetchedComponents = await prisma.component.findMany({
        where: whereClause,
        include: {
          category: true,
          specValues: {
            include: {
              specKey: true
            }
          }
        },
        orderBy: {
          price: 'asc'
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          discountPrice: true,
          discountExpiresAt: true,
          stock: true,
          imageUrl: true,
          categoryId: true,
          specifications: true,
          sku: true,
          category: true,
          specValues: {
            include: {
              specKey: true
            }
          }
        }
      })

      const specKeys = await prisma.specificationKey.findMany({
        where: {
          OR: [
            { componentCategoryId: null }, 
            { componentCategoryId: category }
          ]
        },
        include: {
          componentSpecValues: {
            where: {
              component: {
                category: {
                  slug: category
                }
              }
            },
            select: {
              value: true
            },
            distinct: ['value']
          }
        }
      })

      availableSpecifications = specKeys.map(key => ({
        id: key.id,
        name: key.name,
        displayName: key.displayName,
        values: key.componentSpecValues.map(spec => spec.value)
      })).filter(spec => spec.values.length > 0)
   
      components = fetchedComponents.map(comp => {
        const specifications: Record<string, string> = {}
        comp.specValues.forEach(spec => {
          specifications[spec.specKey.name] = spec.value
        })
   
        const existingSpecs = comp.specifications
          ? (typeof comp.specifications === 'string' 
              ? JSON.parse(comp.specifications) as Record<string, string>
              : comp.specifications as Record<string, string>)
          : {}

        const combinedSpecs = {
          ...existingSpecs,
          ...specifications
        }        const discountPrice = comp.discountPrice && (!comp.discountExpiresAt || new Date(comp.discountExpiresAt) > new Date())
          ? comp.discountPrice
          : null;

        return {
          id: comp.id,
          name: comp.name,
          description: comp.description || '',
          price: comp.price,
          discountPrice: discountPrice,
          stock: comp.stock,
          imageUrl: comp.imageUrl,
          categoryId: comp.categoryId,
          categoryName: comp.category.name,
          specifications: combinedSpecs,
          sku: comp.sku || ''
        }
      })

      if (specFilters.length > 0) {
        components = components.filter(comp => {
          return specFilters.every(filter => {
            const [key, value] = filter.split('=')
            return comp.specifications[key] === value
          })
        })
      }
    } else if (type === 'peripherals' || type === 'components') {
      featuredProducts = await getFeaturedProducts(type)
    }

    return NextResponse.json({
      categories,
      components,
      specifications: availableSpecifications,
      featuredProducts
    })
  } catch (error) {
    console.error('Error fetching components:', error)
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    )
  }
}

async function getCategories(type: string) {
  try {
    const whereClause: any = {}
    
    if (type === 'peripherals') {
      whereClause.type = 'peripheral'
    } else if (type === 'components') {
      whereClause.type = 'component'
    }

    const categories = await prisma.componentCategory.findMany({
      where: whereClause,
      orderBy: {
        displayOrder: 'asc'
      },
      include: {
        _count: {
          select: {
            components: true
          }
        }
      }
    })

    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      componentCount: cat._count.components
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

async function getFeaturedProducts(type: string) {
  try {
    const whereClause: any = {
      stock: {
        gt: 0
      }
    }
    
    if (type === 'peripherals') {
      whereClause.category = {
        type: 'peripheral'
      }
    } else if (type === 'components') {
      whereClause.category = {
        type: 'component'
      }
    }

    const featuredProducts = await prisma.component.findMany({
      where: whereClause,
      include: {
        category: true,
        specValues: {
          include: {
            specKey: true
          }
        }
      },
      orderBy: {
        price: 'desc'
      },
      take: 4
    })

    return featuredProducts.map(product => {
      const specifications: Record<string, string> = {}
      product.specValues.forEach(spec => {
        specifications[spec.specKey.name] = spec.value
      })      // Use stored discount price if available, otherwise disable
      const discountPrice = product.discountPrice && (!product.discountExpiresAt || new Date(product.discountExpiresAt) > new Date()) 
        ? product.discountPrice 
        : null;
        
      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        discountPrice: discountPrice,
        categoryId: product.categoryId,
        categoryName: product.category.name,
        imageUrl: product.imageUrl || '',
        stock: product.stock,
        rating: 4.5,
        ratingCount: Math.floor(Math.random() * 50) + 10,
        specifications
      }
    })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}