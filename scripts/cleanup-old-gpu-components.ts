import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOldGpuComponents() {
  console.log('🧹 Cleaning up old GPU components with incorrect brand/subBrand structure...\n');
  
  try {
    // Find GPU components where brand is a chip manufacturer (NVIDIA, AMD)
    // and subBrand is not set, which indicates the old structure
    const oldGpuComponents = await prisma.component.findMany({
      where: {
        category: {
          slug: 'gpu'
        },
        gpu: {
          OR: [
            {
              brand: 'NVIDIA',
              subBrand: null
            },
            {
              brand: 'AMD',
              subBrand: null
            },
            {
              brand: 'AMD',
              subBrand: 'AMD' // This one has wrong subBrand
            }
          ]
        }
      },
      include: {
        gpu: true
      }
    });

    console.log(`Found ${oldGpuComponents.length} old GPU components to remove:\n`);

    for (const component of oldGpuComponents) {
      console.log(`- ${component.name} (SKU: ${component.sku})`);      // First delete the GPU specification
      if (component.gpu) {
        await prisma.gPU.delete({
          where: { id: component.gpu.id }
        });
      }
      
      // Then delete the component
      await prisma.component.delete({
        where: { id: component.id }
      });
    }

    console.log(`\n✅ Successfully removed ${oldGpuComponents.length} old GPU components.`);
    
    // Verify the cleanup
    const remainingGpuComponents = await prisma.component.findMany({
      where: {
        category: {
          slug: 'gpu'
        }
      },
      include: {
        gpu: true
      }
    });

    console.log(`\n📊 Remaining GPU components: ${remainingGpuComponents.length}`);
    
    // Check if all remaining components have proper brand/subBrand structure
    const properStructure = remainingGpuComponents.every(component => 
      component.gpu?.subBrand && 
      !['NVIDIA', 'AMD'].includes(component.gpu.brand) &&
      ['NVIDIA', 'AMD'].includes(component.gpu.subBrand)
    );

    if (properStructure) {
      console.log('✅ All remaining GPU components have correct brand/subBrand structure!');
    } else {
      console.log('⚠️ Some GPU components still need attention.');
    }

  } catch (error) {
    console.error('❌ Error cleaning up GPU components:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldGpuComponents();
