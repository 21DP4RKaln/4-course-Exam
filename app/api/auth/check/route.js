import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return NextResponse.json(
        { message: 'Not authorised' },
        { status: 401 }
      );
    }
    
    jwt.verify(
      token.value,
      process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8'
    );
    
    return NextResponse.json({ 
      authenticated: true,
      message: 'Authentication successful' 
    });
  } catch (error) {
    console.error('Authentication check error:', error);
    return NextResponse.json(
      { message: 'Not authorised' },
      { status: 401 }
    );
  }
}