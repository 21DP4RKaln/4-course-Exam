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

export async function PUT(request, { params }) {
  try {
    const userId = getUserIdFromToken();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Not authorised' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const data = await request.json();
    const { name, components, status } = data;
    
    const existingConfiguration = await prisma.configuration.findUnique({
      where: {
        id,
        userId
      }
    });
    
    if (!existingConfiguration) {
      return NextResponse.json(
        { message: 'Configuration not found' },
        { status: 404 }
      );
    }
    
    const updateData = {};
    
    if (name) {
      updateData.name = name;
    }
    
    if (status) {
      updateData.status = status;
    }
    
    if (components && components.length > 0) {
      const componentDetails = await Promise.all(
        components.map(async (component) => {
          return await prisma.component.findUnique({
            where: { id: component.id }
          });
        })
      );
      
      const validComponents = componentDetails.filter(component => component !== null);
      
      if (validComponents.length > 0) {
        const totalPrice = validComponents.reduce((sum, component) => sum + component.price, 0);
        updateData.totalPrice = totalPrice;
        
        const updatedConfiguration = await prisma.configuration.update({
          where: {
            id
          },
          data: {
            ...updateData,
            components: {
              set: [], 
              connect: validComponents.map(component => ({ id: component.id })) 
            }
          },
          include: {
            components: true
          }
        });
        
        return NextResponse.json(updatedConfiguration);
      }
    }
    
    const updatedConfiguration = await prisma.configuration.update({
      where: {
        id
      },
      data: updateData,
      include: {
        components: true
      }
    });
    
    return NextResponse.json(updatedConfiguration);
  } catch (error) {
    console.error('Configuration update error:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the configuration' },
      { status: 500 }
    );
  }
}