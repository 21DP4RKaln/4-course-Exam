import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/authMiddleware';
import { prisma } from '@/lib/prismaService';

export async function POST(request: NextRequest) {
  const result = await authenticate(request);
  if (result instanceof Response) {
    return result;
  }
  const jwtPayload = result;

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: jwtPayload.userId },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { fullName, email, phone, address, city, postalCode, country } =
      await request.json();

    await prisma.user.update({
      where: { id: jwtPayload.userId },
      data: {
        name: fullName || currentUser.name,
        email: email || currentUser.email,
        phone: phone || currentUser.phone,
        shippingAddress: address,
        shippingCity: city,
        shippingPostalCode: postalCode,
        shippingCountry: country,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving address:', error);
    return NextResponse.json(
      { error: 'Failed to save address' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const result = await authenticate(request);
  if (result instanceof Response) {
    return result;
  }
  const jwtPayload = result;
  try {
    const userData = await prisma.user.findUnique({
      where: { id: jwtPayload.userId },
      select: {
        name: true,
        email: true,
        phone: true,
        shippingAddress: true,
        shippingCity: true,
        shippingPostalCode: true,
        shippingCountry: true,
      },
    });

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address' },
      { status: 500 }
    );
  }
}
