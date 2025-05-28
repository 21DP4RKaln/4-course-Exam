import { PrismaClient } from '@prisma/client';

export async function seedComponents(prisma: PrismaClient) {
  // Get component categories
  const categories = await prisma.componentCategory.findMany();
  const cpuCategory = categories.find(c => c.slug === 'cpu');
  const gpuCategory = categories.find(c => c.slug === 'gpu');
  const motherboardCategory = categories.find(c => c.slug === 'motherboard');
  const ramCategory = categories.find(c => c.slug === 'ram');
  const storageCategory = categories.find(c => c.slug === 'storage');
  const psuCategory = categories.find(c => c.slug === 'psu');
  const caseCategory = categories.find(c => c.slug === 'case');
  const coolingCategory = categories.find(c => c.slug === 'cooling');
  
  if (!cpuCategory || !gpuCategory || !motherboardCategory || !ramCategory || 
      !storageCategory || !psuCategory || !caseCategory || !coolingCategory) {
    throw new Error('Required component categories not found');
  }

  // CPU Components (10 entries)
  const cpuComponents = [
    {
      name: 'Intel Core i9-13900K',
      description: 'Intel\'s flagship 13th gen processor with 24 cores and 32 threads',
      price: 589.99,
      stock: 15,
      imageUrl: '/products/cpu/intel-i9-13900k.jpg',
      categoryId: cpuCategory.id,
      sku: 'CPU-INTEL-13900K',
      viewCount: 1245,
      discountPrice: 549.99,
      discountExpiresAt: new Date('2025-06-15'),
      subType: 'cpu',
      specifications: JSON.stringify({
        manufacturer: 'Intel',
        socket: 'LGA1700',
        cores: 24,
        threads: 32
      })
    },
    {
      name: 'AMD Ryzen 9 7950X',
      description: 'AMD\'s top-tier processor with 16 cores and 32 threads',
      price: 549.99,
      stock: 12,
      imageUrl: '/products/cpu/amd-7950x.jpg',
      categoryId: cpuCategory.id,
      sku: 'CPU-AMD-7950X',
      viewCount: 1120,
      subType: 'cpu',
      specifications: JSON.stringify({
        manufacturer: 'AMD',
        socket: 'AM5',
        cores: 16,
        threads: 32
      })
    },
    // Add 8 more CPUs
  ];

  // GPU Components (10 entries)
  const gpuComponents = [
    {
      name: 'NVIDIA GeForce RTX 4090',
      description: 'NVIDIA\'s flagship graphics card with 24GB GDDR6X memory',
      price: 1599.99,
      stock: 8,
      imageUrl: '/products/gpu/rtx-4090.jpg',
      categoryId: gpuCategory.id,
      sku: 'GPU-NVIDIA-4090',
      viewCount: 2245,
      subType: 'gpu',
      specifications: JSON.stringify({
        manufacturer: 'NVIDIA',
        memory: '24GB GDDR6X',
        boost_clock: '2.52 GHz'
      })
    },
    {
      name: 'AMD Radeon RX 7900 XTX',
      description: 'AMD\'s high-end graphics card with 24GB GDDR6 memory',
      price: 999.99,
      stock: 10,
      imageUrl: '/products/gpu/rx-7900-xtx.jpg',
      categoryId: gpuCategory.id,
      sku: 'GPU-AMD-7900XTX',
      viewCount: 1845,
      discountPrice: 949.99,
      discountExpiresAt: new Date('2025-06-01'),
      subType: 'gpu',
      specifications: JSON.stringify({
        manufacturer: 'AMD',
        memory: '24GB GDDR6',
        boost_clock: '2.5 GHz'
      })
    },
    // Add 8 more GPUs
  ];

  // Add more component types...

  // Combine all components
  const allComponents = [
    ...cpuComponents,
    ...gpuComponents,
    // Add more component arrays
  ];

  // Insert components
  for (const component of allComponents) {
    await prisma.component.upsert({
      where: { sku: component.sku },
      update: {},
      create: component
    });
  }
}
