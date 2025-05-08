import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { prisma } from '@/lib/prismaService'
import { z } from 'zod'

const helpfulVoteSchema = z.object({
  reviewId: z.string().uuid(),
  isHelpful: z.boolean()
})

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
   
    const validationResult = helpfulVoteSchema.safeParse(body)
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid data', validationResult.error.flatten())
    }

    const { reviewId, isHelpful } = validationResult.data
    
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return createBadRequestResponse('Review not found')
    }
   
    if (review.userId === userId) {
      return createBadRequestResponse('You cannot vote on your own reviews')
    }

    const existingVote = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId
        }
      }
    })

    if (existingVote) {
      if (existingVote.isHelpful === isHelpful) {
        await prisma.reviewHelpful.delete({
          where: { id: existingVote.id }
        })
        
        return NextResponse.json({ removed: true })
      } 
      else {
        const updatedVote = await prisma.reviewHelpful.update({
          where: { id: existingVote.id },
          data: { isHelpful }
        })
        
        return NextResponse.json(updatedVote)
      }
    } else {
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