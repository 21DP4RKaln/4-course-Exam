import { PrismaClient, ConfigStatus } from '@prisma/client';

export async function seedConfigurations(prisma: PrismaClient) {
  // Get some users for assigning configurations
  const users = await prisma.user.findMany({
    take: 5
  });
  
  // Get components by categories for creating configurations - take at least 10 of each
  const cpus = await prisma.component.findMany({
    where: { subType: 'cpu' },
    take: 10
  });
  
  const motherboards = await prisma.component.findMany({
    where: { subType: 'motherboard' },
    take: 10
  });
  
  const gpus = await prisma.component.findMany({
    where: { subType: 'gpu' },
    take: 10
  });
  
  const rams = await prisma.component.findMany({
    where: { subType: 'ram' },
    take: 10
  });
  
  const storage = await prisma.component.findMany({
    where: { subType: 'storage' },
    take: 10
  });
  
  const psus = await prisma.component.findMany({
    where: { subType: 'psu' },
    take: 10
  });
  
  const cases = await prisma.component.findMany({
    where: { subType: 'case' },
    take: 10
  });
  
  const cooling = await prisma.component.findMany({
    where: { subType: 'cooling' },
    take: 10
  });
  
  // Log component counts for debugging
  console.log('CPUs count:', cpus.length);
  console.log('Motherboards count:', motherboards.length);
  console.log('GPUs count:', gpus.length);
  console.log('RAMs count:', rams.length);
  console.log('Storage count:', storage.length);
  console.log('PSUs count:', psus.length);
  console.log('Cases count:', cases.length);
  console.log('Cooling count:', cooling.length);
  
  // Check if we have enough components to seed configurations
  // We need at least 6 of each component type to create varied configurations
  if (cpus.length < 6 || motherboards.length < 6 || gpus.length < 6 || 
      rams.length < 6 || storage.length < 6 || psus.length < 6 || 
      cases.length < 6 || cooling.length < 6) {
    console.log('⚠️ Not enough components to seed configurations! Skipping configuration seeding.');
    console.log('Please ensure you have at least 6 components of each type.');
    return;
  }
  
  // Configuration templates
  const configTemplates = [
    {
      name: "Budget Gaming PC",
      description: "A budget-friendly gaming PC that can handle most modern games at 1080p.",
      category: "Gaming",
      imageUrl: "/products/configurations/budget-gaming.jpg",
      isTemplate: true,
      isPublic: true,
    },
    {
      name: "Mid-range Gaming Beast",
      description: "A powerful gaming PC for 1440p gaming with high refresh rates.",
      category: "Gaming",
      imageUrl: "/products/configurations/mid-gaming.jpg",
      isTemplate: true,
      isPublic: true,
    },
    {
      name: "Ultimate Gaming Rig",
      description: "No compromises gaming PC for 4K gaming and content creation.",
      category: "Gaming",
      imageUrl: "/products/configurations/ultimate-gaming.jpg",
      isTemplate: true,
      isPublic: true,
    },
    {
      name: "Content Creator Workstation",
      description: "Optimized for video editing, streaming, and creative workflows.",
      category: "Workstation",
      imageUrl: "/products/configurations/creator-pc.jpg",
      isTemplate: true,
      isPublic: true,
    },
    {
      name: "Compact Gaming PC",
      description: "Small form factor PC with powerful gaming capabilities.",
      category: "Gaming",
      imageUrl: "/products/configurations/compact-gaming.jpg",
      isTemplate: true,
      isPublic: true,
    },
    {
      name: "Office Productivity PC",
      description: "Reliable system for everyday tasks and office work.",
      category: "Office",
      imageUrl: "/products/configurations/office-pc.jpg",
      isTemplate: true,
      isPublic: true,
    },
    {
      name: "Developer Workstation",
      description: "Ideal setup for programming, compiling and development work.",
      category: "Workstation",
      imageUrl: "/products/configurations/dev-pc.jpg",
      isTemplate: true,
      isPublic: true,
    },
    {
      name: "Ultimate RGB Build",
      description: "Maximum RGB effect with high-end components.",
      category: "Gaming",
      imageUrl: "/products/configurations/rgb-pc.jpg",
      isTemplate: true,
      isPublic: true,
    },
  ];
  
  // User configurations (saved configs)
  const userConfigs = [
    {
      name: "My Gaming Setup",
      description: "My personal gaming configuration I'm saving up for.",
      category: "Gaming",
      isTemplate: false,
      isPublic: false,
    },
    {
      name: "Streaming PC",
      description: "Dedicated streaming setup for my Twitch channel.",
      category: "Streaming",
      isTemplate: false,
      isPublic: true,
    },
    {
      name: "Home Office PC",
      description: "Setup for remote work and occasional gaming.",
      category: "Office",
      isTemplate: false,
      isPublic: false,
    },
  ];
    // Create configuration entries
  const configurations = [];
  
  // Log component arrays to debug
  console.log(`CPUs count: ${cpus.length}`);
  console.log(`Motherboards count: ${motherboards.length}`);
  console.log(`GPUs count: ${gpus.length}`);
  console.log(`RAMs count: ${rams.length}`);
  console.log(`Storage count: ${storage.length}`);
  console.log(`PSUs count: ${psus.length}`);
  console.log(`Cases count: ${cases.length}`);
  console.log(`Cooling count: ${cooling.length}`);
  
  // Add all template configurations
  for (let i = 0; i < configTemplates.length; i++) {
    const template = configTemplates[i];
    
    // Calculate which components to use based on tier/price point
    const tierIndex = Math.min(i % 3, 2); // 0=budget, 1=mid, 2=high
    const componentOffset = tierIndex * 2; // Skip by 2 for each tier
    
    // Add safety checks for each component access
    const cpuPrice = cpus[componentOffset + (i % 2)]?.price ?? 10000;
    const mbPrice = motherboards[componentOffset + (i % 2)]?.price ?? 15000;
    const gpuPrice = gpus[componentOffset + (i % 2)]?.price ?? 30000;
    const ramPrice = rams[componentOffset]?.price ?? 8000;
    const storagePrice = storage[componentOffset]?.price ?? 10000;
    const psuPrice = psus[componentOffset]?.price ?? 7000;
    const casePrice = cases[i % cases.length]?.price ?? 9000;
    const coolingPrice = cooling[componentOffset]?.price ?? 5000;
    
    const totalPrice = cpuPrice + mbPrice + gpuPrice + ramPrice + storagePrice + psuPrice + casePrice + coolingPrice;
    
    // Create config entry
    configurations.push({      name: template.name,
      description: template.description,
      userId: null, // Templates don't have an owner
      totalPrice,
      status: ConfigStatus.APPROVED,
      isTemplate: template.isTemplate,
      isPublic: template.isPublic,
      category: template.category,
      imageUrl: template.imageUrl,
      viewCount: 10 + Math.floor(Math.random() * 990),
      discountPrice: i % 3 === 0 ? totalPrice * 0.9 : null,
      discountExpiresAt: i % 3 === 0 ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) : null,
      components: [
        { componentId: cpus[componentOffset + (i % 2)].id, quantity: 1 },
        { componentId: motherboards[componentOffset + (i % 2)].id, quantity: 1 },
        { componentId: gpus[componentOffset + (i % 2)].id, quantity: 1 },
        { componentId: rams[componentOffset].id, quantity: i === 2 || i === 3 ? 2 : 1 }, // More RAM for high-end builds
        { componentId: storage[componentOffset].id, quantity: 1 },
        { componentId: psus[componentOffset].id, quantity: 1 },
        { componentId: cases[i % cases.length].id, quantity: 1 },
        { componentId: cooling[componentOffset].id, quantity: 1 }
      ]
    });
  }
  
  // Add user configurations
  if (users.length > 0) {
    for (let i = 0; i < userConfigs.length; i++) {
      const userConfig = userConfigs[i];
      const userId = users[i % users.length].id;
      
      // Calculate which components to use
      const componentOffset = i % 3 * 2;
      
      // Calculate total price based on selected components
      const totalPrice = 
        cpus[componentOffset].price +
        motherboards[componentOffset].price +
        gpus[componentOffset].price +
        rams[componentOffset].price +
        storage[componentOffset].price +
        psus[componentOffset].price +
        cases[i].price +
        cooling[componentOffset].price;
      
      // Create config entry
      configurations.push({
        name: userConfig.name,
        description: userConfig.description,
        userId,
        totalPrice,
        status: ConfigStatus.DRAFT,
        isTemplate: userConfig.isTemplate,
        isPublic: userConfig.isPublic,
        category: userConfig.category,
        imageUrl: null,
        components: [
          { componentId: cpus[componentOffset].id, quantity: 1 },
          { componentId: motherboards[componentOffset].id, quantity: 1 },
          { componentId: gpus[componentOffset].id, quantity: 1 },
          { componentId: rams[componentOffset].id, quantity: 1 },
          { componentId: storage[componentOffset].id, quantity: 1 },
          { componentId: psus[componentOffset].id, quantity: 1 },
          { componentId: cases[i].id, quantity: 1 },
          { componentId: cooling[componentOffset].id, quantity: 1 }
        ]
      });
    }
  }
    // Insert configurations and their items
  for (const config of configurations) {
    // Extract components and create a configuration object without components
    const { components, ...configWithoutComponents } = config;
    
    // Create the configuration
    const createdConfig = await prisma.configuration.upsert({
      where: {
        id: crypto.randomUUID()
      },
      update: {},
      create: configWithoutComponents,
    });
    
    // Add the components to the configuration
    for (const component of components) {
      await prisma.configItem.create({
        data: {
          configurationId: createdConfig.id,
          componentId: component.componentId,
          quantity: component.quantity
        }
      });
    }
  }
}
