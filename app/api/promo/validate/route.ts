import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prismaService';

export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const json = await request.json();
    const promoCode = await prisma.promoCode.findUnique({
      where: {
        code: json.code?.toUpperCase(),
      },
    });

    if (!promoCode) {
      return new Response(JSON.stringify({ error: 'Invalid promo code' }), {
        status: 400,
        headers,
      });
    }

    const discount = (json.total * promoCode.discountPercentage) / 100;

    return new Response(
      JSON.stringify({
        valid: true,
        discount,
        discountPercentage: promoCode.discountPercentage,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to validate promo code' }),
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
