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
 
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }
 
    const components = await prisma.component.findMany({
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedComponents = components.map(component => ({
      id: component.id,
      name: component.name,
      category: component.category.name,
      price: component.price,
      stock: component.stock,
      createdAt: component.createdAt.toISOString()
    }))

    return NextResponse.json(formattedComponents)
  } catch (error) {
    console.error('Error fetching components:', error)
    return createServerErrorResponse('Failed to fetch components')
  }
}