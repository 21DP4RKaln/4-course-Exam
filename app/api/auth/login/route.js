import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const JWT_SECRET = process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8';
    
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
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