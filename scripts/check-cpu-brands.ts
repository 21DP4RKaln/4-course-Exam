import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCpuBrands() {
  try {
    // First, check what categories exist
    const categories = await prisma.componentCategory.findMany();
    console.log('Available categories:');
    categories.forEach((cat: any) => {
      console.log(`  - ${cat.name} (slug: ${cat.slug})`);
    });
    
    // Check for components with CPU data
    const componentsWithCpu = await prisma.component.findMany({
      where: {
        cpu: {
          isNot: null
        }
      },
      include: {
        cpu: true,
        category: true
      }
    });

    console.log('\nComponents with CPU data found:', componentsWithCpu.length);
    console.log('\nCPU Brand Data:');
    
    componentsWithCpu.forEach((component: any) => {
      console.log(`${component.name} (Category: ${component.category.name}):`);
      console.log(`  - CPU Brand: ${component.cpu?.brand || 'NULL'}`);
      console.log(`  - CPU Series: ${component.cpu?.series || 'NULL'}`);
      console.log(`  - Component Brand: ${component.brand || 'NULL'}`);
      console.log(`  - Component Manufacturer: ${component.manufacturer || 'NULL'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCpuBrands();
