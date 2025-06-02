import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { createPasswordResetToken, sendVerificationCode } from '@/lib/password-reset';
import { z } from 'zod';

const sendCodeSchema = z.object({
  contact: z.string().min(1, 'Contact is required'),
  type: z.enum(['email', 'phone']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact, type } = sendCodeSchema.parse(body);

    let user;
    if (type === 'email') {
      user = await prisma.user.findUnique({
        where: { email: contact },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { phone: contact },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this contact information' },
        { status: 404 }
      );
    }

    const resetToken = await createPasswordResetToken(user.id, contact, type);

    await sendVerificationCode(contact, resetToken.code, type);

    return NextResponse.json({
      message: 'Verification code sent successfully',
      token: resetToken.token, 
    });  } catch (error) {
    console.error('Error sending verification code:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    // More specific error messages
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
