import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { prisma } from '@/lib/prismaService'
import { getAuditLogs, exportAuditLogs, createAuditLog } from '@/lib/services/auditService'

export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authorized and is an admin
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return createUnauthorizedResponse('Unauthorized: Admin access required')
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const entityType = searchParams.get('entityType')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const format = searchParams.get('format') as 'json' | 'csv' || 'json'
    
    // Build filters object
    const filters: any = {}
    
    if (userId) filters.userId = userId
    if (action) filters.action = action
    if (entityType) filters.entityType = entityType
    
    // Date filtering
    if (fromDate || toDate) {
      filters.dateRange = {}
      
      if (fromDate) {
        filters.dateRange.start = new Date(fromDate)
      } else {
        filters.dateRange.start = new Date(0) // Default to earliest date
      }
      
      if (toDate) {
        filters.dateRange.end = new Date(toDate)
      } else {
        filters.dateRange.end = new Date() // Default to current date
      }
    }

    // Check if this is an export request
    if (format === 'csv') {
      const csvData = await exportAuditLogs(filters, 'csv')
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Fetch logs with pagination
    const result = await getAuditLogs(filters, { page, limit })

    // Log this audit viewing
    await createAuditLog({
      userId: payload.userId,
      action: 'view',
      entityType: 'audit_logs',
      details: { filters },
      ipAddress: request.headers.get('x-forwarded-for') || require('request-ip').getClientIp(request) || '',
      userAgent: request.headers.get('user-agent') || ''
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return createServerErrorResponse('Failed to fetch audit logs')
  }
}

// Add a new audit log entry
export async function POST(request: NextRequest) {
  try {
    // Verify that the user is authorized
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    // Get the request body
    const body = await request.json()
    
    const {
      action,
      entityType,
      entityId,
      details,
    } = body

    // Validate required fields
    if (!action || !entityType) {
      return NextResponse.json(
        { error: 'Missing required fields: action and entityType are required' },
        { status: 400 }
      )
    }

    // Create the audit log entry
    const auditLog = await createAuditLog({
      userId: payload.userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress: request.headers.get('x-forwarded-for') || require('request-ip').getClientIp(request) || '',
      userAgent: request.headers.get('user-agent') || ''
    })

    return NextResponse.json(auditLog)
  } catch (error) {
    console.error('Error creating audit log:', error)
    return createServerErrorResponse('Failed to create audit log')
  }
}