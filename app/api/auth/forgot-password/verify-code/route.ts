import { NextRequest, NextResponse } from 'next/server';
import { verifyResetCode } from '@/lib/password-reset';
import { z } from 'zod';

const verifyCodeSchema = z.object({
  contact: z.string().min(1, 'Contact is required'),
  code: z.string().length(6, 'Code must be 6 digits'),
  type: z.enum(['email', 'phone']),
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact, code, type, token } = verifyCodeSchema.parse(body);

    const resetToken = await verifyResetCode(contact, code, type);

    if (!resetToken || resetToken.token !== token) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }
    return NextResponse.json({
      message: 'Code verified successfully',
      userId: resetToken.user.id,
      token: resetToken.token,
    });
  } catch (error) {
    console.error('Error verifying code:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
