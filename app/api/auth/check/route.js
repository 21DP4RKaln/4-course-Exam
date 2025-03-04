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
      process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
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