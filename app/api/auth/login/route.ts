import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { signJWT } from '@/lib/jwt'
import { createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import * as bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      return createBadRequestResponse('Invalid input data', {
        errors: validationResult.error.format(),
      })
    }

    const { email, password } = validationResult.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return createBadRequestResponse('Invalid email or password')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return createBadRequestResponse('Invalid email or password')
    }

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
    console.error('Login error:', error)
    return createServerErrorResponse('Failed to login')
  }
}