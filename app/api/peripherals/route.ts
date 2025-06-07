import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { extractPeripheralSpecifications } from '@/lib/services/unifiedProductService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search') || '';
    const specFilters = searchParams
      .getAll('spec')
      .filter((spec): spec is string => spec !== null);

    const categories = await getCategories();

    let peripherals: any[] = [];
    let featuredProducts: any[] = [];
    let availableSpecifications: any[] = [];

    if (category) {
      const whereClause: any = {
        category: {
          slug: category,
        },
      };

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const fetchedPeripherals = await prisma.peripheral.findMany({
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
          price: 'asc',
        },
      });

      peripherals = fetchedPeripherals.map(peripheral => {
        const discountPrice =
          peripheral.discountPrice &&
          (!peripheral.discountExpiresAt ||
            new Date(peripheral.discountExpiresAt) > new Date())
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
          type: 'peripheral',
        };
      });

      if (specFilters.length > 0) {
        peripherals = peripherals.filter(filteredPeripheral => {
          return specFilters.every(filter => {
            const [key, value] = filter.split('=');
            const peripheralValue =
              filteredPeripheral.specifications[key]?.toLowerCase() || '';
            const filterValue = value.toLowerCase();

            if (key === 'model') {
              const normalizedPeripheralValue = peripheralValue.replace(
                /\s+/g,
                '-'
              );
              const normalizedFilterValue = filterValue.replace(/\s+/g, '-');
              return normalizedPeripheralValue.includes(normalizedFilterValue);
            }

            return peripheralValue.includes(filterValue);
          });
        });
      }
    } else {
      featuredProducts = await getFeaturedProducts();
    }

    return NextResponse.json({
      categories,
      components: peripherals,
      specifications: availableSpecifications,
      featuredProducts,
    });
  } catch (error) {
    console.error('Error fetching peripherals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch peripherals' },
      { status: 500 }
    );
  }
}

async function getCategories() {
  try {
    const categories = await prisma.peripheralCategory.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            peripherals: true,
          },
        },
      },
    });

    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      componentCount: cat._count.peripherals,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function getFeaturedProducts() {
  try {
    const featured = await prisma.peripheral.findMany({
      where: {
        quantity: { gt: 0 },
      },
      include: {
        category: true,
      },
      orderBy: [{ viewCount: 'desc' }, { price: 'asc' }],
      take: 6,
    });

    return featured.map(peripheral => {
      const discountPrice =
        peripheral.discountPrice &&
        (!peripheral.discountExpiresAt ||
          new Date(peripheral.discountExpiresAt) > new Date())
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
        type: 'peripheral',
      };
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}
