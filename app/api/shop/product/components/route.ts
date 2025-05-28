import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';

interface FormattedComponent {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  specifications: Record<string, string>;
  sku: string | null;
}

// Removed conflicting import from @prisma/client
// import { Component, ComponentCategory, ComponentSpec, SpecificationKey } from '@prisma/client';

interface FormattedComponent {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  specifications: Record<string, string>;
  sku: string | null;
}

interface SpecificationKey {
  id: string;
  name: string;
  displayName: string;
}

interface Component {
  id: string;
  specifications: Record<string, string>;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    
    console.log('Request for category:', categorySlug); // Debug log

    let whereClause: any = {
      category: {
        type: 'component'
      },
      stock: { gt: 0 }
    };

    let category;
    if (categorySlug) {
      // Get the category first if a specific one is requested
      category = await prisma.componentCategory.findFirst({
        where: { 
          slug: categorySlug
        }
      });
      
      console.log('Found category:', category); // Debug log

      if (!category) {
        console.log('Category not found for slug:', categorySlug); // Debug log
        return NextResponse.json(
          { error: `Category not found for slug: ${categorySlug}` },
          { status: 404 }
        );
      }

      whereClause.categoryId = category.id;
    }

    // Get all components (filtered by category if specified)
    console.log('Fetching components with where clause:', whereClause);
    const components = await prisma.component.findMany({
      where: whereClause,
      include: {
        category: true,
        specValues: {
          include: {
            specKey: true
          }
        }
      }
    }) as any;

    // Map the data to match the expected format
    const formattedComponents = components.map((p: any) => {
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
      p.specValues.forEach((sv: any) => {
        if (sv.specKey?.name && sv.value) {
          specs[sv.specKey.name] = sv.value;
        }
      });

      // Format the component data
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
    });    // Get specification keys for this category or all component categories
    const specificationKeys = await prisma.specificationKey.findMany({
      where: categorySlug ? { componentCategoryId: category!.id } : undefined
    });
    
    // Extract unique specification values
    const specifications = specificationKeys.map((key: SpecificationKey) => {
      const values = new Set<string>();
      formattedComponents.forEach((component: FormattedComponent) => {
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
      : await prisma.componentCategory.findMany({
          where: {
            type: 'component'
          }
        });

    return NextResponse.json({
      categories: categories || [],
      components: formattedComponents || [],
      specifications: specifications || []
    });
  } catch (error) {
    console.error('Error in components API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}