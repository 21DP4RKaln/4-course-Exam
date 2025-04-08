import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8';
const JWT_EXPIRES_IN = '7d'; 
const MAX_AGE = 7 * 24 * 60 * 60; 

/**
 * Lietotāja informācija no JWT
 */
export interface UserAuthInfo {
  userId: string;
  email?: string | null;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT payload informācija
 */
export interface JwtPayload extends UserAuthInfo {}

/**
 * Ģenerē JWT tokenu izmantojot JOSE bibliotēku
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
 * Pārbauda JWT tokenu izmantojot JOSE bibliotēku
 */
export async function verifyJwtToken(token: string): Promise<JwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
 
    if (!payload.userId || !payload.role) {
      console.error('JWT payload missing required properties:', payload);
      return null;
    }
    
    return payload as unknown as JwtPayload;
  } catch (error) {
    console.error('Token verification failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Izveido cepuma opcijas autentifikācijai
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

/**
 * Iegūst lietotāja ID un lomu no cepuma
 */
export function getUserInfoFromCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(
      token.value,
      JWT_SECRET
    ) as UserAuthInfo;
    
    return {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Pārbauda, vai lietotājam ir nepieciešamā loma
 */
export function hasRequiredRole(requiredRoles?: string[]) {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  
  const userInfo = getUserInfoFromCookie();
  if (!userInfo) {
    return false;
  }
  
  return requiredRoles.includes(userInfo.role);
}

/**
 * Pārbauda, vai lietotājs ir autentificēts
 */
export function isAuthenticated() {
  return !!getUserInfoFromCookie();
}

/**
 * Pārbauda tokenu no pieprasījuma
 */
export async function verifyRequestToken(req: NextRequest): Promise<UserAuthInfo | null> {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserAuthInfo;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Iegūst lietotāja ID, ja tāds ir
 */
export function getUserId(): string | null {
  const userInfo = getUserInfoFromCookie();
  return userInfo?.userId || null;
}

/**
 * Iegūst lietotāja lomu, ja tāda ir
 */
export function getUserRole(): string | null {
  const userInfo = getUserInfoFromCookie();
  return userInfo?.role || null;
}

/**
 * Pārbauda, vai lietotājam ir administrātora tiesības
 */
export function isAdmin(): boolean {
  const role = getUserRole();
  return role === 'ADMIN';
}

/**
 * Pārbauda, vai lietotājam ir speciālista tiesības
 */
export function isSpecialist(): boolean {
  const role = getUserRole();
  return role === 'SPECIALIST' || role === 'ADMIN';
}

/**
 * Iegūst tokenu no cepumiem un pārbauda to
 */
export async function getTokenFromCookies(): Promise<JwtPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyJwtToken(token);
}