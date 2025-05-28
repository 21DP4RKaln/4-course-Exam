import { PrismaClient } from '@prisma/client';

export async function seedSpecificationKeys(prisma: PrismaClient) {
  // Get all component categories
  const componentCategories = await prisma.componentCategory.findMany();
  const cpuCategory = componentCategories.find(c => c.slug === 'cpu');
  const gpuCategory = componentCategories.find(c => c.slug === 'gpu');
  const motherboardCategory = componentCategories.find(c => c.slug === 'motherboard');
  const ramCategory = componentCategories.find(c => c.slug === 'ram');
  const storageCategory = componentCategories.find(c => c.slug === 'storage');
  const psuCategory = componentCategories.find(c => c.slug === 'psu');
  const caseCategory = componentCategories.find(c => c.slug === 'case');
  const coolingCategory = componentCategories.find(c => c.slug === 'cooling');

  // Get all peripheral categories
  const peripheralCategories = await prisma.peripheralCategory.findMany();
  const keyboardCategory = peripheralCategories.find(c => c.slug === 'keyboard');
  const mouseCategory = peripheralCategories.find(c => c.slug === 'mouse');
  const mousePadCategory = peripheralCategories.find(c => c.slug === 'mousepad');
  const microphoneCategory = peripheralCategories.find(c => c.slug === 'microphone');
  const cameraCategory = peripheralCategories.find(c => c.slug === 'camera');
  const monitorCategory = peripheralCategories.find(c => c.slug === 'monitor');
  const headphonesCategory = peripheralCategories.find(c => c.slug === 'headphones');
  const speakersCategory = peripheralCategories.find(c => c.slug === 'speakers');
  const gamepadCategory = peripheralCategories.find(c => c.slug === 'gamepad');
  
  // CPU Spec Keys
  const cpuSpecKeys = [
    { name: 'manufacturer', displayName: 'Manufacturer', componentCategoryId: cpuCategory?.id },
    { name: 'socket', displayName: 'Socket', componentCategoryId: cpuCategory?.id },
    { name: 'cores', displayName: 'Cores', componentCategoryId: cpuCategory?.id },
    { name: 'threads', displayName: 'Threads', componentCategoryId: cpuCategory?.id },
    { name: 'base_clock', displayName: 'Base Clock', componentCategoryId: cpuCategory?.id },
    { name: 'boost_clock', displayName: 'Boost Clock', componentCategoryId: cpuCategory?.id },
    { name: 'tdp', displayName: 'TDP', componentCategoryId: cpuCategory?.id },
    { name: 'integrated_graphics', displayName: 'Integrated Graphics', componentCategoryId: cpuCategory?.id },
  ];
  
  // GPU Spec Keys
  const gpuSpecKeys = [
    { name: 'manufacturer', displayName: 'Manufacturer', componentCategoryId: gpuCategory?.id },
    { name: 'chipset', displayName: 'Chipset', componentCategoryId: gpuCategory?.id },
    { name: 'vram', displayName: 'VRAM', componentCategoryId: gpuCategory?.id },
    { name: 'memory_type', displayName: 'Memory Type', componentCategoryId: gpuCategory?.id },
    { name: 'core_clock', displayName: 'Core Clock', componentCategoryId: gpuCategory?.id },
    { name: 'boost_clock', displayName: 'Boost Clock', componentCategoryId: gpuCategory?.id },
    { name: 'length', displayName: 'Length', componentCategoryId: gpuCategory?.id },
    { name: 'power_connectors', displayName: 'Power Connectors', componentCategoryId: gpuCategory?.id },
  ];

  // Add specs for other component categories...

  // Keyboard Spec Keys
  const keyboardSpecKeys = [
    { name: 'switch_type', displayName: 'Switch Type', peripheralCategoryId: keyboardCategory?.id },
    { name: 'layout', displayName: 'Layout', peripheralCategoryId: keyboardCategory?.id },
    { name: 'connection', displayName: 'Connection Type', peripheralCategoryId: keyboardCategory?.id },
    { name: 'rgb', displayName: 'RGB Lighting', peripheralCategoryId: keyboardCategory?.id },
    { name: 'numpad', displayName: 'Numpad', peripheralCategoryId: keyboardCategory?.id },
    { name: 'multimedia_keys', displayName: 'Multimedia Keys', peripheralCategoryId: keyboardCategory?.id },
  ];

  // Add specs for other peripheral categories...

  // Combine all spec keys
  const allSpecKeys = [
    ...cpuSpecKeys,
    ...gpuSpecKeys,
    ...keyboardSpecKeys,
    // Add more categories here
  ];

  // Insert spec keys
  for (const specKey of allSpecKeys) {
    await prisma.specificationKey.upsert({
      where: { name: specKey.name },
      update: {},
      create: specKey
    });
  }
}
