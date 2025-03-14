import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// GET route (existing)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8'
    );

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId
      },
      include: {
        configurations: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Profile loading error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { message: 'Unauthorised access' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8'
    );

    const userData = await request.json();
    
    if (!userData.name || !userData.email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    if (userData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: userData.email,
          id: { not: decoded.userId }
        }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { message: 'Email is already in use by another user' },
          { status: 409 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: decoded.userId
      },
      data: {
        name: userData.name,
        email: userData.email
      }
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { message: 'Unauthorised access' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}