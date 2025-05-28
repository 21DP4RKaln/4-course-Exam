import { PrismaClient } from '@prisma/client';

export async function seedRAMs(prisma: PrismaClient) {
  // Get all components with subType 'ram'
  const ramComponents = await prisma.component.findMany({
    where: { subType: 'ram' }
  });

  // Prepare RAM entries
  const rams = [];

  // For each RAM component, create a detailed RAM entry
  for (let i = 0; i < ramComponents.length; i++) {
    const component = ramComponents[i];
    
    // Parse existing specifications if available
    const specs = component.specifications ? JSON.parse(component.specifications.toString()) : {};
    
    rams.push({
      componentId: component.id,
      manufacturer: i % 4 === 0 ? 'Corsair' : (i % 4 === 1 ? 'G.Skill' : (i % 4 === 2 ? 'Kingston' : 'Crucial')),
      capacity: 8 * (1 + (i % 4)),
      speed: 4800 + (i % 6) * 400,
      type: i % 5 === 0 ? 'DDR4' : 'DDR5',
      modules: 1 + (i % 2),
      casLatency: 16 + (i % 8),
      voltage: 1.2 + (i % 4) * 0.1,
      rgb: i % 3 === 0
    });
  }  // Add 10 more RAM modules directly
  const additionalRams = [
    {
      manufacturer: 'Corsair',
      capacity: 32,
      speed: 6000,
      type: 'DDR5',
      modules: 2,
      casLatency: 36,
      voltage: 1.35,
      rgb: true
    },
    {
      manufacturer: 'G.Skill',
      capacity: 64,
      speed: 6400,
      type: 'DDR5',
      modules: 2,
      casLatency: 32,
      voltage: 1.4,
      rgb: true
    },
    {
      manufacturer: 'Kingston',
      capacity: 32,
      speed: 5600,
      type: 'DDR5',
      modules: 2,
      casLatency: 40,
      voltage: 1.25,
      rgb: false
    },
    {
      manufacturer: 'Crucial',
      capacity: 16,
      speed: 5200,
      type: 'DDR5',
      modules: 2,
      casLatency: 38,
      voltage: 1.2,
      rgb: false
    },
    {
      manufacturer: 'TeamGroup',
      capacity: 32,
      speed: 6200,
      type: 'DDR5',
      modules: 2,
      casLatency: 36,
      voltage: 1.35,
      rgb: true
    },
    {
      manufacturer: 'Corsair',
      capacity: 32,
      speed: 3600,
      type: 'DDR4',
      modules: 2,
      casLatency: 18,
      voltage: 1.35,
      rgb: true
    },
    {
      manufacturer: 'G.Skill',
      capacity: 32,
      speed: 4000,
      type: 'DDR4',
      modules: 2,
      casLatency: 16,
      voltage: 1.4,
      rgb: true
    },
    {
      manufacturer: 'Kingston',
      capacity: 16,
      speed: 3200,
      type: 'DDR4',
      modules: 2,
      casLatency: 16,
      voltage: 1.35,
      rgb: false
    },
    {
      manufacturer: 'Crucial',
      capacity: 64,
      speed: 3600,
      type: 'DDR4',
      modules: 4,
      casLatency: 18,
      voltage: 1.35,
      rgb: false
    },
    {
      manufacturer: 'Patriot',
      capacity: 16,
      speed: 3600,
      type: 'DDR4',
      modules: 2,
      casLatency: 18,
      voltage: 1.35,
      rgb: true
    }
  ];
    // Create component entries for the new RAMs
  for (const ram of additionalRams) {
    // Create a base component first
    const sku = `RAM-${ram.manufacturer.toUpperCase().replace('.', '')}-${ram.capacity}GB-${ram.type}-${ram.speed}-${Date.now().toString().slice(-6)}`;
    const componentName = `${ram.manufacturer} ${ram.capacity}GB (${ram.modules}x${ram.capacity/ram.modules}GB) ${ram.type}-${ram.speed} ${ram.rgb ? 'RGB' : ''}`;
    
    const categories = await prisma.componentCategory.findMany();
    const ramCategory = categories.find(c => c.slug === 'ram');
    if (!ramCategory) {
      throw new Error('RAM category not found');
    }
    
    // Calculate a reasonable price based on specs
    const basePrice = ram.type === 'DDR5' ? 80 : 50;
    const capacityMultiplier = ram.capacity / 16;
    const speedMultiplier = 
      ram.type === 'DDR5' 
        ? (ram.speed - 4800) / 400 * 0.1 + 1 
        : (ram.speed - 3200) / 400 * 0.1 + 1;
    
    const rgbMultiplier = ram.rgb ? 1.15 : 1;
    
    const price = Math.round(basePrice * capacityMultiplier * speedMultiplier * rgbMultiplier);
    
    const component = await prisma.component.create({
      data: {
        name: componentName,
        description: `${ram.capacity}GB ${ram.type} RAM at ${ram.speed}MT/s with CL${ram.casLatency} timing${ram.rgb ? ' with RGB lighting' : ''}`,
        price: price,
        stock: 15 + Math.floor(Math.random() * 20),
        imageUrl: `/products/ram/${ram.manufacturer.toLowerCase().replace('.', '')}-${ram.type.toLowerCase()}-${ram.rgb ? 'rgb' : 'standard'}.jpg`,
        categoryId: ramCategory.id,
        sku: sku,
        viewCount: Math.floor(Math.random() * 600) + 100,
        subType: 'ram',
        specifications: JSON.stringify({
          manufacturer: ram.manufacturer,
          capacity: `${ram.capacity}GB`,
          speed: `${ram.speed} MT/s`,
          type: ram.type
        })
      }
    });
    
    // Add to RAM entries
    rams.push({
      componentId: component.id,
      ...ram
    });
  }
  
  // Insert RAM entries
  for (const ram of rams) {
    await prisma.rAM.upsert({
      where: { componentId: ram.componentId },
      update: ram,
      create: ram
    });
  }
}
