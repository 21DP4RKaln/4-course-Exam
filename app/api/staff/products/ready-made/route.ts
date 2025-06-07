import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt';
import {
  createUnauthorizedResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';

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

    if (!['ADMIN', 'SPECIALIST'].includes(payload.role)) {
      return createUnauthorizedResponse('Insufficient permissions');
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isPublic = searchParams.get('isPublic');

    let whereClause: any = {
      isTemplate: true,
    };

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isPublic !== null) {
      whereClause.isPublic = isPublic === 'true';
    }

    const readyMadePCs = await prisma.configuration.findMany({
      where: whereClause,
      include: {
        components: {
          include: {
            component: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedPCs = readyMadePCs.map(config => {
      const cpu = config.components.find(item =>
        item.component.category.name.toLowerCase().includes('cpu')
      )?.component;

      const gpu = config.components.find(
        item =>
          item.component.category.name.toLowerCase().includes('gpu') ||
          item.component.category.name.toLowerCase().includes('graphics')
      )?.component;

      const ram = config.components.find(
        item =>
          item.component.category.name.toLowerCase().includes('ram') ||
          item.component.category.name.toLowerCase().includes('memory')
      )?.component;

      const storage = config.components.find(
        item =>
          item.component.category.name.toLowerCase().includes('storage') ||
          item.component.category.name.toLowerCase().includes('ssd') ||
          item.component.category.name.toLowerCase().includes('hdd')
      )?.component;

      return {
        id: config.id,
        name: config.name,
        description: config.description,
        category: config.category || 'Custom PC',
        totalPrice: config.totalPrice,
        isPublic: config.isPublic,
        status: config.status,
        imageUrl: config.imageUrl,
        viewCount: config.viewCount,
        keySpecs: {
          cpu: cpu ? cpu.name : 'Not specified',
          gpu: gpu ? gpu.name : 'Not specified',
          ram: ram ? ram.name : 'Not specified',
          storage: storage ? storage.name : 'Not specified',
        },
        components: config.components.map(item => ({
          id: item.component.id,
          name: item.component.name,
          category: item.component.category.name,
          quantity: item.quantity,
          price: item.component.price,
        })),
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      };
    });

    const categories = [
      {
        id: 'gaming',
        name: 'Gaming PC',
        description: 'High-performance gaming computers',
      },
      {
        id: 'workstation',
        name: 'Workstation',
        description: 'Professional workstations',
      },
      {
        id: 'office',
        name: 'Office PC',
        description: 'Business and office computers',
      },
      {
        id: 'budget',
        name: 'Budget PC',
        description: 'Affordable everyday computers',
      },
    ];

    return NextResponse.json({
      readyMadePCs: formattedPCs,
      categories,
    });
  } catch (error) {
    console.error('Error fetching ready-made PCs:', error);
    return createServerErrorResponse('Failed to fetch ready-made PCs');
  }
}
