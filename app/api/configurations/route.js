import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const getUserIdFromToken = () => {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(
      token.value,
      process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
    );
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

export async function GET() {
  try {
    const userId = getUserIdFromToken();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Not authorised' },
        { status: 401 }
      );
    }
    
    const configurations = await prisma.configuration.findMany({
      where: {
        userId
      },
      include: {
        components: true
      }
    });
    
    return NextResponse.json(configurations);
  } catch (error) {
    console.error('Configuration extraction error:', error);
    return NextResponse.json(
      { message: 'An error occurred during configuration extraction' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const userId = getUserIdFromToken();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Not authorised' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { name, components, status = 'draft' } = data;
    
    let totalPrice = 0;
    if (components && components.length > 0) {
      components.forEach(component => {
        if (component.price) {
          totalPrice += parseFloat(component.price);
        }
      });
    }
    
    const newConfiguration = await prisma.configuration.create({
      data: {
        name,
        userId,
        status,
        totalPrice,
        ...(components && components.length > 0 && {
          components: {
            connect: components.map(component => ({ id: component.id }))
          }
        })
      },
      include: {
        components: true
      }
    });
    
    return NextResponse.json(newConfiguration);
  } catch (error) {
    console.error('Configuration creation error:', error);
    return NextResponse.json(
      { message: 'An error occurred during configuration creation' },
      { status: 500 }
    );
  }
}