import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'

export async function GET(request: NextRequest) {
  try {
    // Get pending orders
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        isGuestOrder: true,
        locale: true
      }
    })

    const count = await prisma.order.count({
      where: {
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      count,
      orders: pendingOrders
    })
  } catch (error) {
    console.error('Error fetching pending orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending orders' },
      { status: 500 }
    )
  }
}
