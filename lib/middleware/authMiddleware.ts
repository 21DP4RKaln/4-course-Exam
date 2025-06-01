import { NextRequest } from 'next/server';
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt';
import { createUnauthorizedResponse, createForbiddenResponse } from '@/lib/apiErrors';
import { JWTPayload } from '@/lib/jwt';

/**
 * Authenticate a user from the request
 * @returns JWTPayload if authenticated, or an error response if not
 */
export async function authenticate(request: NextRequest): Promise<JWTPayload | Response> {
  const token = getJWTFromRequest(request);
  if (!token) {
    return createUnauthorizedResponse('Authentication required');
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return createUnauthorizedResponse('Invalid token');
  }

  return payload;
}

/**
 * Authenticate an admin user from the request
 * @returns JWTPayload if authenticated as admin, or an error response if not
 */
export async function authenticateAdmin(request: NextRequest): Promise<JWTPayload | Response> {
  const payload = await authenticate(request);
  
  if (payload instanceof Response) {
    return payload; 
  }
  
  if (payload.role !== 'ADMIN') {
    return createForbiddenResponse('Admin access required');
  }
  
  return payload;
}

/**
 * Authenticate a staff user (admin or specialist) from the request
 * @returns JWTPayload if authenticated as staff, or an error response if not
 */
export async function authenticateStaff(request: NextRequest): Promise<JWTPayload | Response> {
  const payload = await authenticate(request);
  
  if (payload instanceof Response) {
    return payload; 
  }
  
  if (!['ADMIN', 'SPECIALIST'].includes(payload.role)) {
    return createForbiddenResponse('Staff access required');
  }
  
  return payload;
}