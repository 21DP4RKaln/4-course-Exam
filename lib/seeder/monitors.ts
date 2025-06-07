import { PrismaClient } from '@prisma/client';

export async function seedMonitors(prisma: PrismaClient) {
  // Get all peripherals with subType 'monitors'
  const monitorPeripherals = await prisma.peripheral.findMany({
    where: { subType: 'monitors' },
  });

  // Prepare Monitor entries
  const monitors = [];

  // For each Monitor peripheral, create a detailed Monitor entry
  for (let i = 0; i < monitorPeripherals.length; i++) {
    const peripheral = monitorPeripherals[i];

    // Parse existing specifications if available
    const specs = peripheral.specifications
      ? JSON.parse(peripheral.specifications.toString())
      : {};

    // Get manufacturer from peripheral name or use default
    const manufacturer = peripheral.name.includes('Dell')
      ? 'Dell'
      : peripheral.name.includes('LG')
        ? 'LG'
        : peripheral.name.includes('Samsung')
          ? 'Samsung'
          : peripheral.name.includes('ASUS')
            ? 'ASUS'
            : peripheral.name.includes('Acer')
              ? 'Acer'
              : 'Generic';

    // Screen sizes
    const screenSizes = [24.0, 27.0, 32.0, 34.0, 49.0];
    const size = specs.screenSize || screenSizes[i % screenSizes.length];

    // Panel types
    const panelTypes = ['IPS', 'VA', 'TN', 'OLED', 'IPS'];
    const panelType = specs.panelType || panelTypes[i % panelTypes.length];

    // Common resolutions
    let resolution;
    if (size === 34.0 || size === 49.0) {
      resolution = size === 49.0 ? '5120x1440' : '3440x1440'; // Ultrawide
    } else {
      resolution = ['1920x1080', '2560x1440', '3840x2160'][i % 3];
    }

    // Refresh rates
    const refreshRates = [60, 75, 144, 165, 240, 360];
    let refreshRate;

    if (resolution === '3840x2160') {
      // 4K
      refreshRate = [60, 120, 144][i % 3];
    } else if (resolution === '2560x1440') {
      // 1440p
      refreshRate = [144, 165, 240][i % 3];
    } else {
      // 1080p or ultrawide
      refreshRate = [144, 165, 240, 360][i % 4];
    }

    // Response times (convert string to float)
    const responseTimes = [1.0, 1.0, 2.0, 4.0, 0.5];
    const responseTime = specs.responseTime
      ? parseFloat(specs.responseTime)
      : responseTimes[i % responseTimes.length];

    // Brightness (as integer, not string with "nits")
    const brightness = 250 + (i % 6) * 50;

    // HDR support (boolean instead of string)
    const hdr = i % 3 === 0;

    // Additional specs to store in specifications JSON
    const additionalSpecs = {
      aspectRatio:
        resolution.includes('3440') || resolution.includes('5120')
          ? '21:9'
          : '16:9',
      contrast:
        panelType === 'VA'
          ? '3000:1'
          : panelType === 'OLED'
            ? '1000000:1'
            : '1000:1',
      colorGamut: `${90 + (i % 11) * 1}% DCI-P3`,
      hdrRating: i % 3 === 0 ? (i % 2 === 0 ? 'HDR400' : 'HDR600') : 'None',
      adjustable: i % 2 === 0,
      mountType: 'VESA 100x100mm',
    };

    // Ports as JSON string
    const ports = JSON.stringify([
      'HDMI 2.0',
      'DisplayPort 1.4',
      ...(i % 4 === 0 ? ['USB-C'] : []),
    ]);

    // Update peripheral specifications
    await prisma.peripheral.update({
      where: { id: peripheral.id },
      data: {
        specifications: JSON.stringify({
          ...specs,
          ...additionalSpecs,
        }),
      },
    });

    monitors.push({
      peripheralId: peripheral.id,
      manufacturer,
      size,
      resolution,
      refreshRate,
      panelType,
      responseTime,
      brightness,
      hdr,
      ports,
      speakers: i % 3 === 0,
      curved: size >= 32.0 && i % 2 === 0,
    });
  }

  // Insert Monitor entries
  for (const monitor of monitors) {
    await prisma.monitor.upsert({
      where: { peripheralId: monitor.peripheralId },
      update: monitor,
      create: monitor,
    });
  }

  // Call the function to add 10 more monitors
  await addMoreMonitors(prisma);
}

/**
 * Adds 10 additional monitor entries with unique specifications
 */
async function addMoreMonitors(prisma: PrismaClient) {
  const category = await prisma.peripheralCategory.findFirst({
    where: { slug: { contains: 'monitors' } },
  });

  if (!category) {
    console.error('Monitor category not found');
    return;
  }

  // Define new monitor models with interesting specifications
  const newMonitorModels = [
    {
      name: 'Samsung Odyssey G9 G95NC',
      manufacturer: 'Samsung',
      size: 49.0,
      resolution: '5120x1440',
      refreshRate: 240,
      panelType: 'OLED',
      responseTime: 0.03,
      brightness: 1000,
      hdr: true,
      speakers: false,
      curved: true,
      price: 1299.99,
      specs: {
        manufacturer: 'Samsung',
        aspectRatio: '32:9',
        contrast: '1000000:1',
        colorGamut: '99% DCI-P3',
        hdrRating: 'HDR1000',
        adjustable: true,
        mountType: 'VESA 100x100mm',
        curvature: '1000R',
        backlight: 'OLED',
        antiGlare: true,
        gaming: true,
        eyeCare: true,
        adaptiveSync: 'G-Sync Compatible, FreeSync Premium Pro',
        dimensions: '1149.5mm x 537.2mm x 418.3mm',
        weight: '14.5kg',
        connectivity: 'DisplayPort 1.4, HDMI 2.1, USB Hub',
      },
      ports: ['DisplayPort 1.4', 'HDMI 2.1', 'USB-C', 'USB Hub 3.0'],
    },
    {
      name: 'LG UltraGear 32GR93U',
      manufacturer: 'LG',
      size: 32.0,
      resolution: '3840x2160',
      refreshRate: 144,
      panelType: 'Nano IPS',
      responseTime: 1.0,
      brightness: 400,
      hdr: true,
      speakers: true,
      curved: false,
      price: 899.99,
      specs: {
        manufacturer: 'LG',
        aspectRatio: '16:9',
        contrast: '1000:1',
        colorGamut: '98% DCI-P3',
        hdrRating: 'HDR600',
        adjustable: true,
        mountType: 'VESA 100x100mm',
        backlight: 'LED',
        antiGlare: true,
        gaming: true,
        eyeCare: true,
        adaptiveSync: 'G-Sync Compatible, FreeSync Premium Pro',
        dimensions: '714.7mm x 603.8mm x 292.1mm',
        weight: '10.3kg',
        connectivity: 'DisplayPort 1.4, HDMI 2.1, USB Hub',
        speakerPower: '10W x 2',
      },
      ports: [
        'DisplayPort 1.4',
        'HDMI 2.1 (2)',
        'USB Hub 3.0',
        'Headphone Out',
      ],
    },
    {
      name: 'Dell Alienware AW3423DWF',
      manufacturer: 'Dell',
      size: 34.0,
      resolution: '3440x1440',
      refreshRate: 165,
      panelType: 'QD-OLED',
      responseTime: 0.1,
      brightness: 1000,
      hdr: true,
      speakers: false,
      curved: true,
      price: 999.99,
      specs: {
        manufacturer: 'Dell',
        aspectRatio: '21:9',
        contrast: '1000000:1',
        colorGamut: '99.3% DCI-P3',
        hdrRating: 'DisplayHDR True Black 400',
        adjustable: true,
        mountType: 'VESA 100x100mm',
        curvature: '1800R',
        backlight: 'QD-OLED',
        antiGlare: true,
        gaming: true,
        eyeCare: true,
        adaptiveSync: 'FreeSync Premium Pro',
        dimensions: '810.5mm x 461.8mm x 257.2mm',
        weight: '9.7kg',
        connectivity: 'DisplayPort 1.4, HDMI 2.0, USB Hub',
      },
      ports: [
        'DisplayPort 1.4',
        'HDMI 2.0 (2)',
        'USB 3.2 Hub',
        'Headphone Out',
      ],
    },
    {
      name: 'ASUS ROG Swift PG32UQX',
      manufacturer: 'ASUS',
      size: 32.0,
      resolution: '3840x2160',
      refreshRate: 144,
      panelType: 'IPS',
      responseTime: 1.0,
      brightness: 1400,
      hdr: true,
      speakers: true,
      curved: false,
      price: 2499.99,
      specs: {
        manufacturer: 'ASUS',
        aspectRatio: '16:9',
        contrast: '1000:1',
        colorGamut: '98% DCI-P3',
        hdrRating: 'HDR1400',
        adjustable: true,
        mountType: 'VESA 100x100mm',
        backlight: 'Mini-LED (1152 zones)',
        antiGlare: true,
        gaming: true,
        eyeCare: true,
        adaptiveSync: 'G-Sync Ultimate',
        dimensions: '748.96mm x 551.3mm x 297mm',
        weight: '13.5kg',
        connectivity: 'DisplayPort 1.4, HDMI 2.0, USB Hub',
        liveDisplay: true,
      },
      ports: [
        'DisplayPort 1.4 DSC',
        'HDMI 2.0 (3)',
        'USB 3.0 Hub',
        'Headphone Out',
      ],
    },
    {
      name: 'Gigabyte M32U',
      manufacturer: 'Gigabyte',
      size: 32.0,
      resolution: '3840x2160',
      refreshRate: 144,
      panelType: 'SS IPS',
      responseTime: 1.0,
      brightness: 350,
      hdr: true,
      speakers: true,
      curved: false,
      price: 699.99,
      specs: {
        manufacturer: 'Gigabyte',
        aspectRatio: '16:9',
        contrast: '1000:1',
        colorGamut: '90% DCI-P3',
        hdrRating: 'HDR400',
        adjustable: true,
        mountType: 'VESA 100x100mm',
        backlight: 'LED',
        antiGlare: true,
        gaming: true,
        eyeCare: true,
        adaptiveSync: 'FreeSync Premium Pro',
        dimensions: '715.8mm x 586.7mm x 244.3mm',
        weight: '9.5kg',
        connectivity: 'DisplayPort 1.4, HDMI 2.1, USB-C, KVM Switch',
        kvm: true,
      },
      ports: [
        'DisplayPort 1.4',
        'HDMI 2.1 (2)',
        'USB-C',
        'USB Hub 3.0',
        'Headphone Out',
      ],
    },
    {
      name: 'MSI MPG ARTYMIS 343CQR',
      manufacturer: 'MSI',
      size: 34.0,
      resolution: '3440x1440',
      refreshRate: 180,
      panelType: 'VA',
      responseTime: 1.0,
      brightness: 550,
      hdr: true,
      speakers: true,
      curved: true,
      price: 799.99,
      specs: {
        manufacturer: 'MSI',
        aspectRatio: '21:9',
        contrast: '3000:1',
        colorGamut: '95% DCI-P3',
        hdrRating: 'HDR600',
        adjustable: true,
        mountType: 'VESA 100x100mm',
        curvature: '1000R',
        backlight: 'LED',
        antiGlare: true,
        gaming: true,
        eyeCare: true,
        adaptiveSync: 'FreeSync Premium Pro',
        dimensions: '816.8mm x 505.9mm x 304.2mm',
        weight: '10.3kg',
        connectivity: 'DisplayPort 1.4, HDMI 2.0, USB Hub',
        gameIntel: true,
      },
      ports: [
        'DisplayPort 1.4',
        'HDMI 2.0 (2)',
        'USB 3.2 Hub',
        'Headphone Out',
      ],
    },
    {
      name: 'ViewSonic ELITE XG270QG',
      manufacturer: 'ViewSonic',
      size: 27.0,
      resolution: '2560x1440',
      refreshRate: 165,
      panelType: 'Nano IPS',
      responseTime: 1.0,
      brightness: 350,
      hdr: false,
      speakers: false,
      curved: false,
      price: 499.99,
      specs: {
        manufacturer: 'ViewSonic',
        aspectRatio: '16:9',
        contrast: '1000:1',
        colorGamut: '98% DCI-P3',
        hdrRating: 'None',
        adjustable: true,
        mountType: 'VESA 100x100mm',
        backlight: 'LED',
        antiGlare: true,
        gaming: true,
        eyeCare: true,
        adaptiveSync: 'G-Sync',
        dimensions: '614.5mm x 458.7mm x 265.2mm',
        weight: '8.6kg',
        connectivity: 'DisplayPort 1.4, HDMI 2.0, USB Hub',
        rgbLighting: true,
      },
      ports: ['DisplayPort 1.4', 'HDMI 2.0', 'USB 3.0 Hub', 'Headphone Out'],
    },
    {
      name: 'BenQ MOBIUZ EX3210U',
      manufacturer: 'BenQ',
      size: 32.0,
      resolution: '3840x2160',
      refreshRate: 144,
      panelType: 'IPS',
      responseTime: 1.0,
      brightness: 600,
      hdr: true,
      speakers: true,
      curved: false,
      price: 799.99,
      specs: {
        manufacturer: 'BenQ',
        aspectRatio: '16:9',
        contrast: '1000:1',
        colorGamut: '98% DCI-P3',
        hdrRating: 'HDR600',
        adjustable: true,
        mountType: 'VESA 100x100mm',
        backlight: 'LED',
        antiGlare: true,
        gaming: true,
        eyeCare: true,
        adaptiveSync: 'FreeSync Premium Pro',
        dimensions: '727.97mm x 522.12mm x 267.39mm',
        weight: '10.8kg',
        connectivity: 'DisplayPort 1.4, HDMI 2.1, USB Hub',
        speakerPower: '2.1 Channel (5W x 2 + 10W Woofer)',
        remoteControl: true,
      },
      ports: [
        'DisplayPort 1.4',
        'HDMI 2.1 (2)',
        'USB 3.0 Hub',
        'Headphone Out',
      ],
    },
    {
      name: 'AOC AGON AG274QZM',
      manufacturer: 'AOC',
      size: 27.0,
      resolution: '2560x1440',
      refreshRate: 240,
      panelType: 'IPS',
      responseTime: 1.0,
      brightness: 1100,
      hdr: true,
      speakers: true,
      curved: false,
      price: 699.99,
      specs: {
        manufacturer: 'AOC',
        aspectRatio: '16:9',
        contrast: '1200:1',
        colorGamut: '95% DCI-P3',
        hdrRating: 'HDR1000',
        adjustable: true,
        mountType: 'VESA 100x100mm',
        backlight: 'Mini-LED (576 zones)',
        antiGlare: true,
        gaming: true,
        eyeCare: true,
        adaptiveSync: 'G-Sync Compatible, FreeSync Premium Pro',
        dimensions: '615.1mm x 566.1mm x 236.3mm',
        weight: '8.5kg',
        connectivity: 'DisplayPort 1.4, HDMI 2.0, USB Hub',
        speakerPower: '5W x 2',
        rgbLighting: true,
      },
      ports: [
        'DisplayPort 1.4',
        'HDMI 2.0 (2)',
        'USB 3.2 Hub',
        'Headphone Out',
      ],
    },
    {
      name: 'Corsair XENEON 32UHD144',
      manufacturer: 'Corsair',
      size: 32.0,
      resolution: '3840x2160',
      refreshRate: 144,
      panelType: 'IPS',
      responseTime: 1.0,
      brightness: 400,
      hdr: true,
      speakers: false,
      curved: false,
      price: 899.99,
      specs: {
        manufacturer: 'Corsair',
        aspectRatio: '16:9',
        contrast: '1000:1',
        colorGamut: '100% sRGB, 98% DCI-P3',
        hdrRating: 'HDR600',
        adjustable: true,
        mountType: 'VESA 100x100mm',
        backlight: 'LED',
        antiGlare: true,
        gaming: true,
        eyeCare: true,
        adaptiveSync: 'G-Sync Compatible, FreeSync Premium Pro',
        dimensions: '728.5mm x 602.2mm x 270.8mm',
        weight: '10kg',
        connectivity: 'DisplayPort 1.4, HDMI 2.1, USB-C',
        icueIntegration: true,
        streamcamMount: true,
      },
      ports: [
        'DisplayPort 1.4',
        'HDMI 2.1 (2)',
        'USB-C (DP Alt Mode)',
        'USB 3.0 Hub',
      ],
    },
  ];

  // Create new monitor peripherals and monitor entries
  for (let i = 0; i < newMonitorModels.length; i++) {
    const model = newMonitorModels[i];

    // Generate a unique SKU
    const sku = `P-MON-${model.manufacturer.substring(0, 3).toUpperCase()}-${2000 + i}`;

    // Create peripheral description
    let description = `${model.name} - ${model.size}" ${model.resolution} ${model.refreshRate}Hz ${model.panelType} gaming monitor`;
    if (model.hdr) {
      description += ' with HDR support';
    }
    if (model.curved) {
      description += ' and curved display';
    }

    // Create the peripheral entry
    const peripheral = await prisma.peripheral.create({
      data: {
        name: model.name,
        description,
        price: model.price,
        stock: 5 + Math.floor(Math.random() * 20),
        categoryId: category.id,
        specifications: JSON.stringify(model.specs),
        sku,
        subType: 'monitors',
        imageUrl: `/products/peripherals/monitors${(i % 3) + 1}.jpg`,
      },
    });

    // Create the monitor entry
    await prisma.monitor.create({
      data: {
        peripheralId: peripheral.id,
        manufacturer: model.manufacturer,
        size: model.size,
        resolution: model.resolution,
        refreshRate: model.refreshRate,
        panelType: model.panelType,
        responseTime: model.responseTime,
        brightness: model.brightness,
        hdr: model.hdr,
        ports: JSON.stringify(model.ports),
        speakers: model.speakers,
        curved: model.curved,
      },
    });

    console.log(`Added monitor: ${model.name}`);
  }

  console.log('Added 10 additional monitors');
}
