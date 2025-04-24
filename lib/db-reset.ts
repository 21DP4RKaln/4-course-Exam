import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

async function resetDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log('Starting database reset and seeding process...');

    console.log('1. Dropping all database tables...');
    try {
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error dropping database:', error);
    }

    console.log('2. Applying database migrations...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });

    console.log('3. Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('4. Seeding database with initial data...');
    execSync('npm run seed', { stdio: 'inherit' });

    console.log('Database reset and seeding completed successfully!');
  } catch (error) {
    console.error('Error during database reset and seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase()
  .catch((error) => {
    console.error('Unhandled error during database reset:', error);
    process.exit(1);
  });