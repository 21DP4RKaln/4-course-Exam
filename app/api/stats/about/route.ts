import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { createServerErrorResponse } from '@/lib/apiErrors'

export async function GET(request: NextRequest) {
  try {
    // Get the count of completed configurations
    const configurationsCount = await prisma.configuration.count({
      where: {
        status: 'APPROVED',
      },
    })

    // Get the count of customers (users with USER role)
    const customersCount = await prisma.user.count({
      where: {
        role: 'USER',
      },
    })

    // Get the count of completed orders
    const ordersCount = await prisma.order.count({
      where: {
        status: 'COMPLETED',
      },
    })

    // Calculate years in business based on the oldest user
    const oldestUser = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
    })

    let yearsInBusiness = 1 // Default to 1 year
    if (oldestUser) {
      const startYear = oldestUser.createdAt.getFullYear()
      const currentYear = new Date().getFullYear()
      yearsInBusiness = currentYear - startYear
      if (yearsInBusiness < 1) yearsInBusiness = 1 // Always at least 1 year
    }

    // Format numbers with commas for thousands
    const formatNumber = (num: number): string => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    return NextResponse.json({
      computersBuilt: formatNumber(configurationsCount),
      customers: formatNumber(customersCount),
      completedOrders: formatNumber(ordersCount),
      yearsInBusiness
    })
  } catch (error) {
    console.error('Error retrieving statistics:', error)
    return createServerErrorResponse('Failed to retrieve statistics')
  }
}