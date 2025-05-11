import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
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
    
    const specs: Record<string, string> = { ...(component.specifications as any || {}) };
  
    for (const specValue of component.specValues) {
      specs[specValue.specKey.name] = specValue.value;
    }    // Calculate if discount is valid
    let discountPrice = null;
    if (component.discountPrice && component.discountExpiresAt) {
      const now = new Date();
      if (now < component.discountExpiresAt) {
        discountPrice = component.discountPrice;
      }
    } else if (component.discountPrice) {
      discountPrice = component.discountPrice;
    }

    return NextResponse.json({
      id: component.id,
      type: 'component',
      name: component.name,
      category: component.category.name,
      description: component.description || '',
      specifications: specs,
      price: component.price,
      discountPrice: discountPrice,
      discountExpiresAt: component.discountExpiresAt,
      imageUrl: component.imageUrl,
      stock: component.stock,
      ratings: {
        average: 4.3,
        count: 18,
      }
    });  } catch (error) {
    console.error(`Error fetching component with ID ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}