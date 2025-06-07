import { PrismaClient, ProductType } from '@prisma/client';

export async function seedReviews(prisma: PrismaClient): Promise<void> {
  const users = await prisma.user.findMany({ take: 5 });
  const components = await prisma.component.findMany({ take: 3 });
  const peripherals = await prisma.peripheral.findMany({ take: 3 });
  const configurations = await prisma.configuration.findMany({ take: 4 });

  if (users.length === 0) {
    throw new Error('Users not found. Please seed users first.');
  }
  const reviews = [
    {
      userId: users[0]?.id || '',
      productId: components[0]?.id || '',
      productType: ProductType.COMPONENT,
      rating: 5,
      comment:
        'Excellent CPU performance! Handles all my gaming and streaming needs perfectly. Installation was straightforward and temperatures stay cool under load.',
      purchaseDate: new Date('2025-04-15'),
    },
    {
      userId: users[1]?.id || '',
      productId: peripherals[0]?.id || '',
      productType: ProductType.PERIPHERAL,
      rating: 4,
      comment:
        'Great monitor with vibrant colors and smooth 144Hz refresh rate. Only minor complaint is the stand could be more adjustable.',
      purchaseDate: new Date('2025-05-01'),
    },
    {
      userId: users[2]?.id || '',
      productId: configurations[0]?.id || '',
      productType: ProductType.CONFIGURATION,
      rating: 5,
      comment:
        'Amazing pre-built configuration! Everything works perfectly out of the box. Great value for money and excellent customer service.',
      purchaseDate: new Date('2025-04-20'),
    },
    {
      userId: users[3]?.id || '',
      productId: components[1]?.id || '',
      productType: ProductType.COMPONENT,
      rating: 4,
      comment:
        'Solid graphics card performance for 1440p gaming. Runs most games at high settings with good frame rates. A bit loud under full load.',
      purchaseDate: new Date('2025-05-05'),
    },
    {
      userId: users[4]?.id || '',
      productId: peripherals[1]?.id || '',
      productType: ProductType.PERIPHERAL,
      rating: 5,
      comment:
        "Best mechanical keyboard I've owned! The switches feel amazing and the RGB lighting is customizable. Highly recommend for gaming.",
      purchaseDate: new Date('2025-04-25'),
    },
    {
      userId: users[0]?.id || '',
      productId: configurations[1]?.id || '',
      productType: ProductType.CONFIGURATION,
      rating: 3,
      comment:
        'Good performance but had some compatibility issues initially. Support team helped resolve them quickly. Works well now.',
      purchaseDate: new Date('2025-03-30'),
    },
    {
      userId: users[1]?.id || '',
      productId: components[2]?.id || '',
      productType: ProductType.COMPONENT,
      rating: 5,
      comment:
        'Fast NVMe SSD with excellent read/write speeds. Boot times are incredible and file transfers are lightning quick. Worth the investment.',
      purchaseDate: new Date('2025-05-10'),
    },
    {
      userId: users[2]?.id || '',
      productId: peripherals[2]?.id || '',
      productType: ProductType.PERIPHERAL,
      rating: 4,
      comment:
        'Comfortable gaming mouse with accurate sensor. Battery life is good and wireless connectivity is stable. Great for competitive gaming.',
      purchaseDate: new Date('2025-04-18'),
    },
    {
      userId: users[3]?.id || '',
      productId: configurations[2]?.id || '',
      productType: ProductType.CONFIGURATION,
      rating: 5,
      comment:
        'Perfect workstation build! Handles video editing, 3D rendering, and multitasking effortlessly. Professional quality components throughout.',
      purchaseDate: new Date('2025-03-25'),
    },
    {
      userId: users[4]?.id || '',
      productId: configurations[3]?.id || '',
      productType: ProductType.CONFIGURATION,
      rating: 4,
      comment:
        'Great entry-level gaming build. Plays all modern games at 1080p with good settings. Excellent starting point for PC gaming.',
      purchaseDate: new Date('2025-05-12'),
    },
  ];

  await prisma.review.createMany({ data: reviews, skipDuplicates: true });
}
