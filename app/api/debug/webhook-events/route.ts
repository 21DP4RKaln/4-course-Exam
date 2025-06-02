import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: token.sub }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get webhook-related audit logs
    const whereClause: any = {
      entityType: 'ORDER',
      OR: [
        { details: { contains: 'stripe' } },
        { details: { contains: 'checkout.session' } },
        { details: { contains: 'payment_intent' } },
        { details: { contains: 'webhook' } }
      ]
    }

    if (orderId) {
      whereClause.entityId = orderId
    }

    const webhookEvents = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Get total count
    const totalCount = await prisma.auditLog.count({
      where: whereClause
    })

    // Parse and enhance webhook events
    const enhancedEvents = webhookEvents.map(event => {
      let parsedDetails = {}
      try {
        parsedDetails = JSON.parse(event.details)
      } catch (e) {
        parsedDetails = { raw: event.details }
      }

      return {
        ...event,
        parsedDetails,
        isWebhookEvent: event.details.includes('stripe') || 
                       event.details.includes('checkout.session') ||
                       event.details.includes('payment_intent')
      }
    })

    // Get summary statistics
    const stats = {
      totalEvents: totalCount,
      eventTypes: {},
      recentEvents: enhancedEvents.slice(0, 10),
      statusDistribution: {}
    }

    // Count event types
    enhancedEvents.forEach(event => {
      const eventType = event.parsedDetails.event || 'unknown'
      stats.eventTypes[eventType] = (stats.eventTypes[eventType] || 0) + 1
    })

    return NextResponse.json({
      events: enhancedEvents,
      stats,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching webhook events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
