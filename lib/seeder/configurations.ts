import { PrismaClient } from '@prisma/client';
import { priceWith99 } from './utils';

export async function seedConfigurations(prisma: PrismaClient): Promise<void> {
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    console.log(
      '⚠️ No admin user found, creating configurations without user assignment'
    );
  }

  const cpus = await prisma.component.findMany({
    where: { category: { slug: 'cpu' } },
    take: 6,
  });

  const gpus = await prisma.component.findMany({
    where: { category: { slug: 'gpu' } },
    take: 6,
  });

  const motherboards = await prisma.component.findMany({
    where: { category: { slug: 'motherboard' } },
    take: 3,
  });

  const rams = await prisma.component.findMany({
    where: { category: { slug: 'ram' } },
    take: 3,
  });

  const storages = await prisma.component.findMany({
    where: { category: { slug: 'storage' } },
    take: 3,
  });

  const psus = await prisma.component.findMany({
    where: { category: { slug: 'psu' } },
    take: 2,
  });

  const cases = await prisma.component.findMany({
    where: { category: { slug: 'case' } },
    take: 2,
  });

  const coolings = await prisma.component.findMany({
    where: { category: { slug: 'cooling' } },
    take: 2,
  });

  const calculateTotalPrice = (componentPrices: number[]): number => {
    return (
      Math.round(componentPrices.reduce((sum, price) => sum + price, 0) * 100) /
      100
    );
  };

  const configurations = [
    {
      name: 'Budget Gaming PC',
      description:
        'Perfect entry-level gaming computer for 1080p gaming at medium to high settings. Great value for money with solid performance for popular games.',
      userId: adminUser?.id,
      status: 'APPROVED' as const,
      isTemplate: true,
      isPublic: true,
      category: 'Gaming',
      imageUrl: '/products/configurations/budget-gaming.jpg',
      viewCount: Math.floor(Math.random() * 500) + 100,
      components: [
        { componentId: cpus[1]?.id, quantity: 1 }, // AMD Ryzen 5 9500 or similar
        { componentId: gpus[0]?.id, quantity: 1 }, // RTX 4060 or similar
        { componentId: motherboards[1]?.id, quantity: 1 },
        { componentId: rams[0]?.id, quantity: 1 }, // 16GB DDR4
        { componentId: storages[0]?.id, quantity: 1 }, // 1TB NVMe
        { componentId: psus[0]?.id, quantity: 1 },
        { componentId: cases[0]?.id, quantity: 1 },
        { componentId: coolings[0]?.id, quantity: 1 },
      ],
    },
    {
      name: 'Mid-Range Gaming Build',
      description:
        'Excellent 1440p gaming performance with modern components. Perfect balance of performance and value for enthusiast gamers.',
      userId: adminUser?.id,
      status: 'APPROVED' as const,
      isTemplate: true,
      isPublic: true,
      category: 'Gaming',
      imageUrl: '/products/configurations/mid-gaming.jpg',
      viewCount: Math.floor(Math.random() * 400) + 150,
      components: [
        { componentId: cpus[2]?.id, quantity: 1 }, // AMD Ryzen 5 9600X or similar
        { componentId: gpus[4]?.id, quantity: 1 }, // RX 7800 XT or similar
        { componentId: motherboards[0]?.id, quantity: 1 },
        { componentId: rams[1]?.id, quantity: 1 }, // 32GB DDR4
        { componentId: storages[1]?.id, quantity: 1 }, // 2TB NVMe
        { componentId: psus[1]?.id, quantity: 1 },
        { componentId: cases[1]?.id, quantity: 1 },
        { componentId: coolings[1]?.id, quantity: 1 },
      ],
    },
    {
      name: 'Ultimate Gaming Beast',
      description:
        'No-compromise gaming powerhouse for 4K gaming and maximum performance. Features the latest high-end components for the ultimate gaming experience.',
      userId: adminUser?.id,
      status: 'APPROVED' as const,
      isTemplate: true,
      isPublic: true,
      category: 'Gaming',
      imageUrl: '/products/configurations/ultimate-gaming.jpg',
      viewCount: Math.floor(Math.random() * 300) + 200,
      components: [
        { componentId: cpus[0]?.id, quantity: 1 }, // AMD Ryzen 9 7950X
        { componentId: gpus[2]?.id, quantity: 1 }, // RTX 4090
        { componentId: motherboards[0]?.id, quantity: 1 },
        { componentId: rams[2]?.id, quantity: 2 }, // 2x 16GB DDR5 for 32GB total
        { componentId: storages[1]?.id, quantity: 1 }, // 2TB NVMe
        { componentId: storages[2]?.id, quantity: 1 }, // Additional 2TB HDD
        { componentId: psus[0]?.id, quantity: 1 }, // 850W PSU
        { componentId: cases[1]?.id, quantity: 1 },
        { componentId: coolings[1]?.id, quantity: 1 }, // Liquid cooling
      ],
    },
    {
      name: 'Content Creator Workstation',
      description:
        'Professional workstation optimized for video editing, 3D rendering, and content creation. Powerful multi-core processor with ample RAM and fast storage.',
      userId: adminUser?.id,
      status: 'APPROVED' as const,
      isTemplate: true,
      isPublic: true,
      category: 'Workstation',
      imageUrl: '/products/configurations/creator-pc.jpg',
      viewCount: Math.floor(Math.random() * 250) + 80,
      components: [
        { componentId: cpus[0]?.id, quantity: 1 }, // High-core count CPU
        { componentId: gpus[1]?.id, quantity: 1 }, // RTX 4070 Ti for CUDA acceleration
        { componentId: motherboards[0]?.id, quantity: 1 },
        { componentId: rams[1]?.id, quantity: 2 }, // 64GB total RAM
        { componentId: storages[1]?.id, quantity: 2 }, // 2x 2TB NVMe for speed
        { componentId: psus[0]?.id, quantity: 1 },
        { componentId: cases[0]?.id, quantity: 1 },
        { componentId: coolings[1]?.id, quantity: 1 },
      ],
    },
    {
      name: 'Developer Machine',
      description:
        'Optimized for software development with fast compilation times, multiple VMs, and excellent multitasking performance. Perfect for programmers and developers.',
      userId: adminUser?.id,
      status: 'APPROVED' as const,
      isTemplate: true,
      isPublic: true,
      category: 'Development',
      imageUrl: '/products/configurations/dev-pc.jpg',
      viewCount: Math.floor(Math.random() * 200) + 60,
      components: [
        { componentId: cpus[4]?.id, quantity: 1 }, // Intel i7-14700K
        { componentId: gpus[0]?.id, quantity: 1 }, // Basic graphics for development
        { componentId: motherboards[1]?.id, quantity: 1 },
        { componentId: rams[1]?.id, quantity: 1 }, // 32GB for VMs and IDEs
        { componentId: storages[0]?.id, quantity: 1 }, // Fast NVMe for quick builds
        { componentId: storages[2]?.id, quantity: 1 }, // Large HDD for data
        { componentId: psus[1]?.id, quantity: 1 },
        { componentId: cases[0]?.id, quantity: 1 },
        { componentId: coolings[0]?.id, quantity: 1 },
      ],
    },
    {
      name: 'Office Productivity PC',
      description:
        'Reliable and efficient computer for office work, web browsing, and basic productivity tasks. Energy efficient with quiet operation.',
      userId: adminUser?.id,
      status: 'APPROVED' as const,
      isTemplate: true,
      isPublic: true,
      category: 'Office',
      imageUrl: '/products/configurations/office-pc.jpg',
      viewCount: Math.floor(Math.random() * 150) + 40,
      components: [
        { componentId: cpus[3]?.id, quantity: 1 }, // Intel i5-14400F
        { componentId: motherboards[1]?.id, quantity: 1 },
        { componentId: rams[0]?.id, quantity: 1 }, // 16GB is plenty for office work
        { componentId: storages[0]?.id, quantity: 1 }, // 1TB NVMe
        { componentId: psus[1]?.id, quantity: 1 }, // Efficient PSU
        { componentId: cases[0]?.id, quantity: 1 },
        { componentId: coolings[0]?.id, quantity: 1 },
      ],
    },
    {
      name: 'RGB Gaming Showcase',
      description:
        'Stylish gaming build with extensive RGB lighting and tempered glass. Performance meets aesthetics for the ultimate gaming setup.',
      userId: adminUser?.id,
      status: 'APPROVED' as const,
      isTemplate: true,
      isPublic: true,
      category: 'Gaming',
      imageUrl: '/products/configurations/rgb-pc.jpg',
      viewCount: Math.floor(Math.random() * 350) + 120,
      components: [
        { componentId: cpus[2]?.id, quantity: 1 }, // Ryzen 5 9600X
        { componentId: gpus[1]?.id, quantity: 1 }, // RTX 4070 Ti
        { componentId: motherboards[0]?.id, quantity: 1 }, // RGB motherboard
        { componentId: rams[1]?.id, quantity: 1 }, // RGB RAM
        { componentId: storages[1]?.id, quantity: 1 },
        { componentId: psus[0]?.id, quantity: 1 },
        { componentId: cases[1]?.id, quantity: 1 }, // Glass case
        { componentId: coolings[1]?.id, quantity: 1 }, // RGB liquid cooling
      ],
    },
    {
      name: 'Compact Gaming Build',
      description:
        "Small form factor gaming PC that doesn't compromise on performance. Perfect for limited space while maintaining excellent gaming capabilities.",
      userId: adminUser?.id,
      status: 'APPROVED' as const,
      isTemplate: true,
      isPublic: true,
      category: 'Gaming',
      imageUrl: '/products/configurations/compact-gaming.jpg',
      viewCount: Math.floor(Math.random() * 200) + 70,
      components: [
        { componentId: cpus[1]?.id, quantity: 1 }, // Efficient CPU
        { componentId: gpus[3]?.id, quantity: 1 }, // Compact GPU
        { componentId: motherboards[1]?.id, quantity: 1 }, // mATX board
        { componentId: rams[2]?.id, quantity: 1 }, // High-speed DDR5
        { componentId: storages[0]?.id, quantity: 1 }, // Single fast SSD
        { componentId: psus[1]?.id, quantity: 1 }, // Modular PSU
        { componentId: cases[0]?.id, quantity: 1 }, // Compact case
        { componentId: coolings[0]?.id, quantity: 1 }, // Low-profile cooling
      ],
    },
  ];

  // Create configurations with their components
  for (const configData of configurations) {
    const { components: configComponents, ...configInfo } = configData;

    // Filter out any undefined component IDs
    const validComponents = configComponents.filter(comp => comp.componentId);

    if (validComponents.length === 0) {
      console.log(
        `⚠️ Skipping configuration "${configInfo.name}" - no valid components found`
      );
      continue;
    }

    // Calculate total price
    let totalPrice = 0;
    for (const comp of validComponents) {
      const component = await prisma.component.findUnique({
        where: { id: comp.componentId },
      });
      if (component) {
        totalPrice += component.price * comp.quantity;
      }
    }

    // Create the configuration
    const configuration = await prisma.configuration.create({
      data: {
        ...configInfo,
        totalPrice: Math.round(totalPrice * 100) / 100,
      },
    });

    // Create config items
    for (const comp of validComponents) {
      await prisma.configItem.create({
        data: {
          configurationId: configuration.id,
          componentId: comp.componentId,
          quantity: comp.quantity,
        },
      });
    }
  }

  // Create some additional random configurations
  const randomConfigurations = [
    {
      name: 'Custom Build #1',
      description:
        'User-created custom configuration with balanced performance',
      userId: adminUser?.id,
      status: 'DRAFT' as const,
      isTemplate: false,
      isPublic: false,
      category: 'Custom',
    },
    {
      name: 'Budget Workstation',
      description: 'Cost-effective workstation for light professional tasks',
      userId: adminUser?.id,
      status: 'APPROVED' as const,
      isTemplate: true,
      isPublic: true,
      category: 'Workstation',
    },
    {
      name: 'Streaming Setup',
      description: 'Optimized for live streaming and content creation',
      userId: adminUser?.id,
      status: 'APPROVED' as const,
      isTemplate: true,
      isPublic: true,
      category: 'Streaming',
    },
  ];

  for (const configData of randomConfigurations) {
    // Randomly select components for these configurations
    const randomCpu = cpus[Math.floor(Math.random() * cpus.length)];
    const randomGpu = gpus[Math.floor(Math.random() * gpus.length)];
    const randomMobo =
      motherboards[Math.floor(Math.random() * motherboards.length)];
    const randomRam = rams[Math.floor(Math.random() * rams.length)];
    const randomStorage = storages[Math.floor(Math.random() * storages.length)];
    const randomPsu = psus[Math.floor(Math.random() * psus.length)];
    const randomCase = cases[Math.floor(Math.random() * cases.length)];
    const randomCooling = coolings[Math.floor(Math.random() * coolings.length)];

    const components = [
      randomCpu,
      randomGpu,
      randomMobo,
      randomRam,
      randomStorage,
      randomPsu,
      randomCase,
      randomCooling,
    ].filter(Boolean);
    const totalPrice = components.reduce((sum, comp) => sum + comp.price, 0);

    const configuration = await prisma.configuration.create({
      data: {
        ...configData,
        totalPrice: Math.round(totalPrice * 100) / 100,
        viewCount: Math.floor(Math.random() * 50),
      },
    });

    // Create config items
    for (const component of components) {
      await prisma.configItem.create({
        data: {
          configurationId: configuration.id,
          componentId: component.id,
          quantity: 1,
        },
      });
    }
  }

  console.log('✅ Configurations seeded successfully');
}
