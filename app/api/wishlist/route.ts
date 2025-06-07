import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createBadRequestResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { prisma } from '@/lib/prismaService';

export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) return createUnauthorizedResponse('Authentication required');

    const payload = await verifyJWT(token);
    if (!payload) return createUnauthorizedResponse('Invalid token');

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
    });

    const itemsWithDetails = await Promise.all(
      wishlistItems.map(async item => {
        let productDetails = null;

        switch (item.productType) {
          case 'CONFIGURATION':
            const config = await prisma.configuration.findUnique({
              where: { id: item.productId },
            });

            if (config)
              productDetails = {
                name: config.name,
                price: config.totalPrice,
                imageUrl: config.imageUrl,
              };
            break;

          case 'COMPONENT':
            const component = await prisma.component.findUnique({
              where: { id: item.productId },
            });
            if (component)
              productDetails = {
                name: component.name,
                price: component.price,
                imageUrl: component.imagesUrl,
              };
            break;

          case 'PERIPHERAL':
            const peripheral = await prisma.peripheral.findUnique({
              where: { id: item.productId },
            });
            if (peripheral)
              productDetails = {
                name: peripheral.name,
                price: peripheral.price,
                imageUrl: peripheral.imagesUrl,
              };
            break;
        }

        return {
          id: item.id,
          productId: item.productId,
          productType: item.productType,
          createdAt: item.createdAt,
          ...productDetails,
        };
      })
    );

    return NextResponse.json(itemsWithDetails);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return createServerErrorResponse('Failed to fetch wishlist');
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) return createUnauthorizedResponse('Authentication required');

    const payload = await verifyJWT(token);
    if (!payload) return createUnauthorizedResponse('Invalid token');

    const { productId, productType } = await request.json();

    let productExists = false;
    switch (productType) {
      case 'CONFIGURATION':
        productExists = !!(await prisma.configuration.findUnique({
          where: { id: productId },
        }));
        break;
      case 'COMPONENT':
        productExists = !!(await prisma.component.findUnique({
          where: { id: productId },
        }));
        break;
      case 'PERIPHERAL':
        productExists = !!(await prisma.peripheral.findUnique({
          where: { id: productId },
        }));
        break;
    }

    if (!productExists) {
      return createBadRequestResponse('Product not found');
    }

    const wishlistItem = await prisma.wishlist
      .create({
        data: {
          userId: payload.userId,
          productId,
          productType,
        },
      })
      .catch(() => null);

    return NextResponse.json({
      success: true,
      inWishlist: true,
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return createServerErrorResponse('Failed to add to wishlist');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) return createUnauthorizedResponse('Authentication required');

    const payload = await verifyJWT(token);
    if (!payload) return createUnauthorizedResponse('Invalid token');

    const { productId, productType } = await request.json();

    await prisma.wishlist.deleteMany({
      where: {
        userId: payload.userId,
        productId,
        productType,
      },
    });

    return NextResponse.json({
      success: true,
      inWishlist: false,
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return createServerErrorResponse('Failed to remove from wishlist');
  }
}
