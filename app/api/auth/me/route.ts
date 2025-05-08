import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt'
import { createUnauthorizedResponse, createServerErrorResponse } from '@/lib/apiErrors'

export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request)
    
    if (!token) {
      console.log('No token found in /me request')
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    
    if (!payload) {
      console.log('Invalid or expired token in /me request')
      return createUnauthorizedResponse('Invalid token')
    }

    console.log('Fetching user data for:', payload.userId)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        profileImageUrl: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      console.log('User not found:', payload.userId)
      return createUnauthorizedResponse('User not found')
    }

    if (user.isBlocked) {
      console.log('Blocked user attempted access:', payload.userId)
      return createUnauthorizedResponse('Account is blocked')
    }

    console.log('Successfully fetched user data for:', payload.userId)
    return NextResponse.json(user)
  } catch (error) {
    console.error('Auth check error:', error)
    return createServerErrorResponse('Failed to authenticate user')
  }
}