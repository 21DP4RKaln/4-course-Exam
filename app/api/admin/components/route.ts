import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createServerErrorResponse,
  createBadRequestResponse 
} from '@/lib/apiErrors'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }
  
    const components = await prisma.component.findMany({
      select: {
        id: true,
        name: true,
        category: {
          select: {
            name: true
          }
        },
        price: true,
        stock: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedComponents = components.map(component => ({
      id: component.id,
      name: component.name,
      category: component.category.name,
      price: component.price,
      stock: component.stock,
      createdAt: component.createdAt.toISOString()
    }))

    return NextResponse.json(formattedComponents)
  } catch (error) {
    console.error('Error fetching components:', error)
    return createServerErrorResponse('Failed to fetch components')
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    const body = await request.json()

    const componentSchema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      description: z.string().optional(),
      price: z.number().positive('Price must be positive'),
      stock: z.number().int().nonnegative('Stock cannot be negative'),
      categoryId: z.string().min(1, 'Category is required'),
      specifications: z.record(z.string()).optional()
    })

    const validationResult = componentSchema.safeParse(body)
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid input data', {
        errors: validationResult.error.format()
      })
    }
    
    const { name, description, price, stock, categoryId, specifications } = validationResult.data

    const categoryExists = await prisma.componentCategory.findUnique({
      where: { id: categoryId }
    })
    
    if (!categoryExists) {
      return createBadRequestResponse('Invalid category')
    }

    const component = await prisma.component.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        specifications: specifications || {}
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      id: component.id,
      name: component.name,
      description: component.description,
      price: component.price,
      stock: component.stock,
      categoryId: component.categoryId,
      category: component.category.name,
      specifications: component.specifications
    })
  } catch (error) {
    console.error('Error creating component:', error)
    return createServerErrorResponse('Failed to create component')
  }
}