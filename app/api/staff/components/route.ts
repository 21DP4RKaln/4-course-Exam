import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
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

    if (!['ADMIN', 'SPECIALIST'].includes(payload.role)) {
      return createUnauthorizedResponse('Insufficient permissions')
    }    
    const components = await prisma.component.findMany({
      where: {
        quantity: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const formattedComponents = components.map(component => ({
      id: component.id,
      name: component.name,
      price: component.price,
      stock: component.quantity,
      category: component.category.name
    }))

    return NextResponse.json(formattedComponents)
  } catch (error) {
    console.error('Error fetching components:', error)
    return createServerErrorResponse('Failed to fetch components')
  }
}
