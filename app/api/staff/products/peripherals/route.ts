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
        type: 'peripheral'
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
    }

    if (lowStock) {
      whereClause.stock = { lt: 10 }
    }

    const peripherals = await prisma.component.findMany({
      where: whereClause,
      include: {
        category: true,
        specValues: {
          include: {
            specKey: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const categories = await prisma.componentCategory.findMany({
      where: {
        type: 'peripheral'
      },
      orderBy: {
        displayOrder: 'asc'
      }
    })

    const formattedPeripherals = peripherals.map(peripheral => {
      const specifications: Record<string, string> = {}
      
      // Extract specifications from JSON field
      if (peripheral.specifications && typeof peripheral.specifications === 'object') {
        Object.entries(peripheral.specifications).forEach(([key, value]) => {
          specifications[key] = String(value)
        })
      }
      
      // Add spec values
      peripheral.specValues.forEach(specValue => {
        specifications[specValue.specKey.name] = specValue.value
      })
      
      return {
        id: peripheral.id,
        name: peripheral.name,
        description: peripheral.description,
        category: peripheral.category.name,
        categoryId: peripheral.categoryId,
        price: peripheral.price,
        stock: peripheral.stock,
        imageUrl: peripheral.imageUrl,
        sku: peripheral.sku,
        specifications,
        viewCount: peripheral.viewCount,
        createdAt: peripheral.createdAt.toISOString(),
        updatedAt: peripheral.updatedAt.toISOString()
      }
    })

    return NextResponse.json({
      peripherals: formattedPeripherals,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        displayOrder: cat.displayOrder
      }))
    })
  } catch (error) {
    console.error('Error fetching peripherals:', error)
    return createServerErrorResponse('Failed to fetch peripherals')
  }
}