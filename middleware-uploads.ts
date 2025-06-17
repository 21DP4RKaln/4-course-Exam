import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle profile image uploads with proper headers
  if (request.nextUrl.pathname.startsWith('/api/uploads/')) {
    const response = NextResponse.next();

    // Add proper CORS headers for image uploads
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/uploads/:path*'],
};
