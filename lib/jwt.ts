import { NextRequest } from 'next/server'
import * as jose from 'jose'

// Constants
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '7w4U4zcoBQgN9OEcAJDF8gNNc5B7h7du')
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret')
const ACCESS_TOKEN_EXPIRES_IN = '1h'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

// Types
export interface JWTPayload {
  userId: string
  email: string
  role: string
  tokenType?: 'access' | 'refresh'
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export class JWTError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'JWTError'
  }
}

// Sign JWT token
export async function signJWT(
  payload: JWTPayload,
  type: 'access' | 'refresh' = 'access'
): Promise<string> {
  try {
    const secret = type === 'access' ? JWT_SECRET : REFRESH_TOKEN_SECRET
    const expiresIn = type === 'access' ? ACCESS_TOKEN_EXPIRES_IN : REFRESH_TOKEN_EXPIRES_IN

    const jwt = await new jose.SignJWT({ ...payload, tokenType: type })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(expiresIn)
      .setIssuedAt()
      .sign(secret)

    return jwt
  } catch (error) {
    console.error(`JWT Sign Error (${type}):`, error)
    throw new JWTError('Failed to sign token', error as Error)
  }
}

// Generate both access and refresh tokens
export async function generateTokenPair(payload: Omit<JWTPayload, 'tokenType'>): Promise<TokenPair> {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      signJWT(payload, 'access'),
      signJWT(payload, 'refresh')
    ])
    return { accessToken, refreshToken }
  } catch (error) {
    throw new JWTError('Failed to generate token pair', error as Error)
  }
}

// Verify JWT token
export async function verifyJWT(token: string, type: 'access' | 'refresh' = 'access'): Promise<JWTPayload | null> {
  try {
    const secret = type === 'access' ? JWT_SECRET : REFRESH_TOKEN_SECRET
    const { payload } = await jose.jwtVerify(token, secret)
    
    if (payload.tokenType !== type) {
      console.error(`Invalid token type. Expected ${type}`)
      return null
    }

    // Validate payload structure
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      console.error('Invalid payload structure')
      return null
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      tokenType: type
    }
  } catch (error) {
    console.error(`JWT Verification Error (${type}):`, error)
    if ((error as Error).name === 'JWTExpired') {
      console.log(`${type} token expired`)
    }
    return null
  }
}

// Get JWT from request
export function getJWTFromRequest(request: NextRequest, type: 'access' | 'refresh' = 'access'): string | undefined {
  const cookieName = type === 'access' ? 'authToken' : 'refreshToken'
  return request.cookies.get(cookieName)?.value
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const payload = await verifyJWT(refreshToken, 'refresh')
  if (!payload) return null

  try {
    const newAccessToken = await signJWT({
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    }, 'access')
    return newAccessToken
  } catch (error) {
    console.error('Failed to refresh access token:', error)
    return null
  }
}