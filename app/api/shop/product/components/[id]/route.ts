import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const component = await prisma.component.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        specValues: {
          include: {
            specKey: true
          }
        }
      }
    });

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Build specs object
    const specs: Record<string, string> = { ...(component.specifications as any || {}) };
    
    // Add component specs from the specValues
    for (const specValue of component.specValues) {
      specs[specValue.specKey.name] = specValue.value;
    }

    return NextResponse.json({
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
        average: 4.3,
        count: 18,
      }
    });
  } catch (error) {
    console.error(`Error fetching component with ID ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}