import { PrismaClient } from '@prisma/client';

export async function seedGPUs(prisma: PrismaClient) {
  // Get all components with subType 'gpu'
  const gpuComponents = await prisma.component.findMany({
    where: { subType: 'gpu' },
  });

  // Prepare GPU entries
  const gpus = [];

  // For each GPU component, create a detailed GPU entry
  for (let i = 0; i < gpuComponents.length; i++) {
    const component = gpuComponents[i];

    // Parse existing specifications if available
    const specs = component.specifications
      ? JSON.parse(component.specifications.toString())
      : {};

    gpus.push({
      componentId: component.id,
      manufacturer: specs.manufacturer || (i % 2 === 0 ? 'NVIDIA' : 'AMD'),
      chipset:
        i % 2 === 0
          ? `GeForce RTX ${40 - (i % 3)}0${9 - (i % 2)}0`
          : `Radeon RX ${79 - (i % 3)}00 ${i % 2 === 0 ? 'XT' : 'XTX'}`,
      memory: 8 + (i % 4) * 4,
      memoryType: i % 2 === 0 ? 'GDDR6X' : 'GDDR6',
      coreClock: 1.5 + (i % 5) * 0.15,
      boostClock: 2.2 + (i % 5) * 0.1,
      tdp: 250 + (i % 6) * 25,
      powerConnectors:
        i % 3 === 0 ? '3x 8-pin' : i % 3 === 1 ? '2x 8-pin' : '16-pin PCIe 5.0',
      length: 280 + (i % 5) * 10,
      width: 120 + (i % 3) * 10,
      hdmiPorts: 1 + (i % 3),
      displayPorts: 2 + (i % 2),
      rayTracing: i % 4 !== 3,
    });
  } // Add 10 more GPUs directly
  const additionalGpus = [
    {
      manufacturer: 'NVIDIA',
      chipset: 'GeForce RTX 4090 Ti',
      memory: 24,
      memoryType: 'GDDR6X',
      coreClock: 1.8,
      boostClock: 2.7,
      tdp: 450,
      powerConnectors: '16-pin PCIe 5.0',
      length: 328,
      width: 140,
      hdmiPorts: 2,
      displayPorts: 3,
      rayTracing: true,
    },
    {
      manufacturer: 'AMD',
      chipset: 'Radeon RX 8000 XT',
      memory: 24,
      memoryType: 'GDDR7',
      coreClock: 1.9,
      boostClock: 2.8,
      tdp: 420,
      powerConnectors: '16-pin PCIe 5.0',
      length: 320,
      width: 135,
      hdmiPorts: 2,
      displayPorts: 2,
      rayTracing: true,
    },
    {
      manufacturer: 'NVIDIA',
      chipset: 'GeForce RTX 4080 Super',
      memory: 16,
      memoryType: 'GDDR6X',
      coreClock: 1.7,
      boostClock: 2.6,
      tdp: 350,
      powerConnectors: '16-pin PCIe 5.0',
      length: 305,
      width: 130,
      hdmiPorts: 1,
      displayPorts: 3,
      rayTracing: true,
    },
    {
      manufacturer: 'AMD',
      chipset: 'Radeon RX 7900 XT',
      memory: 20,
      memoryType: 'GDDR6',
      coreClock: 1.8,
      boostClock: 2.5,
      tdp: 320,
      powerConnectors: '2x 8-pin',
      length: 300,
      width: 125,
      hdmiPorts: 1,
      displayPorts: 2,
      rayTracing: true,
    },
    {
      manufacturer: 'NVIDIA',
      chipset: 'GeForce RTX 4070 Ti',
      memory: 12,
      memoryType: 'GDDR6X',
      coreClock: 1.6,
      boostClock: 2.5,
      tdp: 285,
      powerConnectors: '16-pin PCIe 5.0',
      length: 290,
      width: 125,
      hdmiPorts: 1,
      displayPorts: 3,
      rayTracing: true,
    },
    {
      manufacturer: 'AMD',
      chipset: 'Radeon RX 7800 XT',
      memory: 16,
      memoryType: 'GDDR6',
      coreClock: 1.7,
      boostClock: 2.4,
      tdp: 265,
      powerConnectors: '2x 8-pin',
      length: 280,
      width: 120,
      hdmiPorts: 1,
      displayPorts: 2,
      rayTracing: true,
    },
    {
      manufacturer: 'NVIDIA',
      chipset: 'GeForce RTX 4060 Ti',
      memory: 8,
      memoryType: 'GDDR6',
      coreClock: 1.5,
      boostClock: 2.4,
      tdp: 165,
      powerConnectors: '1x 8-pin',
      length: 240,
      width: 120,
      hdmiPorts: 1,
      displayPorts: 3,
      rayTracing: true,
    },
    {
      manufacturer: 'AMD',
      chipset: 'Radeon RX 7700 XT',
      memory: 12,
      memoryType: 'GDDR6',
      coreClock: 1.6,
      boostClock: 2.3,
      tdp: 220,
      powerConnectors: '1x 8-pin',
      length: 260,
      width: 115,
      hdmiPorts: 1,
      displayPorts: 2,
      rayTracing: true,
    },
    {
      manufacturer: 'NVIDIA',
      chipset: 'GeForce RTX 4060',
      memory: 8,
      memoryType: 'GDDR6',
      coreClock: 1.4,
      boostClock: 2.2,
      tdp: 130,
      powerConnectors: '1x 8-pin',
      length: 220,
      width: 110,
      hdmiPorts: 1,
      displayPorts: 3,
      rayTracing: true,
    },
    {
      manufacturer: 'AMD',
      chipset: 'Radeon RX 7600 XT',
      memory: 10,
      memoryType: 'GDDR6',
      coreClock: 1.5,
      boostClock: 2.2,
      tdp: 180,
      powerConnectors: '1x 8-pin',
      length: 245,
      width: 115,
      hdmiPorts: 1,
      displayPorts: 2,
      rayTracing: true,
    },
  ];
  // Create component entries for the new GPUs
  for (const gpu of additionalGpus) {
    // Create a base component first
    const sku = `GPU-${gpu.manufacturer.toUpperCase()}-${gpu.chipset.replace(/\\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const componentName = `${gpu.manufacturer} ${gpu.chipset} ${gpu.memory}GB ${gpu.memoryType}`;

    const categories = await prisma.componentCategory.findMany();
    const gpuCategory = categories.find(c => c.slug === 'gpu');
    if (!gpuCategory) {
      throw new Error('GPU category not found');
    }

    // Calculate a reasonable price based on specs
    const basePrice = 150;
    const memoryMultiplier = gpu.memory * 15;
    const tierMultiplier =
      gpu.chipset.includes('4090') || gpu.chipset.includes('8000')
        ? 7.0
        : gpu.chipset.includes('4080') || gpu.chipset.includes('7900')
          ? 4.5
          : gpu.chipset.includes('4070') || gpu.chipset.includes('7800')
            ? 3.0
            : gpu.chipset.includes('4060') || gpu.chipset.includes('7700')
              ? 2.0
              : gpu.chipset.includes('7600')
                ? 1.5
                : 1.0;

    const price = Math.round(basePrice + memoryMultiplier * tierMultiplier);

    const component = await prisma.component.create({
      data: {
        name: componentName,
        description: `${gpu.memory}GB ${gpu.memoryType} graphics card with ${gpu.coreClock}GHz base and ${gpu.boostClock}GHz boost clock`,
        price: price,
        stock: 5 + Math.floor(Math.random() * 15),
        imageUrl: `/products/gpu/${gpu.manufacturer.toLowerCase()}-${gpu.chipset.toLowerCase().replace(/\\s+/g, '-')}.jpg`,
        categoryId: gpuCategory.id,
        sku: sku,
        viewCount: Math.floor(Math.random() * 1200) + 200,
        subType: 'gpu',
        specifications: JSON.stringify({
          manufacturer: gpu.manufacturer,
          memory: `${gpu.memory}GB ${gpu.memoryType}`,
          boost_clock: `${gpu.boostClock} GHz`,
        }),
      },
    });

    // Add to GPU entries
    gpus.push({
      componentId: component.id,
      ...gpu,
    });
  }

  // Insert GPU entries
  for (const gpu of gpus) {
    await prisma.gPU.upsert({
      where: { componentId: gpu.componentId },
      update: gpu,
      create: gpu,
    });
  }
}
