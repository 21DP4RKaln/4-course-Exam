import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createNotFoundResponse, createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { randomUUID } from 'crypto'
import { z } from 'zod'

const completeRepairSchema = z.object({
  finalCost: z.number(),
  completionNotes: z.string(),
  parts: z.array(z.object({
    componentId: z.string(),
    quantity: z.number().min(1),
    price: z.number()
  })).optional()
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

    // Parse form data for file upload
    const formData = await request.formData()
    const finalCost = parseFloat(formData.get('finalCost') as string)
    const completionNotes = formData.get('completionNotes') as string
    const partsJson = formData.get('parts') as string
    const completionImage = formData.get('completionImage') as File | null

    // Validate input
    const validationData = {
      finalCost,
      completionNotes,
      parts: partsJson ? JSON.parse(partsJson) : undefined
    }

    const validationResult = completeRepairSchema.safeParse(validationData)

    if (!validationResult.success) {
      return createBadRequestResponse('Invalid completion data', validationResult.error.flatten())
    }

    const { parts } = validationResult.data

    // Check if repair exists and user has access
    const repair = await prisma.repair.findUnique({
      where: { id: params.id },
      include: {
        specialists: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        },
        peripheral: true,
        configuration: true
      }
    })

    if (!repair) {
      return createNotFoundResponse('Repair not found')
    }

    // Check if specialist is assigned to this repair
    if (payload.role === 'SPECIALIST') {
      const isAssigned = repair.specialists.some(s => s.specialistId === payload.userId)
      if (!isAssigned) {
        return createUnauthorizedResponse('You are not assigned to this repair')
      }
    }

    // Check if repair is already completed
    if (repair.status === 'COMPLETED') {
      return createBadRequestResponse('Repair is already completed')
    }

    // Handle image upload
    let imageUrl: string | null = null
    if (completionImage) {
      const bytes = await completionImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const filename = `${randomUUID()}-${completionImage.name}`
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'repairs', 'completed')
      
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      
      const imagePath = join(uploadDir, filename)
      await writeFile(imagePath, buffer)
      
      imageUrl = `/uploads/repairs/completed/${filename}`
    }

    // Update repair with completion data
    const updateData: any = {
      status: 'COMPLETED',
      finalCost,
      completionDate: new Date(),
      diagnosticNotes: repair.diagnosticNotes ? 
        `${repair.diagnosticNotes}\n\nCompletion Notes:\n${completionNotes}` : 
        `Completion Notes:\n${completionNotes}`
    }

    // Add completion image to diagnostic notes if uploaded
    if (imageUrl) {
      updateData.diagnosticNotes = `${updateData.diagnosticNotes}\n\nCompletion Image: ${imageUrl}`
    }

    // Handle parts if provided
    if (parts && parts.length > 0) {
      // Remove existing parts
      await prisma.repairPart.deleteMany({
        where: { repairId: params.id }
      })

      // Add new parts
      updateData.parts = {
        create: parts.map(part => ({
          componentId: part.componentId,
          quantity: part.quantity,
          price: part.price
        }))
      }
    }

    const completedRepair = await prisma.repair.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        peripheral: true,
        configuration: true,
        parts: {
          include: {
            component: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      }
    })

    // Send email notification to customer
    // TODO: Implement actual email sending service
    console.log('Email notification:', {
      to: completedRepair.user.email,
      subject: `Repair Completed - ${completedRepair.title}`,
      body: `
Dear ${completedRepair.user.name},

Your repair request "${completedRepair.title}" has been completed.

Final Cost: €${completedRepair.finalCost}
Completion Notes: ${completionNotes}

${imageUrl ? `You can view the completion image here: ${process.env.NEXT_PUBLIC_URL}${imageUrl}` : ''}

Parts Used:
${completedRepair.parts.map(part => 
  `- ${part.component.name} x${part.quantity} - €${part.price}`
).join('\n')}

Thank you for choosing our service!

Best regards,
IvaPro Team
      `
    })

    return NextResponse.json({
      id: completedRepair.id,
      title: completedRepair.title,
      status: completedRepair.status,
      finalCost: completedRepair.finalCost,
      completionDate: completedRepair.completionDate,
      diagnosticNotes: completedRepair.diagnosticNotes,
      customer: {
        id: completedRepair.user.id,
        name: completedRepair.user.name,
        email: completedRepair.user.email,
        notified: true
      },
      product: completedRepair.peripheral ? {
        type: 'peripheral',
        name: completedRepair.peripheral.name,
      } : completedRepair.configuration ? {
        type: 'configuration',
        name: completedRepair.configuration.name,
      } : null,
      parts: completedRepair.parts.map(part => ({
        name: part.component.name,
        quantity: part.quantity,
        price: part.price
      })),
      completionImage: imageUrl
    })
  } catch (error) {
    console.error('Error completing repair:', error)
    return createServerErrorResponse('Failed to complete repair')
  }
}