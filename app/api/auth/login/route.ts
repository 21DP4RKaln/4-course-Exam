import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { signJWT } from '@/lib/jwt'
import { createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import * as bcrypt from 'bcryptjs'
import { z } from 'zod'

// Updated schema to accept either email or phone
const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(6, 'Phone number must be at least 6 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ['email'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      return createBadRequestResponse('Invalid input data', {
        errors: validationResult.error.format(),
      })
    }

    const { email, phone, password } = validationResult.data

    // Find user by email or phone
    const user = email 
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.user.findFirst({ where: { phone } });

    if (!user) {
      return createBadRequestResponse('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return createBadRequestResponse('Invalid credentials')
    }

    const token = await signJWT({
      userId: user.id,
      email: user.email || '',
      role: user.role,
    })

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImageUrl: user.profileImageUrl
    })

    response.cookies.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,  // 1 day
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return createServerErrorResponse('Failed to login')
  }
}