import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const getUserIdAndRoleFromToken = () => {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(
      token.value,
      process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8'
    );
    return { userId: decoded.userId, role: decoded.role };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export async function GET() {
  try {
    const auth = getUserIdAndRoleFromToken();
    
    if (!auth || !['SPECIALIST', 'ADMIN'].includes(auth.role)) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 403 }
      );
    }

    const components = await prisma.component.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json(components);
  } catch (error) {
    console.error('Components fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = getUserIdAndRoleFromToken();
    
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, manufacturer, category, price, specifications, availabilityStatus } = body;
    
    if (!name || !manufacturer || !category || !specifications || price === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const component = await prisma.component.create({
      data: {
        name,
        manufacturer,
        category,
        price,
        specifications,
        availabilityStatus
      }
    });
    
    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    console.error('Component creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create component' },
      { status: 500 }
    );
  }
}