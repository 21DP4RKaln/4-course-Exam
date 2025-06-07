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
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock') === 'true';

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

      if (peripheral.microphone) {
        specifications['Type'] = peripheral.microphone.type;
        specifications['Pattern'] = peripheral.microphone.pattern;
        specifications['Frequency'] = `${peripheral.microphone.frequency}Hz`;
        specifications['Sensitivity'] =
          `${peripheral.microphone.sensitivity}dB`;
        specifications['Interface'] = peripheral.microphone.interface;
        specifications['Stand Included'] = peripheral.microphone.stand
          ? 'Yes'
          : 'No';
        specifications['Brand'] = peripheral.microphone.brand;
      }

      if (peripheral.camera) {
        specifications['Resolution'] = peripheral.camera.resolution;
        specifications['FPS'] = peripheral.camera.fps.toString();
        specifications['FOV'] = `${peripheral.camera.fov}°`;
        specifications['Microphone'] = peripheral.camera.microphone
          ? 'Yes'
          : 'No';
        specifications['Autofocus'] = peripheral.camera.autofocus
          ? 'Yes'
          : 'No';
        specifications['Connection'] = peripheral.camera.connection;
        specifications['Brand'] = peripheral.camera.brand;
      }

      if (peripheral.monitor) {
        specifications['Size'] = `${peripheral.monitor.size}"`;
        specifications['Resolution'] = peripheral.monitor.resolution;
        specifications['Refresh Rate'] = `${peripheral.monitor.refreshRate}Hz`;
        specifications['Panel Type'] = peripheral.monitor.panelType;
        specifications['Response Time'] =
          `${peripheral.monitor.responseTime}ms`;
        specifications['Brightness'] = `${peripheral.monitor.brightness} nits`;
        specifications['HDR'] = peripheral.monitor.hdr ? 'Yes' : 'No';
        specifications['Ports'] = peripheral.monitor.ports;
        specifications['Speakers'] = peripheral.monitor.speakers ? 'Yes' : 'No';
        specifications['Curved'] = peripheral.monitor.curved ? 'Yes' : 'No';
        specifications['Brand'] = peripheral.monitor.brand;
      }

      if (peripheral.headphones) {
        specifications['Type'] = peripheral.headphones.type;
        specifications['Connection'] = peripheral.headphones.connection;
        specifications['Microphone'] = peripheral.headphones.microphone
          ? 'Yes'
          : 'No';
        specifications['Impedance'] = `${peripheral.headphones.impedance}Ω`;
        specifications['Frequency'] = peripheral.headphones.frequency;
        specifications['Weight'] = `${peripheral.headphones.weight}g`;
        specifications['Noise Cancelling'] = peripheral.headphones
          .noiseCancelling
          ? 'Yes'
          : 'No';
        specifications['RGB'] = peripheral.headphones.rgb ? 'Yes' : 'No';
        specifications['Brand'] = peripheral.headphones.brand;
      }

      if (peripheral.speakers) {
        specifications['Type'] = peripheral.speakers.type;
        specifications['Total Wattage'] =
          `${peripheral.speakers.totalWattage}W`;
        specifications['Frequency'] = peripheral.speakers.frequency;
        specifications['Connections'] = peripheral.speakers.connections;
        specifications['Bluetooth'] = peripheral.speakers.bluetooth
          ? 'Yes'
          : 'No';
        specifications['Remote'] = peripheral.speakers.remote ? 'Yes' : 'No';
        specifications['Brand'] = peripheral.speakers.brand;
      }

      if (peripheral.gamepad) {
        specifications['Connection'] = peripheral.gamepad.connection;
        specifications['Platform'] = peripheral.gamepad.platform;
        specifications['Layout'] = peripheral.gamepad.layout;
        specifications['Vibration'] = peripheral.gamepad.vibration
          ? 'Yes'
          : 'No';
        specifications['RGB'] = peripheral.gamepad.rgb ? 'Yes' : 'No';
        specifications['Battery Life'] = `${peripheral.gamepad.batteryLife}h`;
        specifications['Programmable'] = peripheral.gamepad.programmable
          ? 'Yes'
          : 'No';
        specifications['Brand'] = peripheral.gamepad.brand;
      }

      if (peripheral.mousePad) {
        specifications['Dimensions'] = peripheral.mousePad.dimensions;
        specifications['Thickness'] = `${peripheral.mousePad.thickness}mm`;
        specifications['Material'] = peripheral.mousePad.material;
        specifications['RGB'] = peripheral.mousePad.rgb ? 'Yes' : 'No';
        specifications['Surface'] = peripheral.mousePad.surface;
        specifications['Brand'] = peripheral.mousePad.brand;
      }

      return {
        id: peripheral.id,
        name: peripheral.name,
        description: peripheral.description,
        category: peripheral.category.name,
        categoryId: peripheral.categoryId,
        price: peripheral.price,
        quantity: peripheral.quantity,
        imagesUrl: peripheral.imagesUrl,
        sku: peripheral.sku,
        specifications,
        viewCount: peripheral.viewCount,
        createdAt: peripheral.createdAt.toISOString(),
        updatedAt: peripheral.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      peripherals: formattedPeripherals,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
      })),
    });
  } catch (error) {
    console.error('Error fetching peripherals:', error);
    return createServerErrorResponse('Failed to fetch peripherals');
  }
}
