import { PrismaClient } from '@prisma/client';

export async function seedGamepads(prisma: PrismaClient) {
  // Get all peripherals with subType 'gamepads'
  const gamepadPeripherals = await prisma.peripheral.findMany({
    where: { subType: 'gamepads' },
  });

  // Prepare Gamepad entries
  const gamepads = [];

  // For each Gamepad peripheral, create a detailed Gamepad entry
  for (let i = 0; i < gamepadPeripherals.length; i++) {
    const peripheral = gamepadPeripherals[i];

    // Parse existing specifications if available
    const specs = peripheral.specifications
      ? JSON.parse(peripheral.specifications.toString())
      : {};

    // Connection types
    const connections = [
      'Wired - USB',
      'Wireless - 2.4GHz',
      'Wireless - Bluetooth',
      'Wired - USB, Wireless - Bluetooth',
    ];
    const connection = specs.connection || connections[i % connections.length];
    // Determine if wireless based on connection type
    const isWireless = connection.includes('Wireless');

    // Manufacturer (required field)
    const manufacturers = [
      'Microsoft',
      'Sony',
      'Nintendo',
      'Logitech',
      'Razer',
      'SteelSeries',
      'PowerA',
      '8BitDo',
    ];
    const manufacturer =
      specs.manufacturer || manufacturers[i % manufacturers.length];

    // Platform compatibility
    const platforms = [
      'Xbox, PC',
      'PlayStation, PC',
      'PC',
      'Xbox, PlayStation, PC, Switch',
      'PlayStation, PC, Android, iOS',
      'Xbox, PC, Android',
    ];
    const platformCompatibility =
      specs.platformCompatibility || platforms[i % platforms.length];
    // Primary platform (required field)
    const primaryPlatform = platformCompatibility.split(',')[0].trim();

    // Layout types
    const layouts = [
      'Xbox-style',
      'PlayStation-style',
      'Xbox-style',
      'Switch-style',
    ];
    const layout = specs.layout || layouts[i % layouts.length];

    // Battery life in hours (only for wireless)
    const batteryLife = isWireless ? 20 + (i % 10) * 5 : null;

    gamepads.push({
      peripheralId: peripheral.id,
      manufacturer, // Added required field
      connection,
      platform: primaryPlatform, // Added required field
      layout,
      vibration: i % 5 !== 4,
      programmable: i % 2 === 0,
      batteryLife,
      rgb: i % 4 === 0,
    });
  }
  // Insert Gamepad entries
  for (const gamepad of gamepads) {
    // Filter out any fields that aren't in the Prisma schema
    const validGamepadData = {
      peripheralId: gamepad.peripheralId,
      manufacturer: gamepad.manufacturer,
      connection: gamepad.connection,
      platform: gamepad.platform,
      layout: gamepad.layout,
      vibration: gamepad.vibration,
      programmable: gamepad.programmable,
      batteryLife: gamepad.batteryLife,
      rgb: gamepad.rgb,
    };

    await prisma.gamepad.upsert({
      where: { peripheralId: gamepad.peripheralId },
      update: validGamepadData,
      create: validGamepadData,
    });
  }

  // Call the function to add 10 more gamepads
  await addMoreGamepads(prisma);
}

/**
 * Adds 10 additional gamepad entries with unique specifications
 */
async function addMoreGamepads(prisma: PrismaClient) {
  const category = await prisma.peripheralCategory.findFirst({
    where: { slug: 'gamepad' },
  });

  if (!category) {
    console.error('Gamepad category not found');
    return;
  }

  // Define new gamepad models with interesting specifications
  const newGamepadModels = [
    {
      name: 'Xbox Elite Series 3 Controller',
      manufacturer: 'Microsoft',
      connection: 'Wireless - Bluetooth, Wired - USB-C',
      platform: 'Xbox',
      layout: 'Xbox-style',
      rumble: true,
      programmableButtons: true,
      analogSticks: 2,
      triggers: 'Hall Effect',
      dPad: '8-way',
      backButtons: 4,
      batteryLife: 60,
      chargingMethod: 'USB-C',
      rgb: true,
      weight: '345g',
      dimensions: '160mm x 105mm x 65mm',
      price: 179.99,
      specs: {
        manufacturer: 'Microsoft',
        connectivity: 'Wireless/Wired',
        interface: 'Bluetooth/USB-C',
        color: 'Black/Carbon Fiber',
        weight: '345g',
        warranty: '3 years',
        platformCompatibility: 'Xbox, PC, iOS, Android',
        layout: 'Xbox-style',
        interchangeableParts: true,
        customProfiles: 3,
        triggerLocks: true,
        gripMaterial: 'Premium rubber',
        adjustableJoystickTension: true,
      },
    },
    {
      name: 'DualSense Edge Wireless Controller',
      manufacturer: 'Sony',
      connection: 'Wireless - Bluetooth, Wired - USB-C',
      platform: 'PlayStation',
      layout: 'PlayStation-style',
      rumble: true,
      programmableButtons: true,
      analogSticks: 2,
      triggers: 'Adaptive',
      dPad: '8-way',
      backButtons: 4,
      batteryLife: 40,
      chargingMethod: 'USB-C',
      rgb: true,
      weight: '325g',
      dimensions: '155mm x 106mm x 68mm',
      price: 199.99,
      specs: {
        manufacturer: 'Sony',
        connectivity: 'Wireless/Wired',
        interface: 'Bluetooth/USB-C',
        color: 'White/Black',
        weight: '325g',
        warranty: '2 years',
        platformCompatibility: 'PlayStation, PC',
        layout: 'PlayStation-style',
        interchangeableParts: true,
        customProfiles: 4,
        triggerLocks: true,
        gripMaterial: 'Textured plastic',
        hapticFeedback: true,
        adaptiveTriggers: true,
        touchpad: true,
      },
    },
    {
      name: '8BitDo Ultimate Controller',
      manufacturer: '8BitDo',
      connection: 'Wireless - 2.4GHz, Wireless - Bluetooth, Wired - USB-C',
      platform: 'PC',
      layout: 'Xbox-style',
      rumble: true,
      programmableButtons: true,
      analogSticks: 2,
      triggers: 'Standard',
      dPad: '8-way',
      backButtons: 2,
      batteryLife: 45,
      chargingMethod: 'Charging Dock',
      rgb: false,
      weight: '220g',
      dimensions: '153mm x 100mm x 62mm',
      price: 79.99,
      specs: {
        manufacturer: '8BitDo',
        connectivity: 'Wireless/Wired',
        interface: '2.4GHz/Bluetooth/USB-C',
        color: 'Black',
        weight: '220g',
        warranty: '2 years',
        platformCompatibility: 'PC, Switch, Android, iOS',
        layout: 'Xbox-style',
        interchangeableParts: false,
        customProfiles: 3,
        chargingDock: true,
        classicDPad: true,
      },
    },
    {
      name: 'Nintendo Switch Pro Controller Plus',
      manufacturer: 'Nintendo',
      connection: 'Wireless - Bluetooth, Wired - USB-C',
      platform: 'Switch',
      layout: 'Switch-style',
      rumble: true,
      programmableButtons: false,
      analogSticks: 2,
      triggers: 'Standard',
      dPad: '4-way',
      backButtons: 0,
      batteryLife: 55,
      chargingMethod: 'USB-C',
      rgb: false,
      weight: '240g',
      dimensions: '158mm x 102mm x 64mm',
      price: 89.99,
      specs: {
        manufacturer: 'Nintendo',
        connectivity: 'Wireless/Wired',
        interface: 'Bluetooth/USB-C',
        color: 'Black/Gray',
        weight: '240g',
        warranty: '2 years',
        platformCompatibility: 'Switch, PC',
        layout: 'Switch-style',
        hdRumble: true,
        motionControls: true,
        nfcReader: true,
        amiboSupport: true,
      },
    },
    {
      name: 'Razer Wolverine V3 Pro',
      manufacturer: 'Razer',
      connection: 'Wireless - 2.4GHz, Wired - USB-C',
      platform: 'Xbox',
      layout: 'Xbox-style',
      rumble: true,
      programmableButtons: true,
      analogSticks: 2,
      triggers: 'Mechanical',
      dPad: '8-way',
      backButtons: 6,
      batteryLife: 35,
      chargingMethod: 'USB-C',
      rgb: true,
      weight: '280g',
      dimensions: '162mm x 105mm x 65mm',
      price: 149.99,
      specs: {
        manufacturer: 'Razer',
        connectivity: 'Wireless/Wired',
        interface: '2.4GHz/USB-C',
        color: 'Black/RGB',
        weight: '280g',
        warranty: '2 years',
        platformCompatibility: 'Xbox, PC',
        layout: 'Xbox-style',
        interchangeableParts: true,
        customProfiles: 4,
        triggerStops: true,
        mechanicalButtons: true,
        chroma: true,
      },
    },
    {
      name: 'SteelSeries Stratus Pro',
      manufacturer: 'SteelSeries',
      connection: 'Wireless - Bluetooth, Wired - USB-C',
      platform: 'PC',
      layout: 'Xbox-style',
      rumble: true,
      programmableButtons: true,
      analogSticks: 2,
      triggers: 'Hall Effect',
      dPad: '8-way',
      backButtons: 2,
      batteryLife: 50,
      chargingMethod: 'USB-C',
      rgb: true,
      weight: '260g',
      dimensions: '157mm x 103mm x 63mm',
      price: 139.99,
      specs: {
        manufacturer: 'SteelSeries',
        connectivity: 'Wireless/Wired',
        interface: 'Bluetooth/USB-C',
        color: 'Black/Gray',
        weight: '260g',
        warranty: '2 years',
        platformCompatibility: 'PC, Android, iOS, tvOS',
        layout: 'Xbox-style',
        customProfiles: 3,
        rapidTriggers: true,
        analogStickCalibration: true,
        lowLatencyBluetooth: true,
      },
    },
    {
      name: 'PowerA MOGA XP Ultra',
      manufacturer: 'PowerA',
      connection: 'Wired - USB-C, Wireless - Bluetooth',
      platform: 'Android',
      layout: 'Xbox-style',
      rumble: true,
      programmableButtons: true,
      analogSticks: 2,
      triggers: 'Standard',
      dPad: '4-way',
      backButtons: 2,
      batteryLife: 30,
      chargingMethod: 'USB-C',
      rgb: false,
      weight: '235g',
      dimensions: '155mm x 102mm x 62mm',
      price: 69.99,
      specs: {
        manufacturer: 'PowerA',
        connectivity: 'Wireless/Wired',
        interface: 'Bluetooth/USB-C',
        color: 'Black/Orange',
        weight: '235g',
        warranty: '1 year',
        platformCompatibility: 'Android, Windows, iOS',
        layout: 'Xbox-style',
        phoneMounting: true,
        lowLatencyConnection: true,
        passthroughCharging: true,
      },
    },
    {
      name: 'Logitech G Pro X',
      manufacturer: 'Logitech',
      connection: 'Wireless - Lightspeed, Wired - USB-C',
      platform: 'PC',
      layout: 'Xbox-style',
      rumble: true,
      programmableButtons: true,
      analogSticks: 2,
      triggers: 'Hall Effect',
      dPad: '8-way',
      backButtons: 4,
      batteryLife: 48,
      chargingMethod: 'USB-C',
      rgb: true,
      weight: '270g',
      dimensions: '160mm x 104mm x 65mm',
      price: 159.99,
      specs: {
        manufacturer: 'Logitech',
        connectivity: 'Wireless/Wired',
        interface: 'Lightspeed/USB-C',
        color: 'Black',
        weight: '270g',
        warranty: '2 years',
        platformCompatibility: 'PC, Android',
        layout: 'Xbox-style',
        customProfiles: 5,
        lightspeedTechnology: true,
        powerPlay: true,
        analogStickModules: 'Replaceable',
        buttonLifespan: '20 million clicks',
      },
    },
    {
      name: 'Turtle Beach Recon Cloud',
      manufacturer: 'Turtle Beach',
      connection: 'Wireless - Bluetooth, Wired - USB-C',
      platform: 'Xbox',
      layout: 'Xbox-style',
      rumble: true,
      programmableButtons: true,
      analogSticks: 2,
      triggers: 'Standard',
      dPad: '4-way',
      backButtons: 2,
      batteryLife: 30,
      chargingMethod: 'USB-C',
      rgb: false,
      weight: '250g',
      dimensions: '156mm x 103mm x 64mm',
      price: 99.99,
      specs: {
        manufacturer: 'Turtle Beach',
        connectivity: 'Wireless/Wired',
        interface: 'Bluetooth/USB-C',
        color: 'Black/Blue',
        weight: '250g',
        warranty: '1 year',
        platformCompatibility: 'Xbox, PC, Android, iOS',
        layout: 'Xbox-style',
        customProfiles: 2,
        coolingGrips: true,
        mobileGaming: true,
        audioControls: true,
      },
    },
    {
      name: 'GuliKit KingKong Pro 2',
      manufacturer: 'GuliKit',
      connection: 'Wireless - Bluetooth, Wired - USB-C',
      platform: 'PC',
      layout: 'Switch-style',
      rumble: true,
      programmableButtons: true,
      analogSticks: 2,
      triggers: 'Hall Effect',
      dPad: '8-way',
      backButtons: 4,
      batteryLife: 25,
      chargingMethod: 'USB-C',
      rgb: true,
      weight: '228g',
      dimensions: '152mm x 101mm x 62mm',
      price: 89.99,
      specs: {
        manufacturer: 'GuliKit',
        connectivity: 'Wireless/Wired',
        interface: 'Bluetooth/USB-C',
        color: 'Black/Transparent',
        weight: '228g',
        warranty: '1 year',
        platformCompatibility: 'PC, Switch, Android, iOS, MacOS',
        layout: 'Switch-style',
        hallEffectJoysticks: true,
        hallEffectTriggers: true,
        noDrifting: true,
        sixAxisMotion: true,
        turboFunction: true,
        nfcSupport: true,
      },
    },
  ];

  // Create new gamepad peripherals and gamepad entries
  for (let i = 0; i < newGamepadModels.length; i++) {
    const model = newGamepadModels[i];

    // Generate a unique SKU
    const sku = `P-PAD-${model.manufacturer.substring(0, 3).toUpperCase()}-${2000 + i}`;

    // Create the peripheral entry
    const peripheral = await prisma.peripheral.create({
      data: {
        name: model.name,
        description: `${model.name} - Professional ${model.platform} controller with ${model.backButtons} back buttons${model.rgb ? ' and RGB lighting' : ''}. ${model.connection} connectivity.`,
        price: model.price,
        stock: 10 + Math.floor(Math.random() * 40),
        categoryId: category.id,
        specifications: JSON.stringify(model.specs),
        sku,
        subType: 'gamepads',
        imageUrl: `/products/peripherals/gamepads${(i % 3) + 1}.jpg`,
      },
    });
    // Map from the model fields to the database fields using only fields that exist in the schema
    const gamepadData = {
      peripheralId: peripheral.id,
      manufacturer: model.manufacturer,
      connection: model.connection,
      platform: model.platform,
      layout: model.layout,
      vibration: model.rumble || false, // field name mismatch: rumble -> vibration
      programmable: model.programmableButtons || false, // field name mismatch: programmableButtons -> programmable
      batteryLife: model.batteryLife || null,
      rgb: model.rgb || false,
    };

    // Create the gamepad entry
    await prisma.gamepad.create({
      data: gamepadData,
    });

    console.log(`Added gamepad: ${model.name}`);
  }

  console.log('Added 10 additional gamepads');
}
