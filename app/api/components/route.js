import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';

export async function GET() {
  try {
    const components = await prisma.component.findMany({
      where: {
        availabilityStatus: {
          in: ['pieejams', 'pasūtāms'] // Only show available or orderable components
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    if (components.length === 0) {
      // Fallback for empty database (demo data)
      return NextResponse.json(getDemoComponents());
    }
    
    // Format components for the client-side configurator
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
    // Try to parse the specifications as JSON if they're stored that way
    return JSON.parse(specificationsString);
  } catch (error) {
    // If not JSON, return as a simple object with description
    return { description: specificationsString };
  }
}

// Fallback demo data in case the database is empty
function getDemoComponents() {
  return [
    {
      id: 'cpu1',
      category: 'CPU',
      name: 'Intel Core i7-13700K',
      manufacturer: 'Intel',
      price: 419.99,
      specs: {
        cores: 16,
        threads: 24,
        baseFrequency: '3.4 GHz',
        boostFrequency: '5.4 GHz',
        cache: '30 MB'
      },
      stock: 10
    },
    {
      id: 'cpu2',
      category: 'CPU',
      name: 'AMD Ryzen 7 7800X3D',
      manufacturer: 'AMD',
      price: 449.99,
      specs: {
        cores: 8,
        threads: 16,
        baseFrequency: '4.2 GHz',
        boostFrequency: '5.0 GHz',
        cache: '96 MB'
      },
      stock: 10
    },
    {
      id: 'gpu1',
      category: 'GPU',
      name: 'NVIDIA GeForce RTX 4070',
      manufacturer: 'NVIDIA',
      price: 599.99,
      specs: {
        memory: '12 GB GDDR6X',
        coreClock: '2.48 GHz',
        ports: 'HDMI 2.1, 3x DisplayPort 1.4a'
      },
      stock: 10
    },
    {
      id: 'gpu2',
      category: 'GPU',
      name: 'AMD Radeon RX 7800 XT',
      manufacturer: 'AMD',
      price: 549.99,
      specs: {
        memory: '16 GB GDDR6',
        coreClock: '2.43 GHz',
        ports: 'HDMI 2.1, 2x DisplayPort 2.1'
      },
      stock: 10
    }
  ];
}