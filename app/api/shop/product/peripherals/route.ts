import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { Peripheral } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');

    let whereClause: any = {
      stock: { gt: 0 }
    };

    let category;
    if (categorySlug) {
      // Get the category first if a specific one is requested
      category = await prisma.peripheralCategory.findFirst({
        where: {
          OR: [
            { slug: categorySlug },
            { id: categorySlug }
          ]
        }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      whereClause.categoryId = category.id;
    }    // Get all peripherals (filtered by category if specified)
    const peripherals = await prisma.peripheral.findMany({
      where: whereClause,
      include: {
        category: true,
        specValues: {
          include: {
            specKey: true
          }
        }
      }
    });

    // Map the data to match the expected format
    const components = peripherals.map((p: any) => {
      // Extract specifications from multiple sources
      const specs: Record<string, string> = {};
      
      // 1. From JSON specifications field
      if (p.specifications) {
        try {
          const parsedSpecs = typeof p.specifications === 'string' 
            ? JSON.parse(p.specifications)
            : p.specifications;
          Object.assign(specs, parsedSpecs);
        } catch (e) {
          console.error('Error parsing specifications:', e);
        }
      }
      
      // 2. From specValues relation
      if (p.specValues) {
        p.specValues.forEach((sv: any) => {
          if (sv.specKey?.name && sv.value) {
            specs[sv.specKey.name] = sv.value;
          }
        });
      }

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.imageUrl,
        categoryId: p.categoryId,
        categoryName: p.category.name,
        specifications: specs,
        sku: p.sku
      };
    });    // Get specification keys (for the specific category or all categories)
    const specificationKeys = await prisma.specificationKey.findMany({
      where: categorySlug ? { peripheralCategoryId: category!.id } : undefined
    });
    
    // Extract unique specification values
    const specifications = specificationKeys.map(key => {
      const values = new Set<string>();
      components.forEach(component => {
        if (component.specifications && component.specifications[key.name]) {
          // Ensure the value is properly cast to string and added to the set
          const value = component.specifications[key.name].toString().trim();
          if (value) {
            values.add(value);
          }
        }
      });
      return {
        id: key.id,
        name: key.name,
        displayName: key.displayName,
        values: Array.from(values).filter(Boolean).sort()
      };
    });

    // Get all categories if none specified
    const categories = categorySlug 
      ? [category!]
      : await prisma.peripheralCategory.findMany();

    return NextResponse.json({
      categories,
      components,
      specifications
    });
  } catch (error) {
    console.error('Error fetching peripherals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}