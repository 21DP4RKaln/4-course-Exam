import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeder/users';
import { seedComponentCategories } from './seeder/componentCategories';
import { seedPeripheralCategories } from './seeder/peripheralCategories';
import { seedComponents } from './seeder/components';
import { seedPeripherals } from './seeder/peripherals';
import { seedConfigurations } from './seeder/configurations';
import { seedPromoCodes } from './seeder/promoCodes';
import { seedOrders } from './seeder/orders';
import { seedRepairs } from './seeder/repairs';
import { seedReviews } from './seeder/reviews';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    await seedUsers(prisma);
    console.log('✅ Users seeded successfully');

    await seedComponentCategories(prisma);
    console.log('✅ Component categories seeded successfully');

    await seedPeripheralCategories(prisma);
    console.log('✅ Peripheral categories seeded successfully');

    await seedComponents(prisma);
    console.log('✅ Components (with specifications) seeded successfully');

    await seedPeripherals(prisma);
    console.log('✅ Peripherals (with specifications) seeded successfully');

    await seedConfigurations(prisma);
    console.log('✅ Configurations seeded successfully');

    await seedPromoCodes(prisma);
    console.log('✅ Promo codes seeded successfully');

    await seedOrders(prisma);
    console.log('✅ Orders seeded successfully');

    await seedRepairs(prisma);
    console.log('✅ Repairs seeded successfully');

    await seedReviews(prisma);
    console.log('✅ Reviews seeded successfully');

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error('Unhandled error during seeding:', error);
  process.exit(1);
});
