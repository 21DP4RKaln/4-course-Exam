import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createForbiddenResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { prisma } from '@/lib/prismaService'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    if (payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    // Fetch all required stats in parallel
    const [
      totalUsers,
      totalOrders,
      totalRepairs,
      totalRevenue,
      pendingConfigurations,
      activeRepairs,
      lowStockComponents,
      lastMonthOrders,
      thisMonthOrders
    ] = await prisma.$transaction([
      // Total users
      prisma.user.count(),
      // Total orders
      prisma.order.count(),
      // Total repairs
      prisma.repair.count(),
      // Total revenue from completed orders
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true }
      }),
      // Pending configurations
      prisma.configuration.count({
        where: { status: 'SUBMITTED' }
      }),
      // Active repairs
      prisma.repair.count({
        where: { 
          status: { in: ['PENDING', 'IN_PROGRESS', 'WAITING_FOR_PARTS'] }
        }
      }),
      // Low stock items
      prisma.component.count({
        where: { stock: { lt: 10 } }
      }),
      // Last month orders count
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            lt: new Date()
          }
        }
      }),
      // This month orders count
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(1))
          }
        }
      })
    ])

    // Calculate monthly growth percentage
    const monthlyGrowth = lastMonthOrders === 0 
      ? thisMonthOrders * 100 
      : ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRepairs,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingConfigurations,
      activeRepairs,
      lowStockItems: lowStockComponents,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10 // Round to 1 decimal place
    })
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    return createServerErrorResponse('Failed to fetch dashboard stats')
  }
}