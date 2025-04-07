// app/api/components/route.ts - Main API endpoint for components
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiErrors, withErrorHandling } from '@/lib/api';
import { getUserFromToken } from '@/lib/auth';

/**
 * GET handler for fetching components with filtering
 * Supports query parameters: category, search, available
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const availableOnly = searchParams.get('available') === 'true';
    
    // Build filter criteria
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { manufacturer: { contains: search } },
        { specifications: { contains: search } }
      ];
    }
    
    if (availableOnly) {
      where.availabilityStatus = {
        in: ['pieejams', 'pasūtāms']
      };
    }
    
    // Execute the query
    const components = await prisma.component.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });
    
    // Format components for the client
    const formattedComponents = components.map(component => ({
      id: component.id,
      category: component.category,
      name: component.name,
      manufacturer: component.manufacturer,
      price: parseFloat(component.price.toString()),
      specifications: parseSpecifications(component.specifications),
      availabilityStatus: component.availabilityStatus
    }));
    
    return NextResponse.json(formattedComponents);
  });
}

/**
 * POST handler for creating a new component (admin only)
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get user from token and verify admin permissions
    const user = await getUserFromToken(request);
    
    if (!user || user.role !== 'ADMIN') {
      return ApiErrors.forbidden('Only administrators can create components');
    }
    
    // Parse request body
    const body = await request.json();
    const { 
      name, 
      manufacturer, 
      category, 
      price, 
      specifications, 
      productCode,
      availabilityStatus 
    } = body;
    
    // Validate required fields
    if (!name || !manufacturer || !category || !specifications || price === undefined) {
      return ApiErrors.badRequest('Missing required fields');
    }
    
    // Create the component
    const component = await prisma.component.create({
      data: {
        name,
        manufacturer,
        category,
        price,
        specifications: typeof specifications === 'string' 
          ? specifications 
          : JSON.stringify(specifications),
        productCode,
        availabilityStatus,
        addedById: user.id
      }
    });
    
    return NextResponse.json(component, { status: 201 });
  });
}

// Helper to parse specifications
function parseSpecifications(specificationsString: string) {
  try {
    // Try to parse as JSON
    return JSON.parse(specificationsString);
  } catch (error) {
    // If not JSON, return as a simple object with description
    return { description: specificationsString };
  }
}