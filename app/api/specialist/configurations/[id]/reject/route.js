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
    
    if (!auth || !['SPECIALIST', 'ADMIN'].includes(auth.role)) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    const configuration = await prisma.configuration.findUnique({
      where: { id }
    });
    
    if (!configuration) {
      return NextResponse.json(
        { message: 'Configuration not found' },
        { status: 404 }
      );
    }
    
    if (configuration.status !== 'awaiting_approval') {
      return NextResponse.json(
        { message: 'Configuration is not awaiting approval' },
        { status: 400 }
      );
    }
    
    const body = await request.json().catch(() => ({}));
    const { reason } = body;
    
    const updatedConfiguration = await prisma.configuration.update({
      where: { id },
      data: {
        status: 'rejected',
        isPublic: false 
      }
    });
    
    return NextResponse.json({
      message: 'Configuration rejected successfully',
      configuration: updatedConfiguration
    });
  } catch (error) {
    console.error('Configuration rejection error:', error);
    return NextResponse.json(
      { message: 'Failed to reject configuration' },
      { status: 500 }
    );
  }
}