import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts, getProductsByCategory } from '@/lib/services/productService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    let products;
    
    if (category) {
      products = await getProductsByCategory(category)
    } else {
      products = await getAllProducts()
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}