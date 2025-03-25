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

    const readyConfigs = await prisma.configuration.findMany({
      where: {
        isPublic: true,
        userId: auth.userId 
      },
      include: {
        components: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(readyConfigs);
  } catch (error) {
    console.error('Ready configs fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch ready configurations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = getUserIdAndRoleFromToken();
    
    if (!auth || !['SPECIALIST', 'ADMIN'].includes(auth.role)) {
      return NextResponse.json(
        { message: 'Not authorized' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { name, components, description } = data;
    
    if (!name || !components || components.length === 0) {
      return NextResponse.json(
        { message: 'Configuration name and components are required' },
        { status: 400 }
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
    
    const newConfig = await prisma.configuration.create({
      data: {
        name,
        userId: auth.userId,
        totalPrice,
        status: 'awaiting_approval', 
        isPublic: true,
        components: {
          connect: validComponents.map(component => ({ id: component.id }))
        }
      },
      include: {
        components: true
      }
    });
    
    return NextResponse.json(newConfig, { status: 201 });
  } catch (error) {
    console.error('Ready config creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create ready configuration' },
      { status: 500 }
    );
  }
}