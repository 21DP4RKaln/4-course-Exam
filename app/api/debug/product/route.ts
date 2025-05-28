import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';

/**
 * Debug endpoint to help diagnose product loading issues
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // If ID is provided, check for its existence in all possible tables
      const results = {
        queryId: id,
        exists: {
          component: false,
          peripheral: false,
          configuration: false
        },
        details: {} as any
      };
      
      // Check component
      const component = await prisma.component.findUnique({
        where: { id },
        select: { id: true, name: true, categoryId: true }
      });
      
      if (component) {
        results.exists.component = true;
        results.details.component = component;
      }
      
      // Check peripheral
      const peripheral = await prisma.peripheral.findUnique({
        where: { id },
        select: { id: true, name: true, categoryId: true }
      });
      
      if (peripheral) {
        results.exists.peripheral = true;
        results.details.peripheral = peripheral;
      }
      
      // Check configuration
      const configuration = await prisma.configuration.findUnique({
        where: { id },
        select: { id: true, name: true }
      });
      
      if (configuration) {
        results.exists.configuration = true;
        results.details.configuration = configuration;
      }
      
      return NextResponse.json(results);
    } else {
      // If no ID is provided, return a sample from each table
      const components = await prisma.component.findMany({
        take: 5,
        select: { id: true, name: true, categoryId: true }
      });
      
      const peripherals = await prisma.peripheral.findMany({
        take: 5,
        select: { id: true, name: true, categoryId: true }
      });
      
      const configurations = await prisma.configuration.findMany({
        take: 5,
        select: { id: true, name: true }
      });
      
      return NextResponse.json({
        samples: {
          components,
          peripherals,
          configurations
        }
      });
    }
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
