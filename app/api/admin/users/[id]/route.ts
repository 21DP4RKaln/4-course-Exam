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
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { randomUUID } from 'crypto'

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

    const userId = params.id
  
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: true,
        _count: {
          select: {
            orders: true,
            configurations: true
          }
        }
      }
    })

    if (!user) {
      return createNotFoundResponse('User not found')
    }

    const formattedUser = {
      id: user.id,
      name: user.name || 'Anonymous',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      orderCount: user._count.orders,
      configCount: user._count.configurations,
      orders: user.orders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toISOString()
      }))
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return createServerErrorResponse('Failed to fetch user details')
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

    const userId = params.id
  
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, profileImageUrl: true }
    })

    if (!user) {
      return createNotFoundResponse('User not found')
    }

    if (user.role === 'ADMIN' && userId !== payload.userId) {
      return createForbiddenResponse('Cannot delete other admin accounts')
    }

    // Delete profile image if exists
    if (user.profileImageUrl) {
      try {
        const imagePath = join(process.cwd(), 'public', user.profileImageUrl)
        if (existsSync(imagePath)) {
          await unlink(imagePath)
        }
      } catch (error) {
        console.error('Error deleting profile image:', error)
      }
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return createServerErrorResponse('Failed to delete user')
  }
}

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

    const userId = params.id

    // Parse form data for profile image upload
    const formData = await request.formData()
    
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as 'USER' | 'ADMIN' | 'SPECIALIST'
    const profileImage = formData.get('profileImage') as File | null
    const deleteImage = formData.get('deleteImage') === 'true'

    if (!role) {
      return createBadRequestResponse('Role is required')
    }
    
    if (!email && !phone) {
      return createBadRequestResponse('Either email or phone is required')
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return createNotFoundResponse('User not found')
    }
    
    // Check if email is already in use by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })
      
      if (emailExists) {
        return createBadRequestResponse('Email is already in use')
      }
    }
    
    // Check if phone is already in use by another user
    if (phone && phone !== existingUser.phone) {
      const phoneExists = await prisma.user.findFirst({
        where: { phone }
      })
      
      if (phoneExists) {
        return createBadRequestResponse('Phone number is already in use')
      }
    }

    // Prepare update data
    const updateData: any = {
      firstName: firstName || null,
      lastName: lastName || null,
      email: email || null,
      phone: phone || null,
      role
    }

    // Calculate name from first and last name
    const newFirstName = firstName || existingUser.firstName || '';
    const newLastName = lastName || existingUser.lastName || '';
    updateData.name = [newFirstName, newLastName].filter(Boolean).join(' ') || null;

    // Handle profile image - delete existing if requested
    if (deleteImage && existingUser.profileImageUrl) {
      try {
        const imagePath = join(process.cwd(), 'public', existingUser.profileImageUrl)
        if (existsSync(imagePath)) {
          await unlink(imagePath)
        }
        updateData.profileImageUrl = null
      } catch (error) {
        console.error('Error deleting profile image:', error)
      }
    }

    // Handle profile image - upload new if provided
    if (profileImage) {
      const bytes = await profileImage.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const filename = `${randomUUID()}-${profileImage.name}`
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
      
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      const imagePath = join(uploadDir, filename)
      await writeFile(imagePath, buffer)

      // Delete old image if exists and different from new one
      if (existingUser.profileImageUrl) {
        try {
          const oldImagePath = join(process.cwd(), 'public', existingUser.profileImageUrl)
          if (existsSync(oldImagePath)) {
            await unlink(oldImagePath)
          }
        } catch (error) {
          console.error('Error deleting old profile image:', error)
        }
      }

      updateData.profileImageUrl = `/uploads/profiles/${filename}`
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    return NextResponse.json({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      profileImageUrl: updatedUser.profileImageUrl
    })
  }
  catch (error) {
    console.error('Error updating user:', error)
    return createServerErrorResponse('Failed to update user')
  }
}