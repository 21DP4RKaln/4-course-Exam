import { PrismaClient } from '@prisma/client';

export async function seedComponentCategories(prisma: PrismaClient): Promise<void> {  const categories = [
    { name: 'CPU', description: 'Central Processing Units', displayOrder: 1, slug: 'cpu' },
    { name: 'GPU', description: 'Graphics Processing Units', displayOrder: 2, slug: 'gpu' },
    { name: 'Motherboard', description: 'Motherboards and Mainboards', displayOrder: 3, slug: 'motherboard' },
    { name: 'RAM', description: 'Random Access Memory', displayOrder: 4, slug: 'ram' },
    { name: 'Storage', description: 'Storage Devices', displayOrder: 5, slug: 'storage' },
    { name: 'PSU', description: 'Power Supply Units', displayOrder: 6, slug: 'psu' },
    { name: 'Case', description: 'Computer Cases', displayOrder: 7, slug: 'case' },
    { name: 'Cooling', description: 'Cooling Solutions', displayOrder: 8, slug: 'cooling' },
    { name: 'Services', description: 'Additional Services and Software', displayOrder: 9, slug: 'services' }
  ];
  await prisma.componentCategory.createMany({ data: categories, skipDuplicates: true });
}
