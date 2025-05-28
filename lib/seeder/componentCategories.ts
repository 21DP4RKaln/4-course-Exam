import { PrismaClient } from '@prisma/client';

export async function seedComponentCategories(prisma: PrismaClient) {
  const categories = [
    {
      name: 'CPU',
      description: 'Central Processing Units for desktop computers and workstations',
      slug: 'cpu',
      type: 'component',
      displayOrder: 1
    },
    {
      name: 'GPU',
      description: 'Graphics Processing Units for gaming and professional work',
      slug: 'gpu',
      type: 'component',
      displayOrder: 2
    },
    {
      name: 'Motherboard',
      description: 'Motherboards for different CPU sockets and form factors',
      slug: 'motherboard',
      type: 'component',
      displayOrder: 3
    },
    {
      name: 'RAM',
      description: 'Memory modules for desktop and laptop computers',
      slug: 'ram',
      type: 'component',
      displayOrder: 4
    },
    {
      name: 'Storage',
      description: 'Storage devices including SSDs and HDDs',
      slug: 'storage',
      type: 'component',
      displayOrder: 5
    },
    {
      name: 'PSU',
      description: 'Power Supply Units for desktop computers',
      slug: 'psu',
      type: 'component',
      displayOrder: 6
    },
    {
      name: 'Case',
      description: 'Computer cases for different motherboard form factors',
      slug: 'case',
      type: 'component',
      displayOrder: 7
    },
    {
      name: 'Cooling',
      description: 'CPU and system cooling solutions',
      slug: 'cooling',
      type: 'component',
      displayOrder: 8
    }
  ];
  
  for (const category of categories) {
    await prisma.componentCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }
}
