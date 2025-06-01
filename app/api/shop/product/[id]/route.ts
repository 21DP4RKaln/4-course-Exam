import { NextRequest, NextResponse } from 'next/server';
import * as oldService from '@/lib/services/unifiedProductService';
import * as newService from '@/lib/services/productService';
import { createNotFoundResponse, createServerErrorResponse } from '@/lib/apiErrors';
import { USE_NEW_DATABASE } from '@/lib/databaseConfig';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { params } = context;
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'component' | 'peripheral' || 'component';
    
    if (!id || id === 'undefined') {
      console.error("Invalid product ID:", id);
      return createNotFoundResponse('Invalid product ID');
    }
    
    console.log("Fetching product with ID:", id, "Type:", type);
   
    let product;
    if (USE_NEW_DATABASE) {
      product = await newService.getProductById(id);
      if (!product) {
        console.log("Falling back to old service for any type");
        product = await oldService.getProductById(id);
      }
    } else {
      product = await oldService.getProductById(id);
    }
    
    if (!product) {
      console.log("Product not found with ID:", id);
      return createNotFoundResponse('Product not found');
    }
    oldService.incrementProductView(id, type).catch((err: Error) => {
      console.error(`Error incrementing view count for ${type} ${id}:`, err);
    });    console.log(`Found ${type}:`, product.name);
    return NextResponse.json(product);  } catch (error) {
    const resolvedParams = await context.params;
    console.error(`Error fetching product with ID ${resolvedParams.id}:`, error);
    return createServerErrorResponse('Failed to fetch product details');
  }
}