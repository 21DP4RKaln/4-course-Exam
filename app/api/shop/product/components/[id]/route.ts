import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { extractComponentSpecifications } from '@/lib/services/unifiedProductService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { params } = context;
    const resolvedParams = await params;
    const id = resolvedParams.id;console.log('Fetching component with ID:', id);    const component = await prisma.component.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        cpu: true,
        gpu: true,
        motherboard: true,
        ram: true,
        storage: true,
        psu: true,
        cooling: true,
        caseModel: true
      }
    });

    if (!component) {
      console.log('Component not found');
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }    console.log('Raw component data:', JSON.stringify({
      ...component,
      category: component.category?.name
    }, null, 2));
    
    const specs = extractComponentSpecifications(component);
    
    console.log('Final specifications:', specs);
    
    let discountPrice = null;
    if (component.discountPrice && component.discountExpiresAt) {
      const now = new Date();
      if (now < component.discountExpiresAt) {
        discountPrice = component.discountPrice;
      }
    } else if (component.discountPrice) {
      discountPrice = component.discountPrice;
    }    return NextResponse.json({
      id: component.id,
      type: 'component',
      name: component.name,
      category: component.category.name,
      description: component.description || '',
      specifications: specs,
      price: component.price,
      discountPrice: discountPrice,
      discountExpiresAt: component.discountExpiresAt,
      imageUrl: component.imagesUrl, 
      stock: component.quantity, 
      rating: component.rating || 0,
      ratingCount: component.ratingCount || 0,
      ratings: {
        average: component.rating || 0,
        count: component.ratingCount || 0,
      }    });
  } catch (error) {
    const resolvedParams = await context.params;
    console.error(`Error fetching component with ID ${resolvedParams.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}