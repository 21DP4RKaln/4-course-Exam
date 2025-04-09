import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const categories = await prisma.componentCategory.findMany()
 
    let components = []
    if (category) {
      components = await prisma.component.findMany({
        where: {
          category: {
            name: category
          }
        },
        include: {
          category: true
        }
      })
    }
    
    return NextResponse.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description
      })),
      components: components.map(comp => ({
        id: comp.id,
        name: comp.name,
        description: comp.description || '',
        price: comp.price,
        imageUrl: comp.imageUrl
      }))
    })
  } catch (error) {
    console.error('Error fetching components:', error)
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    )
  }
}