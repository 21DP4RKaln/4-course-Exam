import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { prisma } from '@/lib/prismaService'
import { z } from 'zod'
import { ProductType } from '@prisma/client'

const createReviewSchema = z.object({
  productId: z.string().uuid(),
  productType: z.enum(['CONFIGURATION', 'COMPONENT', 'PERIPHERAL']),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000).optional(),
  purchaseDate: z.string().nullable().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const productType = searchParams.get('productType')
    
    if (!productId || !productType) {
      return NextResponse.json({ error: 'Product ID and type are required' }, { status: 400 })
    }

    if (!['CONFIGURATION', 'COMPONENT', 'PERIPHERAL'].includes(productType)) {
      return NextResponse.json({ error: 'Invalid product type' }, { status: 400 })
    }

    const token = getJWTFromRequest(request)
    let currentUserId = null

    if (token) {
      const payload = await verifyJWT(token)
      if (payload) {
        currentUserId = payload.userId
      }
    }

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

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    const formattedReviews = reviews.map(review => {
      const helpfulCount = review.helpful.filter(h => h.isHelpful).length
      const notHelpfulCount = review.helpful.filter(h => !h.isHelpful).length

      let userVote = null
      if (currentUserId) {
        const userVoteData = review.helpful.find(h => h.userId === currentUserId)
        if (userVoteData) {
          userVote = userVoteData.isHelpful ? 'helpful' : 'not-helpful'
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
        notHelpfulCount,
        userVote,
        userProfileImage: review.user.profileImageUrl
      }
    })

    return NextResponse.json({
      reviews: formattedReviews,
      averageRating,
      reviewCount: reviews.length,
      distribution: calculateRatingDistribution(reviews)
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return createServerErrorResponse('Failed to fetch reviews')
  }
}

function calculateRatingDistribution(reviews: any[]) {
  const distribution = [0, 0, 0, 0, 0]
  reviews.forEach(review => {
    distribution[review.rating - 1]++
  })
  return distribution
}

export async function POST(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    const userId = payload.userId

    const body = await request.json()

    const validationResult = createReviewSchema.safeParse(body)
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid review data', validationResult.error.flatten())
    }

    const { productId, productType, rating, comment, purchaseDate } = validationResult.data

    let productExists = false
    switch (productType) {
      case 'CONFIGURATION':
        productExists = !!(await prisma.configuration.findUnique({ where: { id: productId } }))
        break
      case 'COMPONENT':
        productExists = !!(await prisma.component.findUnique({ where: { id: productId } }))
        break
      case 'PERIPHERAL':
        productExists = !!(await prisma.peripheral.findUnique({ where: { id: productId } }))
        break
    }

    if (!productExists) {
      return createBadRequestResponse('Product not found')
    }

    const hasPurchased = await checkIfUserPurchased(userId, productId, productType)
    if (!hasPurchased) {
      return createBadRequestResponse('You can only review products you have purchased')
    }

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
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImageUrl: true
            }
          }
        }
      })

      return NextResponse.json(updatedReview)
    } else {
      const newReview = await prisma.review.create({
        data: {
          userId,
          productId,
          productType: productType as ProductType,
          rating,
          comment,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImageUrl: true
            }
          }
        }
      })

      return NextResponse.json(newReview)
    }
  } catch (error) {
    console.error('Error creating review:', error)
    return createServerErrorResponse('Failed to create review')
  }
}

async function checkIfUserPurchased(userId: string, productId: string, productType: string): Promise<boolean> {
  if (productType === 'CONFIGURATION') {
    const order = await prisma.order.findFirst({
      where: {
        userId,
        configurationId: productId,
        status: {
          in: ['COMPLETED', 'PROCESSING']
        }
      }
    })
    return !!order
  }

  return true
}