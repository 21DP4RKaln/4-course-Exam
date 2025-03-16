import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { signJwtToken } from '../../../../lib/edgeJWT';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, surname, email, phoneNumber, password } = body;

    console.log('Registration attempt for:', { name, surname, email, phoneNumber: phoneNumber || 'Not provided' });

    if (!name || !surname || (!email && !phoneNumber) || !password) {
      return NextResponse.json(
        { message: 'Missing required fields. Name, surname, password, and either email or phone number are required.' },
        { status: 400 }
      );
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (phoneNumber && !/^\+?[0-9]{8,15}$/.test(phoneNumber)) {
      return NextResponse.json(
        { message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUserByEmail) {
        return NextResponse.json(
          { message: 'User with this email already exists' },
          { status: 409 }
        );
      }
    }

    if (phoneNumber) {
      const existingUserByPhone = await prisma.user.findFirst({
        where: { phoneNumber },
      });

      if (existingUserByPhone) {
        return NextResponse.json(
          { message: 'User with this phone number already exists' },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        name,
        surname,
        email: email || null, 
        phoneNumber: phoneNumber || null, 
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    const payload = { 
      userId: user.id,
      email: user.email
    };
    
    const token = await signJwtToken(payload);

    const response = NextResponse.json(
      { 
        user: userWithoutPassword,
        message: 'User registered successfully' 
      },
      { status: 201 }
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

    console.log('Registration successful, token set');
    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}