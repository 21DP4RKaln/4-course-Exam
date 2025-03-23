import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

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
    console.error('Token verification failed:', error);
    return null;
  }
};

export async function GET() {
  try {
    const components = await prisma.component.findMany({
      where: {
        availabilityStatus: {
          in: ['pieejams', 'pasūtāms'] 
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    if (components.length === 0) {
      return NextResponse.json(getDemoComponents());
    }
    
    const formattedComponents = components.map(component => ({
      id: component.id,
      category: component.category,
      name: component.name,
      manufacturer: component.manufacturer,
      price: parseFloat(component.price),
      specs: parseSpecifications(component.specifications),
      stock: component.availabilityStatus === 'pieejams' ? 10 : 0
    }));
    
    return NextResponse.json(formattedComponents);
  } catch (error) {
    console.error('Component fetch error:', error);
    return NextResponse.json(getDemoComponents());
  }
}

function parseSpecifications(specificationsString) {
  try {
    return JSON.parse(specificationsString);
  } catch (error) {
    return { description: specificationsString };
  }
}