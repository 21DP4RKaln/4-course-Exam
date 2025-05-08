import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { createUnauthorizedResponse, createForbiddenResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { prisma } from '@/lib/prismaService'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

/**
 * Creates a database backup
 * Only accessible by ADMIN users
 */
export async function POST(request: NextRequest) {
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

    // Get backup note from the request
    const { note } = await request.json()

    // Create timestamp for the backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = `backup-${timestamp}`

    // In a production app, you would use a database backup tool
    // For this example, we'll create a JSON export of key tables

    // Get data from database
    const [users, components, configurations, orders, repairs] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
          profileImageUrl: true,
          createdAt: true,
          // Exclude password and sensitive fields
        }
      }),
      prisma.component.findMany(),
      prisma.configuration.findMany({
        include: {
          components: {
            include: {
              component: {
                select: {
                  id: true,
                  name: true,
                  price: true
                }
              }
            }
          }
        }
      }),
      prisma.order.findMany({
        include: {
          orderItems: true
        }
      }),
      prisma.repair.findMany()
    ])

    // Create backup object
    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        note: note || 'Manual backup',
        version: '1.0.0',
        createdBy: payload.userId
      },
      data: {
        users,
        components,
        configurations,
        orders,
        repairs
      }
    }

    // In a production environment, you would:
    // 1. Store this in cloud storage (S3, Google Cloud Storage, etc.)
    // 2. Or use a database backup tool
    
    // For this example, we'll save it as a JSON file
    const backupDir = join(process.cwd(), 'backups')
    
    // Ensure backup directory exists
    if (!existsSync(backupDir)) {
      await mkdir(backupDir, { recursive: true })
    }
    
    const backupPath = join(backupDir, `${backupName}.json`)
    await writeFile(backupPath, JSON.stringify(backupData, null, 2))

    // Log backup creation
    console.log(`Backup created: ${backupPath}`)

    // Record backup in the database (in a real app)
    /*
    const backupRecord = await prisma.backup.create({
      data: {
        name: backupName,
        path: backupPath,
        note: note || 'Manual backup',
        userId: payload.userId
      }
    })
    */

    return NextResponse.json({
      success: true,
      backupName,
      timestamp: new Date().toISOString(),
      path: backupPath
    })
  } catch (error) {
    console.error('Error creating backup:', error)
    return createServerErrorResponse('Failed to create backup')
  }
}

/**
 * Lists available backups
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

    // In a production app, you would fetch this from a backups table
    // For this example, we'll return mock data
    const backups = [
      {
        id: '1',
        name: 'backup-2025-05-01-12-00-00',
        timestamp: '2025-05-01T12:00:00Z',
        size: '15.4 MB',
        note: 'Weekly automatic backup',
        createdBy: 'System'
      },
      {
        id: '2',
        name: 'backup-2025-04-24-12-00-00',
        timestamp: '2025-04-24T12:00:00Z',
        size: '14.9 MB',
        note: 'Weekly automatic backup',
        createdBy: 'System'
      },
      {
        id: '3',
        name: 'backup-2025-04-20-09-15-22',
        timestamp: '2025-04-20T09:15:22Z',
        size: '14.7 MB',
        note: 'Before component price update',
        createdBy: 'admin@ivapro.com'
      }
    ]

    return NextResponse.json(backups)
  } catch (error) {
    console.error('Error retrieving backups:', error)
    return createServerErrorResponse('Failed to retrieve backups')
  }
}