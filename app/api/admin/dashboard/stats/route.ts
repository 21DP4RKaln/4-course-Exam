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
    }    // Define date ranges for comparison
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

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
      thisMonthOrders,
      lastMonthUsers,
      thisMonthUsers,
      lastMonthRevenue,
      thisMonthRevenue,
      lastMonthRepairs,
      thisMonthRepairs
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
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        }
      }),
      // This month orders count
      prisma.order.count({
        where: {
          createdAt: {
            gte: thisMonthStart
          }
        }
      }),
      // Last month users count
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        }
      }),
      // This month users count
      prisma.user.count({
        where: {
          createdAt: {
            gte: thisMonthStart
          }
        }
      }),
      // Last month revenue
      prisma.order.aggregate({
        where: { 
          status: 'COMPLETED',
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        },
        _sum: { totalAmount: true }
      }),
      // This month revenue
      prisma.order.aggregate({
        where: { 
          status: 'COMPLETED',
          createdAt: {
            gte: thisMonthStart
          }
        },
        _sum: { totalAmount: true }
      }),
      // Last month repairs count
      prisma.repair.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        }
      }),
      // This month repairs count
      prisma.repair.count({
        where: {
          createdAt: {
            gte: thisMonthStart
          }
        }
      })
    ])    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100 * 10) / 10
    }

    const userGrowth = calculateGrowth(thisMonthUsers, lastMonthUsers)
    const orderGrowth = calculateGrowth(thisMonthOrders, lastMonthOrders)
    const revenueGrowth = calculateGrowth(
      thisMonthRevenue._sum.totalAmount || 0, 
      lastMonthRevenue._sum.totalAmount || 0
    )
    const repairGrowth = calculateGrowth(thisMonthRepairs, lastMonthRepairs)

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRepairs,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingConfigurations,
      activeRepairs,
      lowStockItems: lowStockComponents,
      monthlyGrowth: orderGrowth,
      trends: {
        users: userGrowth,
        orders: orderGrowth,
        revenue: revenueGrowth,
        repairs: repairGrowth
      }
    })
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    return createServerErrorResponse('Failed to fetch dashboard stats')
  }
}