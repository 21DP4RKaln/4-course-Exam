import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    // Get configurations that contain components from the specified category
    // and are marked as templates (pre-configured builds)
    const configurations = await prisma.configuration.findMany({
      where: {
        isTemplate: true,
        isPublic: true,
        status: 'APPROVED',
        components: {
          some: {
            component: {
              categoryId: category
            }
          }
        }
      },
      include: {
        components: {
          include: {
            component: {
              include: {
                category: true
              }
            }
          }
        }
      },
      take: 3 // Limit to top 3 recommendations
    })

    // Transform the data to include highlights
    const transformedConfigs = configurations.map(config => {
      const highlights = []
      const components = config.components.map(c => c.component)
      
      // Add category-specific highlights
      const categoryComponent = components.find(c => c.categoryId === category)
      if (categoryComponent) {
        highlights.push(categoryComponent.name)
      }

      // Add other key components as highlights
      const cpu = components.find(c => c.categoryId === 'cpu')
      const gpu = components.find(c => c.categoryId === 'gpu')
      if (cpu && category !== 'cpu') highlights.push(cpu.name)
      if (gpu && category !== 'gpu') highlights.push(gpu.name)

      // Add performance category
      let performanceCategory = 'Standard'
      if (config.totalPrice > 2000) performanceCategory = 'High-End'
      else if (config.totalPrice > 1000) performanceCategory = 'Mid-Range'
      highlights.push(`${performanceCategory} Performance`)

      return {
        id: config.id,
        name: config.name,
        description: config.description,
        price: config.totalPrice,
        highlights
      }
    })

    return NextResponse.json({ configurations: transformedConfigs })
  } catch (error) {
    console.error('Error fetching recommended configurations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommended configurations' },
      { status: 500 }
    )
  }
}