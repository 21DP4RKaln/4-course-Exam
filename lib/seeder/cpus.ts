import { PrismaClient } from '@prisma/client';

async function createOrUpdateCpuSpecs(
  prisma: PrismaClient,
  componentId: string,
  specs: Record<string, any>
) {
  // Get the CPU category ID first
  const cpuCategory = await prisma.componentCategory.findFirst({
    where: { slug: 'cpu' },
  });

  if (!cpuCategory) {
    throw new Error('CPU category not found');
  }

  // Get all CPU spec keys
  const specKeys = await prisma.specificationKey.findMany({
    where: {
      componentCategoryId: cpuCategory.id,
    },
  });

  // Create spec values for each matching key
  const specs_ = { ...specs }; // Create a copy to avoid mutating the input

  // Handle integrated graphics as boolean
  if ('integratedGpu' in specs_) {
    specs_['integrated_graphics'] = specs_.integratedGpu ? 'Yes' : 'No';
    delete specs_.integratedGpu;
  }

  // Convert clocks to GHz strings
  if ('baseClock' in specs_) {
    specs_['base_clock'] = `${specs_.baseClock} GHz`;
    delete specs_.baseClock;
  }
  if ('boostClock' in specs_) {
    specs_['boost_clock'] = `${specs_.boostClock} GHz`;
    delete specs_.boostClock;
  }

  // Create/update component spec values
  for (const key of specKeys) {
    let value = null;

    // Match specification key names to the data we have
    switch (key.name) {
      case 'manufacturer':
        value = specs_.manufacturer;
        break;
      case 'socket':
        value = specs_.socket;
        break;
      case 'cores':
        value = specs_.cores?.toString();
        break;
      case 'threads':
        value = specs_.threads?.toString();
        break;
      case 'base_clock':
        value = specs_['base_clock'] || `${specs_.baseClock} GHz`;
        break;
      case 'boost_clock':
        value = specs_['boost_clock'] || `${specs_.boostClock} GHz`;
        break;
      case 'tdp':
        value = specs_.tdp?.toString() + 'W';
        break;
      case 'integrated_graphics':
        value = specs_['integrated_graphics'] === 'Yes' ? 'Yes' : 'No';
        break;
    }

    if (value) {
      await prisma.componentSpec.upsert({
        where: {
          componentId_specKeyId: {
            componentId: componentId,
            specKeyId: key.id,
          },
        },
        update: {
          value: value,
        },
        create: {
          componentId: componentId,
          specKeyId: key.id,
          value: value,
        },
      });
    }
  }
}

export async function seedCPUs(prisma: PrismaClient) {
  // Get all components with subType 'cpu'
  const cpuComponents = await prisma.component.findMany({
    where: { subType: 'cpu' },
  });

  // Prepare CPU entries
  const cpus = [];

  // For each CPU component, create a detailed CPU entry
  for (let i = 0; i < cpuComponents.length; i++) {
    const component = cpuComponents[i];

    // Parse existing specifications if available
    const specs = component.specifications
      ? JSON.parse(component.specifications.toString())
      : {};

    const processor = {
      componentId: component.id,
      manufacturer: specs.manufacturer || (i % 2 === 0 ? 'Intel' : 'AMD'),
      socket: specs.socket || (i % 2 === 0 ? 'LGA1700' : 'AM5'),
      series: i % 2 === 0 ? `Core i${9 - (i % 4)}` : `Ryzen ${9 - (i % 4)}`,
      model: i % 2 === 0 ? `13${9 - (i % 4)}00K` : `7${9 - (i % 4)}00X`,
      cores: specs.cores || 16 - (i % 8),
      threads: specs.threads || (16 - (i % 8)) * 2,
      baseClock: 3.0 + (i % 5) * 0.2,
      boostClock: 5.0 + (i % 5) * 0.1,
      cache: `${30 + i * 2}MB`,
      tdp: 65 + (i % 4) * 20,
      architecture: i % 2 === 0 ? 'Raptor Lake' : 'Zen 4',
      integratedGpu: i % 3 === 0,
    };

    // Add to CPU entries
    cpus.push(processor);

    // Create or update component specs
    await createOrUpdateCpuSpecs(prisma, component.id, processor);
  }

  // Add 10 more processors directly
  const additionalProcessors = [
    {
      manufacturer: 'Intel',
      socket: 'LGA1700',
      series: 'Core i9',
      model: '14900K',
      cores: 24,
      threads: 32,
      baseClock: 3.2,
      boostClock: 5.8,
      cache: '36MB',
      tdp: 125,
      architecture: 'Meteor Lake',
      integratedGpu: true,
    },
    {
      manufacturer: 'AMD',
      socket: 'AM5',
      series: 'Ryzen 9',
      model: '9950X',
      cores: 16,
      threads: 32,
      baseClock: 4.2,
      boostClock: 5.7,
      cache: '64MB',
      tdp: 170,
      architecture: 'Zen 5',
      integratedGpu: false,
    },
    {
      manufacturer: 'Intel',
      socket: 'LGA1700',
      series: 'Core i7',
      model: '14700K',
      cores: 20,
      threads: 28,
      baseClock: 3.4,
      boostClock: 5.6,
      cache: '33MB',
      tdp: 105,
      architecture: 'Meteor Lake',
      integratedGpu: true,
    },
    {
      manufacturer: 'AMD',
      socket: 'AM5',
      series: 'Ryzen 7',
      model: '9800X3D',
      cores: 8,
      threads: 16,
      baseClock: 4.2,
      boostClock: 5.0,
      cache: '96MB',
      tdp: 120,
      architecture: 'Zen 5',
      integratedGpu: false,
    },
    {
      manufacturer: 'Intel',
      socket: 'LGA1700',
      series: 'Core i5',
      model: '14600K',
      cores: 14,
      threads: 20,
      baseClock: 3.5,
      boostClock: 5.3,
      cache: '24MB',
      tdp: 125,
      architecture: 'Meteor Lake',
      integratedGpu: true,
    },
    {
      manufacturer: 'AMD',
      socket: 'AM5',
      series: 'Ryzen 7',
      model: '9700X',
      cores: 8,
      threads: 16,
      baseClock: 4.1,
      boostClock: 5.4,
      cache: '40MB',
      tdp: 105,
      architecture: 'Zen 5',
      integratedGpu: false,
    },
    {
      manufacturer: 'Intel',
      socket: 'LGA1700',
      series: 'Core i3',
      model: '14100F',
      cores: 4,
      threads: 8,
      baseClock: 3.5,
      boostClock: 4.7,
      cache: '12MB',
      tdp: 65,
      architecture: 'Meteor Lake',
      integratedGpu: false,
    },
    {
      manufacturer: 'AMD',
      socket: 'AM5',
      series: 'Ryzen 5',
      model: '9600X',
      cores: 6,
      threads: 12,
      baseClock: 3.9,
      boostClock: 5.3,
      cache: '38MB',
      tdp: 105,
      architecture: 'Zen 5',
      integratedGpu: false,
    },
    {
      manufacturer: 'Intel',
      socket: 'LGA1700',
      series: 'Core i5',
      model: '14400F',
      cores: 10,
      threads: 16,
      baseClock: 2.5,
      boostClock: 4.8,
      cache: '20MB',
      tdp: 65,
      architecture: 'Meteor Lake',
      integratedGpu: false,
    },
    {
      manufacturer: 'AMD',
      socket: 'AM5',
      series: 'Ryzen 5',
      model: '9500',
      cores: 6,
      threads: 12,
      baseClock: 3.6,
      boostClock: 5.0,
      cache: '32MB',
      tdp: 65,
      architecture: 'Zen 5',
      integratedGpu: true,
    },
  ];

  // Create component entries for the new processors
  for (const processor of additionalProcessors) {
    // Create a base component first
    const sku = `CPU-${processor.manufacturer.toUpperCase()}-${processor.model}-${Date.now().toString().slice(-6)}`;
    const componentName = `${processor.manufacturer} ${processor.series} ${processor.model}`;

    const categories = await prisma.componentCategory.findMany();
    const cpuCategory = categories.find(c => c.slug === 'cpu');
    if (!cpuCategory) {
      throw new Error('CPU category not found');
    }

    // Calculate a reasonable price based on specs
    const basePrice = processor.manufacturer === 'Intel' ? 200 : 180;
    const coreMultiplier = processor.cores * 10;
    const performanceMultiplier =
      processor.series.includes('i9') || processor.series.includes('9')
        ? 1.8
        : processor.series.includes('i7') || processor.series.includes('7')
          ? 1.4
          : processor.series.includes('i5') || processor.series.includes('5')
            ? 1.0
            : 0.7;

    const price = Math.round(
      (basePrice + coreMultiplier) * performanceMultiplier
    );

    const component = await prisma.component.create({
      data: {
        name: componentName,
        description: `${processor.cores} cores, ${processor.threads} threads, up to ${processor.boostClock}GHz`,
        price: price,
        stock: 10 + Math.floor(Math.random() * 20),
        imageUrl: `/products/cpu/${processor.manufacturer.toLowerCase()}-${processor.model.toLowerCase()}.jpg`,
        categoryId: cpuCategory.id,
        sku: sku,
        viewCount: Math.floor(Math.random() * 1000) + 100,
        subType: 'cpu',
        specifications: JSON.stringify({
          manufacturer: processor.manufacturer,
          socket: processor.socket,
          cores: processor.cores,
          threads: processor.threads,
          baseClock: processor.boostClock,
          boostClock: processor.boostClock,
        }),
      },
    });

    // Add to CPU entries
    cpus.push({
      componentId: component.id,
      ...processor,
    });

    // Create or update component specs
    await createOrUpdateCpuSpecs(prisma, component.id, processor);
  }

  // Insert CPU entries
  for (const cpu of cpus) {
    await prisma.cPU.upsert({
      where: { componentId: cpu.componentId },
      update: cpu,
      create: cpu,
    });
  }
}
