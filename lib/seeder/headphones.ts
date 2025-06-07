import { PrismaClient } from '@prisma/client';

export async function seedHeadphones(prisma: PrismaClient) {
  // Get all peripherals with subType 'headphones'
  const headphonePeripherals = await prisma.peripheral.findMany({
    where: { subType: 'headphones' },
  });

  // Prepare Headphone entries
  const headphones = [];

  // For each Headphone peripheral, create a detailed Headphone entry
  for (let i = 0; i < headphonePeripherals.length; i++) {
    const peripheral = headphonePeripherals[i];

    // Parse existing specifications if available
    const specs = peripheral.specifications
      ? JSON.parse(peripheral.specifications.toString())
      : {};

    // Get or set manufacturer from specs or parent peripheral
    const manufacturer = specs.manufacturer || 'Audio Tech';

    // Types of headphones
    const types = ['Over-ear', 'Over-ear', 'On-ear', 'In-ear'];
    const type = specs.type || types[i % types.length];

    // Connection types
    const connections = [
      'Wired - 3.5mm',
      'Wired - USB',
      'Wireless - 2.4GHz',
      'Wireless - Bluetooth',
      'Wireless - 2.4GHz + Bluetooth',
    ];
    const connection = specs.connection || connections[i % connections.length];

    // Determine if wireless based on connection type
    const isWireless = connection.includes('Wireless');

    // Frequency response
    const frequencyResponses = [
      '20Hz - 20kHz',
      '15Hz - 22kHz',
      '10Hz - 30kHz',
      '20Hz - 40kHz',
      '7Hz - 28kHz',
    ];
    const frequency =
      specs.frequencyResponse ||
      frequencyResponses[i % frequencyResponses.length];

    // Impedance (mostly for wired headphones)
    const impedances = [32, 50, 64, 80, 16, 250];
    const impedance = !isWireless ? impedances[i % impedances.length] : null;

    // Battery life (only for wireless)
    const batteryLife = isWireless ? 15 + (i % 10) * 5 : null;

    // Weight in grams as integer
    const weight = 200 + (i % 12) * 10;

    // Additional specs to store in the specifications JSON
    const additionalSpecs = {
      driver: `${40 + (i % 4) * 5}mm`,
      sensitivity: `${96 + (i % 10) * 2}dB`,
      surroundSound: i % 2 === 0 ? '7.1 Virtual Surround' : null,
      foldable: type !== 'In-ear' && i % 2 === 0,
    };

    // Update specifications JSON with additional specs
    const updatedSpecifications = {
      ...specs,
      ...additionalSpecs,
    };

    // Update the peripheral record with the specifications
    await prisma.peripheral.update({
      where: { id: peripheral.id },
      data: {
        specifications: JSON.stringify(updatedSpecifications),
      },
    });

    headphones.push({
      peripheralId: peripheral.id,
      manufacturer,
      type,
      connection,
      impedance,
      frequency,
      weight,
      microphone: i % 5 !== 4,
      noiseCancelling: i % 3 === 0,
      rgb: !isWireless && i % 3 === 0,
    });
  }

  // Insert Headphone entries
  for (const headphone of headphones) {
    await prisma.headphones.upsert({
      where: { peripheralId: headphone.peripheralId },
      update: headphone,
      create: headphone,
    });
  }

  // Call the function to add 10 more headphones
  await addMoreHeadphones(prisma);
}

/**
 * Adds 10 additional headphone entries with unique specifications
 */
async function addMoreHeadphones(prisma: PrismaClient) {
  const category = await prisma.peripheralCategory.findFirst({
    where: { slug: 'headphones' },
  });

  if (!category) {
    console.error('Headphone category not found');
    return;
  }

  // Define new headphone models with interesting specifications
  const newHeadphoneModels = [
    {
      name: 'Sony WH-1000XM5',
      manufacturer: 'Sony',
      type: 'Over-ear',
      connection: 'Wireless - Bluetooth',
      microphone: true,
      impedance: null,
      frequency: '4Hz - 40kHz',
      weight: 250,
      noiseCancelling: true,
      rgb: false,
      batteryLife: 30,
      price: 349.99,
      specs: {
        manufacturer: 'Sony',
        type: 'Over-ear',
        connectivity: 'Wireless',
        interface: 'Bluetooth 5.2',
        color: 'Black',
        weight: '250g',
        warranty: '2 years',
        driver: '30mm',
        sensitivity: '102dB',
        surroundSound: '360 Reality Audio',
        foldable: false,
        batteryLife: '30 hours',
        quickCharge: '3 hours in 3 minutes',
        touchControls: true,
        multiPointConnection: true,
        speakToChat: true,
        adaptiveNoiseCancelling: true,
      },
    },
    {
      name: 'Sennheiser HD 660 S2',
      manufacturer: 'Sennheiser',
      type: 'Over-ear',
      connection: 'Wired - 3.5mm',
      microphone: false,
      impedance: 300,
      frequency: '8Hz - 41.5kHz',
      weight: 260,
      noiseCancelling: false,
      rgb: false,
      price: 599.99,
      specs: {
        manufacturer: 'Sennheiser',
        type: 'Over-ear',
        connectivity: 'Wired',
        interface: '3.5mm & 6.3mm adapter',
        color: 'Black',
        weight: '260g',
        warranty: '2 years',
        driver: '38mm',
        sensitivity: '104dB',
        surroundSound: null,
        foldable: false,
        openBack: true,
        audiophileGrade: true,
        impedance: '300 ohm',
        cableLength: '1.8m',
        replacableCable: true,
        velourEarpads: true,
      },
    },
    {
      name: 'Apple AirPods Pro 2',
      manufacturer: 'Apple',
      type: 'In-ear',
      connection: 'Wireless - Bluetooth',
      microphone: true,
      impedance: null,
      frequency: '20Hz - 20kHz',
      weight: 5,
      noiseCancelling: true,
      rgb: false,
      batteryLife: 6,
      price: 249.99,
      specs: {
        manufacturer: 'Apple',
        type: 'In-ear',
        connectivity: 'Wireless',
        interface: 'Bluetooth 5.3',
        color: 'White',
        weight: '5.3g (each)',
        warranty: '1 year',
        driver: 'Custom',
        sensitivity: '105dB',
        surroundSound: 'Spatial Audio',
        sweatAndWaterResistant: 'IPX4',
        batteryLife: '6 hours (30 hours with case)',
        adaptiveEQ: true,
        transparencyMode: true,
        wirelessChargingCase: true,
        findMySupport: true,
      },
    },
    {
      name: 'HyperX Cloud Alpha Wireless',
      manufacturer: 'HyperX',
      type: 'Over-ear',
      connection: 'Wireless - 2.4GHz',
      microphone: true,
      impedance: null,
      frequency: '15Hz - 21kHz',
      weight: 322,
      noiseCancelling: false,
      rgb: false,
      batteryLife: 300,
      price: 199.99,
      specs: {
        manufacturer: 'HyperX',
        type: 'Over-ear',
        connectivity: 'Wireless',
        interface: '2.4GHz',
        color: 'Red/Black',
        weight: '322g',
        warranty: '2 years',
        driver: '50mm',
        sensitivity: '98dB',
        surroundSound: 'DTS Headphone:X',
        foldable: false,
        batteryLife: '300 hours',
        detachableMicrophone: true,
        memoryFoamEarpads: true,
        dualChamberDrivers: true,
        durableAluminumFrame: true,
      },
    },
    {
      name: 'Logitech G Pro X 2 Lightspeed',
      manufacturer: 'Logitech',
      type: 'Over-ear',
      connection: 'Wireless - 2.4GHz + Bluetooth',
      microphone: true,
      impedance: null,
      frequency: '20Hz - 20kHz',
      weight: 345,
      noiseCancelling: false,
      rgb: true,
      batteryLife: 50,
      price: 249.99,
      specs: {
        manufacturer: 'Logitech',
        type: 'Over-ear',
        connectivity: 'Wireless',
        interface: '2.4GHz + Bluetooth',
        color: 'Black',
        weight: '345g',
        warranty: '2 years',
        driver: '50mm',
        sensitivity: '91.7dB',
        surroundSound: '7.1 Virtual Surround',
        foldable: false,
        batteryLife: '50 hours',
        blueVoiceMicrophone: true,
        memoryFoamEarpads: true,
        dts: true,
        switchablePlatforms: true,
        rgbLighting: true,
      },
    },
    {
      name: 'Razer BlackShark V2 Pro',
      manufacturer: 'Razer',
      type: 'Over-ear',
      connection: 'Wireless - 2.4GHz',
      microphone: true,
      impedance: null,
      frequency: '12Hz - 28kHz',
      weight: 320,
      noiseCancelling: false,
      rgb: false,
      batteryLife: 70,
      price: 179.99,
      specs: {
        manufacturer: 'Razer',
        type: 'Over-ear',
        connectivity: 'Wireless',
        interface: '2.4GHz HyperSpeed',
        color: 'Black/Green',
        weight: '320g',
        warranty: '2 years',
        driver: 'Razer TriForce Titanium 50mm',
        sensitivity: '100dB',
        surroundSound: 'THX Spatial Audio',
        foldable: false,
        batteryLife: '70 hours',
        detachableMicrophone: true,
        flowKnitMemoryFoamEarcushions: true,
        ultraSoftHeadband: true,
        titaniumCoatedDrivers: true,
      },
    },
    {
      name: 'Beyerdynamic DT 990 Pro',
      manufacturer: 'Beyerdynamic',
      type: 'Over-ear',
      connection: 'Wired - 3.5mm',
      microphone: false,
      impedance: 250,
      frequency: '5Hz - 35kHz',
      weight: 250,
      noiseCancelling: false,
      rgb: false,
      price: 159.99,
      specs: {
        manufacturer: 'Beyerdynamic',
        type: 'Over-ear',
        connectivity: 'Wired',
        interface: '3.5mm',
        color: 'Gray/Black',
        weight: '250g',
        warranty: '2 years',
        driver: '45mm',
        sensitivity: '96dB',
        surroundSound: null,
        foldable: false,
        openBack: true,
        velourEarpads: true,
        studioGrade: true,
        cableLength: '3m coiled',
        madeInGermany: true,
        replacableParts: true,
      },
    },
    {
      name: 'SteelSeries Arctis Nova Pro',
      manufacturer: 'SteelSeries',
      type: 'Over-ear',
      connection: 'Wireless - 2.4GHz + Bluetooth',
      microphone: true,
      impedance: null,
      frequency: '10Hz - 40kHz',
      weight: 338,
      noiseCancelling: true,
      rgb: true,
      batteryLife: 20,
      price: 349.99,
      specs: {
        manufacturer: 'SteelSeries',
        type: 'Over-ear',
        connectivity: 'Wireless',
        interface: '2.4GHz + Bluetooth',
        color: 'Black',
        weight: '338g',
        warranty: '2 years',
        driver: 'High Fidelity 40mm',
        sensitivity: '93dB',
        surroundSound: 'Sonar Audio',
        foldable: false,
        batteryLife: '20 hours',
        hotSwappableBatteries: true,
        baseStation: true,
        multiSystemConnect: true,
        parametricEQ: true,
        activeNoiseCancellation: true,
        simultaneousDualAudio: true,
      },
    },
    {
      name: 'Bose QuietComfort Ultra',
      manufacturer: 'Bose',
      type: 'Over-ear',
      connection: 'Wireless - Bluetooth',
      microphone: true,
      impedance: null,
      frequency: '10Hz - 35kHz',
      weight: 280,
      noiseCancelling: true,
      rgb: false,
      batteryLife: 24,
      price: 429.99,
      specs: {
        manufacturer: 'Bose',
        type: 'Over-ear',
        connectivity: 'Wireless',
        interface: 'Bluetooth 5.3',
        color: 'White Smoke',
        weight: '280g',
        warranty: '2 years',
        driver: '35mm',
        sensitivity: '110dB',
        surroundSound: 'Bose Immersive Audio',
        foldable: true,
        batteryLife: '24 hours',
        quickCharge: '2 hours in 15 minutes',
        noiseCancellationLevels: '11 levels',
        siriGoogleAssistant: true,
        spotifyTapControl: true,
        premiumCarryCase: true,
      },
    },
    {
      name: 'EPOS H6PRO',
      manufacturer: 'EPOS',
      type: 'Over-ear',
      connection: 'Wired - 3.5mm',
      microphone: true,
      impedance: 28,
      frequency: '20Hz - 20kHz',
      weight: 322,
      noiseCancelling: false,
      rgb: false,
      price: 179.99,
      specs: {
        manufacturer: 'EPOS',
        type: 'Over-ear',
        connectivity: 'Wired',
        interface: '3.5mm',
        color: 'Sebring Black',
        weight: '322g',
        warranty: '2 years',
        driver: '42mm',
        sensitivity: '112dB',
        surroundSound: null,
        foldable: false,
        closedAcoustics: true,
        liftToMute: true,
        detachableMicrophone: true,
        memoryFoamEarpads: true,
        studioGradeAudio: true,
        cableLength: '2.5m detachable',
      },
    },
  ];

  // Create new headphone peripherals and headphone entries
  for (let i = 0; i < newHeadphoneModels.length; i++) {
    const model = newHeadphoneModels[i];

    // Generate a unique SKU
    const sku = `P-HPH-${model.manufacturer.substring(0, 3).toUpperCase()}-${2000 + i}`;

    // Determine if wireless based on connection type
    const isWireless = model.connection.includes('Wireless');

    // Create peripheral description
    let description = `${model.name} - Premium ${model.type.toLowerCase()} headphones`;
    if (model.noiseCancelling) {
      description += ' with active noise cancellation';
    }
    if (isWireless) {
      description += ` and ${model.batteryLife}-hour battery life`;
    }
    description += `. ${model.connection} connectivity.`;

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
        subType: 'headphones',
        imageUrl: `/products/peripherals/headphones${(i % 3) + 1}.jpg`,
      },
    });

    // Create the headphone entry
    await prisma.headphones.create({
      data: {
        peripheralId: peripheral.id,
        manufacturer: model.manufacturer,
        type: model.type,
        connection: model.connection,
        microphone: model.microphone,
        impedance: model.impedance,
        frequency: model.frequency,
        weight: model.weight,
        noiseCancelling: model.noiseCancelling,
        rgb: model.rgb,
      },
    });

    console.log(`Added headphone: ${model.name}`);
  }

  console.log('Added 10 additional headphones');
}
