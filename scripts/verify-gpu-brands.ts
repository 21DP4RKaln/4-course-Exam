import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyGpuBrands() {
  console.log('🔍 Checking GPU components brand/subBrand structure...\n');
  
  try {
    const gpuComponents = await prisma.component.findMany({
      where: {
        category: {
          slug: 'gpu'
        }
      },
      include: {
        gpu: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Found ${gpuComponents.length} GPU components:\n`);

    gpuComponents.forEach((component, index) => {
      console.log(`${index + 1}. ${component.name}`);
      console.log(`   SKU: ${component.sku}`);
      console.log(`   Brand: ${component.gpu?.brand}`);
      console.log(`   SubBrand: ${component.gpu?.subBrand || 'Not set'}`);
      console.log(`   Chip Type: ${component.gpu?.chipType}`);
      console.log('');
    });

    // Count by brand (card manufacturer)
    const brandCounts = gpuComponents.reduce((acc, component) => {
      const brand = component.gpu?.brand || 'Unknown';
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 GPU Components by Card Manufacturer (Brand):');
    Object.entries(brandCounts).forEach(([brand, count]) => {
      console.log(`   ${brand}: ${count} components`);
    });

    // Count by subBrand (chip manufacturer)
    const subBrandCounts = gpuComponents.reduce((acc, component) => {
      const subBrand = component.gpu?.subBrand || 'Not set';
      acc[subBrand] = (acc[subBrand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n🔧 GPU Components by Chip Manufacturer (SubBrand):');
    Object.entries(subBrandCounts).forEach(([subBrand, count]) => {
      console.log(`   ${subBrand}: ${count} components`);
    });

  } catch (error) {
    console.error('❌ Error verifying GPU brands:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyGpuBrands();
