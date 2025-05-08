import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })

  response.cookies.set({
    name: 'authToken',
    value: '',
    httpOnly: true,
    path: '/',
    expires: new Date(0), 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
  
  return response
}