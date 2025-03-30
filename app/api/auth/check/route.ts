import { NextResponse } from 'next/server';
import { getTokenFromCookies } from '@/lib/jwt';
import { withErrorHandling, ApiErrors } from '@/lib/apiErrors';

/**
 * Enhanced authentication check endpoint
 * Uses the improved JWT verification with proper typing
 */
export async function GET() {
  return withErrorHandling(async () => {
    const payload = await getTokenFromCookies();
    
    if (!payload) {
      return ApiErrors.unauthorized('Not authenticated');
    }
    
    return NextResponse.json({ 
      authenticated: true,
      userId: payload.userId,
      role: payload.role
    });
  });
}