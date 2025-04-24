import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createNotFoundResponse,
  createServerErrorResponse,
  createBadRequestResponse 
} from '@/lib/apiErrors'
import { z } from 'zod'

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

    const orderId = params.id
  
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        configuration: {
          select: {
            id: true,
            name: true,
            components: {
              include: {
                component: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return createNotFoundResponse('Order not found')
    }
   
    const items = order.configuration?.components.map(item => ({
      id: item.component.id,
      name: item.component.name,
      type: 'component',
      quantity: item.quantity,
      price: item.component.price
    })) || []

    const formattedOrder = {
      id: order.id,
      userId: order.userId,
      userName: order.user.name || 'Anonymous',
      email: order.user.email,
      status: order.status,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      configuration: order.configuration ? {
        id: order.configuration.id,
        name: order.configuration.name
      } : null,
      items
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error('Error fetching order:', error)
    return createServerErrorResponse('Failed to fetch order details')
  }
}

export async function PUT(
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

    const orderId = params.id
    
    const body = await request.json()
    
    const orderSchema = z.object({
      status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']),
      shippingAddress: z.string().optional(),
      paymentMethod: z.string().optional()
    })
    
    const validationResult = orderSchema.safeParse(body)
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid input data', {
        errors: validationResult.error.format()
      })
    }
    
    const { status, shippingAddress, paymentMethod } = validationResult.data

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!existingOrder) {
      return createNotFoundResponse('Order not found')
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        shippingAddress,
        paymentMethod
      }
    })

    return NextResponse.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      shippingAddress: updatedOrder.shippingAddress,
      paymentMethod: updatedOrder.paymentMethod
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return createServerErrorResponse('Failed to update order')
  }
}