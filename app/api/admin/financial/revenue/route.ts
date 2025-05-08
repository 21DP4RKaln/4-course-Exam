import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createForbiddenResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { prisma } from '@/lib/prismaService'

/**
 * GET - Fetch revenue statistics for admin dashboard
 */
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

    // Get query parameters for time ranges
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // day, week, month, year, custom
    
    // Determine date ranges based on the period
    const now = new Date()
    let startDate: Date
    let endDate = now
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate = new Date(now)
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'custom':
        const customStart = searchParams.get('start')
        const customEnd = searchParams.get('end')
        
        if (customStart) {
          startDate = new Date(customStart)
        } else {
          startDate = new Date(now)
          startDate.setMonth(now.getMonth() - 1)
        }
        
        if (customEnd) {
          endDate = new Date(customEnd)
        }
        break
      default:
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
    }
    
    // Fetch orders for the selected period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        orderItems: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    // Calculate revenue by order status
    const revenueByStatus = {
      COMPLETED: orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.totalAmount, 0),
      PENDING: orders.filter(o => o.status === 'PENDING').reduce((sum, o) => sum + o.totalAmount, 0),
      PROCESSING: orders.filter(o => o.status === 'PROCESSING').reduce((sum, o) => sum + o.totalAmount, 0),
      CANCELLED: orders.filter(o => o.status === 'CANCELLED').reduce((sum, o) => sum + o.totalAmount, 0)
    }
    
    // Calculate revenue by product type
    const revenueByProductType = {
      CONFIGURATION: 0,
      COMPONENT: 0,
      PERIPHERAL: 0
    }
    
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (revenueByProductType[item.productType]) {
          revenueByProductType[item.productType] += item.price * item.quantity
        }
      })
    })
    
    // Calculate revenue over time (daily, weekly, or monthly grouping)
    let revenueOverTime: Array<{ period: string, revenue: number }> = []
    
    if (period === 'day') {
      // Group by hour
      const hourlyRevenue: Record<number, number> = {}
      
      orders.forEach(order => {
        const hour = order.createdAt.getHours()
        hourlyRevenue[hour] = (hourlyRevenue[hour] || 0) + order.totalAmount
      })
      
      revenueOverTime = Array.from({ length: 24 }, (_, hour) => ({
        period: `${hour}:00`,
        revenue: hourlyRevenue[hour] || 0
      }))
    } else if (period === 'week' || period === 'month') {
      // Group by day
      const dailyRevenue: Record<string, number> = {}
      
      orders.forEach(order => {
        const day = order.createdAt.toISOString().split('T')[0] // YYYY-MM-DD
        dailyRevenue[day] = (dailyRevenue[day] || 0) + order.totalAmount
      })
      
      revenueOverTime = Object.entries(dailyRevenue).map(([day, revenue]) => ({
        period: day,
        revenue
      })).sort((a, b) => a.period.localeCompare(b.period))
    } else if (period === 'year') {
      // Group by month
      const monthlyRevenue: Record<string, number> = {}
      
      orders.forEach(order => {
        const month = order.createdAt.toISOString().substring(0, 7) // YYYY-MM
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalAmount
      })
      
      revenueOverTime = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        period: month,
        revenue
      })).sort((a, b) => a.period.localeCompare(b.period))
    }
    
    // Calculate average order value
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
    
    // Get previous period for comparison
    const previousPeriodStart = new Date(startDate)
    const previousPeriodEnd = new Date(startDate)
    
    switch (period) {
      case 'day':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 1)
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1)
        previousPeriodEnd.setHours(23, 59, 59, 999)
        break
      case 'week':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7)
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 7)
        break
      case 'month':
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
        previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1)
        break
      case 'year':
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1)
        previousPeriodEnd.setFullYear(previousPeriodEnd.getFullYear() - 1)
        break
    }
    
    // Fetch previous period orders
    const previousPeriodOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    })
    
    const previousPeriodRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    // Calculate growth percentage
    let revenueGrowth = 0
    
    if (previousPeriodRevenue > 0) {
      revenueGrowth = ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
    }
    
    // Calculate top-selling products
    const productSales: Record<string, { 
      productId: string, 
      productName: string, 
      productType: string,
      quantity: number, 
      revenue: number 
    }> = {}
    
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const key = `${item.productType}_${item.productId}`
        
        if (!productSales[key]) {
          productSales[key] = {
            productId: item.productId,
            productName: item.name,
            productType: item.productType,
            quantity: 0,
            revenue: 0
          }
        }
        
        productSales[key].quantity += item.quantity
        productSales[key].revenue += item.price * item.quantity
      })
    })
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
    
    // Compile all data
    const revenueData = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        name: period
      },
      totalRevenue,
      revenueByStatus,
      revenueByProductType,
      revenueOverTime,
      orderCount: orders.length,
      averageOrderValue,
      comparison: {
        previousPeriodRevenue,
        growth: revenueGrowth
      },
      topProducts
    }

    return NextResponse.json(revenueData)
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return createServerErrorResponse('Failed to fetch revenue data')
  }
}

/**
 * POST - Generate forecast and revenue projections
 */
export async function POST(request: NextRequest) {
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

    // Get request body
    const { 
      forecastPeriod = 12, // Number of months to forecast
      growthRate = 5, // Estimated monthly growth rate in percentage
      seasonalFactors = {} // Optional seasonal adjustments by month (e.g., {12: 1.5} for 50% higher in December)
    } = await request.json()
    
    // Get historical data for the past year
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    // Group orders by month to establish baseline
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: oneYearAgo
        },
        status: {
          in: ['COMPLETED', 'PROCESSING'] // Only count successful orders
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    // Group revenue by month
    const monthlyRevenue: Record<string, number> = {}
    
    orders.forEach(order => {
      const month = order.createdAt.toISOString().substring(0, 7) // YYYY-MM
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalAmount
    })
    
    // Convert to array and sort
    const historicalData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue
    })).sort((a, b) => a.month.localeCompare(b.month))
    
    // Calculate average monthly revenue if we have historical data
    let baselineMonthlyRevenue = 0
    
    if (historicalData.length > 0) {
      const totalHistoricalRevenue = historicalData.reduce((sum, item) => sum + item.revenue, 0)
      baselineMonthlyRevenue = totalHistoricalRevenue / historicalData.length
    } else {
      // No historical data, estimate from recent orders
      const recentOrders = await prisma.order.findMany({
        where: {
          status: {
            in: ['COMPLETED', 'PROCESSING']
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10 // Use 10 most recent orders to estimate
      })
      
      if (recentOrders.length > 0) {
        const recentRevenue = recentOrders.reduce((sum, order) => sum + order.totalAmount, 0)
        baselineMonthlyRevenue = recentRevenue / recentOrders.length * 30 // Rough estimate for a month
      } else {
        baselineMonthlyRevenue = 1000 // Default placeholder if no data available
      }
    }
    
    // Generate forecast
    const forecast = []
    let currentDate = new Date()
    let projectedRevenue = baselineMonthlyRevenue
    
    for (let i = 0; i < forecastPeriod; i++) {
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1)
      
      // Apply growth rate
      projectedRevenue *= (1 + (growthRate / 100))
      
      // Apply seasonal factors if provided
      const month = currentDate.getMonth() + 1 // 1-12 for Jan-Dec
      const seasonalFactor = seasonalFactors[month] || 1
      const adjustedRevenue = projectedRevenue * seasonalFactor
      
      forecast.push({
        month: currentDate.toISOString().substring(0, 7), // YYYY-MM
        projectedRevenue: Math.round(adjustedRevenue * 100) / 100
      })
    }
    
    // Prepare quarterly and annual projections
    const quarterlyProjections: Record<string, number> = {}
    const annualProjection = forecast.reduce((sum, item) => sum + item.projectedRevenue, 0)
    
    // Group by quarter
    forecast.forEach(item => {
      const year = item.month.substring(0, 4)
      const month = parseInt(item.month.substring(5, 7))
      const quarter = Math.ceil(month / 3)
      const key = `${year}-Q${quarter}`
      
      quarterlyProjections[key] = (quarterlyProjections[key] || 0) + item.projectedRevenue
    })
    
    // Convert quarterly projections to array
    const quarterlyData = Object.entries(quarterlyProjections).map(([quarter, revenue]) => ({
      quarter,
      projectedRevenue: Math.round(revenue as number * 100) / 100
    }))
    
    // Compile response
    const forecastData = {
      baselineMonthlyRevenue,
      growthAssumption: `${growthRate}% monthly growth`,
      seasonalFactors: Object.keys(seasonalFactors).length > 0 ? seasonalFactors : 'No seasonal adjustments applied',
      historicalData,
      monthlyForecast: forecast,
      quarterlyForecast: quarterlyData,
      annualProjection: Math.round(annualProjection * 100) / 100,
      forecastPeriod: `${forecastPeriod} months`
    }

    return NextResponse.json(forecastData)
  } catch (error) {
    console.error('Error generating revenue forecast:', error)
    return createServerErrorResponse('Failed to generate revenue forecast')
  }
}