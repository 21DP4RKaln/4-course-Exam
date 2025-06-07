import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { signJWT } from '@/lib/auth/jwt';
import {
  createBadRequestResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z
  .object({
    email: z.string().optional(),
    phone: z.string().optional(),
    identifier: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine(data => data.email || data.phone || data.identifier, {
    message: 'Either email, phone, or identifier is required',
    path: ['email'],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Login request body:', body);

    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      console.log('Validation error:', validationResult.error.format());
      return createBadRequestResponse('Invalid input data', {
        errors: validationResult.error.format(),
      });
    }

    const { email, phone, identifier, password } = validationResult.data;

    const loginIdentifier = identifier || email || phone;

    console.log('Looking up user with identifier:', loginIdentifier);

    let user = null;
    if (loginIdentifier && loginIdentifier.includes('@')) {
      user = await prisma.user.findUnique({
        where: { email: loginIdentifier },
      });
      console.log('Email lookup result:', user ? 'Found' : 'Not found');
    }

    if (!user) {
      user = await prisma.user.findFirst({ where: { phone: loginIdentifier } });
      console.log('Phone lookup result:', user ? 'Found' : 'Not found');
    }

    if (!user) {
      console.log('No user found with provided identifier');
      return createBadRequestResponse('Invalid credentials');
    }
    console.log('Checking password...');
    if (!user.password) {
      console.log('User has no password set');
      return createBadRequestResponse('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Password invalid');
      return createBadRequestResponse('Invalid credentials');
    }

    console.log('Password valid, generating token...');
    const token = await signJWT({
      userId: user.id,
      email: user.email || '',
      role: user.role,
    });

    console.log('Token generated, creating response...');
    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
    });

    response.cookies.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log('Login successful!');
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return createServerErrorResponse('Failed to login');
  }
}
