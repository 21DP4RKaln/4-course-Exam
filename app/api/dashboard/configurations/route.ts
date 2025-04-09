// app/api/dashboard/configurations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { getUserConfigurations } from '@/lib/services/dashboardService'

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    const userId = payload.userId
    const configurations = await getUserConfigurations(userId)

    return NextResponse.json(configurations)
  } catch (error) {
    console.error('Error fetching user configurations:', error)
    return createServerErrorResponse('Failed to fetch configurations')
  }
}

// app/api/dashboard/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { getUserOrders } from '@/lib/services/dashboardService'

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    const userId = payload.userId
    const orders = await getUserOrders(userId)

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return createServerErrorResponse('Failed to fetch orders')
  }
}

// app/api/dashboard/configurations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createNotFoundResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { getConfigurationById } from '@/lib/services/dashboardService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    const userId = payload.userId
    const configId = params.id
    const configuration = await getConfigurationById(configId, userId)

    if (!configuration) {
      return createNotFoundResponse('Configuration not found')
    }

    return NextResponse.json(configuration)
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return createServerErrorResponse('Failed to fetch configuration details')
  }
}

// app/api/dashboard/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createNotFoundResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { getOrderById } from '@/lib/services/dashboardService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    const userId = payload.userId
    const orderId = params.id
    const order = await getOrderById(orderId, userId)

    if (!order) {
      return createNotFoundResponse('Order not found')
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return createServerErrorResponse('Failed to fetch order details')
  }
}