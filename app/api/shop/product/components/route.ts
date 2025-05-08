import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';

export async function GET(request: NextRequest) {
  try {
    const components = await prisma.component.findMany({
      include: {
        category: true,
        specValues: {
          include: {
            specKey: true
          }
        }
      },
      take: 50
    });

    const formattedComponents = components.map(component => {
      const specs: Record<string, string> = { ...(component.specifications as any || {}) };
      
      for (const specValue of component.specValues) {
        specs[specValue.specKey.name] = specValue.value;
      }

      return {
        id: component.id,
        type: 'component',
        name: component.name,
        category: component.category.name,
        description: component.description || '',
        specifications: specs,
        price: component.price,
        discountPrice: null,
        imageUrl: component.imageUrl,
        stock: component.stock,
        ratings: {
          average: 4.2,
          count: 12,
        }
      };
    });

    return NextResponse.json(formattedComponents);
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}