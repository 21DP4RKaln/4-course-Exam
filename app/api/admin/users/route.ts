import { NextRequest, NextResponse } from 'next/server'
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
 
    const users = [
      {
        id: "1",
        name: "Admin User",
        email: "admin@ivapro.com",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
        orderCount: 0
      }
    ]

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return createServerErrorResponse('Failed to fetch users')
  }
}