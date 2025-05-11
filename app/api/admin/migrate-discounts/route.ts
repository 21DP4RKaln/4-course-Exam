import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { z } from 'zod';

// Function to update all components and remove hardcoded discounts
export async function GET(request: NextRequest) {
  try {
    // Fetch all components
    const components = await prisma.component.findMany();
    const configurations = await prisma.configuration.findMany({
      where: { isTemplate: true }
    });
    
    // For components that previously had hardcoded discounts
    let updatedCount = 0;
    for (const component of components) {
      // Set a 10% discount for components over 100 euros
      if (component.price > 100) {
        const discountPrice = Math.round(component.price * 0.9 * 100) / 100;
        
        // Set discount that expires in 30 days
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        
        await prisma.component.update({
          where: { id: component.id },
          data: {
            discountPrice,
            discountExpiresAt: expiryDate
          }
        });
        
        updatedCount++;
      }
    }
    
    // Update configurations that previously used 10% hardcoded discount
    let configUpdatedCount = 0;
    for (const config of configurations) {
      if (config.isPublic) {
        const discountPrice = Math.round(config.totalPrice * 0.9 * 100) / 100;
        
        // Set discount that expires in 30 days
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        
        await prisma.configuration.update({
          where: { id: config.id },
          data: {
            discountPrice,
            discountExpiresAt: expiryDate
          }
        });
        
        configUpdatedCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      componentsUpdated: updatedCount,
      configurationsUpdated: configUpdatedCount,
      message: 'Discount data migrated successfully'
    });
  } catch (error) {
    console.error('Error migrating discount data:', error);
    return NextResponse.json({ success: false, error: 'Failed to migrate discount data' }, { status: 500 });
  }
}
