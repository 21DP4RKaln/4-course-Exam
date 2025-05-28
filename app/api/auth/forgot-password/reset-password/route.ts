import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyResetCode, markTokenAsUsed } from '@/lib/password-reset';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Enhanced password validation function
function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  let strength = 0;
  if (/(?=.*[a-z])/.test(password)) strength++; // lowercase
  if (/(?=.*[A-Z])/.test(password)) strength++; // uppercase  
  if (/(?=.*\d)/.test(password)) strength++; // number
  if (/(?=.*[@$!%*?&])/.test(password)) strength++; // special character
  
  if (strength < 3) {
    return { 
      isValid: false, 
      message: 'Password must contain at least 3 of the following: lowercase letter, uppercase letter, number, or special character' 
    };
  }
  
  return { isValid: true };
}

const resetPasswordSchema = z.object({
  contact: z.string().min(1, 'Contact is required'),
  code: z.string().length(6, 'Code must be 6 digits'),
  type: z.enum(['email', 'phone']),
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .refine((password) => validatePasswordStrength(password).isValid, {
      message: 'Password must be at least 8 characters with uppercase, lowercase, number and/or special character'
    }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact, code, type, token, newPassword } = resetPasswordSchema.parse(body);

    // Additional password strength validation
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Verify the reset code
    const resetToken = await verifyResetCode(contact, code, type);

    if (!resetToken || resetToken.token !== token) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);    // Update the user's password
    await prisma.user.update({
      where: { id: resetToken.user.id },
      data: { password: hashedPassword },
    });

    // Mark the token as used
    await markTokenAsUsed(resetToken.id);

    return NextResponse.json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
