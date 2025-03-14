import { SignJWT, jwtVerify } from 'jose';

export async function signJwtToken(payload, expiresIn = '7d') {
  const JWT_SECRET = process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8';
  
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + (typeof expiresIn === 'number' ? expiresIn : 7 * 24 * 60 * 60); 
  
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret);
  
  return token;
}

export async function verifyJwtToken(token) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8';
    const secret = new TextEncoder().encode(JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}