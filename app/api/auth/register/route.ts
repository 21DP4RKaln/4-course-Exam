import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { signJWT } from '@/lib/jwt'
import { createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import * as bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validācijas shēma
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = registerSchema.safeParse(body)

    if (!validationResult.success) {
      return createBadRequestResponse('Invalid input data', {
        errors: validationResult.error.format(),
      })
    }

    const { email, password, name } = validationResult.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return createBadRequestResponse('User with this email already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
 
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
    })

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
 
    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
 
    response.cookies.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, 
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return createServerErrorResponse('Failed to register user')
  }
}