import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';

export async function GET(request: NextRequest) {
  try {
    const peripherals = await prisma.component.findMany({
      where: {
        category: {
          type: 'peripheral'
        }
      },
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

    const formattedPeripherals = peripherals.map(peripheral => {
      const specs: Record<string, string> = { ...(peripheral.specifications as any || {}) };
      
      for (const specValue of peripheral.specValues) {
        specs[specValue.specKey.name] = specValue.value;
      }

      return {
        id: peripheral.id,
        type: 'peripheral',
        name: peripheral.name,
        category: peripheral.category.name,
        description: peripheral.description || '',
        specifications: specs,
        price: peripheral.price,
        discountPrice: null,
        imageUrl: peripheral.imageUrl,
        stock: peripheral.stock,
        ratings: {
          average: 4.2,
          count: 12,
        }
      };
    });

    return NextResponse.json(formattedPeripherals);
  } catch (error) {
    console.error('Error fetching peripherals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}