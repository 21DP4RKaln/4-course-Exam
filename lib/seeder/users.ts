import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  const users = [];
  
  // Create admin user
  users.push({
    email: 'admin@example.com',
    password: await hash('password123', 10),
    name: 'Admin User',
    role: Role.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
    phone: '+37120000001',
    profileImageUrl: '/images/profiles/admin.jpg',
    shippingAddress: '123 Admin St',
    shippingCity: 'Riga',
    shippingPostalCode: 'LV-1001',
    shippingCountry: 'Latvia'
  });
  
  // Create specialist user
  users.push({
    email: 'specialist@example.com',
    password: await hash('password123', 10),
    name: 'Repair Specialist',
    role: Role.SPECIALIST,
    firstName: 'Repair',
    lastName: 'Specialist',
    phone: '+37120000002',
    profileImageUrl: '/images/profiles/specialist.jpg',
    shippingAddress: '456 Repair St',
    shippingCity: 'Riga',
    shippingPostalCode: 'LV-1002',
    shippingCountry: 'Latvia'
  });
  
  // Create regular users
  for (let i = 1; i <= 8; i++) {
    users.push({
      email: `user${i}@example.com`,
      password: await hash('password123', 10),
      name: `Regular User ${i}`,
      role: Role.USER,
      firstName: `User`,
      lastName: `${i}`,
      phone: `+371200000${i+2}`,
      profileImageUrl: i % 2 === 0 ? `/images/profiles/user${i}.jpg` : null,
      shippingAddress: i % 2 === 0 ? `${i}00 User St` : null,
      shippingCity: i % 2 === 0 ? 'Riga' : null,
      shippingPostalCode: i % 2 === 0 ? `LV-100${i}` : null,
      shippingCountry: i % 2 === 0 ? 'Latvia' : null
    });
  }
  
  // Insert all users
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
  }
}
