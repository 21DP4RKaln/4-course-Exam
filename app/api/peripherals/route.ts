import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'

// Helper function to get all peripheral categories with their product counts
async function getAllPeripheralCategoriesWithCounts() {
  try {
    const categories = await prisma.peripheralCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { peripherals: true }, // Correctly count peripherals for PeripheralCategory
        },
      },
    })
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      componentCount: cat._count.peripherals, // Frontend expects componentCount
    }))
  } catch (error) {
    const err = error as Error
    console.error('Error fetching peripheral categories:', err.message, err.stack)
    return []
  }
}

// Helper function to combine JSON string specs and relational specs
function combineSpecifications(peripheral: any): Record<string, string> {
  const relationalSpecs: Record<string, string> = {};
  if (peripheral.specValues && Array.isArray(peripheral.specValues)) {
    peripheral.specValues.forEach((spec: any) => {
      if (spec.specKey) {
        relationalSpecs[spec.specKey.name] = spec.value;
      }
    });
  }

  let jsonSpecs: Record<string, string> = {};
  if (peripheral.specifications) { // This is the JSON string field
    try {
      jsonSpecs = typeof peripheral.specifications === 'string'
        ? JSON.parse(peripheral.specifications)
        : peripheral.specifications; // Assume it's already an object if not string
    } catch (e) {
      console.error(`Failed to parse specifications JSON for peripheral ${peripheral.id}:`, peripheral.specifications, e);
    }
  }
  return { ...jsonSpecs, ...relationalSpecs };
}

// Helper function to get featured peripherals
async function getFeaturedPeripherals() {
  try {
    const featured = await prisma.peripheral.findMany({
      where: { stock: { gt: 0 } }, // Basic filter: in stock
      include: {
        category: true, // PeripheralCategory
        specValues: { include: { specKey: true } },
      },
      orderBy: [{ viewCount: 'desc' }, { price: 'asc' }],
      take: 6,
    })
    return featured.map(p => {
      const combinedSpecs = combineSpecifications(p);
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
        stock: p.stock,
        imageUrl: p.imageUrl,
        categoryId: p.categoryId,
        categoryName: p.category.name,
        specifications: combinedSpecs,
        sku: p.sku || '',
        // Add rating, ratingCount if your frontend expects them
      }
    })
  } catch (error) {
    const err = error as Error
    console.error('Error fetching featured peripherals:', err.message, err.stack)
    return []
  }
}

// Helper function to get peripherals and specifications for a specific category slug
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
      specValues: { include: { specKey: true } },
    },
    orderBy: { price: 'asc' },
  })

  let peripherals = fetchedPeripherals.map(p => {
    const combinedSpecs = combineSpecifications(p);
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
      stock: p.stock,
      imageUrl: p.imageUrl,
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
        return pValue.includes(filterValue) // Use .includes for partial match, or === for exact
      })
    })
  }

  const specKeys = await prisma.specificationKey.findMany({
    where: {
      OR: [
        { peripheralCategoryId: currentCategory.id },
        { peripheralCategoryId: null, componentCategoryId: null }, // Global specs
      ],
    },
    include: {
      peripheralSpecValues: {
        where: { peripheral: { categoryId: currentCategory.id } },
        select: { value: true },
        distinct: ['value'],
      },
    },
  })
  const availableSpecs = specKeys
    .map(key => ({
      id: key.id,
      name: key.name,
      displayName: key.displayName,
      values: key.peripheralSpecValues.map(sv => sv.value).sort(),
    }))
    .filter(spec => spec.values.length > 0)

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
      // This is the call from the main /peripherals page, expecting categories and featured products
      featuredPeripheralsList = await getFeaturedPeripherals()
    }

    return NextResponse.json({
      categories: allPeripheralCategories,
      components: peripheralsForCategoryList, // Frontend might expect 'components' for the list of items
      specifications: specificationsForCategoryList, // For filtering UI on a category-specific page
      featuredProducts: featuredPeripheralsList, // For the main peripherals page's featured section
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
