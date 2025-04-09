import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createNotFoundResponse,
  createServerErrorResponse 
} from '@/lib/apiErrors'

export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    const userId = params.id
  
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: true,
        _count: {
          select: {
            orders: true,
            configurations: true
          }
        }
      }
    })

    if (!user) {
      return createNotFoundResponse('User not found')
    }

    const formattedUser = {
      id: user.id,
      name: user.name || 'Anonymous',
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      orderCount: user._count.orders,
      configCount: user._count.configurations,
      orders: user.orders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toISOString()
      }))
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return createServerErrorResponse('Failed to fetch user details')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    const userId = params.id
  
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) {
      return createNotFoundResponse('User not found')
    }

    if (user.role === 'ADMIN' && userId !== payload.userId) {
      return createForbiddenResponse('Cannot delete other admin accounts')
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return createServerErrorResponse('Failed to delete user')
  }
}