import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createForbiddenResponse,
  createBadRequestResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { prisma } from '@/lib/prismaService';
import { z } from 'zod';

const createPromoCodeSchema = z.object({
  code: z.string().min(3).max(20),
  description: z.string().optional(),
  discountPercentage: z.number().int().min(1).max(100),
  maxDiscountAmount: z.number().optional(),
  minOrderValue: z.number().optional(),
  maxUsage: z.number().int().optional(),
  expiresAt: z.string().datetime(),
  scope: z.enum(['ALL', 'SPECIFIC_PRODUCTS']),
  productIds: z.array(z.string().uuid()).optional(),
  productTypes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const updatePromoCodeSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(3).max(20).optional(),
  description: z.string().optional(),
  discountPercentage: z.number().int().min(1).max(100).optional(),
  maxDiscountAmount: z.number().optional(),
  minOrderValue: z.number().optional(),
  maxUsage: z.number().int().optional(),
  expiresAt: z.string().datetime().optional(),
  scope: z.enum(['ALL', 'SPECIFIC_PRODUCTS']).optional(),
  productIds: z.array(z.string().uuid()).optional(),
  productTypes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    if (payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const expired = searchParams.get('expired');

    const whereConditions: any = {};

    if (isActive === 'true') {
      whereConditions.isActive = true;
    } else if (isActive === 'false') {
      whereConditions.isActive = false;
    }

    if (expired === 'true') {
      whereConditions.expiresAt = {
        lt: new Date(),
      };
    } else if (expired === 'false') {
      whereConditions.expiresAt = {
        gt: new Date(),
      };
    }

    const promoCodes = await prisma.promoCode.findMany({
      where: whereConditions,
      include: {
        products: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedPromoCodes = promoCodes.map(promo => ({
      id: promo.id,
      code: promo.code,
      description: promo.description,
      discountPercentage: promo.discountPercentage,
      maxDiscountAmount: promo.maxDiscountAmount,
      minOrderValue: promo.minOrderValue,
      usageCount: promo.usageCount,
      maxUsage: promo.maxUsage,
      scope: promo.scope,
      expiresAt: promo.expiresAt.toISOString(),
      createdAt: promo.createdAt.toISOString(),
      isActive: promo.isActive,
      isExpired: new Date() > promo.expiresAt,
      products: promo.products.map(p => ({
        productId: p.productId,
        productType: p.productType,
      })),
    }));

    return NextResponse.json(formattedPromoCodes);
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return createServerErrorResponse('Failed to fetch promo codes');
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    if (payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required');
    }

    const body = await request.json();
    const validationResult = createPromoCodeSchema.safeParse(body);

    if (!validationResult.success) {
      return createBadRequestResponse(
        'Invalid promo code data',
        validationResult.error.format()
      );
    }

    const {
      code,
      description,
      discountPercentage,
      maxDiscountAmount,
      minOrderValue,
      maxUsage = 1000,
      expiresAt,
      scope,
      productIds,
      productTypes,
      isActive = true,
    } = validationResult.data;

    const existingCode = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (existingCode) {
      return createBadRequestResponse('Promo code already exists');
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code,
        description,
        discountPercentage,
        maxDiscountAmount,
        minOrderValue,
        maxUsage,
        expiresAt: new Date(expiresAt),
        scope,
        isActive,
        usageCount: 0,
      },
    });

    if (
      scope === 'SPECIFIC_PRODUCTS' &&
      productIds &&
      productIds.length > 0 &&
      productTypes &&
      productTypes.length > 0
    ) {
      if (productIds.length !== productTypes.length) {
        return createBadRequestResponse(
          'Product IDs and types arrays must be the same length'
        );
      }

      const productAssociations = productIds.map((productId, index) => ({
        promoCodeId: promoCode.id,
        productId,
        productType: productTypes[index],
      }));

      await prisma.promoProduct.createMany({
        data: productAssociations,
      });
    }

    const createdPromoCode = await prisma.promoCode.findUnique({
      where: { id: promoCode.id },
      include: { products: true },
    });

    return NextResponse.json({
      ...createdPromoCode,
      expiresAt: createdPromoCode?.expiresAt.toISOString(),
      createdAt: createdPromoCode?.createdAt.toISOString(),
      isExpired: createdPromoCode
        ? new Date() > createdPromoCode.expiresAt
        : false,
    });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return createServerErrorResponse('Failed to create promo code');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    if (payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required');
    }

    const body = await request.json();
    const validationResult = updatePromoCodeSchema.safeParse(body);

    if (!validationResult.success) {
      return createBadRequestResponse(
        'Invalid promo code data',
        validationResult.error.format()
      );
    }

    const {
      id,
      code,
      description,
      discountPercentage,
      maxDiscountAmount,
      minOrderValue,
      maxUsage,
      expiresAt,
      scope,
      productIds,
      productTypes,
      isActive,
    } = validationResult.data;

    const existingPromoCode = await prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existingPromoCode) {
      return createBadRequestResponse('Promo code not found');
    }

    if (code && code !== existingPromoCode.code) {
      const codeExists = await prisma.promoCode.findUnique({
        where: { code },
      });

      if (codeExists) {
        return createBadRequestResponse('Promo code already exists');
      }
    }

    const updateData: any = {};

    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (discountPercentage !== undefined)
      updateData.discountPercentage = discountPercentage;
    if (maxDiscountAmount !== undefined)
      updateData.maxDiscountAmount = maxDiscountAmount;
    if (minOrderValue !== undefined) updateData.minOrderValue = minOrderValue;
    if (maxUsage !== undefined) updateData.maxUsage = maxUsage;
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);
    if (scope !== undefined) updateData.scope = scope;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPromoCode = await prisma.promoCode.update({
      where: { id },
      data: updateData,
    });

    if (
      scope === 'SPECIFIC_PRODUCTS' &&
      productIds &&
      productTypes &&
      productIds.length === productTypes.length
    ) {
      await prisma.promoProduct.deleteMany({
        where: { promoCodeId: id },
      });

      const productAssociations = productIds.map((productId, index) => ({
        promoCodeId: id,
        productId,
        productType: productTypes[index],
      }));

      await prisma.promoProduct.createMany({
        data: productAssociations,
      });
    }

    const finalPromoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: { products: true },
    });

    return NextResponse.json({
      ...finalPromoCode,
      expiresAt: finalPromoCode?.expiresAt.toISOString(),
      createdAt: finalPromoCode?.createdAt.toISOString(),
      isExpired: finalPromoCode ? new Date() > finalPromoCode.expiresAt : false,
    });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return createServerErrorResponse('Failed to update promo code');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    if (payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createBadRequestResponse('Promo code ID is required');
    }

    const existingPromoCode = await prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existingPromoCode) {
      return createBadRequestResponse('Promo code not found');
    }

    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Promo code deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return createServerErrorResponse('Failed to delete promo code');
  }
}
