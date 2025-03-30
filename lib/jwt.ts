import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Define token types for better type safety
export interface JwtPayload {
  userId: string;
  email?: string | null;
  role: 'CLIENT' | 'SPECIALIST' | 'ADMIN';
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Signs a JWT token with enhanced security settings
 */
export async function signJwtToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn: number | string = MAX_AGE): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const iat = Math.floor(Date.now() / 1000);
  const exp = typeof expiresIn === 'number' 
    ? iat + expiresIn 
    : iat + MAX_AGE;
  
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .setNotBefore(iat)
    .sign(secret);
  
  return token;
}

/**
 * Verifies a JWT token and returns the payload
 */
export async function verifyJwtToken(token: string): Promise<JwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as JwtPayload;
  } catch (error) {
    console.error('Token verification failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Gets the JWT token from cookies and verifies it
 */
export async function getTokenFromCookies(): Promise<JwtPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyJwtToken(token);
}

/**
 * Creates a secure cookie with the JWT token
 */
export function createAuthCookie(token: string) {
  return {
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
    path: '/',
    sameSite: 'lax' as const
  };
}