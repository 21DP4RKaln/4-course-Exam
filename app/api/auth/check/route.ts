import { NextResponse } from 'next/server';
import { getTokenFromCookies } from './lib/jwt';

/**
 * Enhanced authentication check endpoint
 * Uses the improved JWT verification with proper typing
 */
export async function GET() {
  try {
    const payload = await getTokenFromCookies();
    
    if (!payload) {
      return NextResponse.json(
        { 
          authenticated: false, 
          message: 'Not authenticated',
          code: 'auth_required'
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      authenticated: true,
      userId: payload.userId,
      role: payload.role,
      code: 'auth_success'
    });
  } catch (error) {
    console.error('Authentication check error:', error);
    
    return NextResponse.json(
      { 
        authenticated: false, 
        message: 'Authentication error occurred',
        code: 'auth_error'
      },
      { status: 500 }
    );
  }
}