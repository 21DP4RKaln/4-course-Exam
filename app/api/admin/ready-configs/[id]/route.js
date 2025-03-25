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
    
    if (!auth || !['ADMIN', 'SPECIALIST'].includes(auth.role)) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    const config = await prisma.configuration.findUnique({
      where: { 
        id,
        isPublic: true
      },
      include: {
        components: true,
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true
          }
        }
      }
    });
    
    if (!config) {
      return NextResponse.json(
        { message: 'Configuration not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Configuration fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = getUserIdAndRoleFromToken();
    
    if (!auth || !['ADMIN', 'SPECIALIST'].includes(auth.role)) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    const data = await request.json();
    const { name, components, description } = data;
    
    if (!name || !components || components.length === 0) {
      return NextResponse.json(
        { message: 'Configuration name and components are required' },
        { status: 400 }
      );
    }
    
    const config = await prisma.configuration.findUnique({
      where: { id }
    });
    
    if (!config) {
      return NextResponse.json(
        { message: 'Configuration not found' },
        { status: 404 }
      );
    }
    
    const componentDetails = await Promise.all(
      components.map(async (componentId) => {
        return await prisma.component.findUnique({
          where: { id: componentId }
        });
      })
    );
    
    const validComponents = componentDetails.filter(component => component !== null);
    
    if (validComponents.length === 0) {
      return NextResponse.json(
        { message: 'No valid components provided' },
        { status: 400 }
      );
    }
    
    const totalPrice = validComponents.reduce((sum, component) => sum + parseFloat(component.price), 0);
    
    const updatedConfig = await prisma.configuration.update({
      where: { id },
      data: {
        name,
        totalPrice,
        components: {
          set: [], 
          connect: validComponents.map(component => ({ id: component.id })) 
        },
        updatedAt: new Date()
      },
      include: {
        components: true,
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Configuration update error:', error);
    return NextResponse.json(
      { message: 'Failed to update configuration' },
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
    
    const config = await prisma.configuration.findUnique({
      where: { id }
    });
    
    if (!config) {
      return NextResponse.json(
        { message: 'Configuration not found' },
        { status: 404 }
      );
    }
    
    const orders = await prisma.order.findMany({
      where: { configurationId: id }
    });
    
    if (orders.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete configuration as it is used in existing orders' },
        { status: 400 }
      );
    }
    
    await prisma.configuration.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Configuration deletion error:', error);
    return NextResponse.json(
      { message: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}