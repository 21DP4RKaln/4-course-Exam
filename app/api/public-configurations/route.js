import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';

export async function GET() {
  try {
    const publicConfigs = await prisma.configuration.findMany({
      where: {
        isPublic: true,
        status: 'approved' 
      },
      include: {
        components: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json(publicConfigs);
  } catch (error) {
    console.error('Public configurations fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch public configurations' },
      { status: 500 }
    );
  }
}