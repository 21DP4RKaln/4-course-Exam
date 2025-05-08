import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createForbiddenResponse, createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'

// Schema for GET query parameters
const getUsersQuerySchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'SPECIALIST']).optional(),
  sortBy: z.enum(['createdAt', 'email', 'name', 'role']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

// Schema for creating a new user
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'SPECIALIST']).default('USER'),
})

/**
 * GET - List all users with filtering, pagination, and sorting
 */
export async function GET(request: NextRequest) {
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const queryResult = getUsersQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))
    
    if (!queryResult.success) {
      return createBadRequestResponse('Invalid query parameters', { errors: queryResult.error.flatten() })
    }

    const { page, limit, search, role, sortBy, order } = queryResult.data

    // Build the where clause for filtering
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (role) {
      where.role = role
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Query users
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
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
          createdAt: true,
          updatedAt: true,
          // Never return password hash
        },
        orderBy: {
          [sortBy]: order,
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return createServerErrorResponse('Failed to fetch users')
  }
}

/**
 * POST - Create a new user
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createUserSchema.safeParse(body)
    
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid user data', { errors: validationResult.error.flatten() })
    }

    const { email, password, firstName, lastName, phone, role } = validationResult.data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return createBadRequestResponse('Email already in use')
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingUserByPhone = await prisma.user.findFirst({
        where: { phone },
      })

      if (existingUserByPhone) {
        return createBadRequestResponse('Phone number already in use')
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        phone: phone || null,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        profileImageUrl: true,
        createdAt: true,
        // Never return password hash
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return createServerErrorResponse('Failed to create user')
  }
}