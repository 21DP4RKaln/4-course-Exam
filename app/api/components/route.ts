import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search') || ''
    const specFilters = searchParams.getAll('spec') || []

    const categories = await prisma.componentCategory.findMany({
      orderBy: {
        displayOrder: 'asc'
      }
    })

    let components = []
    let availableSpecifications = []

    if (category) {
      const whereClause: any = {
        category: {
          name: {
            equals: category,
            mode: 'insensitive'
          }
        }
      }

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }

      const fetchedComponents = await prisma.component.findMany({
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
        }
      })

      const specKeys = await prisma.specificationKey.findMany({
        where: {
          OR: [
            { categoryId: null }, // Global specs
            { category: { name: { equals: category, mode: 'insensitive' } } } 
          ]
        },
        include: {
          specValues: {
            where: {
              component: {
                category: {
                  name: { equals: category, mode: 'insensitive' }
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
        values: key.specValues.map(spec => spec.value)
      }))
 
      components = fetchedComponents.map(comp => {
        const specifications: Record<string, string> = {}
        comp.specValues.forEach(spec => {
          specifications[spec.specKey.name] = spec.value
        })

        const combinedSpecs = {
          ...comp.specifications as Record<string, string>,
          ...specifications
        }

        return {
          id: comp.id,
          name: comp.name,
          description: comp.description || '',
          price: comp.price,
          stock: comp.stock,
          imageUrl: comp.imageUrl || '',
          specifications: combinedSpecs
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
    }

    return NextResponse.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description
      })),
      components,
      specifications: availableSpecifications
    })
  } catch (error) {
    console.error('Error fetching components:', error)
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, description, price, stock, categoryId, specifications, sku = null } = data

    const generatedSku = sku || `${categoryId.substring(0, 3).toUpperCase()}-${Date.now().toString().substring(7)}`

    const component = await prisma.component.create({
      data: {
        name,
        sku: generatedSku,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        specifications: specifications || {},
      }
    })

    if (specifications && typeof specifications === 'object') {
      for (const [key, value] of Object.entries(specifications)) {
        let specKey = await prisma.specificationKey.findFirst({
          where: {
            name: key
          }
        })
        
        if (!specKey) {
          specKey = await prisma.specificationKey.create({
            data: {
              name: key,
              displayName: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
              categoryId: categoryId
            }
          })
        }

        await prisma.componentSpec.create({
          data: {
            componentId: component.id,
            specKeyId: specKey.id,
            value: value.toString()
          }
        })
      }
    }
    
    return NextResponse.json({ 
      id: component.id,
      name: component.name,
      sku: component.sku,
      description: component.description,
      price: component.price,
      stock: component.stock,
      categoryId: component.categoryId,
      specifications: specifications || {}
    })
  } catch (error) {
    console.error('Error creating component:', error)
    return NextResponse.json(
      { error: 'Failed to create component' },
      { status: 500 }
    )
  }
}