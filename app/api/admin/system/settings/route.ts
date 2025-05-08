import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createForbiddenResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { prisma } from '@/lib/prismaService'

/**
 * Retrieves system settings
 * Only accessible by ADMIN users
 */
export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return createUnauthorizedResponse('Invalid token')
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    // In a production app, you'd typically have a settings table
    // For this example, we'll return mock settings
    const settings = {
      general: {
        siteName: 'IvaPro PC Configurator',
        contactEmail: 'admin@ivapro.com',
        maxUploadSize: 5, // MB
        maintenanceMode: false
      },
      email: {
        provider: 'SMTP',
        senderEmail: 'noreply@ivapro.com',
        senderName: 'IvaPro PC Configurator',
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        smtpSecure: true,
        notifyOnNewOrder: true,
        notifyOnNewRepair: true
      },
      security: {
        loginAttempts: 5,
        lockoutTime: 30, // minutes
        requireStrongPasswords: true,
        twoFactorAuthEnabled: false
      },
      localization: {
        defaultLanguage: 'en',
        availableLanguages: ['en', 'lv', 'ru'],
        defaultCurrency: 'EUR',
        dateFormat: 'DD/MM/YYYY'
      }
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error retrieving settings:', error)
    return createServerErrorResponse('Failed to retrieve settings')
  }
}

/**
 * Updates system settings
 * Only accessible by ADMIN users
 */
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    const settings = await request.json()

    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      )
    }

    // In a production app, you'd update the settings in the database
    // For this example, we'll just return mock success

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return createServerErrorResponse('Failed to update settings')
  }
}