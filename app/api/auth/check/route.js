import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    
    console.log('Auth check - Token exists:', !!token);
    
    if (!token) {
      return NextResponse.json(
        { message: 'Not authorised', authenticated: false },
        { status: 401 }
      );
    }
    
    const JWT_SECRET = process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8';
    
    try {
      const decoded = jwt.verify(token.value, JWT_SECRET);
      console.log('Auth check - Token verified successfully');
      
      return NextResponse.json({ 
        authenticated: true,
        message: 'Authentication successful',
        userId: decoded.userId
      });
    } catch (verifyError) {
      console.error('Auth check - Token verification failed:', verifyError.message);
      return NextResponse.json(
        { message: 'Invalid or expired token', authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authentication check error:', error);
    return NextResponse.json(
      { message: 'Not authorised', authenticated: false },
      { status: 401 }
    );
  }
}