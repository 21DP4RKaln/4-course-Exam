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
   
    const configs = await prisma.configuration.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
 
    const formattedConfigs = configs.map(config => ({
      id: config.id,
      name: config.name,
      userId: config.userId || '',
      userName: config.user?.name || 'Anonymous',
      status: config.status,
      isTemplate: config.isTemplate,
      isPublic: config.isPublic,
      totalPrice: config.totalPrice,
      createdAt: config.createdAt.toISOString()
    }))

    return NextResponse.json(formattedConfigs)
  } catch (error) {
    console.error('Error fetching configurations:', error)
    return createServerErrorResponse('Failed to fetch configurations')
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

    const configSchema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      description: z.string().optional(),
      status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']),
      isTemplate: z.boolean(),
      isPublic: z.boolean(),
      components: z.array(
        z.object({
          componentId: z.string(),
          quantity: z.number().int().positive()
        })
      ),
      totalPrice: z.number().optional()
    })
    
    const validationResult = configSchema.safeParse(body)
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid input data', {
        errors: validationResult.error.format()
      })
    }
    
    const { name, description, status, isTemplate, isPublic, components } = validationResult.data

    const componentIds = components.map(item => item.componentId)
    const existingComponents = await prisma.component.findMany({
      where: {
        id: {
          in: componentIds
        }
      }
    })
    
    if (existingComponents.length !== componentIds.length) {
      return createBadRequestResponse('One or more components do not exist')
    }

    const totalPrice = components.reduce((sum, item) => {
      const component = existingComponents.find(c => c.id === item.componentId)
      return sum + (component ? component.price * item.quantity : 0)
    }, 0)

    const configuration = await prisma.configuration.create({
      data: {
        name,
        description,
        status,
        isTemplate,
        isPublic,
        totalPrice,
        userId: payload.userId,
        components: {
          create: components.map(item => ({
            quantity: item.quantity,
            component: {
              connect: {
                id: item.componentId
              }
            }
          }))
        }
      }
    })
    
    return NextResponse.json({
      id: configuration.id,
      name: configuration.name,
      status: configuration.status,
      isTemplate: configuration.isTemplate,
      isPublic: configuration.isPublic,
      totalPrice: configuration.totalPrice
    })
  } catch (error) {
    console.error('Error creating configuration:', error)
    return createServerErrorResponse('Failed to create configuration')
  }
}