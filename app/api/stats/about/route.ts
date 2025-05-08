import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { createServerErrorResponse } from '@/lib/apiErrors'

export async function GET(request: NextRequest) {
  try {
    const configurationsCount = await prisma.configuration.count({
      where: {
        status: 'APPROVED',
      },
    })
  
    const customersCount = await prisma.user.count({
      where: {
        role: 'USER',
      },
    })
 
    const ordersCount = await prisma.order.count({
      where: {
        status: 'COMPLETED',
      },
    })
  
    const oldestUser = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
    })

    let yearsInBusiness = 1 
    if (oldestUser) {
      const startYear = oldestUser.createdAt.getFullYear()
      const currentYear = new Date().getFullYear()
      yearsInBusiness = currentYear - startYear
      if (yearsInBusiness < 1) yearsInBusiness = 1 
    }

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