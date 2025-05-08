import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createForbiddenResponse, createNotFoundResponse, createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'

// Schema for updating a user
const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'SPECIALIST']).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  isBlocked: z.boolean().optional(),
  blockReason: z.string().optional(),
})

/**
 * GET - Get a specific user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    // Authorization check - only ADMIN can access this endpoint
    if (payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin privileges required')
    }

    const userId = params.id

    // Fetch the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        profileImageUrl: true,
        isBlocked: true,
        blockReason: true,
        createdAt: true,
        updatedAt: true,
        // Never return password hash
      },
    })

    if (!user) {
      return createNotFoundResponse('User not found')
    }

    // Get additional user data
    const [
      ordersCount,
      configurationsCount,
      repairsCount,
      latestLogin
    ] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.configuration.count({ where: { userId } }),
      prisma.repair.count({ where: { userId } }),
      // Could be replaced with actual login tracking if available
      null
    ])

    return NextResponse.json({
      ...user,
      statistics: {
        ordersCount,
        configurationsCount,
        repairsCount,
        latestLogin,
      },
    })
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error)
    return createServerErrorResponse('Failed to fetch user details')
  }
}

/**
 * PUT - Update a specific user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    // Authorization check - only ADMIN can access this endpoint
    if (payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin privileges required')
    }

    const userId = params.id

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return createNotFoundResponse('User not found')
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateUserSchema.safeParse(body)
    
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid user data', { errors: validationResult.error.flatten() })
    }

    const { email, firstName, lastName, phone, role, password, isBlocked, blockReason } = validationResult.data

    // Check for email uniqueness if changing email
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      })

      if (emailExists) {
        return createBadRequestResponse('Email already in use')
      }
    }

    // Check for phone uniqueness if changing phone
    if (phone && phone !== existingUser.phone) {
      const phoneExists = await prisma.user.findFirst({
        where: { phone },
      })

      if (phoneExists) {
        return createBadRequestResponse('Phone number already in use')
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (email !== undefined) updateData.email = email
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (phone !== undefined) updateData.phone = phone
    if (role !== undefined) updateData.role = role
    if (isBlocked !== undefined) updateData.isBlocked = isBlocked
    if (blockReason !== undefined) updateData.blockReason = blockReason

    // Update name if first name or last name was updated
    if (firstName !== undefined || lastName !== undefined) {
      const newFirstName = firstName !== undefined ? firstName : existingUser.firstName || ''
      const newLastName = lastName !== undefined ? lastName : existingUser.lastName || ''
      
      updateData.name = `${newFirstName} ${newLastName}`.trim()
    }

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Prevent self-demotion (admin can't demote themselves)
    if (userId === payload.userId && role && role !== 'ADMIN') {
      return createBadRequestResponse('You cannot change your own admin role')
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        profileImageUrl: true,
        isBlocked: true,
        blockReason: true,
        createdAt: true,
        updatedAt: true,
        // Never return password hash
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error)
    return createServerErrorResponse('Failed to update user')
  }
}

/**
 * DELETE - Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    // Authorization check - only ADMIN can access this endpoint
    if (payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin privileges required')
    }

    const userId = params.id

    // Prevent self-deletion (admin can't delete themselves)
    if (userId === payload.userId) {
      return createBadRequestResponse('You cannot delete your own account')
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return createNotFoundResponse('User not found')
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error)
    return createServerErrorResponse('Failed to delete user')
  }
}