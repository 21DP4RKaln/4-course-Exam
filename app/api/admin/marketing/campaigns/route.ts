import { NextRequest, NextResponse } from 'next/server';
import {
  createBadRequestResponse,
  createServerErrorResponse,
  createNotFoundResponse,
} from '@/lib/apiErrors';
import { prisma } from '@/lib/prismaService';
import { authenticateAdmin } from '@/lib/middleware/authMiddleware';
import { z } from 'zod';

const campaignSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  type: z.enum(['EMAIL', 'BANNER', 'SOCIAL', 'PUSH_NOTIFICATION']),
  targetAudience: z.enum([
    'ALL',
    'NEW_USERS',
    'EXISTING_USERS',
    'ABANDONED_CART',
  ]),
  status: z
    .enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'])
    .optional(),
  content: z.string().optional(),
  bannerImageUrl: z.string().url().optional(),
  promoCodeId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const updateCampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['EMAIL', 'BANNER', 'SOCIAL', 'PUSH_NOTIFICATION']).optional(),
  targetAudience: z
    .enum(['ALL', 'NEW_USERS', 'EXISTING_USERS', 'ABANDONED_CART'])
    .optional(),
  status: z
    .enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'])
    .optional(),
  content: z.string().optional(),
  bannerImageUrl: z.string().url().optional(),
  promoCodeId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const typeFilter = searchParams.get('type');
    const campaignId = searchParams.get('id');

    if (campaignId) {
      const campaign = await prisma.marketingCampaign.findUnique({
        where: { id: campaignId },
        include: {
          promoCode: true,
          metrics: true,
        },
      });

      if (!campaign) {
        return createNotFoundResponse('Campaign not found');
      }

      return NextResponse.json({
        ...campaign,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      });
    }

    const whereConditions: any = {};

    if (statusFilter) {
      whereConditions.status = statusFilter;
    }

    if (typeFilter) {
      whereConditions.type = typeFilter;
    }

    const campaigns = await prisma.marketingCampaign.findMany({
      where: whereConditions,
      include: {
        promoCode: {
          select: {
            code: true,
            discountPercentage: true,
            expiresAt: true,
          },
        },
        metrics: {
          select: {
            impressions: true,
            clicks: true,
            conversions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.startDate.toISOString(),
      endDate: campaign.endDate.toISOString(),
      type: campaign.type,
      targetAudience: campaign.targetAudience,
      status: campaign.status,
      content: campaign.content,
      bannerImageUrl: campaign.bannerImageUrl,
      promoCode: campaign.promoCode
        ? {
            code: campaign.promoCode.code,
            discountPercentage: campaign.promoCode.discountPercentage,
            expiresAt: campaign.promoCode.expiresAt.toISOString(),
          }
        : null,
      metrics: campaign.metrics || {
        impressions: 0,
        clicks: 0,
        conversions: 0,
      },
      metadata: campaign.metadata,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedCampaigns);
  } catch (error) {
    console.error('Error fetching marketing campaigns:', error);
    return createServerErrorResponse('Failed to fetch marketing campaigns');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const body = await request.json();
    const validationResult = campaignSchema.safeParse(body);

    if (!validationResult.success) {
      return createBadRequestResponse(
        'Invalid campaign data',
        validationResult.error.format()
      );
    }

    const {
      name,
      description,
      startDate,
      endDate,
      type,
      targetAudience,
      status = 'DRAFT',
      content,
      bannerImageUrl,
      promoCodeId,
      metadata = {},
    } = validationResult.data;

    if (new Date(startDate) >= new Date(endDate)) {
      return createBadRequestResponse('End date must be after start date');
    }

    const campaign = await prisma
      .$transaction(async tx => {
        if (promoCodeId) {
          const promoCode = await tx.promoCode.findUnique({
            where: { id: promoCodeId },
          });

          if (!promoCode) {
            throw new Error('Promo code not found');
          }

          if (promoCode.expiresAt < new Date(endDate)) {
            throw new Error('Promo code expires before campaign end date');
          }
        }

        const newCampaign = await tx.marketingCampaign.create({
          data: {
            name,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type,
            targetAudience,
            status,
            content,
            bannerImageUrl,
            promoCodeId,
            metadata: metadata ? JSON.stringify(metadata) : null,
            createdById: authResult.userId,
          },
        });

        await tx.campaignMetrics.create({
          data: {
            campaignId: newCampaign.id,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            lastUpdated: new Date(),
          },
        });

        return newCampaign;
      })
      .catch(err => {
        if (err.message === 'Promo code not found') {
          throw { code: 'PROMO_CODE_NOT_FOUND' };
        }
        if (err.message === 'Promo code expires before campaign end date') {
          throw { code: 'PROMO_CODE_EXPIRES_TOO_EARLY' };
        }
        throw err;
      });

    return NextResponse.json(
      {
        ...campaign,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating marketing campaign:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'PROMO_CODE_NOT_FOUND'
    ) {
      return createBadRequestResponse('Promo code not found');
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'PROMO_CODE_EXPIRES_TOO_EARLY'
    ) {
      return createBadRequestResponse(
        'Promo code expires before campaign end date'
      );
    }

    return createServerErrorResponse('Failed to create marketing campaign');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const body = await request.json();
    const validationResult = updateCampaignSchema.safeParse(body);

    if (!validationResult.success) {
      return createBadRequestResponse(
        'Invalid campaign data',
        validationResult.error.format()
      );
    }

    const {
      id,
      name,
      description,
      startDate,
      endDate,
      type,
      targetAudience,
      status,
      content,
      bannerImageUrl,
      promoCodeId,
      metadata,
    } = validationResult.data;

    const updatedCampaign = await prisma
      .$transaction(async tx => {
        const existingCampaign = await tx.marketingCampaign.findUnique({
          where: { id },
        });

        if (!existingCampaign) {
          throw new Error('Campaign not found');
        }

        const updateData: any = {};

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (startDate !== undefined) updateData.startDate = new Date(startDate);
        if (endDate !== undefined) updateData.endDate = new Date(endDate);
        if (type !== undefined) updateData.type = type;
        if (targetAudience !== undefined)
          updateData.targetAudience = targetAudience;
        if (status !== undefined) updateData.status = status;
        if (content !== undefined) updateData.content = content;
        if (bannerImageUrl !== undefined)
          updateData.bannerImageUrl = bannerImageUrl;
        if (promoCodeId !== undefined) updateData.promoCodeId = promoCodeId;
        if (metadata !== undefined)
          updateData.metadata = JSON.stringify(metadata);

        if (startDate && endDate) {
          if (new Date(startDate) >= new Date(endDate)) {
            throw new Error('End date must be after start date');
          }
        } else if (startDate && !endDate) {
          if (new Date(startDate) >= existingCampaign.endDate) {
            throw new Error('Start date must be before end date');
          }
        } else if (!startDate && endDate) {
          if (existingCampaign.startDate >= new Date(endDate)) {
            throw new Error('End date must be after start date');
          }
        }

        if (promoCodeId && promoCodeId !== existingCampaign.promoCodeId) {
          const promoCode = await tx.promoCode.findUnique({
            where: { id: promoCodeId },
          });

          if (!promoCode) {
            throw new Error('Promo code not found');
          }

          const campaignEndDate = endDate
            ? new Date(endDate)
            : existingCampaign.endDate;
          if (promoCode.expiresAt < campaignEndDate) {
            throw new Error('Promo code expires before campaign end date');
          }
        }

        return await tx.marketingCampaign.update({
          where: { id },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
        });
      })
      .catch(err => {
        if (err.message === 'Campaign not found') {
          throw { code: 'CAMPAIGN_NOT_FOUND' };
        }
        if (
          err.message === 'End date must be after start date' ||
          err.message === 'Start date must be before end date'
        ) {
          throw { code: 'INVALID_DATE_RANGE' };
        }
        if (err.message === 'Promo code not found') {
          throw { code: 'PROMO_CODE_NOT_FOUND' };
        }
        if (err.message === 'Promo code expires before campaign end date') {
          throw { code: 'PROMO_CODE_EXPIRES_TOO_EARLY' };
        }
        throw err;
      });

    return NextResponse.json({
      ...updatedCampaign,
      startDate: updatedCampaign.startDate.toISOString(),
      endDate: updatedCampaign.endDate.toISOString(),
      createdAt: updatedCampaign.createdAt.toISOString(),
      updatedAt: updatedCampaign.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating marketing campaign:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'CAMPAIGN_NOT_FOUND'
    ) {
      return createNotFoundResponse('Campaign not found');
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'INVALID_DATE_RANGE'
    ) {
      return createBadRequestResponse('Invalid date range');
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'PROMO_CODE_NOT_FOUND'
    ) {
      return createBadRequestResponse('Promo code not found');
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'PROMO_CODE_EXPIRES_TOO_EARLY'
    ) {
      return createBadRequestResponse(
        'Promo code expires before campaign end date'
      );
    }

    return createServerErrorResponse('Failed to update marketing campaign');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createBadRequestResponse('Campaign ID is required');
    }

    const result = await prisma
      .$transaction(async tx => {
        const existingCampaign = await tx.marketingCampaign.findUnique({
          where: { id },
        });

        if (!existingCampaign) {
          throw new Error('Campaign not found');
        }

        if (existingCampaign.status === 'ACTIVE') {
          throw new Error('Cannot delete an active campaign');
        }

        await tx.campaignMetrics.deleteMany({
          where: { campaignId: id },
        });

        return await tx.marketingCampaign.delete({
          where: { id },
        });
      })
      .catch(err => {
        if (err.message === 'Campaign not found') {
          throw { code: 'CAMPAIGN_NOT_FOUND' };
        }
        if (err.message === 'Cannot delete an active campaign') {
          throw { code: 'CAMPAIGN_ACTIVE' };
        }
        throw err;
      });

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
      id: result.id,
    });
  } catch (error) {
    console.error('Error deleting marketing campaign:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'CAMPAIGN_NOT_FOUND'
    ) {
      return createNotFoundResponse('Campaign not found');
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'CAMPAIGN_ACTIVE'
    ) {
      return createBadRequestResponse(
        'Cannot delete an active campaign. Please pause or cancel it first.'
      );
    }

    return createServerErrorResponse('Failed to delete marketing campaign');
  }
}
