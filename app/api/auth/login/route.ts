import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signJwtToken, createAuthCookie } from '@/lib/jwt';
import { withErrorHandling, ApiErrors } from '@/lib/apiErrors';

// Define login request data interface
interface LoginRequest {
  email?: string;
  phoneNumber?: string;
  password: string;
}

/**
 * Login API handler
 */
export async function POST(request: Request) {
  return withErrorHandling(async () => {
    // Parse request body
    const body: LoginRequest = await request.json();
    const { email, phoneNumber, password } = body;
    
    // Validate input
    if ((!email && !phoneNumber) || !password) {
      return ApiErrors.badRequest('Email/phone and password are required');
    }

    // Build query
    const query: any = {};
    if (email) {
      query.email = email;
    } else if (phoneNumber) {
      query.phoneNumber = phoneNumber;
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: query
    });

    // Check if user exists
    if (!user) {
      return ApiErrors.unauthorized('Invalid credentials');
    }
    
    // Check if user is blocked
    if (user.blocked) {
      return ApiErrors.forbidden('This account has been blocked');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return ApiErrors.unauthorized('Invalid credentials');
    }

    // Create JWT payload
    const payload = { 
      userId: user.id,
      email: user.email,
      role: user.role
    };
    
    // Sign JWT token
    const token = await signJwtToken(payload);

    // Create response with user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    // Set cookie and return response
    const response = NextResponse.json(
      { 
        success: true,
        data: { 
          user: userWithoutPassword,
          message: 'Login successful'
        }
      },
      { status: 200 }
    );

    // Set HTTP-only cookie with JWT token
    response.cookies.set(createAuthCookie(token));

    return response;
  });
}