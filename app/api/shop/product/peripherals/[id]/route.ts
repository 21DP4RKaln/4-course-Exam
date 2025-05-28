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
    console.log('Fetching peripheral with ID:', id);
    
    const peripheral = await prisma.peripheral.findUnique({
      where: {
        id
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

    if (!peripheral) {
      return NextResponse.json(
        { error: 'Peripheral not found' },
        { status: 404 }
      );
    }
    
    // Collect all specifications
    let specs: Record<string, string> = {};
    
    // 1. Parse legacy specifications from JSON field
    if (peripheral.specifications) {
      try {
        const parsedSpecs = parseSpecifications(peripheral.specifications);
        if (parsedSpecs && typeof parsedSpecs === 'object') {
          specs = { ...specs, ...parsedSpecs };
        }
      } catch (error) {
        console.error('Error parsing legacy specifications:', error);
      }
    }

    // 2. Add specification values from the specValues relation
    if (peripheral.specValues && Array.isArray(peripheral.specValues)) {
      peripheral.specValues.forEach((specValue) => {
        if (specValue.specKey?.name && specValue.value) {
          // Use display name as the key if available, otherwise use the name
          const key = specValue.specKey.displayName || specValue.specKey.name;
          specs[key] = specValue.value;
        }
      });
    }
    
    // Add debug info in development environment
    if (process.env.NODE_ENV === 'development') {
      specs = withDebugInfo(specs);
    }
    
    console.log('Peripheral specifications:', specs);
    
    // Calculate if discount is valid
    let discountPrice = null;
    if (peripheral.discountPrice && peripheral.discountExpiresAt) {
      const now = new Date();
      if (now < peripheral.discountExpiresAt) {
        discountPrice = peripheral.discountPrice;
      }
    } else if (peripheral.discountPrice) {
      discountPrice = peripheral.discountPrice;
    }

    return NextResponse.json({
      id: peripheral.id,
      type: 'peripheral', 
      name: peripheral.name,
      category: peripheral.category.name,
      description: peripheral.description || '',
      specifications: specs,
      price: peripheral.price,
      discountPrice: discountPrice,
      discountExpiresAt: peripheral.discountExpiresAt,
      imageUrl: peripheral.imageUrl,
      stock: peripheral.stock,
      ratings: {
        average: 4.2,
        count: 12
      }
    });
  } catch (error) {
    console.error(`Error fetching peripheral with ID ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
