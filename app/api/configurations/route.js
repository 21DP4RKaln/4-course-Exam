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
      process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8'
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
      },
      orderBy: {
        updatedAt: 'desc'
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
    
    if (!name) {
      return NextResponse.json(
        { message: 'Configuration name is required' },
        { status: 400 }
      );
    }
    
    if (!components || components.length === 0) {
      return NextResponse.json(
        { message: 'At least one component is required' },
        { status: 400 }
      );
    }
    
    const componentDetails = await Promise.all(
      components.map(async (component) => {
        return await prisma.component.findUnique({
          where: { id: component.id }
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
    
    const totalPrice = validComponents.reduce((sum, component) => sum + component.price, 0);
    
    const newConfiguration = await prisma.configuration.create({
      data: {
        name,
        userId,
        status,
        totalPrice,
        components: {
          connect: validComponents.map(component => ({ id: component.id }))
        }
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

export async function GET(request, { params }) {
  try {
    const userId = getUserIdFromToken();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Not authorised' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    const configuration = await prisma.configuration.findUnique({
      where: {
        id,
        userId
      },
      include: {
        components: true
      }
    });
    
    if (!configuration) {
      return NextResponse.json(
        { message: 'Configuration not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(configuration);
  } catch (error) {
    console.error('Configuration fetch error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the configuration' },
      { status: 500 }
    );
  }
}

// DELETE metode - dzēš konfigurāciju
export async function DELETE(request, { params }) {
  try {
    const userId = getUserIdFromToken();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Not authorised' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    const configuration = await prisma.configuration.findUnique({
      where: {
        id,
        userId
      }
    });
    
    if (!configuration) {
      return NextResponse.json(
        { message: 'Configuration not found' },
        { status: 404 }
      );
    }
    
    // Dzēš konfigurāciju
    await prisma.configuration.delete({
      where: {
        id
      }
    });
    
    return NextResponse.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Configuration deletion error:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the configuration' },
      { status: 500 }
    );
  }
}