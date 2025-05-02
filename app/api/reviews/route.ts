// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { prisma } from '@/lib/prismaService'
import { z } from 'zod'
import { ProductType } from '@prisma/client'

// Schema for review creation
const createReviewSchema = z.object({
  productId: z.string().uuid(),
  productType: z.enum(['CONFIGURATION', 'COMPONENT', 'PERIPHERAL']),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
  purchaseDate: z.string().nullable().optional()
})

// Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const productType = searchParams.get('productType')
    
    if (!productId || !productType) {
      return NextResponse.json({ error: 'Product ID and type are required' }, { status: 400 })
    }

    // Validate product type
    if (!['CONFIGURATION', 'COMPONENT', 'PERIPHERAL'].includes(productType)) {
      return NextResponse.json({ error: 'Invalid product type' }, { status: 400 })
    }

    // Get current user from auth token (if any)
    const token = getJWTFromRequest(request)
    let currentUserId = null

    if (token) {
      const payload = await verifyJWT(token)
      if (payload) {
        currentUserId = payload.userId
      }
    }

    // Fetch reviews for the product
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        productType: productType as ProductType
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true
          }
        },
        helpful: true
      }
    })

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    // Format the reviews with helpful counts and user's vote
    const formattedReviews = reviews.map(review => {
      // Count helpful votes
      const helpfulCount = review.helpful.filter(h => h.isHelpful).length
      
      // If authenticated, check if user has voted on this review
      let isHelpful = undefined
      if (currentUserId) {
        const userVote = review.helpful.find(h => h.userId === currentUserId)
        if (userVote) {
          isHelpful = userVote.isHelpful
        }
      }

      return {
        id: review.id,
        userId: review.userId,
        username: review.user.name || 'Anonymous',
        rating: review.rating,
        comment: review.comment || '',
        purchaseDate: review.purchaseDate?.toISOString() || null,
        createdAt: review.createdAt.toISOString(),
        helpfulCount,
        isHelpful,
        userProfileImage: review.user.profileImageUrl
      }
    })

    return NextResponse.json({
      reviews: formattedReviews,
      averageRating,
      reviewCount: reviews.length
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return createServerErrorResponse('Failed to fetch reviews')
  }
}

// Create a new review
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    const userId = payload.userId

    // Parse request body
    const body = await request.json()
    
    // Validate input data
    const validationResult = createReviewSchema.safeParse(body)
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid review data', validationResult.error.flatten())
    }

    const { productId, productType, rating, comment, purchaseDate } = validationResult.data

    // Check if product exists
    let productExists = false
    switch (productType) {
      case 'CONFIGURATION':
        productExists = !!(await prisma.configuration.findUnique({ where: { id: productId } }))
        break
      case 'COMPONENT':
      case 'PERIPHERAL': 
        productExists = !!(await prisma.component.findUnique({ where: { id: productId } }))
        break
    }

    if (!productExists) {
      return createBadRequestResponse('Product not found')
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId_productType: {
          userId,
          productId,
          productType: productType as ProductType
        }
      }
    })

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
          updatedAt: new Date()
        }
      })

      return NextResponse.json(updatedReview)
    } else {
      // Create new review
      const newReview = await prisma.review.create({
        data: {
          userId,
          productId,
          productType: productType as ProductType,
          rating,
          comment,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null
        }
      })

      return NextResponse.json(newReview)
    }
  } catch (error) {
    console.error('Error creating review:', error)
    return createServerErrorResponse('Failed to create review')
  }
}