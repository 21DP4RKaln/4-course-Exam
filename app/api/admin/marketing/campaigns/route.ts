import { NextRequest, NextResponse } from 'next/server'
import { createBadRequestResponse, createServerErrorResponse, createNotFoundResponse } from '@/lib/apiErrors'
import { prisma } from '@/lib/prismaService'
import { authenticateAdmin } from '@/lib/middleware/authMiddleware'
import { z } from 'zod'

// Schema for campaign creation
const campaignSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  type: z.enum(['EMAIL', 'BANNER', 'SOCIAL', 'PUSH_NOTIFICATION']),
  targetAudience: z.enum(['ALL', 'NEW_USERS', 'EXISTING_USERS', 'ABANDONED_CART']),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  content: z.string().optional(),
  bannerImageUrl: z.string().url().optional(),
  promoCodeId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// Schema for campaign update
const updateCampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['EMAIL', 'BANNER', 'SOCIAL', 'PUSH_NOTIFICATION']).optional(),
  targetAudience: z.enum(['ALL', 'NEW_USERS', 'EXISTING_USERS', 'ABANDONED_CART']).optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  content: z.string().optional(),
  bannerImageUrl: z.string().url().optional(),
  promoCodeId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

/**
 * GET handler - Retrieve all marketing campaigns
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    const typeFilter = searchParams.get('type')
    const campaignId = searchParams.get('id')

    // If single campaign is requested
    if (campaignId) {
      const campaign = await prisma.marketingCampaign.findUnique({
        where: { id: campaignId },
        include: {
          promoCode: true,
          metrics: true
        }
      })

      if (!campaign) {
        return createNotFoundResponse('Campaign not found')
      }

      return NextResponse.json({
        ...campaign,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString()
      })
    }

    // Build where conditions
    const whereConditions: any = {}

    if (statusFilter) {
      whereConditions.status = statusFilter
    }

    if (typeFilter) {
      whereConditions.type = typeFilter
    }

    // Get campaigns from database
    const campaigns = await prisma.marketingCampaign.findMany({
      where: whereConditions,
      include: {
        promoCode: {
          select: {
            code: true,
            discountPercentage: true,
            expiresAt: true
          }
        },
        metrics: {
          select: {
            impressions: true,
            clicks: true,
            conversions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format response
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
      promoCode: campaign.promoCode ? {
        code: campaign.promoCode.code,
        discountPercentage: campaign.promoCode.discountPercentage,
        expiresAt: campaign.promoCode.expiresAt.toISOString()
      } : null,
      metrics: campaign.metrics || {
        impressions: 0,
        clicks: 0,
        conversions: 0
      },
      metadata: campaign.metadata,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString()
    }))

    return NextResponse.json(formattedCampaigns)
  } catch (error) {
    console.error('Error fetching marketing campaigns:', error)
    return createServerErrorResponse('Failed to fetch marketing campaigns')
  }
}

/**
 * POST handler - Create a new marketing campaign
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    // Parse request body
    const body = await request.json()
    const validationResult = campaignSchema.safeParse(body)

    if (!validationResult.success) {
      return createBadRequestResponse('Invalid campaign data', validationResult.error.format())
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
      metadata = {}
    } = validationResult.data

    // Validate date range
    if (new Date(startDate) >= new Date(endDate)) {
      return createBadRequestResponse('End date must be after start date')
    }

    // Use transaction to ensure all related operations succeed or fail together
    const campaign = await prisma.$transaction(async (tx) => {
      // Check promo code if provided
      if (promoCodeId) {
        const promoCode = await tx.promoCode.findUnique({
          where: { id: promoCodeId }
        })

        if (!promoCode) {
          throw new Error('Promo code not found');
        }

        // Check if promo code expires before campaign ends
        if (promoCode.expiresAt < new Date(endDate)) {
          throw new Error('Promo code expires before campaign end date');
        }
      }

      // Create campaign
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
          createdById: authResult.userId
        }
      });

      // Initialize campaign metrics
      await tx.campaignMetrics.create({
        data: {
          campaignId: newCampaign.id,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          lastUpdated: new Date()
        }
      });

      return newCampaign;
    }).catch(err => {
      if (err.message === 'Promo code not found') {
        throw { code: 'PROMO_CODE_NOT_FOUND' };
      }
      if (err.message === 'Promo code expires before campaign end date') {
        throw { code: 'PROMO_CODE_EXPIRES_TOO_EARLY' };
      }
      throw err;
    });

    // Return created campaign
    return NextResponse.json({
      ...campaign,
      startDate: campaign.startDate.toISOString(),
      endDate: campaign.endDate.toISOString(),
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString()
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating marketing campaign:', error)
    
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'PROMO_CODE_NOT_FOUND') {
      return createBadRequestResponse('Promo code not found');
    }
    
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'PROMO_CODE_EXPIRES_TOO_EARLY') {
      return createBadRequestResponse('Promo code expires before campaign end date');
    }
    
    return createServerErrorResponse('Failed to create marketing campaign')
  }
}

/**
 * PUT handler - Update an existing marketing campaign
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    // Parse request body
    const body = await request.json()
    const validationResult = updateCampaignSchema.safeParse(body)

    if (!validationResult.success) {
      return createBadRequestResponse('Invalid campaign data', validationResult.error.format())
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
      metadata
    } = validationResult.data

    // Use transaction for data integrity
    const updatedCampaign = await prisma.$transaction(async (tx) => {
      // Check if campaign exists
      const existingCampaign = await tx.marketingCampaign.findUnique({
        where: { id }
      })

      if (!existingCampaign) {
        throw new Error('Campaign not found');
      }

      // Build update data
      const updateData: any = {}

      if (name !== undefined) updateData.name = name
      if (description !== undefined) updateData.description = description
      if (startDate !== undefined) updateData.startDate = new Date(startDate)
      if (endDate !== undefined) updateData.endDate = new Date(endDate)
      if (type !== undefined) updateData.type = type
      if (targetAudience !== undefined) updateData.targetAudience = targetAudience
      if (status !== undefined) updateData.status = status
      if (content !== undefined) updateData.content = content
      if (bannerImageUrl !== undefined) updateData.bannerImageUrl = bannerImageUrl
      if (promoCodeId !== undefined) updateData.promoCodeId = promoCodeId
      if (metadata !== undefined) updateData.metadata = JSON.stringify(metadata)

      // Validate date range if both dates are provided
      if (startDate && endDate) {
        if (new Date(startDate) >= new Date(endDate)) {
          throw new Error('End date must be after start date');
        }
      } else if (startDate && !endDate) {
        // If only start date is provided, check against existing end date
        if (new Date(startDate) >= existingCampaign.endDate) {
          throw new Error('Start date must be before end date');
        }
      } else if (!startDate && endDate) {
        // If only end date is provided, check against existing start date
        if (existingCampaign.startDate >= new Date(endDate)) {
          throw new Error('End date must be after start date');
        }
      }

      // Check promo code if changed
      if (promoCodeId && promoCodeId !== existingCampaign.promoCodeId) {
        const promoCode = await tx.promoCode.findUnique({
          where: { id: promoCodeId }
        })

        if (!promoCode) {
          throw new Error('Promo code not found');
        }

        // Check if promo code expires before campaign ends
        const campaignEndDate = endDate ? new Date(endDate) : existingCampaign.endDate
        if (promoCode.expiresAt < campaignEndDate) {
          throw new Error('Promo code expires before campaign end date');
        }
      }

      // Update campaign
      return await tx.marketingCampaign.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      })
    }).catch(err => {
      if (err.message === 'Campaign not found') {
        throw { code: 'CAMPAIGN_NOT_FOUND' };
      }
      if (err.message === 'End date must be after start date' || 
          err.message === 'Start date must be before end date') {
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

    // Return updated campaign
    return NextResponse.json({
      ...updatedCampaign,
      startDate: updatedCampaign.startDate.toISOString(),
      endDate: updatedCampaign.endDate.toISOString(),
      createdAt: updatedCampaign.createdAt.toISOString(),
      updatedAt: updatedCampaign.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Error updating marketing campaign:', error)
    
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'CAMPAIGN_NOT_FOUND') {
      return createNotFoundResponse('Campaign not found');
    }
    
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'INVALID_DATE_RANGE') {
      return createBadRequestResponse('Invalid date range');
    }
    
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'PROMO_CODE_NOT_FOUND') {
      return createBadRequestResponse('Promo code not found');
    }
    
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'PROMO_CODE_EXPIRES_TOO_EARLY') {
      return createBadRequestResponse('Promo code expires before campaign end date');
    }
    
    return createServerErrorResponse('Failed to update marketing campaign')
  }
}

/**
 * DELETE handler - Delete a marketing campaign
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    // Get campaign ID
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return createBadRequestResponse('Campaign ID is required')
    }

    // Use transaction for deleting the campaign and its metrics
    const result = await prisma.$transaction(async (tx) => {
      // Check if campaign exists
      const existingCampaign = await tx.marketingCampaign.findUnique({
        where: { id }
      })

      if (!existingCampaign) {
        throw new Error('Campaign not found');
      }

      // Check if campaign is active
      if (existingCampaign.status === 'ACTIVE') {
        throw new Error('Cannot delete an active campaign');
      }

      // Delete campaign metrics first (to avoid foreign key constraints)
      await tx.campaignMetrics.deleteMany({
        where: { campaignId: id }
      })

      // Delete campaign
      return await tx.marketingCampaign.delete({
        where: { id }
      })
    }).catch(err => {
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
      id: result.id
    })
  } catch (error) {
    console.error('Error deleting marketing campaign:', error)
    
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'CAMPAIGN_NOT_FOUND') {
      return createNotFoundResponse('Campaign not found');
    }
    
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'CAMPAIGN_ACTIVE') {
      return createBadRequestResponse('Cannot delete an active campaign. Please pause or cancel it first.');
    }
    
    return createServerErrorResponse('Failed to delete marketing campaign')
  }
}