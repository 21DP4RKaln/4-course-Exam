import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProducts,
  getProductsByCategory,
} from '@/lib/services/unifiedProductService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') as
      | 'configuration'
      | 'component'
      | 'peripheral'
      | undefined;
    const inStock = searchParams.get('inStock') === 'true';

    let result;

    if (category) {
      result = await getProductsByCategory(category, {
        page,
        limit,
        search,
        inStock,
      });
    } else {
      result = await getAllProducts({
        page,
        limit,
        search,
        type,
        inStock,
      });
    }

    if (!searchParams.get('page') && !searchParams.get('limit')) {
      return NextResponse.json(result.products);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
