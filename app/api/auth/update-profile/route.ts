import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createBadRequestResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';

// Add cloud storage configuration
const USE_CLOUD_STORAGE = process.env.USE_CLOUD_STORAGE === 'true';
const CLOUD_STORAGE_URL = process.env.CLOUD_STORAGE_URL || '';

// Function to upload to cloud storage (you'll need to implement based on your provider)
async function uploadToCloud(file: File): Promise<string> {
  // Example for Cloudinary, AWS S3, etc.
  // This is a placeholder - implement based on your cloud provider
  if (process.env.CLOUDINARY_URL) {
    // Cloudinary upload logic
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      process.env.CLOUDINARY_UPLOAD_PRESET || 'profiles'
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  }

  // Fallback to local storage
  throw new Error('Cloud storage not configured');
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
    const formData = await request.formData();

    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const firstName = formData.get('firstName') as string | null;
    const lastName = formData.get('lastName') as string | null;
    const password = formData.get('password') as string | null;
    const profileImage = formData.get('profileImage') as File | null;
    const deleteProfileImage = formData.get('deleteProfileImage') === 'true';
    const shippingAddress = formData.get('shippingAddress') as string | null;
    const shippingCity = formData.get('shippingCity') as string | null;
    const shippingPostalCode = formData.get('shippingPostalCode') as
      | string
      | null;
    const shippingCountry = formData.get('shippingCountry') as string | null;

    if (email === '' && phone === '') {
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

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { firstName: true, lastName: true, email: true, phone: true },
    });

    if (!currentUser) {
      return createUnauthorizedResponse('User not found');
    }

    const updateData: any = {};
    if (email !== null) updateData.email = email || null;
    if (phone !== null) updateData.phone = phone || null;
    if (firstName !== null) updateData.firstName = firstName || null;
    if (lastName !== null) updateData.lastName = lastName || null;
    if (shippingAddress !== null)
      updateData.shippingAddress = shippingAddress || null;
    if (shippingCity !== null) updateData.shippingCity = shippingCity || null;
    if (shippingPostalCode !== null)
      updateData.shippingPostalCode = shippingPostalCode || null;
    if (shippingCountry !== null)
      updateData.shippingCountry = shippingCountry || null;

    if (firstName !== null || lastName !== null) {
      const newFirstName =
        firstName !== null ? firstName : currentUser.firstName || '';
      const newLastName =
        lastName !== null ? lastName : currentUser.lastName || '';

      if (newFirstName || newLastName) {
        updateData.name = `${newFirstName} ${newLastName}`.trim();
      } else {
        updateData.name = null;
      }
    }

    if (password) {
      if (password.length < 8) {
        return createBadRequestResponse(
          'Password must be at least 8 characters'
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (deleteProfileImage) {
      updateData.profileImageUrl = null;
    } else if (profileImage) {
      if (USE_CLOUD_STORAGE) {
        // Upload to cloud storage
        try {
          const cloudUrl = await uploadToCloud(profileImage);
          updateData.profileImageUrl = cloudUrl;
        } catch (cloudError) {
          console.error(
            'Cloud upload failed, falling back to local:',
            cloudError
          );
          // Fall back to local storage
        }
      }

      // Local storage fallback or primary method
      if (!updateData.profileImageUrl) {
        const bytes = await profileImage.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `${randomUUID()}-${profileImage.name}`;

        // For hosting compatibility, try different upload directories
        let uploadDir: string;
        let urlPath: string;

        if (process.env.VERCEL) {
          // Vercel specific - use /tmp directory and serve via API
          uploadDir = '/tmp/uploads/profiles';
          urlPath = `/api/uploads/profiles/${filename}`;
        } else {
          // Traditional hosting
          uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');
          urlPath = `/uploads/profiles/${filename}`;
        }

        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        const imagePath = join(uploadDir, filename);
        await writeFile(imagePath, buffer);
        updateData.profileImageUrl = urlPath;
      }
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
