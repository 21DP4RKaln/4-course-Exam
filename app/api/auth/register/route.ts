import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { signJWT } from '@/lib/auth/jwt';
import {
  createBadRequestResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import * as bcrypt from 'bcryptjs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const email = (formData.get('email') as string) || '';
    const password = formData.get('password') as string;
    const firstName = (formData.get('firstName') as string) || '';
    const lastName = (formData.get('lastName') as string) || '';
    const phone = (formData.get('phone') as string) || '';
    const profileImage = formData.get('profileImage') as File | null;

    if (!password || password.length < 8) {
      return createBadRequestResponse('Password must be at least 8 characters');
    }

    if (!email && !phone) {
      return createBadRequestResponse('Either email or phone is required');
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return createBadRequestResponse('Invalid email address');
      }

      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUserByEmail) {
        return createBadRequestResponse('User with this email already exists');
      }
    }

    if (phone) {
      const existingUserByPhone = await prisma.user.findFirst({
        where: { phone },
      });

      if (existingUserByPhone) {
        return createBadRequestResponse(
          'User with this phone number already exists'
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profileImageUrl = null;
    if (profileImage) {
      const bytes = await profileImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${randomUUID()}-${profileImage.name}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');

      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const imagePath = join(uploadDir, filename);

      await writeFile(imagePath, buffer);

      profileImageUrl = `/uploads/profiles/${filename}`;
    }

    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: email || null,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim() || null,
        phone: phone || null,
        profileImageUrl,
        role: 'USER',
      },
    });

    const token = await signJWT({
      userId: user.id,
      email: user.email || '',
      role: user.role,
    });

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
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return createServerErrorResponse('Failed to register user');
  }
}
