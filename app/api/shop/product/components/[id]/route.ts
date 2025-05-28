import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { parseSpecifications, withDebugInfo } from '@/lib/utils/specifications';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const id = params.id;
    console.log('Fetching component with ID:', id);
    
    // Debug: Check spec values directly
    const specValuesCheck = await prisma.componentSpec.findMany({
      where: {
        componentId: id
      },
      include: {
        specKey: true
      }
    });
    console.log('Direct spec values check:', JSON.stringify(specValuesCheck, null, 2));
    
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
      console.log('Component not found');
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    console.log('Raw component data:', JSON.stringify({
      ...component,
      specifications: component.specifications ? JSON.stringify(component.specifications) : null,
      specValues: component.specValues?.map(sv => ({
        value: sv.value,
        key: sv.specKey?.name,
        displayName: sv.specKey?.displayName
      }))
    }, null, 2));
    
    // Collect all specifications
    let specs: Record<string, string> = {};
    
    // 1. Parse legacy specifications from JSON field
    if (component.specifications) {
      try {
        console.log('Parsing legacy specifications:', component.specifications);
        const parsedSpecs = parseSpecifications(component.specifications);
        console.log('Parsed legacy specifications:', parsedSpecs);
        if (parsedSpecs && typeof parsedSpecs === 'object') {
          specs = { ...specs, ...parsedSpecs };
          console.log('Specs after adding legacy:', specs);
        }
      } catch (error) {
        console.error('Error parsing legacy specifications:', error);
      }
    }

    // 2. Add specification values from the specValues relation
    if (component.specValues && Array.isArray(component.specValues)) {
      console.log('Processing specValues:', component.specValues);
      component.specValues.forEach((specValue) => {
        if (specValue.specKey?.name && specValue.value) {
          // Use display name as the key if available, otherwise use the name          // Always use display name to match the UI
          const key = specValue.specKey.displayName;
          if (key) {
            specs[key] = specValue.value;
          }
        }
      });
      console.log('Specs after adding specValues:', specs);
    }
    
    // Add debug info in development environment
    if (process.env.NODE_ENV === 'development') {
      specs = withDebugInfo(specs);
    }
    
    console.log('Final specifications:', specs);
    
    // Calculate if discount is valid
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
    });
  } catch (error) {
    console.error(`Error fetching component with ID ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}