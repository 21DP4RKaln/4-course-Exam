import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = [    {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+371 20000001'
    },
    {
      email: 'specialist@example.com',
      password: hashedPassword,
      name: 'Repair Specialist',
      role: Role.SPECIALIST,
      firstName: 'Repair',
      lastName: 'Specialist',
      phone: '+371 20000002'
    },
    {
      email: 'john.doe@example.com',
      password: hashedPassword,
      name: 'John Doe',
      role: Role.USER,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+371 20000003'
    },
    {
      email: 'jane.smith@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
      role: Role.USER,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+371 20000004'
    },
    {
      email: 'mike.wilson@example.com',
      password: hashedPassword,
      name: 'Mike Wilson',
      role: Role.USER,
      firstName: 'Mike',
      lastName: 'Wilson',
      phone: '+371 20000005'
    },
    {
      email: 'sarah.johnson@example.com',
      password: hashedPassword,
      name: 'Sarah Johnson',
      role: Role.USER,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+371 20000006'
    },
    {
      email: 'david.brown@example.com',
      password: hashedPassword,
      name: 'David Brown',
      role: Role.USER,
      firstName: 'David',
      lastName: 'Brown',
      phone: '+371 20000007'
    },
    {
      email: 'emily.davis@example.com',
      password: hashedPassword,
      name: 'Emily Davis',
      role: Role.USER,
      firstName: 'Emily',
      lastName: 'Davis',
      phone: '+371 20000008'
    },
    {
      email: 'chris.miller@example.com',
      password: hashedPassword,
      name: 'Chris Miller',
      role: Role.USER,
      firstName: 'Chris',
      lastName: 'Miller',
      phone: '+371 20000009'
    },
    {
      email: 'lisa.anderson@example.com',
      password: hashedPassword,
      name: 'Lisa Anderson',
      role: Role.USER,
      firstName: 'Lisa',
      lastName: 'Anderson',
      phone: '+371 20000010'
    }
  ];
  
  await prisma.user.createMany({ data: users, skipDuplicates: true });
}
