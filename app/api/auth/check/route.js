import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '../../../../lib/jwt';

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
    
    const decoded = await verifyJwtToken(token.value);
    
    if (!decoded) {
      console.error('Auth check - Token verification failed');
      return NextResponse.json(
        { message: 'Invalid or expired token', authenticated: false },
        { status: 401 }
      );
    }
    
    console.log('Auth check - Token verified successfully');
    
    return NextResponse.json({ 
      authenticated: true,
      message: 'Authentication successful',
      userId: decoded.userId
    });
  } catch (error) {
    console.error('Authentication check error:', error);
    return NextResponse.json(
      { message: 'Not authorised', authenticated: false },
      { status: 401 }
    );
  }
}