import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcrypt';
import { signJwtToken } from '../../../../lib/jwt';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, phoneNumber, password } = body;
    
    if ((!email && !phoneNumber) || !password) {
      console.log('Missing identifier (email or phone) or password');
      return NextResponse.json(
        { message: 'Email/phone and password are required' },
        { status: 400 }
      );
    }

    const query = {};
    if (email) {
      console.log('Login attempt with email:', email);
      query.email = email;
    } else {
      console.log('Login attempt with phone number:', phoneNumber);
      query.phoneNumber = phoneNumber;
    }

    const user = await prisma.user.findFirst({
      where: query
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    if (user.blocked) {
      console.log('User is blocked');
      return NextResponse.json(
        { message: 'This account has been blocked' },
        { status: 403 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const payload = { 
      userId: user.id,
      email: user.email,
      role: user.role
    };
    
    const token = await signJwtToken(payload);

    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          surname: user.surname,
          phoneNumber: user.phoneNumber,
          role: user.role
        }
      },
      { status: 200 }
    );

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, 
      path: '/',
      sameSite: 'lax'
    });

    console.log('Login successful, token set');
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Server error occurred' },
      { status: 500 }
    );
  }
}