import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = cookies();
  
  cookieStore.delete('token');
  
  return NextResponse.json({ message: 'Successful deployment' });
}