import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const getUserIdAndRoleFromToken = () => {
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
    return { userId: decoded.userId, role: decoded.role };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export async function POST(request, { params }) {
  try {
    const auth = getUserIdAndRoleFromToken();
    
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { blocked } = body;
    
    const userToUpdate = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!userToUpdate) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (userToUpdate.role === 'ADMIN' && blocked) {
      return NextResponse.json(
        { message: 'Cannot block an administrator' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { blocked }
    });
    
    return NextResponse.json({
      message: blocked ? 'User blocked successfully' : 'User unblocked successfully',
      user: {
        id: updatedUser.id,
        blocked: updatedUser.blocked
      }
    });
  } catch (error) {
    console.error('Toggle block error:', error);
    return NextResponse.json(
      { message: 'Failed to update user' },
      { status: 500 }
    );
  }
}