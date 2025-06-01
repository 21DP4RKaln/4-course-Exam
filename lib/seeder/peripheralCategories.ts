import { PrismaClient } from '@prisma/client';

export async function seedPeripheralCategories(prisma: PrismaClient): Promise<void> {
  const categories = [
    { name: 'Keyboard', description: 'Computer Keyboards', slug: 'keyboard' },
    { name: 'Mouse', description: 'Computer Mice', slug: 'mouse' },
    { name: 'MousePad', description: 'Mouse Pads', slug: 'mousepad' },
    { name: 'Microphone', description: 'Microphones', slug: 'microphone' },
    { name: 'Camera', description: 'Web Cameras', slug: 'camera' },
    { name: 'Monitor', description: 'Computer Monitors', slug: 'monitor' },
    { name: 'Headphones', description: 'Headphones and Headsets', slug: 'headphones' },
    { name: 'Speakers', description: 'Computer Speakers', slug: 'speakers' },
    { name: 'Gamepad', description: 'Gaming Controllers', slug: 'gamepad' },
    { name: 'Tablet', description: 'Graphics Tablets', slug: 'tablet' }
  ];
  await prisma.peripheralCategory.createMany({ data: categories, skipDuplicates: true });
}
