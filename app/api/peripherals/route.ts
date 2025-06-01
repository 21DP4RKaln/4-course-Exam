import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'

async function getAllPeripheralCategoriesWithCounts() {
  try {
    const categories = await prisma.peripheralCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { peripherals: true }, 
        },
      },
    })
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      componentCount: cat._count.peripherals, 
    }))
  } catch (error) {
    const err = error as Error
    console.error('Error fetching peripheral categories:', err.message, err.stack)
    return []
  }
}

function parseSpecifications(peripheral: any): Record<string, string> {
  let jsonSpecs: Record<string, string> = {};
  if (peripheral.specifications) { 
    try {
      jsonSpecs = typeof peripheral.specifications === 'string'
        ? JSON.parse(peripheral.specifications)
        : peripheral.specifications; 
    } catch (e) {
      console.error(`Failed to parse specifications JSON for peripheral ${peripheral.id}:`, peripheral.specifications, e);
    }
  }
  return jsonSpecs;
}

async function getFeaturedPeripherals() {
  try {
    const featured = await prisma.peripheral.findMany({
      where: { quantity: { gt: 0 } }, 
      include: {
        category: true, 
      },
      orderBy: [{ viewCount: 'desc' }, { price: 'asc' }],
      take: 6,
    })
    return featured.map(p => {
      const combinedSpecs = parseSpecifications(p);
      const discountPrice =
        p.discountPrice &&
        (!p.discountExpiresAt || new Date(p.discountExpiresAt) > new Date())
          ? p.discountPrice
          : null
      return {
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: p.price,
        discountPrice: discountPrice,
        stock: p.quantity,
        imageUrl: p.imagesUrl,
        categoryId: p.categoryId,
        categoryName: p.category.name,
        specifications: combinedSpecs,
        sku: p.sku || '',
      }
    })
  } catch (error) {
    const err = error as Error
    console.error('Error fetching featured peripherals:', err.message, err.stack)
    return []
  }
}

async function getPeripheralsAndSpecsForCategorySlug(
  categorySlug: string,
  search: string,
  specFilters: string[],
) {
  const currentCategory = await prisma.peripheralCategory.findUnique({
    where: { slug: categorySlug },
  })

  if (!currentCategory) {
    return { peripherals: [], specifications: [], categoryFound: false }
  }

  const whereClause: any = { categoryId: currentCategory.id }
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }
  const fetchedPeripherals = await prisma.peripheral.findMany({
    where: whereClause,
    include: {
      category: true,
    },
    orderBy: { price: 'asc' },
  })

  let peripherals = fetchedPeripherals.map(p => {
    const combinedSpecs = parseSpecifications(p);
    const discountPrice =
      p.discountPrice &&
      (!p.discountExpiresAt || new Date(p.discountExpiresAt) > new Date())
        ? p.discountPrice
        : null
    return {
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      discountPrice: discountPrice,
      stock: p.quantity,
      imageUrl: p.imagesUrl,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      specifications: combinedSpecs,
      sku: p.sku || '',
    }
  })
  if (specFilters.length > 0) {
    peripherals = peripherals.filter(p => {
      return specFilters.every(filter => {
        const [key, value] = filter.split('=')
        const pValue = p.specifications[key]?.toString().toLowerCase() || ''
        const filterValue = value.toLowerCase()
        return pValue.includes(filterValue) 
      })
    })
  }


  const availableSpecs: any[] = []

  return { peripherals, specifications: availableSpecs, categoryFound: true }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')
    const search = searchParams.get('search') || ''
    const specFilters = searchParams.getAll('spec') || []

    const allPeripheralCategories = await getAllPeripheralCategoriesWithCounts()

    let peripheralsForCategoryList: any[] = []
    let specificationsForCategoryList: any[] = []
    let featuredPeripheralsList: any[] = []

    if (categorySlug) {
      const categoryData = await getPeripheralsAndSpecsForCategorySlug(
        categorySlug,
        search,
        specFilters,
      )
      if (!categoryData.categoryFound) {
        return NextResponse.json(
          { error: 'Peripheral category not found' },
          { status: 404 },
        )
      }
      peripheralsForCategoryList = categoryData.peripherals
      specificationsForCategoryList = categoryData.specifications
    } else {
      featuredPeripheralsList = await getFeaturedPeripherals()
    }

    return NextResponse.json({
      categories: allPeripheralCategories,
      components: peripheralsForCategoryList, 
      specifications: specificationsForCategoryList, 
      featuredProducts: featuredPeripheralsList, 
    })
  } catch (error) {
    const err = error as Error
    console.error('Error in GET /api/peripherals:', err.message, err.stack)
    return NextResponse.json(
      { error: 'Failed to fetch peripheral data', details: err.message },
      { status: 500 },
    )
  }
}
