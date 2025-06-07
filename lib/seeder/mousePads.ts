import { PrismaClient } from '@prisma/client';

export async function seedMousePads(prisma: PrismaClient) {
  // Get all peripherals with subType 'mousepads'
  const mousePadPeripherals = await prisma.peripheral.findMany({
    where: { subType: 'mousepads' },
  });

  // Prepare MousePad entries
  const mousePads = [];

  // For each MousePad peripheral, create a detailed MousePad entry
  for (let i = 0; i < mousePadPeripherals.length; i++) {
    const peripheral = mousePadPeripherals[i];

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
            : peripheral.name.includes('HyperX')
              ? 'HyperX'
              : 'Generic';

    // Size types
    const sizes = ['Small', 'Medium', 'Large', 'XL', 'XXL', 'Extended'];
    const size = specs.size || sizes[i % sizes.length];

    // Surface types
    const surfaces = ['Cloth', 'Hard Plastic', 'Hybrid', 'Soft', 'Glass'];
    const surface = specs.surface || surfaces[i % surfaces.length];

    // Material types (required by schema)
    const materials = ['Microfiber', 'Polyester', 'Silicon', 'Rubber', 'Nylon'];
    const material = specs.material || materials[i % materials.length];

    // Base types
    const bases = ['Rubber', 'Silicone', 'Foam'];
    const base = specs.base || bases[i % bases.length];

    // Dimensions based on size
    let dimensions;
    switch (size) {
      case 'Small':
        dimensions = `250mm x 210mm x ${2 + (i % 3)}mm`;
        break;
      case 'Medium':
        dimensions = `320mm x 270mm x ${3 + (i % 3)}mm`;
        break;
      case 'Large':
        dimensions = `450mm x 400mm x ${3 + (i % 4)}mm`;
        break;
      case 'XL':
        dimensions = `900mm x 400mm x ${4 + (i % 3)}mm`;
        break;
      case 'XXL':
        dimensions = `1200mm x 600mm x ${4 + (i % 3)}mm`;
        break;
      case 'Extended':
        dimensions = `${800 + (i % 5) * 100}mm x 400mm x ${3 + (i % 4)}mm`;
        break;
      default:
        dimensions = `400mm x 400mm x 3mm`;
    }

    // Thickness as integer (not string with "mm")
    const thickness = 2 + (i % 5);

    // Additional specs to store in specifications JSON
    const additionalSpecs = {
      size,
      base,
      stitchedEdges: i % 2 === 0,
      washable: i % 5 !== 0,
      reversible: i % 10 === 0,
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

    mousePads.push({
      peripheralId: peripheral.id,
      manufacturer,
      dimensions,
      thickness,
      material,
      surface,
      rgb: i % 3 === 0,
    });
  }

  // Insert MousePad entries
  for (const mousePad of mousePads) {
    await prisma.mousePad.upsert({
      where: { peripheralId: mousePad.peripheralId },
      update: mousePad,
      create: mousePad,
    });
  }

  // Call the function to add 10 more mousepads
  await addMoreMousePads(prisma);
}

/**
 * Adds 10 additional mousepad entries with unique specifications
 */
async function addMoreMousePads(prisma: PrismaClient) {
  const category = await prisma.peripheralCategory.findFirst({
    where: { slug: 'mousepad' },
  });

  if (!category) {
    console.error('MousePad category not found');
    return;
  }

  // Define new mousepad models with interesting specifications
  const newMousePadModels = [
    {
      name: 'Artisan Ninja FX Zero XSoft',
      manufacturer: 'Artisan',
      dimensions: '490mm x 420mm x 4mm',
      thickness: 4,
      material: 'Premium Cloth',
      rgb: false,
      surface: 'Cloth',
      size: 'XL',
      price: 59.99,
      specs: {
        manufacturer: 'Artisan',
        size: 'XL',
        base: 'XSoft Foam',
        stitchedEdges: true,
        washable: true,
        reversible: false,
        color: 'Black',
        weight: '230g',
        warranty: '1 year',
        gripBase: true,
        waterResistant: true,
        frictionCoefficient: 'Medium',
        handcrafted: true,
        madein: 'Japan',
        specialEdition: true,
        premium: true,
      },
    },
    {
      name: 'Logitech G Powerplay Wireless Charging',
      manufacturer: 'Logitech',
      dimensions: '340mm x 275mm x 7mm',
      thickness: 7,
      material: 'Microfiber Cloth',
      rgb: true,
      surface: 'Cloth/Hard (Reversible)',
      size: 'Medium',
      price: 119.99,
      specs: {
        manufacturer: 'Logitech',
        size: 'Medium',
        base: 'Powercore Module',
        stitchedEdges: true,
        washable: false,
        reversible: true,
        color: 'Black',
        weight: '480g',
        warranty: '2 years',
        wirelessCharging: true,
        lightsync: true,
        compatibleMice: 'Logitech G502 Lightspeed, G Pro Wireless, G903',
        powerModule: 'Integrated Powercore',
        lightingZones: 1,
        powerDelivery: '5W',
        dualSurfaceDesign: true,
      },
    },
    {
      name: 'Razer Strider Chroma',
      manufacturer: 'Razer',
      dimensions: '950mm x 410mm x 4mm',
      thickness: 4,
      material: 'Hybrid Weave',
      rgb: true,
      surface: 'Hybrid',
      size: 'Extended',
      price: 129.99,
      specs: {
        manufacturer: 'Razer',
        size: 'Extended',
        base: 'Rubber',
        stitchedEdges: true,
        washable: true,
        reversible: false,
        color: 'Black',
        weight: '850g',
        warranty: '2 years',
        rgbZones: 19,
        chromaEnabled: true,
        hybridSurface: true,
        waterResistant: true,
        toughened: true,
        rollable: false,
        syncsWithGames: true,
        microTexturedSurface: true,
      },
    },
    {
      name: 'SteelSeries QcK Prism XL',
      manufacturer: 'SteelSeries',
      dimensions: '900mm x 300mm x 4mm',
      thickness: 4,
      material: 'Micro-Woven Cloth',
      rgb: true,
      surface: 'Cloth',
      size: 'XL',
      price: 69.99,
      specs: {
        manufacturer: 'SteelSeries',
        size: 'XL',
        base: 'Silicone',
        stitchedEdges: true,
        washable: true,
        reversible: false,
        color: 'Black',
        weight: '700g',
        warranty: '1 year',
        rgbZones: 12,
        engineSupport: 'SteelSeries GG',
        gameSense: true,
        nonSlipBase: true,
        microWovenSurface: true,
        optimizedForAllSensors: true,
        durability: 'Heavy-duty',
        mouseMovementType: 'Medium-fast',
      },
    },
    {
      name: 'Corsair MM700 RGB',
      manufacturer: 'Corsair',
      dimensions: '930mm x 400mm x 4mm',
      thickness: 4,
      material: 'Textile Weave',
      rgb: true,
      surface: 'Cloth',
      size: 'Extended',
      price: 79.99,
      specs: {
        manufacturer: 'Corsair',
        size: 'Extended',
        base: 'Rubber',
        stitchedEdges: true,
        washable: true,
        reversible: false,
        color: 'Black',
        weight: '720g',
        warranty: '2 years',
        rgbZones: '360-degree, 3-zone',
        iCUE: true,
        usbPassthrough: true,
        usbPorts: 2,
        spillProof: true,
        surfaceCalibration: true,
        precision: 'High-accuracy',
        glideVelocity: 'Medium-fast',
      },
    },
    {
      name: 'Pulsar ParaSpeed V2',
      manufacturer: 'Pulsar',
      dimensions: '480mm x 400mm x 3.5mm',
      thickness: 3,
      material: 'PTFE-infused Cloth',
      rgb: false,
      surface: 'Speed Cloth',
      size: 'Large',
      price: 34.99,
      specs: {
        manufacturer: 'Pulsar',
        size: 'Large',
        base: 'Natural Rubber',
        stitchedEdges: true,
        washable: true,
        reversible: false,
        color: 'White',
        weight: '245g',
        warranty: '1 year',
        waterResistant: true,
        ptfeInfused: true,
        speedOptimized: true,
        flatSurface: true,
        highPrecision: true,
        ultraSmooth: true,
        lowFriction: true,
        specialCoating: 'Anti-humidity',
      },
    },
    {
      name: 'Glorious Elements Ice',
      manufacturer: 'Glorious',
      dimensions: '450mm x 400mm x 4mm',
      thickness: 4,
      material: 'Hard Glass Composite',
      rgb: false,
      surface: 'Glass',
      size: 'Large',
      price: 99.99,
      specs: {
        manufacturer: 'Glorious',
        size: 'Large',
        base: 'Silicone',
        stitchedEdges: false,
        washable: true,
        reversible: false,
        color: 'Transparent',
        weight: '880g',
        warranty: '1 year',
        specialSurface: 'Glass composite',
        hydrodynamicGlide: true,
        ultraLowFriction: true,
        hybridEdge: true,
        compatibleSensors: 'All optical sensors',
        durabilityRating: 'Ultra high',
        temperatureResistant: true,
        cleaningKit: 'Included',
      },
    },
    {
      name: 'XTRFY GP4',
      manufacturer: 'XTRFY',
      dimensions: '460mm x 400mm x 4mm',
      thickness: 4,
      material: 'Microfiber Cloth',
      rgb: false,
      surface: 'Cloth',
      size: 'Large',
      price: 49.99,
      specs: {
        manufacturer: 'XTRFY',
        size: 'Large',
        base: 'Natural Rubber',
        stitchedEdges: true,
        washable: true,
        reversible: false,
        color: 'Street Pink',
        weight: '260g',
        warranty: '2 years',
        designerSeries: true,
        artistCollaboration: 'Street Edition',
        competitionGrade: true,
        waterResistant: true,
        odorProtection: true,
        controlSurface: true,
        proDeveloped: true,
      },
    },
    {
      name: 'LGG Saturn Pro',
      manufacturer: 'Lethal Gaming Gear',
      dimensions: '500mm x 500mm x 4mm',
      thickness: 4,
      material: 'High-density Cloth',
      rgb: false,
      surface: 'Premium Cloth',
      size: 'XXL',
      price: 39.99,
      specs: {
        manufacturer: 'Lethal Gaming Gear',
        size: 'XXL',
        base: 'Dense Rubber',
        stitchedEdges: true,
        washable: true,
        reversible: false,
        color: 'Black',
        weight: '400g',
        warranty: '1 year',
        highDensityWeave: true,
        smoothGlide: true,
        precisionStopping: true,
        competitiveGaming: true,
        specialty: 'Balanced Speed/Control',
        communityDeveloped: true,
        esportsFocused: true,
      },
    },
    {
      name: 'Endgame Gear MPC890 Cordura',
      manufacturer: 'Endgame Gear',
      dimensions: '890mm x 450mm x 3mm',
      thickness: 3,
      material: 'Cordura Fabric',
      rgb: false,
      surface: 'Fabric',
      size: 'Extended',
      price: 44.99,
      specs: {
        manufacturer: 'Endgame Gear',
        size: 'Extended',
        base: 'Silicone',
        stitchedEdges: true,
        washable: true,
        reversible: false,
        color: 'Black',
        weight: '590g',
        warranty: '2 years',
        corduraFabric: true,
        ultraDurable: true,
        waterResistant: true,
        lowFriction: true,
        abrasionResistance: 'Military grade',
        accelerationControlled: true,
        mouseCompatibility: 'All mice types',
        specialCorduraWeave: '1000D',
      },
    },
  ];

  // Create new mousepad peripherals and mousepad entries
  for (let i = 0; i < newMousePadModels.length; i++) {
    const model = newMousePadModels[i];

    // Generate a unique SKU
    const sku = `P-PAD-${model.manufacturer.substring(0, 3).toUpperCase()}-${2000 + i}`;

    // Create peripheral description
    let description = `${model.name} - Premium ${model.size} gaming mousepad with ${model.surface.toLowerCase()} surface`;
    if (model.rgb) {
      description += ' and RGB lighting';
    }
    description += `. Made of high-quality ${model.material.toLowerCase()} material.`;

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
        subType: 'mousepads',
        imageUrl: `/products/peripherals/mousepads${(i % 3) + 1}.jpg`,
      },
    });

    // Create the mousepad entry
    await prisma.mousePad.create({
      data: {
        peripheralId: peripheral.id,
        manufacturer: model.manufacturer,
        dimensions: model.dimensions,
        thickness: model.thickness,
        material: model.material,
        rgb: model.rgb,
        surface: model.surface,
      },
    });

    console.log(`Added mousepad: ${model.name}`);
  }

  console.log('Added 10 additional mousepads');
}
