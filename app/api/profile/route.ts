import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createBadRequestResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

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
    const formData = await request.formData();

    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const firstName = formData.get('firstName') as string | null;
    const lastName = formData.get('lastName') as string | null;
    const password = formData.get('password') as string | null;
    const profileImage = formData.get('profileImage') as File | null;
    const shippingAddress = formData.get('shippingAddress') as string | null;
    const shippingCity = formData.get('shippingCity') as string | null;
    const shippingPostalCode = formData.get('shippingPostalCode') as
      | string
      | null;
    const shippingCountry = formData.get('shippingCountry') as string | null;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return createBadRequestResponse('Invalid email address');
      }

      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUserByEmail && existingUserByEmail.id !== payload.userId) {
        return createBadRequestResponse(
          'Email is already in use by another account'
        );
      }
    }

    if (phone) {
      const existingUserByPhone = await prisma.user.findFirst({
        where: { phone },
      });

      if (existingUserByPhone && existingUserByPhone.id !== payload.userId) {
        return createBadRequestResponse(
          'Phone number is already in use by another account'
        );
      }
    }

    const updateData: any = {};
    if (email !== null) updateData.email = email;
    if (phone !== null) updateData.phone = phone;
    if (firstName !== null) updateData.firstName = firstName;
    if (lastName !== null) updateData.lastName = lastName;
    if (shippingAddress !== null) updateData.shippingAddress = shippingAddress;
    if (shippingCity !== null) updateData.shippingCity = shippingCity;
    if (shippingPostalCode !== null)
      updateData.shippingPostalCode = shippingPostalCode;
    if (shippingCountry !== null) updateData.shippingCountry = shippingCountry;

    if (firstName !== null || lastName !== null) {
      const currentUser = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { firstName: true, lastName: true },
      });

      const newFirstName =
        firstName !== null ? firstName : currentUser?.firstName || '';
      const newLastName =
        lastName !== null ? lastName : currentUser?.lastName || '';

      updateData.name = [newFirstName, newLastName].filter(Boolean).join(' ');
    }

    if (password) {
      if (password.length < 8) {
        return createBadRequestResponse(
          'Password must be at least 8 characters'
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (profileImage) {
      const bytes = await profileImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${uuidv4()}-${profileImage.name}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');
      const imagePath = join(uploadDir, filename);

      await writeFile(imagePath, buffer);

      updateData.profileImageUrl = `/uploads/profiles/${filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        profileImageUrl: true,
        shippingAddress: true,
        shippingCity: true,
        shippingPostalCode: true,
        shippingCountry: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return createServerErrorResponse('Failed to update profile');
  }
}
