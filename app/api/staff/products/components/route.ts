import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createServerErrorResponse } from '@/lib/apiErrors'

export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    if (!['ADMIN', 'SPECIALIST'].includes(payload.role)) {
      return createUnauthorizedResponse('Insufficient permissions')
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const lowStock = searchParams.get('lowStock') === 'true'

    let whereClause: any = {
      category: {
        type: 'component'
      }
    }

    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }    if (lowStock) {
      whereClause.quantity = { lt: 10 }
    }    const components = await prisma.component.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    const categories = await prisma.componentCategory.findMany({
      where: {
        type: 'component'
      },
      orderBy: {
        displayOrder: 'asc'
      }
    })

    const formattedComponents = components.map(component => {
      const specifications: Record<string, string> = {}
      
      specifications['SKU'] = component.sku
      specifications['Sub Type'] = component.subType
      
      return {
        id: component.id,
        name: component.name,
        description: component.description,
        category: component.category.name,
        categoryId: component.categoryId,
        price: component.price,
        stock: component.quantity,
        imageUrl: component.imagesUrl,
        sku: component.sku,
        specifications,
        viewCount: component.viewCount,
        createdAt: component.createdAt.toISOString(),
        updatedAt: component.updatedAt.toISOString()
      }
    })

    return NextResponse.json({
      components: formattedComponents,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        displayOrder: cat.displayOrder
      }))
    })
  } catch (error) {
    console.error('Error fetching components:', error)
    return createServerErrorResponse('Failed to fetch components')
  }
}