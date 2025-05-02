import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4', 10)
    
    // Fetch configurations that are templates and public
    // Order by viewCount (descending) to show most viewed first
    const popularConfigurations = await prisma.configuration.findMany({
      where: {
        isTemplate: true, 
        isPublic: true,
      },
      orderBy: [
        { viewCount: 'desc' }, // Primary sorting by view count
        { createdAt: 'desc' }  // Secondary sorting by creation date
      ],
      take: limit
    })

    // Format the response
    const formattedConfigs = popularConfigurations.map(config => ({
      id: config.id,
      name: config.name,
      description: config.description || '',
      price: config.totalPrice,
      discountPrice: Math.round(config.totalPrice * 0.9 * 100) / 100, // 10% discount
      imageUrl: config.imageUrl,
      viewCount: config.viewCount || 0,
      isPopular: (config.viewCount || 0) > 5 // Flag for showing "Popular" badge
    }))

    return NextResponse.json(formattedConfigs)
  } catch (error) {
    console.error('Error fetching popular configurations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular configurations' },
      { status: 500 }
    )
  }
}