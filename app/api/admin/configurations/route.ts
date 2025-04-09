import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createServerErrorResponse 
} from '@/lib/apiErrors'

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }
   
    const configs = await prisma.configuration.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
 
    const formattedConfigs = configs.map(config => ({
      id: config.id,
      name: config.name,
      userId: config.userId || '',
      userName: config.user?.name || 'Anonymous',
      status: config.status,
      isTemplate: config.isTemplate,
      isPublic: config.isPublic,
      totalPrice: config.totalPrice,
      createdAt: config.createdAt.toISOString()
    }))

    return NextResponse.json(formattedConfigs)
  } catch (error) {
    console.error('Error fetching configurations:', error)
    return createServerErrorResponse('Failed to fetch configurations')
  }
}