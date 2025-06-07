import { PrismaClient } from '@prisma/client';

export async function seedMicrophones(prisma: PrismaClient) {
  // Get all peripherals with subType 'microphones'
  const microphonePeripherals = await prisma.peripheral.findMany({
    where: { subType: 'microphones' },
  });

  // Prepare Microphone entries
  const microphones = [];

  // For each Microphone peripheral, create a detailed Microphone entry
  for (let i = 0; i < microphonePeripherals.length; i++) {
    const peripheral = microphonePeripherals[i];

    // Parse existing specifications if available
    const specs = peripheral.specifications
      ? JSON.parse(peripheral.specifications.toString())
      : {};

    // Get manufacturer from specs or set a default
    const manufacturer =
      specs.manufacturer ||
      ['Blue', 'Audio-Technica', 'Shure', 'HyperX', 'Razer'][i % 5];

    // Types of microphones
    const types = [
      'Condenser',
      'Dynamic',
      'USB Condenser',
      'USB Dynamic',
      'Lavalier',
    ];
    const type = specs.type || types[i % types.length];

    // Polar patterns
    const polarPatterns = [
      'Cardioid',
      'Cardioid, Omnidirectional',
      'Cardioid, Bidirectional, Omnidirectional',
      'Cardioid, Figure-8, Omnidirectional, Stereo',
    ];
    const pattern =
      specs.polarPattern || polarPatterns[i % polarPatterns.length];

    // Frequency response
    const frequencyResponses = [
      '20Hz - 20kHz',
      '40Hz - 18kHz',
      '30Hz - 20kHz',
      '20Hz - 22kHz',
      '50Hz - 16kHz',
    ];
    const frequency =
      specs.frequencyResponse ||
      frequencyResponses[i % frequencyResponses.length];

    // Connection types
    const isUSB = type.includes('USB');
    const interfaceType = isUSB ? 'USB' : 'XLR';

    // Sensitivity value
    const sensitivity = `${-50 - (i % 10) * 2}dB`;

    // Additional specs to store in specifications JSON
    const additionalSpecs = {
      samplingRate: isUSB
        ? ['44.1kHz', '48kHz', '96kHz', '192kHz'][i % 4]
        : null,
      bitDepth: isUSB ? ['16-bit', '24-bit'][i % 2] : null,
      monitoring: isUSB && i % 2 === 0,
      mountType:
        type !== 'Lavalier'
          ? i % 2 === 0
            ? 'Boom Arm'
            : 'Desktop Stand'
          : null,
      popFilter: type.includes('Condenser') && i % 2 === 0,
      shockMount: type !== 'Lavalier' && i % 2 === 0,
      dimensions:
        type !== 'Lavalier'
          ? `${50 + (i % 10) * 10}mm x ${170 + (i % 5) * 20}mm`
          : `${8}mm x ${20}mm`,
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

    microphones.push({
      peripheralId: peripheral.id,
      manufacturer,
      type,
      pattern,
      frequency,
      sensitivity,
      interface: interfaceType,
      stand: type !== 'Lavalier' && i % 2 === 0,
    });
  }

  // Insert Microphone entries
  for (const microphone of microphones) {
    await prisma.microphone.upsert({
      where: { peripheralId: microphone.peripheralId },
      update: microphone,
      create: microphone,
    });
  }

  // Call the function to add 10 more microphones
  await addMoreMicrophones(prisma);
}

/**
 * Adds 10 additional microphone entries with unique specifications
 */
async function addMoreMicrophones(prisma: PrismaClient) {
  const category = await prisma.peripheralCategory.findFirst({
    where: { slug: 'microphone' },
  });

  if (!category) {
    console.error('Microphone category not found');
    return;
  }

  // Define new microphone models with interesting specifications
  const newMicrophoneModels = [
    {
      name: 'Shure SM7B',
      manufacturer: 'Shure',
      type: 'Dynamic',
      pattern: 'Cardioid',
      frequency: '50Hz - 20kHz',
      sensitivity: '-59dB',
      interface: 'XLR',
      stand: true,
      price: 399.99,
      specs: {
        manufacturer: 'Shure',
        type: 'Dynamic',
        connectivity: 'Wired',
        interface: 'XLR',
        color: 'Black',
        weight: '766g',
        warranty: '2 years',
        polarPattern: 'Cardioid',
        frequencyResponse: '50Hz - 20kHz',
        impedance: '150 ohms',
        outputLevel: '-59dB',
        mountType: 'Boom Arm',
        includedAccessories: 'Windscreen, close-talk windscreen',
        dimensions: '189mm x 117mm',
        professionalGrade: true,
        broadcastQuality: true,
        airSuspensionShockIsolation: true,
        popFilter: true,
        bassRolloff: true,
      },
    },
    {
      name: 'Rode NT1 5th Generation',
      manufacturer: 'Rode',
      type: 'Condenser',
      pattern: 'Cardioid',
      frequency: '20Hz - 20kHz',
      sensitivity: '-29dB',
      interface: 'XLR',
      stand: true,
      price: 259.0,
      specs: {
        manufacturer: 'Rode',
        type: 'Condenser',
        connectivity: 'Wired',
        interface: 'XLR',
        color: 'Nickel',
        weight: '440g',
        warranty: '10 years',
        polarPattern: 'Cardioid',
        frequencyResponse: '20Hz - 20kHz',
        selfNoise: '<4dB(A)',
        outputImpedance: '100 ohms',
        maximumSPL: '142dB',
        mountType: 'Shock Mount',
        includedAccessories: 'SM6 shock mount, pop filter',
        dimensions: '187mm x 50mm',
        australianDesigned: true,
        revolutionaryAcousticDesign: true,
        ultraLowNoise: true,
      },
    },
    {
      name: 'Elgato Wave:3',
      manufacturer: 'Elgato',
      type: 'USB Condenser',
      pattern: 'Cardioid',
      frequency: '70Hz - 20kHz',
      sensitivity: '-25dB',
      interface: 'USB',
      stand: true,
      price: 149.99,
      specs: {
        manufacturer: 'Elgato',
        type: 'USB Condenser',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'Black',
        weight: '280g',
        warranty: '2 years',
        polarPattern: 'Cardioid',
        frequencyResponse: '70Hz - 20kHz',
        samplingRate: '96kHz',
        bitDepth: '24-bit',
        monitoring: true,
        mountType: 'Desktop Stand',
        dimensions: '153mm x 66mm x 40mm',
        clipguard: true,
        capacitiveMute: true,
        streamDeckIntegration: true,
        waveLink: true,
        multiplatformCompatibility: true,
      },
    },
    {
      name: 'Audio-Technica AT2020USB+',
      manufacturer: 'Audio-Technica',
      type: 'USB Condenser',
      pattern: 'Cardioid',
      frequency: '20Hz - 20kHz',
      sensitivity: '-47dB',
      interface: 'USB',
      stand: true,
      price: 129.0,
      specs: {
        manufacturer: 'Audio-Technica',
        type: 'USB Condenser',
        connectivity: 'Wired',
        interface: 'USB',
        color: 'Black',
        weight: '386g',
        warranty: '2 years',
        polarPattern: 'Cardioid',
        frequencyResponse: '20Hz - 20kHz',
        samplingRate: '44.1/48kHz',
        bitDepth: '16-bit',
        monitoring: true,
        mountType: 'Desktop Stand',
        dimensions: '162mm x 52mm',
        popFilter: false,
        headphoneJack: true,
        mixControl: true,
        lowMass: true,
        customEngineered: true,
      },
    },
    {
      name: 'Rode Wireless GO II',
      manufacturer: 'Rode',
      type: 'Lavalier',
      pattern: 'Omnidirectional',
      frequency: '50Hz - 20kHz',
      sensitivity: '-30dB',
      interface: 'USB',
      stand: false,
      price: 299.0,
      specs: {
        manufacturer: 'Rode',
        type: 'Lavalier',
        connectivity: 'Wireless',
        interface: 'USB-C',
        color: 'Black',
        weight: '30g',
        warranty: '2 years',
        polarPattern: 'Omnidirectional',
        frequencyResponse: '50Hz - 20kHz',
        batteryLife: '7 hours',
        range: '200m',
        internalMemory: '24 hour onboard recording',
        clip: true,
        dimensions: '44mm x 45.3mm x 18.5mm',
        dualChannel: true,
        encryption: '128-bit',
        safetyChannel: '-20dB',
        onboardCompressor: true,
        multipleTransmitters: true,
      },
    },
    {
      name: 'HyperX QuadCast S',
      manufacturer: 'HyperX',
      type: 'USB Condenser',
      pattern: 'Cardioid, Bidirectional, Omnidirectional, Stereo',
      frequency: '20Hz - 20kHz',
      sensitivity: '-36dB',
      interface: 'USB',
      stand: true,
      price: 159.99,
      specs: {
        manufacturer: 'HyperX',
        type: 'USB Condenser',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'Black',
        weight: '254g',
        warranty: '2 years',
        polarPattern: 'Cardioid, Bidirectional, Omnidirectional, Stereo',
        frequencyResponse: '20Hz - 20kHz',
        samplingRate: '48kHz',
        bitDepth: '16-bit',
        monitoring: true,
        mountType: 'Desktop Stand',
        dimensions: '129mm x 86mm x 210mm',
        popFilter: true,
        antiVibrationShockMount: true,
        tapToMute: true,
        gainControl: true,
        rgbLighting: true,
        customizableRGB: true,
      },
    },
    {
      name: 'Beyerdynamic M 70 Pro X',
      manufacturer: 'Beyerdynamic',
      type: 'Dynamic',
      pattern: 'Cardioid',
      frequency: '30Hz - 18kHz',
      sensitivity: '-57dB',
      interface: 'XLR',
      stand: true,
      price: 299.0,
      specs: {
        manufacturer: 'Beyerdynamic',
        type: 'Dynamic',
        connectivity: 'Wired',
        interface: 'XLR',
        color: 'Black',
        weight: '316g',
        warranty: '2 years',
        polarPattern: 'Cardioid',
        frequencyResponse: '30Hz - 18kHz',
        impedance: '320 ohms',
        sensitivity: '-57dB',
        mountType: 'Boom Arm',
        dimensions: '166mm x 51mm',
        madeInGermany: true,
        transparentTransientResponse: true,
        minimalProximityEffect: true,
        highFeedbackRejection: true,
        robustMetalConstruction: true,
        streamingAndPodcasting: true,
      },
    },
    {
      name: 'AKG Pro Audio C214',
      manufacturer: 'AKG',
      type: 'Condenser',
      pattern: 'Cardioid',
      frequency: '20Hz - 20kHz',
      sensitivity: '-34dB',
      interface: 'XLR',
      stand: true,
      price: 349.0,
      specs: {
        manufacturer: 'AKG',
        type: 'Condenser',
        connectivity: 'Wired',
        interface: 'XLR',
        color: 'Gray',
        weight: '280g',
        warranty: '2 years',
        polarPattern: 'Cardioid',
        frequencyResponse: '20Hz - 20kHz',
        impedance: '200 ohms',
        padSwitch: '-20dB',
        mountType: 'Shock Mount',
        dimensions: '160mm x 55mm',
        powering: '48V phantom power',
        bassRollOff: 'Switchable 160Hz',
        maximumSPL: '156dB',
        selfNoise: '13dB-A',
        professionalStudioMic: true,
        integratedSuspension: true,
      },
    },
    {
      name: 'Blue Ember',
      manufacturer: 'Blue',
      type: 'Condenser',
      pattern: 'Cardioid',
      frequency: '40Hz - 20kHz',
      sensitivity: '-42dB',
      interface: 'XLR',
      stand: true,
      price: 99.99,
      specs: {
        manufacturer: 'Blue',
        type: 'Condenser',
        connectivity: 'Wired',
        interface: 'XLR',
        color: 'Black/Red',
        weight: '380g',
        warranty: '2 years',
        polarPattern: 'Cardioid',
        frequencyResponse: '40Hz - 20kHz',
        impedance: '38 ohms',
        powering: '48V phantom power',
        mountType: 'Boom Arm',
        dimensions: '219mm x 38mm',
        slimSideAddress: true,
        excellentOffAxisRejection: true,
        handTunedCapacity: true,
        precisionAcoustics: true,
        streamingFriendly: true,
      },
    },
    {
      name: 'Razer Seiren V3 Pro',
      manufacturer: 'Razer',
      type: 'USB Condenser',
      pattern: 'Cardioid, Omnidirectional, Bidirectional, Stereo',
      frequency: '20Hz - 20kHz',
      sensitivity: '-34dB',
      interface: 'USB',
      stand: true,
      price: 149.99,
      specs: {
        manufacturer: 'Razer',
        type: 'USB Condenser',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'Black',
        weight: '430g',
        warranty: '2 years',
        polarPattern: 'Cardioid, Omnidirectional, Bidirectional, Stereo',
        frequencyResponse: '20Hz - 20kHz',
        samplingRate: '96kHz',
        bitDepth: '24-bit',
        monitoring: true,
        mountType: 'Desktop Stand',
        dimensions: '173mm x 68mm',
        rgbLighting: true,
        streamMixer: true,
        analogGainLimiter: true,
        highPassFilter: true,
        synapseSoftware: true,
        chromeIntegration: true,
      },
    },
  ];

  // Create new microphone peripherals and microphone entries
  for (let i = 0; i < newMicrophoneModels.length; i++) {
    const model = newMicrophoneModels[i];

    // Generate a unique SKU
    const sku = `P-MIC-${model.manufacturer.substring(0, 3).toUpperCase()}-${2000 + i}`;

    // Create peripheral description
    let description = `${model.name} - Professional ${model.type.toLowerCase()} microphone`;
    if (model.type.includes('USB')) {
      description += ' with digital interface';
    } else if (model.type === 'Lavalier') {
      description += ' for on-the-go recording';
    } else {
      description += ' for studio recording';
    }
    description += `. ${model.interface} connectivity with ${model.pattern.toLowerCase()} polar pattern.`;

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
        subType: 'microphones',
        imageUrl: `/products/peripherals/microphones${(i % 3) + 1}.jpg`,
      },
    });

    // Create the microphone entry
    await prisma.microphone.create({
      data: {
        peripheralId: peripheral.id,
        manufacturer: model.manufacturer,
        type: model.type,
        pattern: model.pattern,
        frequency: model.frequency,
        sensitivity: model.sensitivity,
        interface: model.interface,
        stand: model.stand,
      },
    });

    console.log(`Added microphone: ${model.name}`);
  }

  console.log('Added 10 additional microphones');
}
