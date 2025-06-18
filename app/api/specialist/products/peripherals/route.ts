import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createServerErrorResponse,
  createBadRequestResponse,
  createNotFoundResponse,
} from '@/lib/apiErrors';
import { z } from 'zod';

const peripheralUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().min(0).optional(),
  sku: z.string().optional(),
  subType: z.string().optional(),
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

    if (!['ADMIN', 'SPECIALIST'].includes(payload.role)) {
      return createUnauthorizedResponse('Insufficient permissions');
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock') === 'true';
    const id = searchParams.get('id');

    // If requesting a specific peripheral
    if (id) {
      const peripheral = await prisma.peripheral.findUnique({
        where: { id },
        include: {
          category: true,
          keyboard: true,
          mouse: true,
          microphone: true,
          camera: true,
          monitor: true,
          headphones: true,
          speakers: true,
          gamepad: true,
          mousePad: true,
        },
      });

      if (!peripheral) {
        return createNotFoundResponse('Peripheral not found');
      }

      // Build specifications object
      const specifications: Record<string, string> = {};

      if (peripheral.keyboard) {
        specifications['Switch Type'] = peripheral.keyboard.switchType;
        specifications['Layout'] = peripheral.keyboard.layout;
        specifications['Form Factor'] = peripheral.keyboard.form;
        specifications['Connection'] = peripheral.keyboard.connection;
        specifications['RGB'] = peripheral.keyboard.rgb ? 'Yes' : 'No';
        specifications['Numpad'] = peripheral.keyboard.numpad ? 'Yes' : 'No';
        specifications['Brand'] = peripheral.keyboard.brand;
      }

      if (peripheral.mouse) {
        specifications['Color'] = peripheral.mouse.color;
        specifications['Category'] = peripheral.mouse.category;
        specifications['DPI'] = peripheral.mouse.dpi.toString();
        specifications['Buttons'] = peripheral.mouse.buttons.toString();
        specifications['Connection'] = peripheral.mouse.connection;
        specifications['RGB'] = peripheral.mouse.rgb ? 'Yes' : 'No';
        specifications['Weight'] = `${peripheral.mouse.weight}g`;
        specifications['Sensor'] = peripheral.mouse.sensor;
        specifications['Battery Type'] = peripheral.mouse.batteryType;
        specifications['Battery Life'] = `${peripheral.mouse.batteryLife}h`;
        specifications['Brand'] = peripheral.mouse.brand;
      }

      if (peripheral.monitor) {
        specifications['Size'] = `${peripheral.monitor.size}"`;
        specifications['Resolution'] = peripheral.monitor.resolution;
        specifications['Refresh Rate'] = `${peripheral.monitor.refreshRate}Hz`;
        specifications['Panel Type'] = peripheral.monitor.panelType;
        specifications['Response Time'] =
          `${peripheral.monitor.responseTime}ms`;
        specifications['Brightness'] = `${peripheral.monitor.brightness} nits`;
        specifications['Contrast Ratio'] = peripheral.monitor.contrastRatio;
        specifications['Color Gamut'] = peripheral.monitor.colorGamut;
        specifications['HDR'] = peripheral.monitor.hdr ? 'Yes' : 'No';
        specifications['Curved'] = peripheral.monitor.curved ? 'Yes' : 'No';
        specifications['VESA Mount'] = peripheral.monitor.vesaMount
          ? 'Yes'
          : 'No';
        specifications['Ports'] = peripheral.monitor.ports.join(', ');
        specifications['Brand'] = peripheral.monitor.brand;
      }

      // Add more specifications for other peripheral types...

      return NextResponse.json({
        id: peripheral.id,
        name: peripheral.name,
        description: peripheral.description,
        price: peripheral.price,
        quantity: peripheral.quantity,
        sku: peripheral.sku,
        subType: peripheral.subType,
        imagesUrl: peripheral.imagesUrl,
        category: {
          id: peripheral.category.id,
          name: peripheral.category.name,
          description: peripheral.category.description,
        },
        specifications,
        viewCount: peripheral.viewCount,
        createdAt: peripheral.createdAt.toISOString(),
        updatedAt: peripheral.updatedAt.toISOString(),
      });
    }

    let whereClause: any = {};

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (lowStock) {
      whereClause.quantity = { lt: 10 };
    }

    const peripherals = await prisma.peripheral.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        keyboard: true,
        mouse: true,
        microphone: true,
        camera: true,
        monitor: true,
        headphones: true,
        speakers: true,
        gamepad: true,
        mousePad: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const categories = await prisma.peripheralCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    const formattedPeripherals = peripherals.map(peripheral => {
      const specifications: Record<string, string> = {};

      // Build specifications for each peripheral type
      if (peripheral.keyboard) {
        specifications['Switch Type'] = peripheral.keyboard.switchType;
        specifications['Layout'] = peripheral.keyboard.layout;
        specifications['Connection'] = peripheral.keyboard.connection;
        specifications['RGB'] = peripheral.keyboard.rgb ? 'Yes' : 'No';
        specifications['Brand'] = peripheral.keyboard.brand;
      }

      if (peripheral.mouse) {
        specifications['DPI'] = peripheral.mouse.dpi.toString();
        specifications['Buttons'] = peripheral.mouse.buttons.toString();
        specifications['Connection'] = peripheral.mouse.connection;
        specifications['RGB'] = peripheral.mouse.rgb ? 'Yes' : 'No';
        specifications['Brand'] = peripheral.mouse.brand;
      }

      if (peripheral.monitor) {
        specifications['Size'] = `${peripheral.monitor.size}"`;
        specifications['Resolution'] = peripheral.monitor.resolution;
        specifications['Refresh Rate'] = `${peripheral.monitor.refreshRate}Hz`;
        specifications['Panel Type'] = peripheral.monitor.panelType;
        specifications['Brand'] = peripheral.monitor.brand;
      }

      return {
        id: peripheral.id,
        name: peripheral.name,
        description: peripheral.description,
        price: peripheral.price,
        quantity: peripheral.quantity,
        sku: peripheral.sku,
        subType: peripheral.subType,
        imagesUrl: peripheral.imagesUrl,
        category: {
          id: peripheral.category.id,
          name: peripheral.category.name,
          description: peripheral.category.description,
        },
        specifications,
        viewCount: peripheral.viewCount,
        createdAt: peripheral.createdAt.toISOString(),
        updatedAt: peripheral.updatedAt.toISOString(),
        stockStatus:
          peripheral.quantity === 0
            ? 'out_of_stock'
            : peripheral.quantity < 10
              ? 'low_stock'
              : 'in_stock',
      };
    });

    return NextResponse.json({
      peripherals: formattedPeripherals,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        slug: cat.slug,
      })),
      total: formattedPeripherals.length,
      lowStockCount: formattedPeripherals.filter(p => p.quantity < 10).length,
      outOfStockCount: formattedPeripherals.filter(p => p.quantity === 0)
        .length,
    });
  } catch (error) {
    console.error('Error fetching peripherals:', error);
    return createServerErrorResponse('Failed to fetch peripherals');
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

    if (!['ADMIN', 'SPECIALIST'].includes(payload.role)) {
      return createUnauthorizedResponse('Insufficient permissions');
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return createBadRequestResponse('Peripheral ID is required');
    }

    const validationResult = peripheralUpdateSchema.safeParse(updateData);
    if (!validationResult.success) {
      return createBadRequestResponse('Invalid data', {
        errors: validationResult.error.errors,
      });
    }

    const peripheral = await prisma.peripheral.findUnique({
      where: { id },
    });

    if (!peripheral) {
      return createNotFoundResponse('Peripheral not found');
    }

    const updatedPeripheral = await prisma.peripheral.update({
      where: { id },
      data: validationResult.data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedPeripheral.id,
      name: updatedPeripheral.name,
      description: updatedPeripheral.description,
      price: updatedPeripheral.price,
      quantity: updatedPeripheral.quantity,
      sku: updatedPeripheral.sku,
      subType: updatedPeripheral.subType,
      imagesUrl: updatedPeripheral.imagesUrl,
      category: updatedPeripheral.category,
      viewCount: updatedPeripheral.viewCount,
      createdAt: updatedPeripheral.createdAt.toISOString(),
      updatedAt: updatedPeripheral.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating peripheral:', error);
    return createServerErrorResponse('Failed to update peripheral');
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

    // Only allow ADMIN to delete peripherals
    if (payload.role !== 'ADMIN') {
      return createUnauthorizedResponse(
        'Admin access required for deleting peripherals'
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createBadRequestResponse('Peripheral ID is required');
    }

    const peripheral = await prisma.peripheral.findUnique({
      where: { id },
    });

    if (!peripheral) {
      return createNotFoundResponse('Peripheral not found');
    }

    // Check if peripheral is used in any repairs
    const usedInRepairs = await prisma.repair.count({
      where: { peripheralId: id },
    });

    if (usedInRepairs > 0) {
      return createBadRequestResponse(
        'Cannot delete peripheral that is associated with repairs'
      );
    }

    await prisma.peripheral.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Peripheral deleted successfully' });
  } catch (error) {
    console.error('Error deleting peripheral:', error);
    return createServerErrorResponse('Failed to delete peripheral');
  }
}
