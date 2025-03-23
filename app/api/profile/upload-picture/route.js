import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const getUserIdFromToken = () => {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(
      token.value,
      process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8'
    );
    return decoded.userId;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export async function POST(request) {
  try {
    const userId = getUserIdFromToken();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('profilePicture');
    
    if (!file) {
      return NextResponse.json(
        { message: 'No image file provided' },
        { status: 400 }
      );
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
    console.log("Profile picture data length:", userData?.profilePicture?.length || 0);
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: base64Image }
    });
    
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      message: 'Profile picture updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { message: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}