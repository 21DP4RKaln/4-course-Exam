import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { prisma } from '@/lib/prismaService';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required');
    }

    const { note } = await request.json();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;

    const [users, components, configurations, orders, repairs] =
      await Promise.all([
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
          },
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
                    price: true,
                  },
                },
              },
            },
          },
        }),
        prisma.order.findMany({
          include: {
            orderItems: true,
          },
        }),
        prisma.repair.findMany(),
      ]);

    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        note: note || 'Manual backup',
        version: '1.0.0',
        createdBy: payload.userId,
      },
      data: {
        users,
        components,
        configurations,
        orders,
        repairs,
      },
    };

    const backupDir = join(process.cwd(), 'backups');

    if (!existsSync(backupDir)) {
      await mkdir(backupDir, { recursive: true });
    }

    const backupPath = join(backupDir, `${backupName}.json`);
    await writeFile(backupPath, JSON.stringify(backupData, null, 2));

    console.log(`Backup created: ${backupPath}`);

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
      path: backupPath,
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return createServerErrorResponse('Failed to create backup');
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required');
    }

    const backups = [
      {
        id: '1',
        name: 'backup-2025-05-01-12-00-00',
        timestamp: '2025-05-01T12:00:00Z',
        size: '15.4 MB',
        note: 'Weekly automatic backup',
        createdBy: 'System',
      },
      {
        id: '2',
        name: 'backup-2025-04-24-12-00-00',
        timestamp: '2025-04-24T12:00:00Z',
        size: '14.9 MB',
        note: 'Weekly automatic backup',
        createdBy: 'System',
      },
      {
        id: '3',
        name: 'backup-2025-04-20-09-15-22',
        timestamp: '2025-04-20T09:15:22Z',
        size: '14.7 MB',
        note: 'Before component price update',
        createdBy: 'admin@ivapro.com',
      },
    ];

    return NextResponse.json(backups);
  } catch (error) {
    console.error('Error retrieving backups:', error);
    return createServerErrorResponse('Failed to retrieve backups');
  }
}
