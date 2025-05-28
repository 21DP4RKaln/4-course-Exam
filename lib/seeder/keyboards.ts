import { PrismaClient } from '@prisma/client';

export async function seedKeyboards(prisma: PrismaClient) {
  // Get all peripherals with subType 'keyboards'
  const keyboardPeripherals = await prisma.peripheral.findMany({
    where: { subType: 'keyboards' }
  });

  // Prepare Keyboard entries
  const keyboards = [];

  // For each Keyboard peripheral, create a detailed Keyboard entry
  for (let i = 0; i < keyboardPeripherals.length; i++) {
    const peripheral = keyboardPeripherals[i];
    
    // Parse existing specifications if available
    const specs = peripheral.specifications ? JSON.parse(peripheral.specifications.toString()) : {};
    
    // Get manufacturer from specs or set a default
    const manufacturer = specs.manufacturer || ['Corsair', 'Logitech', 'Razer', 'SteelSeries', 'HyperX'][i % 5];
    
    // Switch types
    const switchTypes = ['Cherry MX Red', 'Cherry MX Blue', 'Cherry MX Brown', 'Razer Green', 'SteelSeries QX2', 'Logitech GX Blue', 'Corsair OPX'];
    const switchType = specs.switchType || switchTypes[i % switchTypes.length];
    
    // Layout types
    const layouts = ['Full-size', 'TKL', '75%', '65%', '60%'];
    const layout = specs.layout || layouts[i % layouts.length];
    
    // Size types (required field in schema)
    const sizes = ['Full-size', 'TKL', 'Compact', 'Mini', '60%'];
    const size = specs.size || sizes[i % sizes.length];
    
    // Connection types (required field in schema)
    const connections = ['Wired', 'Wireless 2.4GHz', 'Bluetooth', 'Wireless 2.4GHz + Bluetooth', 'Wired USB-C'];
    const connection = specs.connection || connections[i % connections.length];
    
    // Backlight types
    const backlights = ['RGB', 'RGB', 'White', 'RGB', 'None'];
    const backlight = specs.backlight || backlights[i % backlights.length];
    
    // Key rollover
    const keyRollover = specs.keyRollover || 'N-Key Rollover';
    
    // Additional specs to store in specifications JSON
    const additionalSpecs = {
      backlight,
      keyRollover,
      keycaps: ['PBT', 'ABS', 'PBT Double-shot', 'ABS Double-shot'][i % 4],
      passthrough: i % 4 === 0 ? 'USB 2.0' : null,
      polling: `${125 * Math.pow(2, i % 4)}Hz`,
      programmableKeys: i % 2 === 0,
      macroKeys: i % 5 === 0 ? 5 : (i % 5 === 1 ? 3 : 0),
      dimensions: `${350 + (i % 10) * 10}mm x ${130 + (i % 5) * 5}mm x ${40 + (i % 3) * 2}mm`,
      hotSwappable: i % 3 === 0
    };
    
    // Update peripheral specifications
    await prisma.peripheral.update({
      where: { id: peripheral.id },
      data: {
        specifications: JSON.stringify({
          ...specs,
          ...additionalSpecs
        })
      }
    });
    
    keyboards.push({
      peripheralId: peripheral.id,
      manufacturer,
      layout,
      size,
      connection,
      switchType,
      rgb: backlight === 'RGB',
      numpad: layout === 'Full-size',
      multimedia: i % 2 === 0
    });
  }

  // Insert Keyboard entries
  for (const keyboard of keyboards) {
    await prisma.keyboard.upsert({
      where: { peripheralId: keyboard.peripheralId },
      update: keyboard,
      create: keyboard
    });
  }
  
  // Call the function to add 10 more keyboards
  await addMoreKeyboards(prisma);
}

/**
 * Adds 10 additional keyboard entries with unique specifications
 */
async function addMoreKeyboards(prisma: PrismaClient) {  const category = await prisma.peripheralCategory.findFirst({
    where: { slug: 'keyboard' }
  });
  
  if (!category) {
    console.error('Keyboard category not found');
    return;
  }
  
  // Define new keyboard models with interesting specifications
  const newKeyboardModels = [
    {
      name: 'Keychron Q1 Pro',
      manufacturer: 'Keychron',
      layout: '75%',
      size: 'Compact',
      connection: 'Wired USB-C + Bluetooth',
      switchType: 'Gateron G Pro Red',
      rgb: true,
      numpad: false,
      multimedia: true,
      price: 199.99,
      specs: {
        manufacturer: 'Keychron',
        connectivity: 'Wired/Wireless',
        interface: 'USB-C/Bluetooth 5.1',
        color: 'Navy Blue',
        weight: '1.77kg',
        warranty: '1 year',
        backlight: 'RGB Per-Key',
        keyRollover: 'N-Key Rollover',
        keycaps: 'PBT Double-shot',
        passthrough: null,
        polling: '1000Hz',
        programmableKeys: true,
        macroKeys: 0,
        dimensions: '330mm x 150mm x 40mm',
        hotSwappable: true,
        gasketMount: true,
        qmkViaSupport: true,
        wirelessRange: '10m',
        batteryLife: '300 hours',
        knob: true,
        caseType: 'CNC Aluminum'
      }
    },
    {
      name: 'Wooting 60HE+',
      manufacturer: 'Wooting',
      layout: '60%',
      size: '60%',
      connection: 'Wired USB-C',
      switchType: 'Lekker Linear Hall Effect',
      rgb: true,
      numpad: false,
      multimedia: false,
      price: 174.99,
      specs: {
        manufacturer: 'Wooting',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'Black',
        weight: '650g',
        warranty: '2 years',
        backlight: 'RGB Per-Key',
        keyRollover: 'N-Key Rollover',
        keycaps: 'PBT',
        passthrough: null,
        polling: '1000Hz',
        programmableKeys: true,
        macroKeys: 0,
        dimensions: '293mm x 103mm x 36mm',
        hotSwappable: true,
        analogInput: true,
        rapidTrigger: true,
        adjustableActuationPoint: true,
        dynamicActuation: true,
        magneticHallEffect: true
      }
    },
    {
      name: 'GMMK Pro',
      manufacturer: 'Glorious',
      layout: '75%',
      size: 'Compact',
      connection: 'Wired USB-C',
      switchType: 'Glorious Panda',
      rgb: true,
      numpad: false,
      multimedia: true,
      price: 169.99,
      specs: {
        manufacturer: 'Glorious',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'Black Slate',
        weight: '1.6kg',
        warranty: '2 years',
        backlight: 'RGB Per-Key',
        keyRollover: 'N-Key Rollover',
        keycaps: 'ABS Double-shot',
        passthrough: null,
        polling: '1000Hz',
        programmableKeys: true,
        macroKeys: 0,
        dimensions: '332mm x 134mm x 40mm',
        hotSwappable: true,
        rotaryEncoder: true,
        gasketMounted: true,
        qmkCompatable: true,
        plateOptions: 'Aluminum, Brass, Polycarbonate',
        casingMaterial: 'CNC Machined Aluminum'
      }
    },
    {
      name: 'Nuphy Air75 V2',
      manufacturer: 'Nuphy',
      layout: '75%',
      size: 'Compact',
      connection: 'Wireless 2.4GHz + Bluetooth',
      switchType: 'Gateron Brown Pro V2',
      rgb: true,
      numpad: false,
      multimedia: true,
      price: 129.99,
      specs: {
        manufacturer: 'Nuphy',
        connectivity: 'Wireless',
        interface: '2.4GHz/Bluetooth 5.0',
        color: 'White',
        weight: '675g',
        warranty: '1 year',
        backlight: 'RGB',
        keyRollover: 'N-Key Rollover',
        keycaps: 'PBT Double-shot',
        passthrough: null,
        polling: '1000Hz',
        programmableKeys: true,
        macroKeys: 0,
        dimensions: '320mm x 129mm x 18mm',
        hotSwappable: true,
        lowProfile: true,
        multiDeviceSupport: true,
        batteryLife: '45 hours',
        ultraThin: true,
        compatibleDevices: 'Windows, Mac, iOS, Android'
      }
    },
    {
      name: 'Ducky One 3',
      manufacturer: 'Ducky',
      layout: 'Full-size',
      size: 'Full-size',
      connection: 'Wired USB-C',
      switchType: 'Cherry MX Silent Red',
      rgb: true,
      numpad: true,
      multimedia: true,
      price: 149.99,
      specs: {
        manufacturer: 'Ducky',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'Daybreak',
        weight: '1.2kg',
        warranty: '2 years',
        backlight: 'RGB Per-Key',
        keyRollover: 'N-Key Rollover',
        keycaps: 'PBT Double-shot',
        passthrough: null,
        polling: '1000Hz',
        programmableKeys: true,
        macroKeys: 0,
        dimensions: '440mm x 140mm x 40mm',
        hotSwappable: true,
        soundAbsorbing: true,
        triplelayerDamping: true,
        extraSilencing: true,
        noStabilizers: false,
        onboardMemory: '3 profiles'
      }
    },
    {
      name: 'Epomaker TH96',
      manufacturer: 'Epomaker',
      layout: '96%',
      size: 'Compact',
      connection: 'Wired USB-C + Bluetooth',
      switchType: 'Gateron Pro Yellow',
      rgb: true,
      numpad: true,
      multimedia: true,
      price: 119.99,
      specs: {
        manufacturer: 'Epomaker',
        connectivity: 'Wired/Wireless',
        interface: 'USB-C/Bluetooth 5.0',
        color: 'Space Gray',
        weight: '1.1kg',
        warranty: '1 year',
        backlight: 'RGB',
        keyRollover: 'N-Key Rollover',
        keycaps: 'PBT',
        passthrough: null,
        polling: '1000Hz',
        programmableKeys: true,
        macroKeys: 0,
        dimensions: '380mm x 145mm x 35mm',
        hotSwappable: true,
        batteryCapacity: '4000mAh',
        batteryLife: '80 hours',
        southFacingLEDs: true,
        gasketMount: true,
        compatibilityModes: 'Windows, Mac',
        foamInserts: true
      }
    },
    {
      name: 'Royal Kludge RK84',
      manufacturer: 'Royal Kludge',
      layout: '75%',
      size: 'Compact',
      connection: 'Triple Mode (Bluetooth, 2.4GHz, Wired)',
      switchType: 'RK Brown',
      rgb: true,
      numpad: false,
      multimedia: true,
      price: 84.99,
      specs: {
        manufacturer: 'Royal Kludge',
        connectivity: 'Wired/Wireless',
        interface: 'USB-C/Bluetooth/2.4GHz',
        color: 'White',
        weight: '720g',
        warranty: '1 year',
        backlight: 'RGB Per-Key',
        keyRollover: 'N-Key Rollover',
        keycaps: 'ABS Double-shot',
        passthrough: 'USB 2.0 Hub',
        polling: '1000Hz',
        programmableKeys: true,
        macroKeys: 0,
        dimensions: '315mm x 126mm x 39mm',
        hotSwappable: true,
        batteryLife: '200 hours',
        multiDeviceConnection: '3 devices',
        software: 'RK Software',
        compatibilityModes: 'Windows, Mac, Android'
      }
    },
    {
      name: 'AKKO ACR Pro 75',
      manufacturer: 'AKKO',
      layout: '75%',
      size: 'Compact',
      connection: 'Wired USB-C',
      switchType: 'AKKO CS Jelly Pink',
      rgb: true,
      numpad: false,
      multimedia: true,
      price: 109.99,
      specs: {
        manufacturer: 'AKKO',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'Clear Purple',
        weight: '1.4kg',
        warranty: '1 year',
        backlight: 'RGB Per-Key',
        keyRollover: 'N-Key Rollover',
        keycaps: 'ASA Profile PBT',
        passthrough: null,
        polling: '1000Hz',
        programmableKeys: true,
        macroKeys: 0,
        dimensions: '328mm x 145mm x 35mm',
        hotSwappable: true,
        knob: true,
        acrylicCasing: true,
        foamInserts: true,
        southFacingLEDs: true,
        plateMount: 'PC',
        colorSchemes: 'Multiple available'
      }
    },
    {
      name: 'Drop CTRL V2',
      manufacturer: 'Drop',
      layout: 'TKL',
      size: 'TKL',
      connection: 'Wired USB-C',
      switchType: 'Holy Panda X',
      rgb: true,
      numpad: false,
      multimedia: true,
      price: 250.00,
      specs: {
        manufacturer: 'Drop',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'Black',
        weight: '1.9kg',
        warranty: '2 years',
        backlight: 'RGB Per-Key',
        keyRollover: 'N-Key Rollover',
        keycaps: 'DCX Profile PBT',
        passthrough: 'USB-C',
        polling: '1000Hz',
        programmableKeys: true,
        macroKeys: 0,
        dimensions: '367mm x 139mm x 42mm',
        hotSwappable: true,
        highProfileAluminumCase: true,
        qmkAndViaSupport: true,
        southFacingLEDs: true,
        dampingFoam: true,
        newStabilizers: true,
        magnets: true
      }
    },
    {
      name: 'Leopold FC980M PD',
      manufacturer: 'Leopold',
      layout: '1800 Compact',
      size: 'Compact',
      connection: 'Wired USB-C',
      switchType: 'Cherry MX Clear',
      rgb: false,
      numpad: true,
      multimedia: false,
      price: 139.00,
      specs: {
        manufacturer: 'Leopold',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'Charcoal Blue',
        weight: '1.2kg',
        warranty: '1 year',
        backlight: 'None',
        keyRollover: 'N-Key Rollover',
        keycaps: 'PBT Double-shot',
        passthrough: null,
        polling: '1000Hz',
        programmableKeys: false,
        macroKeys: 0,
        dimensions: '370mm x 135mm x 34mm',
        hotSwappable: false,
        soundDampingFoam: true,
        doubleStepPBT: true,
        dyeSubLegends: true,
        stepSculptureProfileKeycaps: true,
        premiumBuild: true,
        noSoftware: true
      }
    }
  ];
  
  // Create new keyboard peripherals and keyboard entries
  for (let i = 0; i < newKeyboardModels.length; i++) {
    const model = newKeyboardModels[i];
    
    // Generate a unique SKU
    const sku = `P-KBD-${model.manufacturer.substring(0, 3).toUpperCase()}-${2000 + i}`;
    
    // Create peripheral description
    let description = `${model.name} - Premium ${model.layout} mechanical keyboard with ${model.switchType} switches`;
    if (model.rgb) {
      description += ' and RGB backlighting';
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
        subType: 'keyboards',
        imageUrl: `/products/peripherals/keyboards${(i % 3) + 1}.jpg`,
      }
    });
    
    // Create the keyboard entry
    await prisma.keyboard.create({
      data: {
        peripheralId: peripheral.id,
        manufacturer: model.manufacturer,
        switchType: model.switchType,
        layout: model.layout,
        size: model.size,
        connection: model.connection,
        rgb: model.rgb,
        numpad: model.numpad,
        multimedia: model.multimedia
      }
    });
    
    console.log(`Added keyboard: ${model.name}`);
  }
  
  console.log('Added 10 additional keyboards');
}
