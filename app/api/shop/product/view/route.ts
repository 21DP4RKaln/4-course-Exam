import { NextRequest, NextResponse } from 'next/server';
import * as oldService from '@/lib/services/unifiedProductService';
import * as newService from '@/lib/services/newDatabaseProductService';
import { 
  createBadRequestResponse,
  createUnauthorizedResponse,
  createServerErrorResponse 
} from '@/lib/apiErrors';
import { USE_NEW_DATABASE } from '@/lib/databaseConfig';

/**
 * API route to increment view count for a product
 */
export async function POST(request: NextRequest) {
  try {
    const { productId, productType } = await request.json();
    
    if (!productId || !productType) {
      return createBadRequestResponse('Product ID and type are required');
    }

    // Use appropriate service based on the environment flag
    if (USE_NEW_DATABASE) {
      await newService.incrementProductView(productId, productType.toLowerCase());
    } else {
      await oldService.incrementProductView(productId, productType);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return createServerErrorResponse('Failed to increment view count');
  }
}

/**
 * API route to reset view counts monthly (to be called by a CRON job)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    
    if (apiKey !== process.env.RESET_VIEWS_API_KEY) {
      return createUnauthorizedResponse('Unauthorized access');
    }
   
    // Use appropriate service based on environment flag
    let result;
    if (USE_NEW_DATABASE) {
      // Implement resetViewCounts function in newDatabaseProductService if needed
      // For now, using the old service
      result = await oldService.resetViewCounts();
    } else {
      result = await oldService.resetViewCounts();
    }
    
    console.log(`[CRON] Monthly view counts reset - ${new Date().toISOString()}:`, result.resetCounts);
    
    return NextResponse.json({
      success: true,
      message: 'View counts reset successfully for the new month',
      details: result.resetCounts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting view counts:', error);
    return createServerErrorResponse('Failed to reset view counts');
  }
}