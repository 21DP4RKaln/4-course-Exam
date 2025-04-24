import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { getUserConfigurations } from '@/lib/services/dashboardService'

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

    const userId = payload.userId
    const configurations = await getUserConfigurations(userId)

    return NextResponse.json(configurations)
  } catch (error) {
    console.error('Error fetching user configurations:', error)
    return createServerErrorResponse('Failed to fetch configurations')
  }
}