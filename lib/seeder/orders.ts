import { PrismaClient, OrderStatus } from '@prisma/client';
import { priceWith99 } from './utils';

export async function seedOrders(prisma: PrismaClient): Promise<void> {
  const users = await prisma.user.findMany({ take: 5 });
  const configurations = await prisma.configuration.findMany({ take: 5 });

  if (users.length === 0 || configurations.length === 0) {
    throw new Error('Users and configurations not found. Please seed users and configurations first.');
  }
  const orders = [
    {
      userId: users[0]?.id,
      configurationId: configurations[0]?.id,
      status: OrderStatus.COMPLETED,
      totalAmount: priceWith99(899, 1199),
      discount: priceWith99(100, 200),
      shippingCost: 10.0,
      shippingAddress: '123 Main St, New York, NY 10001',
      paymentMethod: 'Credit Card',
      shippingMethod: 'Standard',
      shippingEmail: 'customer1@example.com',
      shippingName: 'John Doe',
      shippingPhone: '+1-555-0101',
      createdAt: new Date('2025-05-01'),
      updatedAt: new Date('2025-05-05')
    },
    {
      userId: users[1]?.id,
      configurationId: configurations[1]?.id,
      status: OrderStatus.PROCESSING,
      totalAmount: priceWith99(1599, 1899),
      discount: priceWith99(100, 200),
      shippingCost: 15.0,
      shippingAddress: '456 Oak Ave, Los Angeles, CA 90210',
      paymentMethod: 'PayPal',
      shippingMethod: 'Express',
      shippingEmail: 'customer2@example.com',
      shippingName: 'Jane Smith',
      shippingPhone: '+1-555-0102',
      createdAt: new Date('2025-05-15'),
      updatedAt: new Date('2025-05-20')
    },
    {
      userId: users[2]?.id,
      configurationId: configurations[2]?.id,
      status: OrderStatus.PROCESSING,
      totalAmount: priceWith99(2799, 3199),
      discount: priceWith99(200, 300),
      shippingCost: 20.0,
      shippingAddress: '789 Pine St, Chicago, IL 60601',
      paymentMethod: 'Credit Card',
      shippingMethod: 'Overnight',
      shippingEmail: 'customer3@example.com',
      shippingName: 'Mike Johnson',
      shippingPhone: '+1-555-0103',
      createdAt: new Date('2025-05-20'),
      updatedAt: new Date('2025-05-22')
    },
    {
      userId: users[3]?.id,
      configurationId: configurations[3]?.id,
      status: OrderStatus.PENDING,
      totalAmount: priceWith99(1299, 1599),
      discount: priceWith99(100, 200),
      shippingCost: 10.0,
      shippingAddress: '321 Elm Dr, Houston, TX 77001',
      paymentMethod: 'Bank Transfer',
      shippingMethod: 'Standard',
      shippingEmail: 'customer4@example.com',
      shippingName: 'Sarah Wilson',
      shippingPhone: '+1-555-0104',
      createdAt: new Date('2025-05-25'),
      updatedAt: new Date('2025-05-25')
    },
    {
      userId: users[4]?.id,
      configurationId: configurations[4]?.id,
      status: OrderStatus.CANCELLED,
      totalAmount: priceWith99(699, 899),
      discount: priceWith99(100, 150),
      shippingCost: 10.0,
      shippingAddress: '654 Maple Rd, Phoenix, AZ 85001',
      paymentMethod: 'Credit Card',
      shippingMethod: 'Standard',
      shippingEmail: 'customer5@example.com',
      shippingName: 'David Brown',
      shippingPhone: '+1-555-0105',
      createdAt: new Date('2025-05-10'),
      updatedAt: new Date('2025-05-12')
    },
    {
      userId: users[0]?.id,
      configurationId: configurations[1]?.id,
      status: OrderStatus.COMPLETED,
      totalAmount: priceWith99(1899, 2299),
      discount: priceWith99(100, 200),
      shippingCost: 15.0,
      shippingAddress: '987 Cedar Ln, Miami, FL 33101',
      paymentMethod: 'Credit Card',
      shippingMethod: 'Express',
      shippingEmail: 'customer1@example.com',
      shippingName: 'John Doe',
      shippingPhone: '+1-555-0101',
      createdAt: new Date('2025-04-20'),
      updatedAt: new Date('2025-04-25')
    },
    {
      userId: users[1]?.id,
      configurationId: configurations[2]?.id,
      status: OrderStatus.PROCESSING,
      totalAmount: priceWith99(999, 1299),
      discount: priceWith99(100, 150),
      shippingCost: 10.0,
      shippingAddress: '147 Birch St, Seattle, WA 98101',
      paymentMethod: 'PayPal',
      shippingMethod: 'Standard',
      shippingEmail: 'customer2@example.com',
      shippingName: 'Jane Smith',
      shippingPhone: '+1-555-0102',
      createdAt: new Date('2025-05-18'),
      updatedAt: new Date('2025-05-23')
    },
    {
      userId: users[2]?.id,
      configurationId: configurations[3]?.id,
      status: OrderStatus.PROCESSING,
      totalAmount: priceWith99(1499, 1799),
      discount: priceWith99(100, 150),
      shippingCost: 12.0,
      shippingAddress: '258 Spruce Ave, Denver, CO 80201',
      paymentMethod: 'Credit Card',
      shippingMethod: 'Express',
      shippingEmail: 'customer3@example.com',
      shippingName: 'Mike Johnson',
      shippingPhone: '+1-555-0103',
      createdAt: new Date('2025-05-22'),
      updatedAt: new Date('2025-05-24')
    },
    {
      userId: users[3]?.id,
      configurationId: configurations[4]?.id,
      status: OrderStatus.PENDING,
      totalAmount: priceWith99(799, 999),
      discount: priceWith99(100, 150),
      shippingCost: 10.0,
      shippingAddress: '369 Willow Way, Boston, MA 02101',
      paymentMethod: 'Bank Transfer',
      shippingMethod: 'Standard',
      shippingEmail: 'customer4@example.com',
      shippingName: 'Sarah Wilson',
      shippingPhone: '+1-555-0104',
      createdAt: new Date('2025-05-26'),
      updatedAt: new Date('2025-05-26')
    },
    {
      isGuestOrder: true,
      configurationId: configurations[0]?.id,
      status: OrderStatus.COMPLETED,
      totalAmount: priceWith99(1199, 1499),
      discount: priceWith99(100, 150),
      shippingCost: 15.0,
      shippingAddress: '741 Poplar St, Portland, OR 97201',
      paymentMethod: 'Credit Card',
      shippingMethod: 'Express',
      shippingEmail: 'guest@example.com',
      shippingName: 'Guest Customer',
      shippingPhone: '+1-555-0199',
      createdAt: new Date('2025-05-05'),
      updatedAt: new Date('2025-05-10')
    }
  ];

  await prisma.order.createMany({ data: orders, skipDuplicates: true });
}
