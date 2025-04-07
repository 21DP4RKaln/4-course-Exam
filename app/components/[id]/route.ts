// app/api/components/[id]/route.ts - API endpoints for a specific component
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiErrors, withErrorHandling } from '@/lib/api';
import { getUserFromToken } from '@/lib/auth';

/**
 * GET handler for fetching a single component by ID
 */
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  return withErrorHandling(async () => {
    const { id } = context.params;
    
    const component = await prisma.component.findUnique({
      where: { id }
    });
    
    if (!component) {
      return ApiErrors.notFound('Component not found');
    }
    
    return NextResponse.json(component);
  });
}

/**
 * PUT handler for updating a component (admin only)
 */
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  return withErrorHandling(async () => {
    // Get user from token and verify admin permissions
    const user = await getUserFromToken(request);
    
    if (!user || user.role !== 'ADMIN') {
      return ApiErrors.forbidden('Only administrators can update components');
    }
    
    const { id } = context.params;
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
    
    // Check if component exists
    const existingComponent = await prisma.component.findUnique({
      where: { id }
    });
    
    if (!existingComponent) {
      return ApiErrors.notFound('Component not found');
    }
    
    // Update the component
    const component = await prisma.component.update({
      where: { id },
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
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(component);
  });
}

/**
 * DELETE handler for removing a component (admin only)
 */
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  return withErrorHandling(async () => {
    // Get user from token and verify admin permissions
    const user = await getUserFromToken(request);
    
    if (!user || user.role !== 'ADMIN') {
      return ApiErrors.forbidden('Only administrators can delete components');
    }
    
    const { id } = context.params;
    
    // Check if component exists
    const existingComponent = await prisma.component.findUnique({
      where: { id }
    });
    
    if (!existingComponent) {
      return ApiErrors.notFound('Component not found');
    }
    
    // Check if component is used in any configurations
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
      return ApiErrors.badRequest('Cannot delete component as it is used in existing configurations');
    }
    
    // Delete the component
    await prisma.component.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Component deleted successfully' });
  });
}