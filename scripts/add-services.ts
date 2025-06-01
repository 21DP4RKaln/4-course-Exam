import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function priceWith99(min: number, max: number): number {
  const randomPrice = Math.random() * (max - min) + min;
  return Math.floor(randomPrice) + 0.99;
}

async function addServicesCategory() {
  try {
    // Check if Services category exists
    const servicesCategory = await prisma.componentCategory.findFirst({
      where: { slug: 'services' }
    });

    if (!servicesCategory) {
      console.log('❌ Services category not found. Please run the main seeder first.');
      return;
    }

    console.log('✅ Services category found:', servicesCategory.name);

    // Service components to add
    const serviceComponents = [
      {
        name: 'Windows 11 Home',
        description: 'Microsoft Windows 11 Home operating system license',
        price: priceWith99(100, 140),
        quantity: 999,
        imagesUrl: '/products/services/windows-11-home.jpg',
        sku: 'SERVICE-WIN11-HOME',
        subType: 'operating-system',
        categoryId: servicesCategory.id
      },
      {
        name: 'Windows 11 Pro',
        description: 'Microsoft Windows 11 Professional operating system license with advanced features',
        price: priceWith99(180, 220),
        quantity: 999,
        imagesUrl: '/products/services/windows-11-pro.jpg',
        sku: 'SERVICE-WIN11-PRO',
        subType: 'operating-system',
        categoryId: servicesCategory.id
      },
      {
        name: 'TP-Link AC600 USB WiFi Adapter',
        description: 'Dual-band USB 3.0 WiFi adapter for desktop computers',
        price: priceWith99(20, 35),
        quantity: 50,
        imagesUrl: '/products/services/tp-link-ac600.jpg',
        sku: 'SERVICE-WIFI-AC600',
        subType: 'wifi-adapter',
        categoryId: servicesCategory.id
      },
      {
        name: 'ASUS PCE-AX58BT WiFi 6 Card',
        description: 'PCIe WiFi 6 card with Bluetooth 5.0 support',
        price: priceWith99(45, 65),
        quantity: 30,
        imagesUrl: '/products/services/asus-pce-ax58bt.jpg',
        sku: 'SERVICE-WIFI-AX58BT',
        subType: 'wifi-adapter',
        categoryId: servicesCategory.id
      },
      {
        name: 'Creative Sound Blaster Audigy FX',
        description: 'Internal sound card for enhanced audio experience',
        price: priceWith99(35, 50),
        quantity: 25,
        imagesUrl: '/products/services/sound-blaster-fx.jpg',
        sku: 'SERVICE-SOUND-FX',
        subType: 'sound-card',
        categoryId: servicesCategory.id
      },
      {
        name: 'ASUS Xonar SE Sound Card',
        description: 'High-quality PCIe sound card with 5.1 channel support',
        price: priceWith99(25, 40),
        quantity: 20,
        imagesUrl: '/products/services/asus-xonar-se.jpg',
        sku: 'SERVICE-SOUND-SE',
        subType: 'sound-card',
        categoryId: servicesCategory.id
      },
      {
        name: 'PC Assembly Service',
        description: 'Professional PC assembly and cable management service',
        price: priceWith99(50, 80),
        quantity: 999,
        imagesUrl: '/products/services/assembly-service.jpg',
        sku: 'SERVICE-ASSEMBLY',
        subType: 'assembly',
        categoryId: servicesCategory.id
      },
      {
        name: 'Extended 3-Year Warranty',
        description: 'Extended warranty coverage for complete system protection',
        price: priceWith99(80, 120),
        quantity: 999,
        imagesUrl: '/products/services/extended-warranty.jpg',
        sku: 'SERVICE-WARRANTY-3Y',
        subType: 'warranty',
        categoryId: servicesCategory.id
      },
      {
        name: 'Software Installation Service',
        description: 'Professional installation of operating system and essential software',
        price: priceWith99(30, 50),
        quantity: 999,
        imagesUrl: '/products/services/software-install.jpg',
        sku: 'SERVICE-SOFTWARE-INSTALL',
        subType: 'installation',
        categoryId: servicesCategory.id
      }
    ];

    // Add service components
    let added = 0;
    for (const serviceData of serviceComponents) {
      try {
        await prisma.component.create({ data: serviceData });
        console.log(`✅ Added service: ${serviceData.name}`);
        added++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️ Service ${serviceData.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding ${serviceData.name}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Successfully added ${added} service components!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addServicesCategory();
