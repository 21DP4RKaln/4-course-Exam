import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Apstrādāt profila attēlu augšupielādi ar atbilstošām galvenēm
  if (request.nextUrl.pathname.startsWith('/api/uploads/')) {
    const response = NextResponse.next();

    // Pievienot atbilstošas CORS galvenes attēlu augšupielādei
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
