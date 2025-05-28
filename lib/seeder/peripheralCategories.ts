import { PrismaClient } from '@prisma/client';

export async function seedPeripheralCategories(prisma: PrismaClient) {
  const categories = [
    {
      name: 'Keyboard',
      description: 'Gaming and professional keyboards with different switch types',
      slug: 'keyboard',
      displayOrder: 1,
      type: 'peripheral'
    },
    {
      name: 'Mouse',
      description: 'Gaming and professional mice with different sensor types',
      slug: 'mouse',
      displayOrder: 2,
      type: 'peripheral'
    },
    {
      name: 'MousePad',
      description: 'Mousepads for gaming and professional use',
      slug: 'mousepad',
      displayOrder: 3,
      type: 'peripheral'
    },
    {
      name: 'Microphone',
      description: 'Microphones for streaming, gaming, and professional recording',
      slug: 'microphone',
      displayOrder: 4,
      type: 'peripheral'
    },
    {
      name: 'Camera',
      description: 'Webcams and streaming cameras',
      slug: 'camera',
      displayOrder: 5,
      type: 'peripheral'
    },
    {
      name: 'Monitor',
      description: 'Gaming, professional, and general-purpose monitors',
      slug: 'monitor',
      displayOrder: 6,
      type: 'peripheral'
    },
    {
      name: 'Headphones',
      description: 'Gaming headsets and professional headphones',
      slug: 'headphones',
      displayOrder: 7,
      type: 'peripheral'
    },
    {
      name: 'Speakers',
      description: 'Desktop speakers for gaming and multimedia',
      slug: 'speakers',
      displayOrder: 8,
      type: 'peripheral'
    },
    {
      name: 'Gamepad',
      description: 'Controllers for PC and console gaming',
      slug: 'gamepad',
      displayOrder: 9,
      type: 'peripheral'
    },
    {
      name: 'Other Peripherals',
      description: 'Miscellaneous peripherals and accessories',
      slug: 'other-peripherals',
      displayOrder: 10,
      type: 'peripheral'
    }
  ];
  
  // Add peripheral categories to the componentCategory table
  for (const category of categories) {
    await prisma.componentCategory.upsert({
      where: { slug: category.slug },
      update: { type: 'peripheral' },
      create: category
    });
  }
  
  // Keep the original peripheralCategory table updates for backward compatibility
  for (const category of categories) {
    const { type, ...categoryWithoutType } = category;
    await prisma.peripheralCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: categoryWithoutType
    });
  }
}
