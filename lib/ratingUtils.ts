import { prisma } from '@/lib/prismaService';
import { ProductType } from '@prisma/client';

/**
 * Recalculates and updates the rating fields for a product based on all its reviews
 */
export async function updateProductRating(
  productId: string,
  productType: ProductType
): Promise<void> {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        productType,
      },
      select: {
        rating: true,
      },
    });

    const ratingCount = reviews.length;
    const averageRating =
      ratingCount > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / ratingCount
        : 0;

    switch (productType) {
      case 'COMPONENT':
        await prisma.component.update({
          where: { id: productId },
          data: {
            rating: averageRating,
            ratingCount,
          },
        });
        break;

      case 'PERIPHERAL':
        await prisma.peripheral.update({
          where: { id: productId },
          data: {
            rating: averageRating,
            ratingCount,
          },
        });
        break;

      case 'CONFIGURATION':
        break;

      default:
        throw new Error(`Unsupported product type: ${productType}`);
    }
  } catch (error) {
    console.error(
      `Error updating rating for ${productType} ${productId}:`,
      error
    );
    throw error;
  }
}

/**
 * Batch update ratings for all products of a specific type
 */
export async function updateAllProductRatings(
  productType: ProductType
): Promise<void> {
  try {
    let products: { id: string }[] = [];

    switch (productType) {
      case 'COMPONENT':
        products = await prisma.component.findMany({
          select: { id: true },
        });
        break;

      case 'PERIPHERAL':
        products = await prisma.peripheral.findMany({
          select: { id: true },
        });
        break;

      default:
        throw new Error(
          `Unsupported product type for batch update: ${productType}`
        );
    }

    for (const product of products) {
      await updateProductRating(product.id, productType);
    }

    console.log(
      `Updated ratings for ${products.length} ${productType.toLowerCase()}s`
    );
  } catch (error) {
    console.error(`Error batch updating ${productType} ratings:`, error);
    throw error;
  }
}

/**
 * Initialize ratings for all existing products based on their current reviews
 */
export async function initializeAllRatings(): Promise<void> {
  try {
    await updateAllProductRatings('COMPONENT');
    await updateAllProductRatings('PERIPHERAL');
    console.log('Successfully initialized all product ratings');
  } catch (error) {
    console.error('Error initializing ratings:', error);
    throw error;
  }
}
