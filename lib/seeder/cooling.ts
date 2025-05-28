import { PrismaClient } from '@prisma/client';

export async function seedCooling(prisma: PrismaClient) {
  // Get all components with subType 'cooling'
  const coolingComponents = await prisma.component.findMany({
    where: { subType: 'cooling' }
  });

  // Prepare Cooling entries
  const coolingItems = [];

  // For each Cooling component, create a detailed Cooling entry
  for (let i = 0; i < coolingComponents.length; i++) {
    const component = coolingComponents[i];
    
    // Parse existing specifications if available
    const specs = component.specifications ? JSON.parse(component.specifications.toString()) : {};
    
    // Manufacturers
    const manufacturers = ['Noctua', 'Corsair', 'be quiet!', 'NZXT', 'Arctic', 'Cooler Master'];
    const manufacturer = specs.manufacturer || manufacturers[i % manufacturers.length];
    
    // Cooling types
    const coolingTypes = ['Air', 'AIO Liquid', 'AIO Liquid', 'Air', 'Custom Loop', 'Air'];
    const coolingType = specs.coolingType || coolingTypes[i % coolingTypes.length];
    
    // Generate model based on type and manufacturer
    let model = '';
    if (manufacturer === 'Noctua' && coolingType === 'Air') {
      model = ['NH-D15', 'NH-U12S', 'NH-U14S', 'NH-L9i'][i % 4];
    } else if (manufacturer === 'be quiet!' && coolingType === 'Air') {
      model = ['Dark Rock Pro 4', 'Dark Rock 4', 'Pure Rock 2', 'Shadow Rock 3'][i % 4];
    } else if (manufacturer === 'Corsair' && coolingType.includes('Liquid')) {
      model = ['H100i RGB PRO XT', 'H150i ELITE CAPELLIX', 'iCUE H115i ELITE', 'H60'][i % 4];
    } else if (manufacturer === 'NZXT' && coolingType.includes('Liquid')) {
      model = ['Kraken X53', 'Kraken X63', 'Kraken Z73', 'Kraken X73'][i % 4];
    } else if (manufacturer === 'Arctic') {
      model = coolingType === 'Air' 
        ? ['Freezer 34 eSports DUO', 'Freezer 7X', 'Alpine 12', 'Freezer 50'][i % 4]
        : ['Liquid Freezer II 240', 'Liquid Freezer II 280', 'Liquid Freezer II 360', 'Liquid Freezer II 420'][i % 4];
    } else if (manufacturer === 'Cooler Master') {
      model = coolingType === 'Air'
        ? ['Hyper 212 RGB', 'MA612 Stealth', 'MasterAir MA410M', 'Hyper H410R'][i % 4]
        : ['MasterLiquid ML240L', 'MasterLiquid ML360R', 'MasterLiquid ML280', 'MasterLiquid 360 Sub-Zero'][i % 4];
    }
    
    // Socket compatibility
    const sockets = [
      'LGA1700, LGA1200, LGA115x, AM4, AM5', 
      'LGA1700, LGA1200, AM4, AM5',
      'AM4, AM5, LGA1700', 
      'Universal'
    ];
    const socketCompatibility = specs.socketCompatibility || sockets[i % sockets.length];
    
    // Fan specifications
    const fanSizes = [120, 140, 92, 80];
    const fanSize = specs.fanSize || fanSizes[i % fanSizes.length];
    
    const fanRPM = specs.fanRPM || `${800 + (i % 12) * 200}-${1500 + (i % 15) * 200} RPM`;
    
    // TDP ratings
    const tdpRatings = [150, 180, 200, 220, 250, 280, 300, 360];
    const tdpRating = specs.tdpRating || tdpRatings[i % tdpRatings.length];
    
    // AIO-specific properties
    const radiatorSizes = ['120mm', '240mm', '280mm', '360mm', '420mm'];
    let radiatorSize = null;
    if (coolingType.includes('Liquid')) {
      radiatorSize = specs.radiatorSize || radiatorSizes[i % radiatorSizes.length];
    }    coolingItems.push({
      componentId: component.id,
      manufacturer,
      type: coolingType,
      // Convert radiatorSize string to integer - extract just the number
      radiatorSize: radiatorSize ? parseInt(radiatorSize.replace(/[^\d]/g, '')) : null,
      fanSize: fanSize,
      fanCount: coolingType.includes('Liquid') ? 2 : 1, // Missing required field: 1 fan for Air, 2 fans for AIO
      rgb: i % 3 === 0,
      noiseLevel: 20 + (i % 10), // As a float
      maxTdp: tdpRating, // Missing required field: use tdpRating as maxTdp
      socketSupport: socketCompatibility // Missing required field: use socketCompatibility as socketSupport
    });
  }
  // Add 10 more cooling solutions directly
  const additionalCooling = [
    {
      manufacturer: 'Noctua',
      type: 'Air',
      radiatorSize: null,
      fanSize: 140,
      fanCount: 2,
      rgb: false,
      noiseLevel: 24.6,
      maxTdp: 250,
      socketSupport: 'LGA1700, LGA1200, LGA115x, AM4, AM5',
      model: 'NH-D15 chromax.black',
      color: 'Black',
      height: 165
    },
    {
      manufacturer: 'be quiet!',
      type: 'Air',
      radiatorSize: null,
      fanSize: 135,
      fanCount: 1,
      rgb: false,
      noiseLevel: 21.4,
      maxTdp: 200,
      socketSupport: 'LGA1700, LGA1200, LGA115x, AM4, AM5',
      model: 'Shadow Rock Slim 2',
      color: 'Black/Silver',
      height: 135
    },
    {
      manufacturer: 'Corsair',
      type: 'AIO Liquid',
      radiatorSize: 360,
      fanSize: 120,
      fanCount: 3,
      rgb: true,
      noiseLevel: 28,
      maxTdp: 320,
      socketSupport: 'LGA1700, LGA1200, LGA115x, AM4, AM5',
      model: 'iCUE H150i RGB ELITE',
      color: 'Black',
      height: 27
    },
    {
      manufacturer: 'NZXT',
      type: 'AIO Liquid',
      radiatorSize: 280,
      fanSize: 140,
      fanCount: 2,
      rgb: true,
      noiseLevel: 29,
      maxTdp: 300,
      socketSupport: 'LGA1700, LGA1200, LGA115x, AM4, AM5',
      model: 'Kraken X63 RGB',
      color: 'Black',
      height: 30
    },
    {
      manufacturer: 'DeepCool',
      type: 'Air',
      radiatorSize: null,
      fanSize: 120,
      fanCount: 2,
      rgb: true,
      noiseLevel: 27,
      maxTdp: 210,
      socketSupport: 'LGA1700, LGA1200, LGA115x, AM4, AM5',
      model: 'AK620',
      color: 'Black',
      height: 160
    },
    {
      manufacturer: 'EK',
      type: 'AIO Liquid',
      radiatorSize: 240,
      fanSize: 120,
      fanCount: 2,
      rgb: true,
      noiseLevel: 26,
      maxTdp: 280,
      socketSupport: 'LGA1700, LGA1200, LGA115x, AM4, AM5',
      model: 'EK-AIO Basic 240',
      color: 'Black',
      height: 27
    },
    {
      manufacturer: 'Arctic',
      type: 'Air',
      radiatorSize: null,
      fanSize: 120,
      fanCount: 2,
      rgb: false,
      noiseLevel: 22.5,
      maxTdp: 200,
      socketSupport: 'LGA1700, LGA1200, LGA115x, AM4, AM5',
      model: 'Freezer 34 eSports DUO',
      color: 'White',
      height: 157
    },
    {
      manufacturer: 'Thermalright',
      type: 'Air',
      radiatorSize: null,
      fanSize: 140,
      fanCount: 1,
      rgb: false,
      noiseLevel: 25,
      maxTdp: 280,
      socketSupport: 'LGA1700, LGA1200, AM4, AM5',
      model: 'Peerless Assassin 120',
      color: 'Silver',
      height: 158
    },
    {
      manufacturer: 'Scythe',
      type: 'Air',
      radiatorSize: null,
      fanSize: 120,
      fanCount: 2,
      rgb: false,
      noiseLevel: 24.9,
      maxTdp: 220,
      socketSupport: 'LGA1700, LGA1200, AM4, AM5',
      model: 'Fuma 2',
      color: 'Silver',
      height: 155
    },
    {
      manufacturer: 'Lian Li',
      type: 'AIO Liquid',
      radiatorSize: 360,
      fanSize: 120,
      fanCount: 3,
      rgb: true,
      noiseLevel: 30,
      maxTdp: 350,
      socketSupport: 'LGA1700, LGA1200, LGA115x, AM4, AM5',
      model: 'Galahad 360 SL',
      color: 'White',
      height: 27
    }
  ];
  
  // Create component entries for the new cooling solutions
  for (const cooling of additionalCooling) {
    // Create a base component first
    const isAir = cooling.type === 'Air';
    const coolingTypeLabel = isAir ? 'CPU Air Cooler' : 'Liquid CPU Cooler';
    const sizeLabel = isAir ? `${cooling.height}mm Height` : `${cooling.radiatorSize || 0}mm Radiator`;
    const sku = `COOLING-${cooling.manufacturer.toUpperCase().replace(' ', '-').replace('!', '')}-${cooling.model.replace(/\\s+/g, '-')}-${Date.now().toString().slice(-6)}`;
    const componentName = `${cooling.manufacturer} ${cooling.model} ${cooling.rgb ? 'RGB ' : ''}${coolingTypeLabel}`;
    
    const categories = await prisma.componentCategory.findMany();
    const coolingCategory = categories.find(c => c.slug === 'cooling');
    if (!coolingCategory) {
      throw new Error('Cooling category not found');
    }
    
    // Calculate a reasonable price based on specs
    const basePrice = isAir ? 40 : 100;
    
    const performanceMultiplier = cooling.maxTdp / 200;
    
    const typeMultiplier = 
      cooling.type === 'AIO Liquid' ? ((cooling.radiatorSize ?? 240) / 240) : 1.0;
    
    const rgbMultiplier = cooling.rgb ? 1.15 : 1.0;
    
    const price = Math.round(basePrice * performanceMultiplier * typeMultiplier * rgbMultiplier);
    
    // Create a description based on type
    let description = '';
    if (isAir) {
      description = `${cooling.manufacturer} ${cooling.model} CPU air cooler with ${cooling.fanCount} ${cooling.fanSize}mm fan${cooling.fanCount > 1 ? 's' : ''} and ${cooling.maxTdp}W TDP support`;
    } else {
      description = `${cooling.manufacturer} ${cooling.model} ${cooling.radiatorSize}mm AIO liquid cooler with ${cooling.fanCount} ${cooling.fanSize}mm fan${cooling.fanCount > 1 ? 's' : ''}`;
    }
    if (cooling.rgb) {
      description += ' with RGB lighting';
    }
    
    const component = await prisma.component.create({
      data: {
        name: componentName,
        description: description,
        price: price,
        stock: 5 + Math.floor(Math.random() * 15),
        imageUrl: `/products/cooling/${cooling.manufacturer.toLowerCase().replace(' ', '-').replace('!', '')}-${cooling.model.toLowerCase().replace(/\\s+/g, '-')}.jpg`,
        categoryId: coolingCategory.id,
        sku: sku,
        viewCount: Math.floor(Math.random() * 500) + 50,
        subType: 'cooling',
        specifications: JSON.stringify({
          manufacturer: cooling.manufacturer,
          type: cooling.type,
          fanSize: cooling.fanSize,
          fanCount: cooling.fanCount,
          rgb: cooling.rgb,
          noiseLevel: cooling.noiseLevel,
          socketSupport: cooling.socketSupport,
          model: cooling.model,
          color: cooling.color,
          height: cooling.height,
          radiatorSize: cooling.radiatorSize ? `${cooling.radiatorSize}mm` : null
        })
      }
    });
    
    // Add to cooling entries
    coolingItems.push({
      componentId: component.id,
      manufacturer: cooling.manufacturer,
      type: cooling.type,
      radiatorSize: cooling.radiatorSize,
      fanSize: cooling.fanSize,
      fanCount: cooling.fanCount,
      rgb: cooling.rgb,
      noiseLevel: cooling.noiseLevel,
      maxTdp: cooling.maxTdp,
      socketSupport: cooling.socketSupport
    });
  }

  // Insert Cooling entries
  for (const cooling of coolingItems) {
    await prisma.cooling.upsert({
      where: { componentId: cooling.componentId },
      update: cooling,
      create: cooling
    });
  }
}
