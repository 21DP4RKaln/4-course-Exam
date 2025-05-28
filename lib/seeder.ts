import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeder/users';
import { seedComponentCategories } from './seeder/componentCategories';
import { seedPeripheralCategories } from './seeder/peripheralCategories';
import { seedComponents } from './seeder/components';
import { seedPeripherals } from './seeder/peripherals';
import { seedSpecificationKeys } from './seeder/specificationKeys';
import { seedCPUs } from './seeder/cpus';
import { seedGPUs } from './seeder/gpus';
import { seedMotherboards } from './seeder/motherboards';
import { seedRAMs } from './seeder/rams';
import { seedStorage } from './seeder/storage';
import { seedPSUs } from './seeder/psus';
import { seedCases } from './seeder/cases';
import { seedCooling } from './seeder/cooling';
import { seedKeyboards } from './seeder/keyboards';
import { seedMice } from './seeder/mice';
import { seedMousePads } from './seeder/mousePads';
import { seedMicrophones } from './seeder/microphones';
import { seedCameras } from './seeder/cameras';
import { seedMonitors } from './seeder/monitors';
import { seedHeadphones } from './seeder/headphones';
import { seedSpeakers } from './seeder/speakers';
import { seedGamepads } from './seeder/gamepads';
import { seedConfigurations } from './seeder/configurations';
import { seedPromoCodes } from './seeder/promoCodes';
import { seedOrders } from './seeder/orders';
import { seedRepairs } from './seeder/repairs';
import { seedReviews } from './seeder/reviews';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Seed in order of dependencies
    await seedUsers(prisma);
    console.log('✅ Users seeded successfully');
    
    await seedComponentCategories(prisma);
    console.log('✅ Component categories seeded successfully');
    
    await seedPeripheralCategories(prisma);
    console.log('✅ Peripheral categories seeded successfully');
    
    await seedSpecificationKeys(prisma);
    console.log('✅ Specification keys seeded successfully');
    
    await seedComponents(prisma);
    console.log('✅ Base components seeded successfully');
    
    // Seed component-specific tables
    await seedCPUs(prisma);
    console.log('✅ CPUs seeded successfully');
    
    await seedGPUs(prisma);
    console.log('✅ GPUs seeded successfully');
    
    await seedMotherboards(prisma);
    console.log('✅ Motherboards seeded successfully');
    
    await seedRAMs(prisma);
    console.log('✅ RAM modules seeded successfully');
    
    await seedStorage(prisma);
    console.log('✅ Storage devices seeded successfully');
    
    await seedPSUs(prisma);
    console.log('✅ Power supplies seeded successfully');
    
    await seedCases(prisma);
    console.log('✅ Cases seeded successfully');
    
    await seedCooling(prisma);
    console.log('✅ Cooling solutions seeded successfully');
    
    await seedPeripherals(prisma);
    console.log('✅ Base peripherals seeded successfully');
    
    // Seed peripheral-specific tables
    await seedKeyboards(prisma);
    console.log('✅ Keyboards seeded successfully');
    
    await seedMice(prisma);
    console.log('✅ Mice seeded successfully');
    
    await seedMousePads(prisma);
    console.log('✅ MousePads seeded successfully');
    
    await seedMicrophones(prisma);
    console.log('✅ Microphones seeded successfully');
    
    await seedCameras(prisma);
    console.log('✅ Cameras seeded successfully');
    
    await seedMonitors(prisma);
    console.log('✅ Monitors seeded successfully');
    
    await seedHeadphones(prisma);
    console.log('✅ Headphones seeded successfully');
    
    await seedSpeakers(prisma);
    console.log('✅ Speakers seeded successfully');
    
    await seedGamepads(prisma);
    console.log('✅ Gamepads seeded successfully');
    
    // Seed configurations and related tables
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

main()
  .catch((error) => {
    console.error('Unhandled error during seeding:', error);
    process.exit(1);
  });