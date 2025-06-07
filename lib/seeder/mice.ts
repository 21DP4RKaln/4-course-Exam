import { PrismaClient } from '@prisma/client';

export async function seedMice(prisma: PrismaClient) {
  // Get all peripherals with subType 'mice'
  const micePeripherals = await prisma.peripheral.findMany({
    where: { subType: 'mice' },
  });

  // Prepare Mouse entries
  const mice = [];

  // For each Mouse peripheral, create a detailed Mouse entry
  for (let i = 0; i < micePeripherals.length; i++) {
    const peripheral = micePeripherals[i];

    // Parse existing specifications if available
    const specs = peripheral.specifications
      ? JSON.parse(peripheral.specifications.toString())
      : {};

    // Get manufacturer from peripheral name or use default
    const manufacturer = peripheral.name.includes('Logitech')
      ? 'Logitech'
      : peripheral.name.includes('Razer')
        ? 'Razer'
        : peripheral.name.includes('SteelSeries')
          ? 'SteelSeries'
          : peripheral.name.includes('Corsair')
            ? 'Corsair'
            : 'Generic';

    // DPI ranges - extract max value for schema compatibility
    const dpiRanges = [
      '100-16000',
      '100-25600',
      '200-18000',
      '400-20000',
      '100-8000',
      '50-25000',
    ];
    const dpiRange = specs.dpi || dpiRanges[i % dpiRanges.length];
    // Extract the maximum DPI value as an integer
    const dpi = parseInt(dpiRange.split('-')[1]);

    // Sensor types
    const sensorTypes = ['Optical', 'Optical', 'Optical', 'Laser'];
    const sensorType = specs.sensorType || sensorTypes[i % sensorTypes.length];

    // Common sensor names by manufacturer
    let sensorName = 'Custom Sensor';
    if (peripheral.name.includes('Logitech')) {
      sensorName = ['HERO 25K', 'HERO 16K', 'HERO', 'Lightspeed'][i % 4];
    } else if (peripheral.name.includes('Razer')) {
      sensorName = ['Focus+ Optical', 'Focus Pro 30K', 'Razer 5G', 'Razer 8K'][
        i % 4
      ];
    } else if (peripheral.name.includes('SteelSeries')) {
      sensorName = [
        'TrueMove Pro',
        'TrueMove 3',
        'TrueMove Core',
        'TrueMove Air',
      ][i % 4];
    } else if (peripheral.name.includes('Corsair')) {
      sensorName = ['PMW3391', 'PMW3389', 'PixArt PAW3335', 'Corsair Marksman'][
        i % 4
      ];
    }

    // Button counts
    const buttonCounts = [6, 8, 5, 12, 7, 11];
    const buttons = specs.buttons || buttonCounts[i % buttonCounts.length];

    // Connection types
    const connectionTypes = [
      'Wired',
      'Wireless',
      'Bluetooth',
      'Wired/Wireless',
      'USB-C',
    ];
    const connection =
      specs.connection || connectionTypes[i % connectionTypes.length];

    // Mouse weight (as integer)
    const weight = 60 + i * 5; // Just the number without 'g'

    // Battery life for wireless mice (as integer)
    const batteryLife =
      connection.includes('Wireless') || connection.includes('Bluetooth')
        ? 20 + (i % 10) * 5
        : null;

    // Additional specs to store in specifications JSON
    const additionalSpecs = {
      acceleration: `40G`,
      pollingRate: `${125 * Math.pow(2, i % 5)}Hz`, // 125, 250, 500, 1000, 2000 Hz
      grip: ['Palm', 'Claw', 'Fingertip', 'Universal'][i % 4],
      dimensions: `${120 + (i % 5) * 5}mm x ${65 + (i % 3) * 2}mm x ${40 + (i % 5)}mm`,
      adjustableWeight: i % 3 === 0,
    };

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

    mice.push({
      peripheralId: peripheral.id,
      manufacturer,
      dpi,
      buttons,
      connection,
      sensor: sensorName,
      weight,
      rgb: i % 5 !== 4, // Convert 'lighting' to boolean rgb
      batteryLife,
    });
  }

  // Insert Mouse entries
  for (const mouse of mice) {
    await prisma.mouse.upsert({
      where: { peripheralId: mouse.peripheralId },
      update: mouse,
      create: mouse,
    });
  }

  // Call the function to add 10 more mice
  await addMoreMice(prisma);
}

/**
 * Adds 10 additional mouse entries with unique specifications
 */
async function addMoreMice(prisma: PrismaClient) {
  const category = await prisma.peripheralCategory.findFirst({
    where: { slug: 'mouse' },
  });

  if (!category) {
    console.error('Mouse category not found');
    return;
  }

  // Define new mouse models with interesting specifications
  const newMouseModels = [
    {
      name: 'Logitech G Pro X Superlight 2',
      manufacturer: 'Logitech',
      dpi: 32000,
      buttons: 5,
      connection: 'Wireless',
      rgb: false,
      weight: 60,
      sensor: 'HERO 2 Sensor',
      batteryLife: 95,
      price: 159.99,
      specs: {
        manufacturer: 'Logitech',
        dpi: '100-32000',
        sensorType: 'Optical',
        buttons: 5,
        connection: 'Wireless',
        weight: '60g',
        grip: 'Universal',
        dimensions: '125mm x 63.5mm x 40mm',
        adjustableWeight: false,
        acceleration: '40G',
        pollingRate: '2000Hz',
        switches: 'Lightforce Hybrid Optical-Mechanical',
        battery: '95 hours',
        charging: 'USB-C',
        onboardMemory: '5 profiles',
        zeroAdditivesDesign: true,
        lowLatency: true,
        carbonNeutralCertified: true,
        color: 'White/Black',
        warranty: '2 years',
        compatibleSoftware: 'G Hub',
      },
    },
    {
      name: 'Razer Viper V3 Pro',
      manufacturer: 'Razer',
      dpi: 35000,
      buttons: 7,
      connection: 'Wireless',
      rgb: false,
      weight: 54,
      sensor: 'Focus Pro 35K',
      batteryLife: 90,
      price: 159.99,
      specs: {
        manufacturer: 'Razer',
        dpi: '100-35000',
        sensorType: 'Optical',
        buttons: 7,
        connection: 'Wireless',
        weight: '54g',
        grip: 'Universal',
        dimensions: '126.8mm x 66.2mm x 37.8mm',
        adjustableWeight: false,
        acceleration: '50G',
        pollingRate: '4000Hz',
        switches: 'Razer Gen-3 Optical',
        battery: '90 hours',
        charging: 'USB-C',
        onboardMemory: '5 profiles',
        smartTracking: true,
        asymmetricCutoff: true,
        motionSync: true,
        color: 'Black',
        warranty: '2 years',
        compatibleSoftware: 'Razer Synapse',
      },
    },
    {
      name: 'Pulsar X2 Mini Wireless SuperGlide',
      manufacturer: 'Pulsar',
      dpi: 26000,
      buttons: 5,
      connection: 'Wireless',
      rgb: true,
      weight: 52,
      sensor: 'PAW3395',
      batteryLife: 70,
      price: 99.99,
      specs: {
        manufacturer: 'Pulsar',
        dpi: '50-26000',
        sensorType: 'Optical',
        buttons: 5,
        connection: 'Wireless',
        weight: '52g',
        grip: 'Claw/Fingertip',
        dimensions: '114mm x 58mm x 38mm',
        adjustableWeight: false,
        acceleration: '50G',
        pollingRate: '1000Hz',
        switches: 'Kailh 8.0',
        battery: '70 hours',
        charging: 'USB-C',
        superglides: true,
        glassFeet: true,
        overclocking: true,
        color: 'White',
        warranty: '2 years',
        compatibleSoftware: 'Pulsar Fusion',
      },
    },
    {
      name: 'Finalmouse Starlight Pro TenZ',
      manufacturer: 'Finalmouse',
      dpi: 20000,
      buttons: 6,
      connection: 'Wireless',
      rgb: false,
      weight: 42,
      sensor: 'Finalsensor',
      batteryLife: 160,
      price: 189.99,
      specs: {
        manufacturer: 'Finalmouse',
        dpi: '400-20000',
        sensorType: 'Optical',
        buttons: 6,
        connection: 'Wireless',
        weight: '42g',
        grip: 'Fingertip',
        dimensions: '125mm x 63mm x 39mm',
        adjustableWeight: false,
        acceleration: '50G',
        pollingRate: '1000Hz',
        switches: 'Japanese Omron',
        battery: '160 hours',
        charging: 'USB-C',
        limitedEdition: true,
        signatureEdition: 'TenZ',
        magnesiumAlloy: true,
        skatesMaterial: 'Pure PTFE',
        color: 'Blue/Gold',
        warranty: '4 years',
      },
    },
    {
      name: 'Glorious Model O Pro',
      manufacturer: 'Glorious',
      dpi: 26000,
      buttons: 6,
      connection: 'Wireless',
      rgb: true,
      weight: 58,
      sensor: 'BAMF 2.0',
      batteryLife: 110,
      price: 99.99,
      specs: {
        manufacturer: 'Glorious',
        dpi: '400-26000',
        sensorType: 'Optical',
        buttons: 6,
        connection: 'Wireless',
        weight: '58g',
        grip: 'Universal',
        dimensions: '128mm x 66mm x 37mm',
        adjustableWeight: false,
        acceleration: '50G',
        pollingRate: '1000Hz',
        switches: 'Glorious Switches',
        battery: '110 hours',
        charging: 'USB-C',
        honeycombShell: true,
        flexCable: 'Ascended Cable',
        glossFinish: true,
        color: 'Matte White',
        warranty: '2 years',
        compatibleSoftware: 'Glorious Core',
      },
    },
    {
      name: 'SteelSeries Aerox 5 Wireless',
      manufacturer: 'SteelSeries',
      dpi: 18000,
      buttons: 9,
      connection: 'Wireless/Bluetooth',
      rgb: true,
      weight: 74,
      sensor: 'TrueMove Air',
      batteryLife: 180,
      price: 139.99,
      specs: {
        manufacturer: 'SteelSeries',
        dpi: '100-18000',
        sensorType: 'Optical',
        buttons: 9,
        connection: 'Wireless/Bluetooth',
        weight: '74g',
        grip: 'Universal',
        dimensions: '128.8mm x 68.2mm x 42.1mm',
        adjustableWeight: false,
        acceleration: '40G',
        pollingRate: '1000Hz',
        switches: 'Golden Micro IP54',
        battery: '180 hours',
        charging: 'USB-C',
        honeycombDesign: true,
        waterResistant: 'IP54',
        dualWireless: true,
        prismSync: true,
        color: 'Black',
        warranty: '1 year',
        compatibleSoftware: 'SteelSeries GG',
      },
    },
    {
      name: 'Corsair M75 Wireless',
      manufacturer: 'Corsair',
      dpi: 26000,
      buttons: 8,
      connection: 'Wireless/Bluetooth',
      rgb: true,
      weight: 89,
      sensor: 'Marksman',
      batteryLife: 200,
      price: 129.99,
      specs: {
        manufacturer: 'Corsair',
        dpi: '100-26000',
        sensorType: 'Optical',
        buttons: 8,
        connection: 'Wireless/Bluetooth',
        weight: '89g',
        grip: 'Palm',
        dimensions: '130mm x 75mm x 43mm',
        adjustableWeight: true,
        acceleration: '50G',
        pollingRate: '2000Hz',
        switches: 'Omron',
        battery: '200 hours',
        charging: 'USB-C/Qi Wireless',
        quickcharge: true,
        slipstreamWireless: true,
        hyperprocessing: true,
        color: 'Black',
        warranty: '2 years',
        compatibleSoftware: 'iCUE',
      },
    },
    {
      name: 'Xtrfy M8 Wireless',
      manufacturer: 'Xtrfy',
      dpi: 19000,
      buttons: 6,
      connection: 'Wireless',
      rgb: true,
      weight: 59,
      sensor: 'PixArt 3370',
      batteryLife: 75,
      price: 99.99,
      specs: {
        manufacturer: 'Xtrfy',
        dpi: '400-19000',
        sensorType: 'Optical',
        buttons: 6,
        connection: 'Wireless',
        weight: '59g',
        grip: 'Claw',
        dimensions: '123mm x 64mm x 40mm',
        adjustableWeight: false,
        acceleration: '50G',
        pollingRate: '1000Hz',
        switches: 'Kailh GM 8.0',
        battery: '75 hours',
        charging: 'USB-C',
        interchangeableShells: true,
        modularDesign: true,
        eztune: true,
        color: 'Retro',
        warranty: '2 years',
        noSoftwareRequired: true,
      },
    },
    {
      name: 'Endgame Gear XM2w',
      manufacturer: 'Endgame Gear',
      dpi: 26000,
      buttons: 5,
      connection: 'Wireless',
      rgb: true,
      weight: 63,
      sensor: 'PixArt PAW3395',
      batteryLife: 100,
      price: 119.99,
      specs: {
        manufacturer: 'Endgame Gear',
        dpi: '50-26000',
        sensorType: 'Optical',
        buttons: 5,
        connection: 'Wireless',
        weight: '63g',
        grip: 'Claw',
        dimensions: '122mm x 65.8mm x 38.5mm',
        adjustableWeight: false,
        acceleration: '50G',
        pollingRate: '1000Hz',
        switches: 'Kailh GM 8.0',
        battery: '100 hours',
        charging: 'USB-C',
        analyticalSoftware: true,
        customLOD: true,
        debounceTime: 'Adjustable',
        color: 'Black',
        warranty: '2 years',
        noDriverRequired: true,
      },
    },
    {
      name: 'Lamzu Atlantis Pro',
      manufacturer: 'Lamzu',
      dpi: 26000,
      buttons: 6,
      connection: 'Wireless',
      rgb: false,
      weight: 48,
      sensor: 'PixArt PAW3395',
      batteryLife: 70,
      price: 149.99,
      specs: {
        manufacturer: 'Lamzu',
        dpi: '50-26000',
        sensorType: 'Optical',
        buttons: 6,
        connection: 'Wireless',
        weight: '48g',
        grip: 'Universal',
        dimensions: '126mm x 64mm x 39mm',
        adjustableWeight: false,
        acceleration: '50G',
        pollingRate: '1000Hz',
        switches: 'Huano Blue Shell',
        battery: '70 hours',
        charging: 'USB-C',
        ptfeFeet: true,
        corepadAirFeet: true,
        cleanMinimalistDesign: true,
        color: 'Sakura Pink',
        warranty: '1 year',
        community: 'Enthusiast Grade',
      },
    },
    {
      name: 'Zowie EC-3C',
      manufacturer: 'Zowie',
      dpi: 3200,
      buttons: 5,
      connection: 'Wired',
      rgb: false,
      weight: 70,
      sensor: 'Zowie 3360',
      batteryLife: null,
      price: 69.99,
      specs: {
        manufacturer: 'Zowie',
        dpi: '400/800/1600/3200',
        sensorType: 'Optical',
        buttons: 5,
        connection: 'Wired',
        weight: '70g',
        grip: 'Palm/Claw',
        dimensions: '120mm x 61mm x 40mm',
        adjustableWeight: false,
        acceleration: '40G',
        pollingRate: '1000Hz',
        switches: 'Huano',
        cableMaterial: 'Flexible Rubber',
        driverless: true,
        plugAndPlay: true,
        symmetricalDesign: false,
        sized: 'Small Ergonomic',
        designedForEsports: true,
        color: 'Black',
        warranty: '2 years',
        noSoftwareRequired: true,
      },
    },
  ];

  // Create new mouse peripherals and mouse entries
  for (let i = 0; i < newMouseModels.length; i++) {
    const model = newMouseModels[i];

    // Generate a unique SKU
    const sku = `P-MOU-${model.manufacturer.substring(0, 3).toUpperCase()}-${2000 + i}`;

    // Create peripheral description
    let description = `${model.name} - ${model.weight}g ${model.connection.toLowerCase()} gaming mouse with ${model.dpi} DPI ${model.sensor} sensor`;
    if (model.rgb) {
      description += ' and RGB lighting';
    }
    if (model.batteryLife) {
      description += `. Up to ${model.batteryLife} hours battery life`;
    }

    // Create the peripheral entry
    const peripheral = await prisma.peripheral.create({
      data: {
        name: model.name,
        description,
        price: model.price,
        stock: 10 + Math.floor(Math.random() * 40),
        categoryId: category.id,
        specifications: JSON.stringify(model.specs),
        sku,
        subType: 'mice',
        imageUrl: `/products/peripherals/mice${(i % 3) + 1}.jpg`,
      },
    });

    // Create the mouse entry
    await prisma.mouse.create({
      data: {
        peripheralId: peripheral.id,
        manufacturer: model.manufacturer,
        dpi: model.dpi,
        buttons: model.buttons,
        connection: model.connection,
        rgb: model.rgb,
        weight: model.weight,
        sensor: model.sensor,
        batteryLife: model.batteryLife,
      },
    });

    console.log(`Added mouse: ${model.name}`);
  }

  console.log('Added 10 additional mice');
}
