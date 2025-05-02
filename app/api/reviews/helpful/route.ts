// app/api/reviews/helpful/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { prisma } from '@/lib/prismaService'
import { z } from 'zod'

// Schema for helpful vote
const helpfulVoteSchema = z.object({
  reviewId: z.string().uuid(),
  isHelpful: z.boolean()
})

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
    const validationResult = helpfulVoteSchema.safeParse(body)
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid data', validationResult.error.flatten())
    }

    const { reviewId, isHelpful } = validationResult.data

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return createBadRequestResponse('Review not found')
    }

    // Prevent users from voting on their own reviews
    if (review.userId === userId) {
      return createBadRequestResponse('You cannot vote on your own reviews')
    }

    // Check if user already voted
    const existingVote = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId
        }
      }
    })

    if (existingVote) {
      // If the vote is the same, remove it (toggle off)
      if (existingVote.isHelpful === isHelpful) {
        await prisma.reviewHelpful.delete({
          where: { id: existingVote.id }
        })
        
        return NextResponse.json({ removed: true })
      } 
      // Otherwise, update the vote
      else {
        const updatedVote = await prisma.reviewHelpful.update({
          where: { id: existingVote.id },
          data: { isHelpful }
        })
        
        return NextResponse.json(updatedVote)
      }
    } else {
      // Create new vote
      const newVote = await prisma.reviewHelpful.create({
        data: {
          reviewId,
          userId,
          isHelpful
        }
      })
      
      return NextResponse.json(newVote)
    }
  } catch (error) {
    console.error('Error processing helpful vote:', error)
    return createServerErrorResponse('Failed to process vote')
  }
}