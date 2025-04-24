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

    const configId = params.id
  
    const configuration = await prisma.configuration.findUnique({
      where: { id: configId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        components: {
          include: {
            component: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })

    if (!configuration) {
      return createNotFoundResponse('Configuration not found')
    }

    // Format components
    const components = configuration.components.map(item => ({
      id: item.component.id,
      name: item.component.name,
      category: item.component.category.name,
      price: item.component.price,
      quantity: item.quantity
    }))

    const formattedConfiguration = {
      id: configuration.id,
      name: configuration.name,
      description: configuration.description,
      userId: configuration.userId,
      userName: configuration.user?.name || 'Anonymous',
      email: configuration.user?.email || '',
      status: configuration.status,
      isTemplate: configuration.isTemplate,
      isPublic: configuration.isPublic,
      totalPrice: configuration.totalPrice,
      components,
      createdAt: configuration.createdAt.toISOString(),
      updatedAt: configuration.updatedAt.toISOString()
    }

    return NextResponse.json(formattedConfiguration)
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return createServerErrorResponse('Failed to fetch configuration details')
  }
}

// Update a configuration
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

    const configId = params.id
    
    // Validate input
    const body = await request.json()
    
    const configSchema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      description: z.string().optional(),
      status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']),
      isTemplate: z.boolean(),
      isPublic: z.boolean()
    })
    
    const validationResult = configSchema.safeParse(body)
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid input data', {
        errors: validationResult.error.format()
      })
    }
    
    const { name, description, status, isTemplate, isPublic } = validationResult.data
    
    // Check if configuration exists
    const existingConfig = await prisma.configuration.findUnique({
      where: { id: configId }
    })

    if (!existingConfig) {
      return createNotFoundResponse('Configuration not found')
    }
    
    // Update configuration
    const updatedConfig = await prisma.configuration.update({
      where: { id: configId },
      data: {
        name,
        description,
        status,
        isTemplate,
        isPublic
      }
    })

    return NextResponse.json({
      id: updatedConfig.id,
      name: updatedConfig.name,
      description: updatedConfig.description,
      status: updatedConfig.status,
      isTemplate: updatedConfig.isTemplate,
      isPublic: updatedConfig.isPublic
    })
  } catch (error) {
    console.error('Error updating configuration:', error)
    return createServerErrorResponse('Failed to update configuration')
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

    const configId = params.id
 
    const config = await prisma.configuration.findUnique({
      where: { id: configId },
      include: {
        orders: true
      }
    })

    if (!config) {
      return createNotFoundResponse('Configuration not found')
    }
  
    if (config.orders.length > 0) {
      return createBadRequestResponse('Cannot delete configuration because it is used in orders')
    }

    await prisma.configItem.deleteMany({
      where: {
        configurationId: configId
      }
    })
  
    await prisma.configuration.delete({
      where: { id: configId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting configuration:', error)
    return createServerErrorResponse('Failed to delete configuration')
  }
}