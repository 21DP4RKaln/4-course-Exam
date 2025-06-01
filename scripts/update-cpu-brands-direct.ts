import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCpuBrands() {
  try {
    // Get all CPUs and update their brands based on series
    const cpus = await prisma.cPU.findMany({
      include: {
        component: true
      }
    });

    console.log(`Found ${cpus.length} CPUs to update`);

    for (const cpu of cpus) {
      let brand = '';
      const series = cpu.series.toLowerCase();
      
      if (series.includes('ryzen') || series.includes('athlon') || series.includes('fx')) {
        brand = 'AMD';
      } else if (series.includes('core') || series.includes('pentium') || series.includes('celeron') || series.includes('xeon')) {
        brand = 'Intel';
      }

      if (brand) {
        await prisma.cPU.update({
          where: { id: cpu.id },
          data: { brand: brand }
        });
        
        console.log(`Updated ${cpu.component.name}: series "${cpu.series}" -> brand "${brand}"`);
      } else {
        console.log(`Could not determine brand for ${cpu.component.name} with series "${cpu.series}"`);
      }
    }
    
    console.log('CPU brand update completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCpuBrands();
