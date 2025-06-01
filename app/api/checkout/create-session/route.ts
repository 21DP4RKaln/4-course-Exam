import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prismaService'
import { ProductType, OrderStatus, Prisma } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
})

interface ShippingAddress {
  name: string
  address: string
  city: string
  postalCode: string
  country: string
  email: string
  phone: string
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  type: ProductType
  images?: string[]
}

interface CheckoutBody {
  items: OrderItem[]
  total: number
  shipping: {
    method: string
    rate: number
    address: ShippingAddress
  }
  promoDiscount?: number
  promoCode?: string
  locale?: string // Add locale field
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json()
    const { items, total, shipping, promoDiscount = 0, promoCode, locale = 'en' } = body

    const token = await getToken({ req: request })
    const user = token?.email ? await prisma.user.findUnique({
      where: { email: token.email }
    }) : null

    const lineItems = items.map((item) => {
      const validImages = (item.images || []).filter(url => /^https?:\/\//.test(url));
      const productData: { name: string; images?: string[] } = { name: item.name };
      if (validImages.length > 0) {
        productData.images = validImages;
      }
      return {
        price_data: {
          currency: 'eur',
          product_data: productData,
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    if (shipping.rate > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Shipping (${shipping.method})`,
          },
          unit_amount: Math.round(shipping.rate * 100),
        },
        quantity: 1,
      })
    }

    const stripeDiscounts: Array<{coupon: string}> = [];
    if (promoDiscount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(promoDiscount * 100),
        currency: 'eur',
        duration: 'once',
        name: promoCode,
      });
      stripeDiscounts.push({ coupon: coupon.id });
    }

    let order;

    if (!user) {
      const orderId = uuidv4();
      order = await prisma.$transaction(async (prisma) => {        const newOrder = await prisma.$queryRaw`
          INSERT INTO \`order\` (
            id, 
            status, 
            totalAmount, 
            shippingAddress, 
            paymentMethod, 
            createdAt,
            updatedAt, 
            isGuestOrder, 
            shippingName, 
            shippingEmail, 
            shippingPhone,
            shippingCost,
            locale
          ) 
          VALUES (
            ${orderId}, 
            'PENDING', 
            ${total}, 
            ${`${shipping.address.address}, ${shipping.address.city}, ${shipping.address.country}, ${shipping.address.postalCode}`}, 
            'CARD', 
            NOW(), 
            NOW(), 
            1, 
            ${shipping.address.name}, 
            ${shipping.address.email}, 
            ${shipping.address.phone},
            ${shipping.rate},
            ${locale}
          )
        `;
        for (const item of items) {
          await prisma.$queryRaw`
            INSERT INTO \`order_item\` (
              id, 
              orderId, 
              productId, 
              productType, 
              quantity, 
              price, 
              name
            ) 
            VALUES (
              ${uuidv4()}, 
              ${orderId}, 
              ${item.id}, 
              ${item.type.toUpperCase()}, 
              ${item.quantity}, 
              ${item.price}, 
              ${item.name}
            )
          `;
        }
        
        return { 
          id: orderId,
          totalAmount: total,
          status: "PENDING",
          isGuestOrder: true
        };
      });
    } else {      order = await prisma.order.create({
        data: {
          totalAmount: total,
          status: OrderStatus.PENDING,
          shippingAddress: `${shipping.address.address}, ${shipping.address.city}, ${shipping.address.country}, ${shipping.address.postalCode}`,
          shippingEmail: shipping.address.email,
          shippingName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : shipping.address.name,
          shippingPhone: shipping.address.phone,
          paymentMethod: 'CARD',
          shippingCost: shipping.rate, 
          isGuestOrder: false,
          locale: locale as any,
          user: { connect: { id: user.id } },
          orderItems: {
            create: items.map((item) => ({
              productId: item.id,
              productType: item.type.toUpperCase() as ProductType,
              quantity: item.quantity,
              price: item.price,
              name: item.name
            }))
          }
        }
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      discounts: stripeDiscounts,
      mode: 'payment',
      success_url: `${baseUrl}/en/order-confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/en/checkout`,
      shipping_address_collection: {
        allowed_countries: ['LV', 'LT', 'EE'],
      },
      customer_email: shipping.address.email,
      metadata: {
        orderId: order.id,
      },
    });

    return NextResponse.json({
      sessionUrl: stripeSession.url,
      sessionId: stripeSession.id,
    });

  } catch (error: any) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 400 }
    );
  }
}
