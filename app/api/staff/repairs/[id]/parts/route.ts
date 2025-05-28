import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createNotFoundResponse, createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { z } from 'zod'

const addPartsSchema = z.object({
  parts: z.array(z.object({
    componentId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive()
  }))
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const validationResult = addPartsSchema.safeParse(body)

    if (!validationResult.success) {
      return createBadRequestResponse('Invalid parts data', validationResult.error.flatten())
    }

    const { parts } = validationResult.data

    // Check if repair exists
    const existingRepair = await prisma.repair.findUnique({
      where: { id: params.id },
      include: { specialists: true }
    })

    if (!existingRepair) {
      return createNotFoundResponse('Repair not found')
    }

    // Check if specialist is assigned to this repair
    if (payload.role === 'SPECIALIST') {
      const isAssigned = existingRepair.specialists.some(s => s.specialistId === payload.userId)
      if (!isAssigned) {
        return createUnauthorizedResponse('You are not assigned to this repair')
      }
    }

    // Check if repair is in a state where parts can be added
    if (existingRepair.status === 'COMPLETED' || existingRepair.status === 'CANCELLED') {
      return createBadRequestResponse(`Cannot add parts to a repair that is already ${existingRepair.status.toLowerCase()}`)
    }

    // Verify that components exist
    const componentIds = parts.map(part => part.componentId)
    const components = await prisma.component.findMany({
      where: { 
        id: { in: componentIds } 
      },
      include: {
        category: true
      }
    })

    if (components.length !== componentIds.length) {
      return createBadRequestResponse('One or more components do not exist')
    }

    // Create parts for the repair
    const addedParts = []
    for (const part of parts) {
      const component = components.find(c => c.id === part.componentId)
      if (!component) continue

      const newPart = await prisma.repairPart.create({
        data: {
          repairId: params.id,
          componentId: part.componentId,
          quantity: part.quantity,
          price: part.price
        },
        include: {
          component: {
            include: {
              category: true
            }
          }
        }
      })

      addedParts.push({
        id: newPart.id,
        componentId: newPart.componentId,
        name: newPart.component.name,
        category: newPart.component.category.name,
        quantity: newPart.quantity,
        price: newPart.price
      })
    }

    // Calculate total cost of added parts
    const totalPartsCost = parts.reduce((total, part) => total + (part.price * part.quantity), 0)

    // Update repair with new estimated cost
    const currentEstimatedCost = existingRepair.estimatedCost || 0
    await prisma.repair.update({
      where: { id: params.id },
      data: {
        estimatedCost: currentEstimatedCost + totalPartsCost,
        // If we're adding parts, we're likely working on it
        status: existingRepair.status === 'PENDING' ? 'IN_PROGRESS' : existingRepair.status
      }
    })

    return NextResponse.json({
      message: 'Parts added successfully',
      parts: addedParts
    })
  } catch (error) {
    console.error('Error adding parts to repair:', error)
    return createServerErrorResponse('Failed to add parts to repair')
  }
}
