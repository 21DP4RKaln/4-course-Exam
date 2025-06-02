import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { extractComponentSpecifications, extractPeripheralSpecifications } from '@/lib/services/unifiedProductService'

export async function GET(request: NextRequest) {  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search') || ''
    const specFilters = searchParams.getAll('spec').filter((spec): spec is string => spec !== null)
    const type = searchParams.get('type') || 'components'

    const categories = await getCategories(type)

    let components: any[] = []
    let featuredProducts: any[] = []
    let availableSpecifications: any[] = []

    if (category) {
      if (type === 'peripherals') {
        const whereClause: any = {
          category: {
            slug: category
          }
        }
        
        if (search) {
          whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }        const fetchedPeripherals = await prisma.peripheral.findMany({
          where: whereClause,
          include: {
            category: true,
            keyboard: true,
            mouse: true,
            microphone: true,
            camera: true,
            monitor: true,
            headphones: true,
            speakers: true,
            gamepad: true,
            mousePad: true,
          },
          orderBy: {
            price: 'asc'
          }
        });components = fetchedPeripherals.map(peripheral => {
          const discountPrice = peripheral.discountPrice && (!peripheral.discountExpiresAt || new Date(peripheral.discountExpiresAt) > new Date())
            ? peripheral.discountPrice
            : null;

          return {
            id: peripheral.id,
            name: peripheral.name,
            description: peripheral.description || '',
            price: peripheral.price,
            discountPrice: discountPrice,
            stock: peripheral.quantity,
            imageUrl: peripheral.imagesUrl,
            categoryId: peripheral.categoryId,
            categoryName: peripheral.category.name,
            specifications: extractPeripheralSpecifications(peripheral),
            sku: peripheral.sku || '',
            type: 'peripheral'
          };
        });
      } else {
        const whereClause: any = {
          category: {
            slug: category,
            type: 'component'
          }
        }
        
        if (search) {
          whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }        const fetchedComponents = await prisma.component.findMany({
          where: whereClause,
          include: {
            category: true,
            cpu: true,
            gpu: true,
            motherboard: true,
            ram: true,
            storage: true,
            psu: true,
            cooling: true,
            caseModel: true,
          },
          orderBy: {
            price: 'asc'
          }
        });        components = fetchedComponents.map(comp => {
          const discountPrice = comp.discountPrice && (!comp.discountExpiresAt || new Date(comp.discountExpiresAt) > new Date())
            ? comp.discountPrice
            : null;        
          let powerConsumption = 0;
          if (comp.cpu && comp.cpu.powerConsumption) {
            powerConsumption += comp.cpu.powerConsumption;
          }
          
          if (comp.gpu && comp.gpu.powerConsumption) {
            powerConsumption += comp.gpu.powerConsumption;
          }

          if (comp.ram && comp.ram.powerConsumption) {
            powerConsumption += comp.ram.powerConsumption;
          }
          
          if (comp.storage && comp.storage.powerConsumption) {
            powerConsumption += comp.storage.powerConsumption;
          }

          return {
            id: comp.id,
            name: comp.name,
            description: comp.description || '',
            price: comp.price,
            discountPrice: discountPrice,
            stock: comp.quantity,
            imageUrl: comp.imagesUrl,
            categoryId: comp.categoryId,
            categoryName: comp.category.name,
            specifications: extractComponentSpecifications(comp),
            sku: comp.sku || '',
            type: 'component',
            cpu: comp.cpu,
            gpu: comp.gpu,
            motherboard: comp.motherboard,
            ram: comp.ram,
            storage: comp.storage,
            psu: comp.psu,
            cooling: comp.cooling,
            caseModel: comp.caseModel,
            powerConsumption: powerConsumption
          };
        });
      }

      if (specFilters.length > 0) {
        components = components.filter(filteredComp => {
          return specFilters.every(filter => {
            const [key, value] = filter.split('=')
            const compValue = filteredComp.specifications[key]?.toLowerCase() || ''
            const filterValue = value.toLowerCase()
            
            if (key === 'model') {
              const normalizedCompValue = compValue.replace(/\s+/g, '-')
              const normalizedFilterValue = filterValue.replace(/\s+/g, '-')
              return normalizedCompValue.includes(normalizedFilterValue)
            }
            
            return compValue.includes(filterValue)
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
    if (type === 'peripherals') {
      const categories = await prisma.peripheralCategory.findMany({
        orderBy: {
          name: 'asc'
        },
        include: {
          _count: {
            select: {
              peripherals: true
            }
          }
        }
      })

      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        componentCount: cat._count.peripherals
      }))
    } else {      const categories = await prisma.componentCategory.findMany({
        where: {
          type: 'component',
          slug: {
            not: 'services'
          }
        },
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
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

async function getFeaturedProducts(type: string) {
  try {
    if (type === 'peripherals') {
      const featured = await prisma.peripheral.findMany({
        where: {
          quantity: { gt: 0 }
        },
        include: {
          category: true
        },
        orderBy: [
          { viewCount: 'desc' },
          { price: 'asc' }
        ],
        take: 6
      })

      return featured.map(peripheral => {
        const discountPrice = peripheral.discountPrice && (!peripheral.discountExpiresAt || new Date(peripheral.discountExpiresAt) > new Date())
          ? peripheral.discountPrice
          : null;

        return {
          id: peripheral.id,
          name: peripheral.name,
          description: peripheral.description || '',
          price: peripheral.price,
          discountPrice: discountPrice,
          stock: peripheral.quantity,
          imageUrl: peripheral.imagesUrl,
          categoryId: peripheral.categoryId,
          categoryName: peripheral.category.name,
          type: 'peripheral'
        };
      });
    } else {
      const featured = await prisma.component.findMany({
        where: {
          quantity: { gt: 0 }
        },
        include: {
          category: true
        },
        orderBy: [
          { viewCount: 'desc' },
          { price: 'asc' }
        ],
        take: 6
      })

      return featured.map(component => {
        const discountPrice = component.discountPrice && (!component.discountExpiresAt || new Date(component.discountExpiresAt) > new Date())
          ? component.discountPrice
          : null;

        return {
          id: component.id,
          name: component.name,
          description: component.description || '',
          price: component.price,
          discountPrice: discountPrice,
          stock: component.quantity,
          imageUrl: component.imagesUrl,
          categoryId: component.categoryId,
          categoryName: component.category.name,
          type: 'component'
        };
      });
    }
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}