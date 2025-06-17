import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prismaService';
import { getJWTFromRequest, verifyJWT } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createBadRequestResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { put } from '@vercel/blob';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload to cloud storage
async function uploadToCloud(file: File): Promise<string> {
  console.log('🔧 [HOSTING DEBUG] Starting cloud upload process...');
  console.log('🔧 [HOSTING DEBUG] Environment check:', {
    hasCloudinaryName: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasCloudinaryKey: !!process.env.CLOUDINARY_API_KEY,
    hasCloudinarySecret: !!process.env.CLOUDINARY_API_SECRET,
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    isVercel: !!process.env.VERCEL,
  });

  // Try Vercel Blob first if token is available
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      console.log('🔧 [HOSTING DEBUG] Trying Vercel Blob upload...');
      const filename = `profiles/${randomUUID()}-${file.name}`;
      const blob = await put(filename, file, {
        access: 'public',
      });
      console.log(
        '✅ [HOSTING DEBUG] Vercel Blob upload successful:',
        blob.url
      );
      return blob.url;
    } catch (error: any) {
      console.error('❌ [HOSTING DEBUG] Vercel Blob upload failed:', error);
    }
  }

  // Fallback to Cloudinary
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      console.log('🔧 [HOSTING DEBUG] Trying Cloudinary upload...');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString('base64')}`,
        {
          folder: 'profiles',
          public_id: `${randomUUID()}-${file.name.split('.')[0]}`,
          overwrite: true,
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' },
          ],
        }
      );

      console.log(
        '✅ [HOSTING DEBUG] Cloudinary upload successful:',
        result.secure_url
      );
      return result.secure_url;
    } catch (error: any) {
      console.error('❌ [HOSTING DEBUG] Cloudinary upload failed:', error);
      console.error('❌ [HOSTING DEBUG] Cloudinary error details:', {
        message: error?.message,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME?.substring(0, 5) + '...',
      });
    }
  } else {
    console.error('❌ [HOSTING DEBUG] Cloudinary not configured. Missing:', {
      cloudName: !process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: !process.env.CLOUDINARY_API_KEY,
      apiSecret: !process.env.CLOUDINARY_API_SECRET,
    });
  }

  throw new Error(
    '❌ [HOSTING DEBUG] No cloud storage service configured or all uploads failed'
  );
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

    console.log('Profile update request:', {
      hasImage: !!profileImage,
      deleteImage: deleteProfileImage,
      imageSize: profileImage?.size,
      imageName: profileImage?.name,
    });

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
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profileImageUrl: true,
      },
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

    // Handle profile image upload
    if (deleteProfileImage) {
      console.log('Deleting profile image');
      updateData.profileImageUrl = null;
    } else if (profileImage && profileImage.size > 0) {
      try {
        console.log('Processing profile image upload...');
        const imageUrl = await uploadToCloud(profileImage);
        updateData.profileImageUrl = imageUrl;
        console.log('Profile image uploaded successfully:', imageUrl);
      } catch (error) {
        console.error('Profile image upload failed:', error);
        return createServerErrorResponse('Failed to upload profile image');
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

    console.log('Profile updated successfully:', {
      userId: updatedUser.id,
      profileImageUrl: updatedUser.profileImageUrl,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return createServerErrorResponse('Failed to update profile');
  }
}
