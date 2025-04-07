import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8';
const JWT_EXPIRES_IN = '7d'; 

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
 * Iegūt lietotāja ID un lomu no cepuma
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
 * Pārbaudīt, vai lietotājam ir nepieciešamā loma
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
 * Pārbaudīt, vai lietotājs ir autentificēts
 */
export function isAuthenticated() {
  return !!getUserInfoFromCookie();
}

/**
 * Pārbaudīt tokenu no pieprasījuma
 * @param req - NextRequest objekts
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
 * Iegūt lietotāja ID, ja tāds ir
 */
export function getUserId(): string | null {
  const userInfo = getUserInfoFromCookie();
  return userInfo?.userId || null;
}

/**
 * Iegūt lietotāja lomu, ja tāda ir
 */
export function getUserRole(): string | null {
  const userInfo = getUserInfoFromCookie();
  return userInfo?.role || null;
}

/**
 * Pārbaudīt, vai lietotājam ir administrātora tiesības
 */
export function isAdmin(): boolean {
  const role = getUserRole();
  return role === 'ADMIN';
}

/**
 * Pārbaudīt, vai lietotājam ir speciālista tiesības
 */
export function isSpecialist(): boolean {
  const role = getUserRole();
  return role === 'SPECIALIST' || role === 'ADMIN';
}

/**
 * Ģenerēt jaunu JWT tokenu
 */
export function generateToken(payload: Omit<UserAuthInfo, 'iat' | 'exp'>): string {
  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Izveidot cepuma opcijas priekš autentifikācijas
 */
export function createAuthCookie(token: string) {
  return {
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60, 
    path: '/',
    sameSite: 'lax' as const
  };
}