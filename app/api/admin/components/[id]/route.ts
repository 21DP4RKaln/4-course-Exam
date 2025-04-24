import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createNotFoundResponse,
  createServerErrorResponse,
  createBadRequestResponse 
} from '@/lib/apiErrors'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    const componentId = params.id
  
    const component = await prisma.component.findUnique({
      where: { id: componentId },
      include: {
        category: true
      }
    })

    if (!component) {
      return createNotFoundResponse('Component not found')
    }

    const formattedComponent = {
      id: component.id,
      name: component.name,
      description: component.description,
      price: component.price,
      stock: component.stock,
      imageUrl: component.imageUrl,
      categoryId: component.categoryId,
      category: component.category.name,
      specifications: component.specifications,
      createdAt: component.createdAt.toISOString(),
      updatedAt: component.updatedAt.toISOString()
    }

    return NextResponse.json(formattedComponent)
  } catch (error) {
    console.error('Error fetching component:', error)
    return createServerErrorResponse('Failed to fetch component details')
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    const componentId = params.id

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

    const existingComponent = await prisma.component.findUnique({
      where: { id: componentId }
    })

    if (!existingComponent) {
      return createNotFoundResponse('Component not found')
    }

    const categoryExists = await prisma.componentCategory.findUnique({
      where: { id: categoryId }
    })
    
    if (!categoryExists) {
      return createBadRequestResponse('Invalid category')
    }

    const updatedComponent = await prisma.component.update({
      where: { id: componentId },
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
      id: updatedComponent.id,
      name: updatedComponent.name,
      description: updatedComponent.description,
      price: updatedComponent.price,
      stock: updatedComponent.stock,
      categoryId: updatedComponent.categoryId,
      category: updatedComponent.category.name,
      specifications: updatedComponent.specifications
    })
  } catch (error) {
    console.error('Error updating component:', error)
    return createServerErrorResponse('Failed to update component')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    const componentId = params.id

    const component = await prisma.component.findUnique({
      where: { id: componentId }
    })

    if (!component) {
      return createNotFoundResponse('Component not found')
    }

    const configItems = await prisma.configItem.findFirst({
      where: {
        componentId: componentId
      }
    })
    
    if (configItems) {
      return createBadRequestResponse('Cannot delete component because it is used in configurations')
    }

    await prisma.component.delete({
      where: { id: componentId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting component:', error)
    return createServerErrorResponse('Failed to delete component')
  }
}