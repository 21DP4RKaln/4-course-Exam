import { NextRequest, NextResponse } from 'next/server';
import { getProductById, incrementProductView } from '@/lib/services/unifiedProductService';
import { createNotFoundResponse, createServerErrorResponse } from '@/lib/apiErrors';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const id = params.id;
    
    // Check for undefined or empty ID
    if (!id || id === 'undefined') {
      console.error("Invalid product ID:", id);
      return createNotFoundResponse('Invalid product ID');
    }
    
    console.log("Fetching product with ID:", id);
   
    const product = await getProductById(id);
    
    if (!product) {
      console.log("Product not found with ID:", id);
      return createNotFoundResponse('Product not found');
    }
    
    incrementProductView(id, product.type).catch(err => {
      console.error(`Error incrementing view count for ${product.type} ${id}:`, err);
    });
      console.log(`Found ${product.type}:`, product.name);
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Error fetching product with ID ${context.params.id}:`, error);
    return createServerErrorResponse('Failed to fetch product details');
  }
}