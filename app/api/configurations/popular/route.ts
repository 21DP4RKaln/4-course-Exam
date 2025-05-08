import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4', 10)
 
    const popularConfigurations = await prisma.configuration.findMany({
      where: {
        isTemplate: true, 
        isPublic: true,
      },
      orderBy: [
        { viewCount: 'desc' }, 
        { createdAt: 'desc' }  
      ],
      take: limit
    })
    
    const formattedConfigs = popularConfigurations.map(config => ({
      id: config.id,
      name: config.name,
      description: config.description || '',
      price: config.totalPrice,
      imageUrl: config.imageUrl,
      viewCount: config.viewCount || 0,
      isPopular: (config.viewCount || 0) > 5 
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