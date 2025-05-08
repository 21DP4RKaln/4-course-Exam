import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'

export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const productType = searchParams.get('productType')?.toUpperCase()
    
    if (!productId || !productType) {
      return createBadRequestResponse('Product ID and type are required')
    }

    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId: payload.userId,
        productId: productId,
        productType: productType
      }
    })

    return NextResponse.json({ isWishlisted: !!wishlistItem })
  } catch (error) {
    console.error('Error checking wishlist status:', error)
    return createServerErrorResponse('Failed to check wishlist status')
  }
}