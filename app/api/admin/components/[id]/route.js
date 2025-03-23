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

export async function GET(request, { params }) {
  try {
    const auth = getUserIdAndRoleFromToken();
    
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    const component = await prisma.component.findUnique({
      where: { id }
    });
    
    if (!component) {
      return NextResponse.json(
        { message: 'Component not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(component);
  } catch (error) {
    console.error('Component fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch component' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = getUserIdAndRoleFromToken();
    
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, manufacturer, category, price, specifications, availabilityStatus } = body;
    
    if (!name || !manufacturer || !category || !specifications || price === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const component = await prisma.component.update({
      where: { id },
      data: {
        name,
        manufacturer,
        category,
        price,
        specifications,
        availabilityStatus,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(component);
  } catch (error) {
    console.error('Component update error:', error);
    return NextResponse.json(
      { message: 'Failed to update component' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = getUserIdAndRoleFromToken();
    
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    const configsWithComponent = await prisma.configuration.findMany({
      where: {
        components: {
          some: {
            id: id
          }
        }
      }
    });
    
    if (configsWithComponent.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete component as it is used in existing configurations' },
        { status: 400 }
      );
    }
    
    await prisma.component.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Component deleted successfully' });
  } catch (error) {
    console.error('Component deletion error:', error);
    return NextResponse.json(
      { message: 'Failed to delete component' },
      { status: 500 }
    );
  }
}