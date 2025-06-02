import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { getToken } from 'next-auth/jwt'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request })
    const orderId = params.id

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order with all related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to view this order
    if (!token?.sub) {
      // Guest order - anyone can view (for order confirmation)
      if (!order.isGuestOrder) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    } else {
      // Authenticated user - must own the order or be admin
      const user = await prisma.user.findUnique({
        where: { id: token.sub }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        )
      }

      const isOwner = order.userId === user.id
      const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF'

      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    // Add debug information for admins
    let debugInfo = null
    if (token?.sub) {
      const user = await prisma.user.findUnique({
        where: { id: token.sub }
      })
      
      if (user && (user.role === 'ADMIN' || user.role === 'STAFF')) {
        debugInfo = {
          orderAge: Date.now() - order.createdAt.getTime(),
          lastUpdated: order.updatedAt,
          auditLogCount: order.auditLogs.length,
          hasStripeEvents: order.auditLogs.some(log => 
            log.details.includes('stripe') || 
            log.details.includes('checkout.session') ||
            log.details.includes('payment_intent')
          )
        }
      }
    }

    return NextResponse.json({
      order,
      debugInfo
    })

  } catch (error) {
    console.error('Error fetching order status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
