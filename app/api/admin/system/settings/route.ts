import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { prisma } from '@/lib/prismaService';

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

    const settings = {
      general: {
        siteName: 'IvaPro PC Configurator',
        contactEmail: 'admin@ivapro.com',
        maxUploadSize: 5,
        maintenanceMode: false,
      },
      email: {
        provider: 'SMTP',
        senderEmail: '14dprkalninskvdarbs@gmail.com',
        senderName: 'IvaPro PC Configurator',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpSecure: true,
        notifyOnNewOrder: true,
        notifyOnNewRepair: true,
      },
      security: {
        loginAttempts: 5,
        lockoutTime: 30,
        requireStrongPasswords: true,
        twoFactorAuthEnabled: false,
      },
      localization: {
        defaultLanguage: 'en',
        availableLanguages: ['en', 'lv', 'ru'],
        defaultCurrency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
      },
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return createServerErrorResponse('Failed to retrieve settings');
  }
}

export async function PUT(request: NextRequest) {
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

    const settings = await request.json();

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return createServerErrorResponse('Failed to update settings');
  }
}
