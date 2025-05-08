import { NextRequest, NextResponse } from 'next/server';
import { 
  incrementProductView, 
  resetViewCounts 
} from '@/lib/services/unifiedProductService';
import { 
  createBadRequestResponse,
  createUnauthorizedResponse,
  createServerErrorResponse 
} from '@/lib/apiErrors';

/**
 * API route to increment view count for a product
 */
export async function POST(request: NextRequest) {
  try {
    const { productId, productType } = await request.json();
    
    if (!productId || !productType) {
      return createBadRequestResponse('Product ID and type are required');
    }

    await incrementProductView(productId, productType);
    
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
   
    const result = await resetViewCounts();
    
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