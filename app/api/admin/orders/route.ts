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
  
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        configuration: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedOrders = orders.map(order => {
      const itemCount = order.configuration ? 1 : 0; 
      
      return {
        id: order.id,
        userId: order.userId,
        userName: order.user.name || 'Anonymous',
        email: order.user.email,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toISOString(),
        itemCount: itemCount
      };
    });

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return createServerErrorResponse('Failed to fetch orders')
  }
}