import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { extractComponentSpecifications } from '@/lib/services/unifiedProductService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search') || '';
    const specFilters = searchParams
      .getAll('spec')
      .filter((spec): spec is string => spec !== null);

    const categories = await getCategories();

    let components: any[] = [];
    let featuredProducts: any[] = [];
    let availableSpecifications: any[] = [];

    if (category) {
      const whereClause: any = {
        category: {
          slug: category,
          type: 'component',
        },
      };

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const fetchedComponents = await prisma.component.findMany({
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
          price: 'asc',
        },
      });

      components = fetchedComponents.map(comp => {
        const discountPrice =
          comp.discountPrice &&
          (!comp.discountExpiresAt ||
            new Date(comp.discountExpiresAt) > new Date())
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

        const specs = extractComponentSpecifications(comp);

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
          specifications: specs,
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
          powerConsumption: powerConsumption,
        };
      });

      if (specFilters.length > 0) {
        components = components.filter(filteredComp => {
          const passes = specFilters.every(filter => {
            const [key, value] = filter.split('=');
            if (!key || !value) return true; // Skip invalid filters

            // Try to find the specification value with case-insensitive key matching
            let compValue = '';
            const specs = filteredComp.specifications;

            // Try exact match first
            if (specs[key]) {
              compValue = specs[key].toLowerCase();
            } else {
              // Try case-insensitive search
              const specKeys = Object.keys(specs);
              const matchingKey = specKeys.find(
                k => k.toLowerCase() === key.toLowerCase()
              );
              if (matchingKey) {
                compValue = specs[matchingKey].toLowerCase();
              }
            }

            const filterValue = value.toLowerCase();

            if (key === 'model') {
              const normalizedCompValue = compValue.replace(/\s+/g, '-');
              const normalizedFilterValue = filterValue.replace(/\s+/g, '-');
              return normalizedCompValue.includes(normalizedFilterValue);
            }

            // Special handling for GPU brand filters
            if (key.toLowerCase() === 'brand' && filteredComp.gpu) {
              // For GPUs, check both Brand (board manufacturer) and Sub Brand (chip manufacturer)
              const brandValue = specs['Brand'] || '';
              const subBrandValue = specs['Sub Brand'] || '';

              return (
                brandValue.toLowerCase() === filterValue ||
                subBrandValue.toLowerCase() === filterValue
              );
            }

            // Special handling for GPU architecture series filters
            if (key.toLowerCase() === 'architecture' && filteredComp.gpu) {
              const architectureValue = specs['Architecture'] || '';

              // Handle series-based filtering (e.g., RTX 40 matches RTX 4070, RTX 4080, etc.)
              if (
                filterValue.includes('rtx 5') ||
                filterValue.includes('rtx 50')
              ) {
                return architectureValue.toLowerCase().includes('rtx 5');
              }
              if (
                filterValue.includes('rtx 4') ||
                filterValue.includes('rtx 40')
              ) {
                return architectureValue.toLowerCase().includes('rtx 4');
              }
              if (
                filterValue.includes('rtx 3') ||
                filterValue.includes('rtx 30')
              ) {
                return architectureValue.toLowerCase().includes('rtx 3');
              }
              if (filterValue.includes('gtx 16')) {
                return architectureValue.toLowerCase().includes('gtx 16');
              }
              if (
                filterValue.includes('rx 8') ||
                filterValue.includes('rx 8000')
              ) {
                return architectureValue.toLowerCase().includes('rx 8');
              }
              if (
                filterValue.includes('rx 7') ||
                filterValue.includes('rx 7000')
              ) {
                return architectureValue.toLowerCase().includes('rx 7');
              }
              if (
                filterValue.includes('rx 6') ||
                filterValue.includes('rx 6000')
              ) {
                return architectureValue.toLowerCase().includes('rx 6');
              }
              if (
                filterValue.includes('rx 5') ||
                filterValue.includes('rx 5000')
              ) {
                return architectureValue.toLowerCase().includes('rx 5');
              }
              if (filterValue.includes('arc')) {
                return architectureValue.toLowerCase().includes('arc');
              }

              // Fallback to exact match for specific models
              return architectureValue.toLowerCase() === filterValue;
            }

            // For exact matches on brand, series, etc.
            if (['brand', 'series'].includes(key.toLowerCase())) {
              return compValue === filterValue;
            }

            // Special handling for Form Factor - exact match to avoid ATX matching Micro-ATX
            if (key.toLowerCase() === 'form factor') {
              return compValue === filterValue;
            }

            // For other fields, use contains
            return compValue.includes(filterValue);
          });

          return passes;
        });
      }
    } else {
      featuredProducts = await getFeaturedProducts();
    }

    return NextResponse.json({
      categories,
      components,
      specifications: availableSpecifications,
      featuredProducts,
    });
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}

async function getCategories() {
  try {
    const categories = await prisma.componentCategory.findMany({
      where: {
        type: 'component',
        slug: {
          not: 'services',
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        _count: {
          select: {
            components: true,
          },
        },
      },
    });

    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      componentCount: cat._count.components,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function getFeaturedProducts() {
  try {
    const featured = await prisma.component.findMany({
      where: {
        quantity: { gt: 0 },
      },
      include: {
        category: true,
      },
      orderBy: [{ viewCount: 'desc' }, { price: 'asc' }],
      take: 6,
    });

    return featured.map(component => {
      const discountPrice =
        component.discountPrice &&
        (!component.discountExpiresAt ||
          new Date(component.discountExpiresAt) > new Date())
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
        type: 'component',
      };
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}
