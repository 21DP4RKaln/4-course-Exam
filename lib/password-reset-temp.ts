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
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete any existing tokens for this user using raw SQL
  await prisma.$executeRaw`
    DELETE FROM password_reset_tokens 
    WHERE userId = ${userId} AND type = ${type}
  `;

  // Create new token using raw SQL
  await prisma.$executeRaw`
    INSERT INTO password_reset_tokens (id, userId, token, code, type, contact, expiresAt, used, createdAt)
    VALUES (${crypto.randomUUID()}, ${userId}, ${token}, ${code}, ${type}, ${contact}, ${expiresAt}, false, ${new Date()})
  `;

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
  // Use raw SQL to query password reset tokens
  const resetTokens: any[] = await prisma.$queryRaw`
    SELECT rt.*, u.id as userId, u.email, u.phone
    FROM password_reset_tokens rt
    JOIN user u ON rt.userId = u.id
    WHERE rt.contact = ${contact} 
    AND rt.code = ${code} 
    AND rt.type = ${type}
    AND rt.used = false 
    AND rt.expiresAt > ${new Date()}
    LIMIT 1
  `;

  if (resetTokens.length === 0) {
    return null;
  }

  const resetToken = resetTokens[0];
  return {
    id: resetToken.id,
    token: resetToken.token,
    code: resetToken.code,
    contact: resetToken.contact,
    type: resetToken.type,
    user: {
      id: resetToken.userId,
      email: resetToken.email,
      phone: resetToken.phone,
    },
  };
}

export async function markTokenAsUsed(tokenId: string) {
  await prisma.$executeRaw`
    UPDATE password_reset_tokens 
    SET used = true 
    WHERE id = ${tokenId}
  `;
}

export async function cleanupExpiredTokens() {
  await prisma.$executeRaw`
    DELETE FROM password_reset_tokens 
    WHERE expiresAt < ${new Date()}
  `;
}
