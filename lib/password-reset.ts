import { prisma } from '@/lib/prismaService';
import { sendPasswordResetEmail, EmailConfig } from '@/lib/email';
import { sendPasswordResetSMS, SMSConfig } from '@/lib/sms';
import crypto from 'crypto';

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createPasswordResetToken(
  userId: string,
  contact: string,
  type: 'email' | 'phone'
) {
  const token = generateSecureToken();
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

  // Delete existing tokens using Prisma client
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId,
      type
    }
  });

  // Create new token using Prisma client
  await prisma.passwordResetToken.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      token,
      code,
      type,
      contact,
      expiresAt,
      used: false,
      createdAt: new Date()
    }
  });

  return { token, code };
}

export async function sendVerificationCode(
  contact: string,
  code: string,
  type: 'email' | 'phone'
) {
  if (type === 'email') {
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    await sendPasswordResetEmail(contact, code, emailConfig);
  } else if (type === 'phone') {
    const smsConfig: SMSConfig = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_FROM_NUMBER || '',
    };

    await sendPasswordResetSMS(contact, code, smsConfig);
  }
}

export async function verifyResetCode(
  contact: string,
  code: string,
  type: 'email' | 'phone'
) {
  // Use Prisma client instead of raw queries
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      contact,
      code,
      type,
      used: false,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true
        }
      }
    }
  });

  if (!resetToken) {
    return null;
  }
  
  return {
    id: resetToken.id,
    token: resetToken.token,
    code: resetToken.code,
    contact: resetToken.contact,
    type: resetToken.type,
    user: {
      id: resetToken.userId,
      email: resetToken.user?.email || null,
      phone: resetToken.user?.phone || null,
    },
  };
}

export async function markTokenAsUsed(tokenId: string) {
  await prisma.passwordResetToken.update({
    where: { id: tokenId },
    data: { used: true }
  });
}

export async function cleanupExpiredTokens() {
  await prisma.passwordResetToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });
}