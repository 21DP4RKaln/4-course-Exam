import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { getJWTFromRequest, verifyJWT } from '@/lib/jwt'
import { createUnauthorizedResponse, createServerErrorResponse } from '@/lib/apiErrors'

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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return createUnauthorizedResponse('User not found')
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Auth check error:', error)
    return createServerErrorResponse('Failed to authenticate user')
  }
}