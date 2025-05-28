import { NextRequest, NextResponse } from 'next/server';
// Import both service modules to support old and new databases
import * as oldService from '@/lib/services/unifiedProductService';
import * as newService from '@/lib/services/newDatabaseProductService';
import { createNotFoundResponse, createServerErrorResponse } from '@/lib/apiErrors';
import { USE_NEW_DATABASE } from '@/lib/databaseConfig';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const id = params.id;
    const { searchParams } = new URL(request.url);
    // Make sure type has a default value if missing from URL
    const type = searchParams.get('type') as 'component' | 'peripheral' || 'component';
    
    // Check for undefined or empty ID
    if (!id || id === 'undefined') {
      console.error("Invalid product ID:", id);
      return createNotFoundResponse('Invalid product ID');
    }
    
    console.log("Fetching product with ID:", id, "Type:", type);
   
    // Use the appropriate service based on the flag
    let product;
    if (USE_NEW_DATABASE) {
      // Try both 'component' and 'peripheral' types if type parameter was not explicit
      if (!searchParams.has('type')) {
        console.log("No explicit type provided, trying component first");
        product = await newService.getProductById(id, 'component');
        if (!product) {
          console.log("Product not found as component, trying peripheral");
          product = await newService.getProductById(id, 'peripheral');
        }
      } else {
        // explicit type param
        product = await newService.getProductById(id, type);
      }
      // Fallback to old unified service for configurations or any unresolved cases
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
      // Increment view count based on the selected database
    if (USE_NEW_DATABASE) {
      newService.incrementProductView(id, type).catch((err: Error) => {
        console.error(`Error incrementing view count for ${type} ${id}:`, err);
      });
    } else {
      oldService.incrementProductView(id, product.type).catch((err: Error) => {
        console.error(`Error incrementing view count for ${product.type} ${id}:`, err);
      });
    }
      console.log(`Found ${product.type}:`, product.name);
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Error fetching product with ID ${context.params.id}:`, error);
    return createServerErrorResponse('Failed to fetch product details');
  }
}