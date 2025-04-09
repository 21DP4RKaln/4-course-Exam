import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || '7w4U4zcoBQgN9OEcAJDF8gNNc5B7h7du'
const secretKey = new TextEncoder().encode(JWT_SECRET)

export type JWTPayload = {
  userId: string
  email: string
  role: string
}

/**
 * Generates a JWT token with the given payload.
 */
export async function signJWT(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey)
}

/**
 * Verifies the JWT token and returns the payload if valid.
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Retrieves the JWT token from the request cookies.
 */
export function getJWTFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('authToken')?.value
  return token || null
}