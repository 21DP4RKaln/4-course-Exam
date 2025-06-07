import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { extractPeripheralSpecifications } from '@/lib/services/unifiedProductService';

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
        id,
      },
      include: {
        category: true,
        keyboard: true,
        mouse: true,
        microphone: true,
        camera: true,
        monitor: true,
        headphones: true,
        speakers: true,
        gamepad: true,
        mousePad: true,
      },
    });

    if (!peripheral) {
      return NextResponse.json(
        { error: 'Peripheral not found' },
        { status: 404 }
      );
    }
    const specs = extractPeripheralSpecifications(peripheral);

    console.log('Peripheral specifications:', specs);

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
      imageUrl: peripheral.imagesUrl,
      stock: peripheral.quantity,
      rating: peripheral.rating || 0,
      ratingCount: peripheral.ratingCount || 0,
      ratings: {
        average: peripheral.rating || 0,
        count: peripheral.ratingCount || 0,
      },
    });
  } catch (error) {
    console.error(
      `Error fetching peripheral with ID ${context.params.id}:`,
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
