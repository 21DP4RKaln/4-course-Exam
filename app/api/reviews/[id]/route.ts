import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createBadRequestResponse,
  createServerErrorResponse,
  createNotFoundResponse,
} from '@/lib/apiErrors';
import { prisma } from '@/lib/prismaService';
import { updateProductRating } from '@/lib/ratingUtils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    const userId = payload.userId;
    const reviewId = params.id;

    if (!reviewId) {
      return createBadRequestResponse('Review ID is required');
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return createNotFoundResponse('Review not found');
    }

    if (review.userId !== userId) {
      return createUnauthorizedResponse('You can only delete your own reviews');
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    await updateProductRating(review.productId, review.productType);

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return createServerErrorResponse('Failed to delete review');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    const userId = payload.userId;
    const reviewId = params.id;

    if (!reviewId) {
      return createBadRequestResponse('Review ID is required');
    }

    const body = await request.json();
    const { rating, comment, purchaseDate } = body;

    if (!rating || rating < 1 || rating > 5) {
      return createBadRequestResponse('Rating must be between 1 and 5');
    }

    if (!comment || comment.trim().length === 0) {
      return createBadRequestResponse('Comment is required');
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return createNotFoundResponse('Review not found');
    }

    if (existingReview.userId !== userId) {
      return createUnauthorizedResponse('You can only edit your own reviews');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment: comment.trim(),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
          },
        },
      },
    });

    await updateProductRating(
      existingReview.productId,
      existingReview.productType
    );

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return createServerErrorResponse('Failed to update review');
  }
}
