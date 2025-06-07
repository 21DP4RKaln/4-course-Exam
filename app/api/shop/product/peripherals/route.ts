import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    let whereClause: any = {
      quantity: { gt: 0 },
    };

    let category;
    if (categorySlug) {
      category = await prisma.peripheralCategory.findFirst({
        where: {
          OR: [{ slug: categorySlug }, { id: categorySlug }],
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      whereClause.categoryId = category.id;
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
    });
    const components = peripherals.map((p: any) => {
      let specifications: Record<string, string> = {};

      if (p.subType) specifications['subType'] = p.subType;

      if (p.keyboard) {
        specifications['brand'] = p.keyboard.brand;
        specifications['switchType'] = p.keyboard.switchType;
        specifications['layout'] = p.keyboard.layout;
        specifications['form'] = p.keyboard.form;
        specifications['connection'] = p.keyboard.connection;
        specifications['rgb'] = p.keyboard.rgb ? 'Yes' : 'No';
        specifications['numpad'] = p.keyboard.numpad ? 'Yes' : 'No';
      } else if (p.mouse) {
        specifications['brand'] = p.mouse.brand;
        specifications['color'] = p.mouse.color;
        specifications['category'] = p.mouse.category;
        specifications['dpi'] = p.mouse.dpi.toString();
        specifications['buttons'] = p.mouse.buttons.toString();
        specifications['connection'] = p.mouse.connection;
        specifications['rgb'] = p.mouse.rgb ? 'Yes' : 'No';
        specifications['weight'] = p.mouse.weight.toString();
        specifications['sensor'] = p.mouse.sensor;
        specifications['batteryType'] = p.mouse.batteryType;
        specifications['batteryLife'] = p.mouse.batteryLife.toString();
      } else if (p.microphone) {
        specifications['brand'] = p.microphone.brand;
        specifications['type'] = p.microphone.type;
        specifications['pattern'] = p.microphone.pattern;
        specifications['frequency'] = p.microphone.frequency.toString();
        specifications['sensitivity'] = p.microphone.sensitivity.toString();
        specifications['interface'] = p.microphone.interface;
        specifications['stand'] = p.microphone.stand ? 'Yes' : 'No';
      } else if (p.camera) {
        specifications['brand'] = p.camera.brand;
        specifications['resolution'] = p.camera.resolution;
        specifications['fps'] = p.camera.fps.toString();
        specifications['fov'] = p.camera.fov.toString();
        specifications['microphone'] = p.camera.microphone ? 'Yes' : 'No';
        specifications['autofocus'] = p.camera.autofocus ? 'Yes' : 'No';
        specifications['connection'] = p.camera.connection;
      } else if (p.monitor) {
        specifications['brand'] = p.monitor.brand;
        specifications['size'] = p.monitor.size.toString();
        specifications['resolution'] = p.monitor.resolution;
        specifications['refreshRate'] = p.monitor.refreshRate.toString();
        specifications['panelType'] = p.monitor.panelType;
        specifications['responseTime'] = p.monitor.responseTime.toString();
        specifications['brightness'] = p.monitor.brightness.toString();
        specifications['hdr'] = p.monitor.hdr ? 'Yes' : 'No';
        specifications['ports'] = p.monitor.ports;
        specifications['speakers'] = p.monitor.speakers ? 'Yes' : 'No';
        specifications['curved'] = p.monitor.curved ? 'Yes' : 'No';
      } else if (p.headphones) {
        specifications['brand'] = p.headphones.brand;
        specifications['type'] = p.headphones.type;
        specifications['connection'] = p.headphones.connection;
        specifications['microphone'] = p.headphones.microphone ? 'Yes' : 'No';
        specifications['impedance'] = p.headphones.impedance.toString();
        specifications['frequency'] = p.headphones.frequency;
        specifications['weight'] = p.headphones.weight.toString();
        specifications['noiseCancelling'] = p.headphones.noiseCancelling
          ? 'Yes'
          : 'No';
        specifications['rgb'] = p.headphones.rgb ? 'Yes' : 'No';
      } else if (p.speakers) {
        specifications['brand'] = p.speakers.brand;
        specifications['type'] = p.speakers.type;
        specifications['totalWattage'] = p.speakers.totalWattage.toString();
        specifications['frequency'] = p.speakers.frequency;
        specifications['connections'] = p.speakers.connections;
        specifications['bluetooth'] = p.speakers.bluetooth ? 'Yes' : 'No';
        specifications['remote'] = p.speakers.remote ? 'Yes' : 'No';
      } else if (p.gamepad) {
        specifications['brand'] = p.gamepad.brand;
        specifications['connection'] = p.gamepad.connection;
        specifications['platform'] = p.gamepad.platform;
        specifications['layout'] = p.gamepad.layout;
        specifications['vibration'] = p.gamepad.vibration ? 'Yes' : 'No';
        specifications['rgb'] = p.gamepad.rgb ? 'Yes' : 'No';
        specifications['batteryLife'] = p.gamepad.batteryLife.toString();
        specifications['programmable'] = p.gamepad.programmable ? 'Yes' : 'No';
      } else if (p.mousePad) {
        specifications['brand'] = p.mousePad.brand;
        specifications['dimensions'] = p.mousePad.dimensions;
        specifications['thickness'] = p.mousePad.thickness.toString();
        specifications['material'] = p.mousePad.material;
        specifications['rgb'] = p.mousePad.rgb ? 'Yes' : 'No';
        specifications['surface'] = p.mousePad.surface;
      }

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.quantity,
        imageUrl: p.imagesUrl,
        categoryId: p.categoryId,
        categoryName: p.category.name,
        specifications,
        sku: p.sku,
        rating: p.rating || 0,
        ratingCount: p.ratingCount || 0,
        keyboard: p.keyboard,
        mouse: p.mouse,
        microphone: p.microphone,
        camera: p.camera,
        monitor: p.monitor,
        headphones: p.headphones,
        speakers: p.speakers,
        gamepad: p.gamepad,
        mousePad: p.mousePad,
      };
    });
    const categories = categorySlug
      ? [category!]
      : await prisma.peripheralCategory.findMany();

    return NextResponse.json({
      categories,
      components,
      specifications: [],
    });
  } catch (error) {
    console.error('Error fetching peripherals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
