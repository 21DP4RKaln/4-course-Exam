// app/api/auth/route.ts - Combined authentication handler
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { withErrorHandling, ApiErrors } from '@/lib/api';
import { signJwtToken, verifyJwtToken, createAuthCookie } from '@/lib/jwt';

// Login request types
interface LoginRequest {
  email?: string;
  phoneNumber?: string;
  password: string;
}

// Registration request types
interface RegisterRequest {
  name: string;
  surname: string;
  email?: string | null;
  phoneNumber?: string | null;
  password: string;
}

/**
 * Login handler
 */
export async function POST(request: NextRequest) {
  // Determine the requested action from the URL
  const { pathname } = request.nextUrl;
  const action = pathname.split('/').pop();
  
  switch(action) {
    case 'login':
      return handleLogin(request);
    case 'register':
      return handleRegister(request);
    case 'logout':
      return handleLogout();
    case 'check':
      return handleAuthCheck();
    default:
      return ApiErrors.badRequest('Invalid auth endpoint');
  }
}

/**
 * Login handler
 */
async function handleLogin(request: NextRequest) {
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

/**
 * Registration handler
 */
async function handleRegister(request: NextRequest) {
  return withErrorHandling(async () => {
    // Parse request body
    const body: RegisterRequest = await request.json();
    const { name, surname, email, phoneNumber, password } = body;

    // Validate input
    if (!name || !surname || (!email && !phoneNumber) || !password) {
      return ApiErrors.badRequest('Missing required fields. Name, surname, password, and either email or phone number are required.');
    }

    // Check if user with the same email or phone exists
    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
      if (existingUserByEmail) {
        return ApiErrors.conflict('Email already in use');
      }
    }

    if (phoneNumber) {
      const existingUserByPhone = await prisma.user.findUnique({ where: { phoneNumber } });
      if (existingUserByPhone) {
        return ApiErrors.conflict('Phone number already in use');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        name,
        surname,
        email: email || null, 
        phoneNumber: phoneNumber || null, 
        password: hashedPassword,
        role: 'CLIENT',
      },
    });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    // Create JWT payload
    const payload = { 
      userId: user.id,
      email: user.email,
      role: user.role
    };
    
    // Sign JWT token
    const token = await signJwtToken(payload);

    // Create response with cookie
    const response = NextResponse.json(
      { 
        success: true,
        data: {
          user: userWithoutPassword,
          message: 'User registered successfully'
        }
      },
      { status: 201 }
    );

    // Set HTTP-only cookie with JWT token
    response.cookies.set(createAuthCookie(token));

    return response;
  });
}

/**
 * Logout handler
 */
async function handleLogout() {
  return withErrorHandling(async () => {
    // Delete the token cookie
    const cookieStore = cookies();
    cookieStore.delete('token');
    
    return NextResponse.json({ 
      success: true,
      data: {
        message: 'Logout successful'
      }
    });
  });
}

/**
 * Auth check handler
 */
async function handleAuthCheck() {
  return withErrorHandling(async () => {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return ApiErrors.unauthorized('Not authenticated');
    }
    
    // Verify token
    const payload = await verifyJwtToken(token.value);
    
    if (!payload) {
      return ApiErrors.unauthorized('Invalid or expired token');
    }
    
    return NextResponse.json({ 
      success: true,
      data: {
        authenticated: true,
        userId: payload.userId,
        role: payload.role
      }
    });
  });
}

// For the GET method, only allow auth checks
export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const action = pathname.split('/').pop();
  
  if (action === 'check') {
    return handleAuthCheck();
  }
  
  return ApiErrors.badRequest('Invalid auth endpoint');
}