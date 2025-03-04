import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Incorrect email or password' },
        { status: 401 }
      );
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Incorrect email or password' },
        { status: 401 }
      );
    }
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
      { expiresIn: '7d' }
    );
    
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });
    
    const { password: userPassword, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Connection successful!'
    });
  } catch (error) {
    console.error('Connection error:', error);
    return NextResponse.json(
      { message: 'An error occurred during connection' },
      { status: 500 }
    );
  }
}