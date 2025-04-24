import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import * as bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    // Parse form data
    const formData = await request.formData()
    
    // Extract form fields
    const email = formData.get('email') as string | null
    const phone = formData.get('phone') as string | null
    const firstName = formData.get('firstName') as string | null
    const lastName = formData.get('lastName') as string | null
    const password = formData.get('password') as string | null
    const profileImage = formData.get('profileImage') as File | null
    
    // Basic validation
    if (email === '' && phone === '') {
      return createBadRequestResponse('Either email or phone is required')
    }
    
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return createBadRequestResponse('Invalid email address')
      }
      
      // Check if email is taken by another user
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUserByEmail && existingUserByEmail.id !== payload.userId) {
        return createBadRequestResponse('Email is already in use by another account')
      }
    }
    
    if (phone) {
      // Check if phone is taken by another user
      const existingUserByPhone = await prisma.user.findFirst({
        where: { phone },
      })

      if (existingUserByPhone && existingUserByPhone.id !== payload.userId) {
        return createBadRequestResponse('Phone number is already in use by another account')
      }
    }

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { firstName: true, lastName: true, email: true, phone: true }
    })
    
    if (!currentUser) {
      return createUnauthorizedResponse('User not found')
    }

    // Build update data object
    const updateData: any = {}
    
    // Only update fields that were provided
    if (email !== null) updateData.email = email || null
    if (phone !== null) updateData.phone = phone || null
    if (firstName !== null) updateData.firstName = firstName || null
    if (lastName !== null) updateData.lastName = lastName || null
    
    // Calculate name from first and last name if either was provided
    if (firstName !== null || lastName !== null) {
      const newFirstName = firstName !== null ? firstName : currentUser.firstName || ''
      const newLastName = lastName !== null ? lastName : currentUser.lastName || ''
      
      if (newFirstName || newLastName) {
        updateData.name = `${newFirstName} ${newLastName}`.trim()
      } else {
        updateData.name = null
      }
    }
    
    // Hash password if provided
    if (password) {
      if (password.length < 8) {
        return createBadRequestResponse('Password must be at least 8 characters')
      }
      updateData.password = await bcrypt.hash(password, 10)
    }
    
    // Process profile image if exists
    if (profileImage) {
      const bytes = await profileImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Create unique filename
      const filename = `${randomUUID()}-${profileImage.name}`
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
      
      // Ensure directory exists
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      
      const imagePath = join(uploadDir, filename)
      
      // Save the file
      await writeFile(imagePath, buffer)
      
      // Set the URL to be saved in the database
      updateData.profileImageUrl = `/uploads/profiles/${filename}`
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        profileImageUrl: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Profile update error:', error)
    return createServerErrorResponse('Failed to update profile')
  }
}