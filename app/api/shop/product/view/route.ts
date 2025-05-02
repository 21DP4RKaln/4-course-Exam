import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'

/**
 * API route to increment view count for a product
 */
export async function POST(request: NextRequest) {
  try {
    const { productId, productType } = await request.json()
    
    if (!productId || !productType) {
      return NextResponse.json(
        { error: 'Product ID and type are required' },
        { status: 400 }
      )
    }
    
    // Increment view count based on product type
    if (productType === 'configuration') {
      await prisma.configuration.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } }
      })
    } else if (productType === 'component') {
      await prisma.component.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } }
      })
    } else if (productType === 'peripheral') {
      await prisma.peripheral.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } }
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid product type' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    )
  }
}

/**
 * API route to reset view counts monthly (to be called by a CRON job)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('apiKey')
    
    // Security check - verify API key
    if (apiKey !== process.env.RESET_VIEWS_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Reset view counts for all product types
    const [configurationsResult, componentsResult, peripheralsResult] = await Promise.all([
      prisma.configuration.updateMany({
        data: { viewCount: 0 }
      }),
      prisma.component.updateMany({
        data: { viewCount: 0 }
      }),
      prisma.peripheral.updateMany({
        data: { viewCount: 0 }
      })
    ])
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      resetCounts: {
        configurations: configurationsResult.count,
        components: componentsResult.count,
        peripherals: peripheralsResult.count
      }
    })
  } catch (error) {
    console.error('Error resetting view counts:', error)
    return NextResponse.json(
      { error: 'Failed to reset view counts' },
      { status: 500 }
    )
  }
}