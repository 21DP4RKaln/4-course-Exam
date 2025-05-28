import { PrismaClient } from '@prisma/client';

export async function seedMotherboards(prisma: PrismaClient) {
  // Get all components with subType 'motherboard'
  const motherboardComponents = await prisma.component.findMany({
    where: { subType: 'motherboard' }
  });

  // Prepare motherboard entries
  const motherboards = [];

  // Define form factors
  const formFactors = ['ATX', 'mATX', 'E-ATX', 'ITX'];
  
  // Define socket types
  const sockets = ['LGA1700', 'AM5', 'LGA1200', 'AM4', 'sTRX4'];

  // For each motherboard component, create a detailed motherboard entry
  for (let i = 0; i < motherboardComponents.length; i++) {
    const component = motherboardComponents[i];
    
    // Parse existing specifications if available
    const specs = component.specifications ? JSON.parse(component.specifications.toString()) : {};
    
    motherboards.push({
      componentId: component.id,
      manufacturer: i % 3 === 0 ? 'ASUS' : (i % 3 === 1 ? 'Gigabyte' : 'MSI'),
      socket: specs.socket || sockets[i % sockets.length],
      chipset: i % 2 === 0 
        ? (i % 4 === 0 ? 'Z790' : (i % 4 === 1 ? 'H770' : 'B760'))
        : (i % 4 === 0 ? 'X670' : (i % 4 === 1 ? 'B650' : 'A620')),
      formFactor: formFactors[i % formFactors.length],
      memoryType: 'DDR5',
      memorySlots: 2 + (i % 3) * 2,
      maxMemory: 64 + (i % 3) * 64,
      pciSlots: `1x PCIe 5.0 x16, ${1 + (i % 3)}x PCIe 4.0 x16, ${2 + (i % 2)}x PCIe 3.0 x1`,
      m2Slots: 1 + (i % 4),
      sataConnectors: 4 + (i % 4),
      wifiBuiltIn: i % 3 === 0,
      bluetoothBuiltIn: i % 3 === 0
    });
  }
  // Add 10 more motherboards directly
  const additionalMotherboards = [
    {
      manufacturer: 'ASUS',
      socket: 'LGA1700',
      chipset: 'Z790',
      formFactor: 'ATX',
      memoryType: 'DDR5',
      memorySlots: 4,
      maxMemory: 128,
      pciSlots: '1x PCIe 5.0 x16, 2x PCIe 4.0 x16, 2x PCIe 3.0 x1',
      m2Slots: 4,
      sataConnectors: 6,
      wifiBuiltIn: true,
      bluetoothBuiltIn: true
    },
    {
      manufacturer: 'Gigabyte',
      socket: 'AM5',
      chipset: 'X670E',
      formFactor: 'ATX',
      memoryType: 'DDR5',
      memorySlots: 4,
      maxMemory: 128,
      pciSlots: '1x PCIe 5.0 x16, 1x PCIe 4.0 x16, 3x PCIe 3.0 x1',
      m2Slots: 4,
      sataConnectors: 8,
      wifiBuiltIn: true,
      bluetoothBuiltIn: true
    },
    {
      manufacturer: 'MSI',
      socket: 'LGA1700',
      chipset: 'B760',
      formFactor: 'mATX',
      memoryType: 'DDR4',
      memorySlots: 4,
      maxMemory: 128,
      pciSlots: '1x PCIe 4.0 x16, 1x PCIe 3.0 x16, 1x PCIe 3.0 x1',
      m2Slots: 2,
      sataConnectors: 6,
      wifiBuiltIn: false,
      bluetoothBuiltIn: false
    },
    {
      manufacturer: 'ASRock',
      socket: 'AM5',
      chipset: 'B650',
      formFactor: 'mATX',
      memoryType: 'DDR5',
      memorySlots: 2,
      maxMemory: 64,
      pciSlots: '1x PCIe 4.0 x16, 1x PCIe 3.0 x16, 1x PCIe 3.0 x1',
      m2Slots: 2,
      sataConnectors: 4,
      wifiBuiltIn: false,
      bluetoothBuiltIn: false
    },
    {
      manufacturer: 'ASUS',
      socket: 'AM4',
      chipset: 'X570',
      formFactor: 'ATX',
      memoryType: 'DDR4',
      memorySlots: 4,
      maxMemory: 128,
      pciSlots: '1x PCIe 4.0 x16, 2x PCIe 3.0 x16, 2x PCIe 3.0 x1',
      m2Slots: 3,
      sataConnectors: 8,
      wifiBuiltIn: true,
      bluetoothBuiltIn: true
    },
    {
      manufacturer: 'MSI',
      socket: 'LGA1700',
      chipset: 'Z790',
      formFactor: 'ITX',
      memoryType: 'DDR5',
      memorySlots: 2,
      maxMemory: 64,
      pciSlots: '1x PCIe 5.0 x16',
      m2Slots: 2,
      sataConnectors: 4,
      wifiBuiltIn: true,
      bluetoothBuiltIn: true
    },
    {
      manufacturer: 'Gigabyte',
      socket: 'AM5',
      chipset: 'B650I',
      formFactor: 'ITX',
      memoryType: 'DDR5',
      memorySlots: 2,
      maxMemory: 64,
      pciSlots: '1x PCIe 4.0 x16',
      m2Slots: 2,
      sataConnectors: 4,
      wifiBuiltIn: true,
      bluetoothBuiltIn: true
    },
    {
      manufacturer: 'EVGA',
      socket: 'LGA1700',
      chipset: 'Z690',
      formFactor: 'ATX',
      memoryType: 'DDR5',
      memorySlots: 4,
      maxMemory: 128,
      pciSlots: '1x PCIe 5.0 x16, 2x PCIe 4.0 x16, 3x PCIe 3.0 x1',
      m2Slots: 4,
      sataConnectors: 6,
      wifiBuiltIn: false,
      bluetoothBuiltIn: false
    },
    {
      manufacturer: 'ASRock',
      socket: 'LGA1700',
      chipset: 'H770',
      formFactor: 'ATX',
      memoryType: 'DDR4',
      memorySlots: 4,
      maxMemory: 128,
      pciSlots: '1x PCIe 4.0 x16, 1x PCIe 3.0 x16, 2x PCIe 3.0 x1',
      m2Slots: 2,
      sataConnectors: 6,
      wifiBuiltIn: false,
      bluetoothBuiltIn: false
    },
    {
      manufacturer: 'ASUS',
      socket: 'LGA1700',
      chipset: 'Z790',
      formFactor: 'E-ATX',
      memoryType: 'DDR5',
      memorySlots: 4,
      maxMemory: 192,
      pciSlots: '2x PCIe 5.0 x16, 1x PCIe 4.0 x16, 2x PCIe 3.0 x1',
      m2Slots: 5,
      sataConnectors: 8,
      wifiBuiltIn: true,
      bluetoothBuiltIn: true
    }
  ];
  
  // Create component entries for the new motherboards
  for (const motherboard of additionalMotherboards) {
    // Create a base component first
    const sku = `MB-${motherboard.manufacturer.toUpperCase()}-${motherboard.chipset}-${motherboard.formFactor}-${Date.now().toString().slice(-6)}`;
    const componentName = `${motherboard.manufacturer} ${motherboard.chipset} ${motherboard.formFactor} ${motherboard.socket}`;
    
    const categories = await prisma.componentCategory.findMany();
    const motherboardCategory = categories.find(c => c.slug === 'motherboard');
    if (!motherboardCategory) {
      throw new Error('Motherboard category not found');
    }
    
    // Calculate a reasonable price based on specs
    const basePrice = 120;
    const chipsetMultiplier = 
      motherboard.chipset.includes('Z7') ? 1.8 :
      motherboard.chipset.includes('X6') ? 1.7 :
      motherboard.chipset.includes('B6') || motherboard.chipset.includes('B7') ? 1.2 :
      1.0;
    
    const formFactorMultiplier =
      motherboard.formFactor === 'E-ATX' ? 1.4 :
      motherboard.formFactor === 'ATX' ? 1.2 :
      motherboard.formFactor === 'ITX' ? 1.3 :
      1.0;
    
    const price = Math.round(basePrice * chipsetMultiplier * formFactorMultiplier);
    
    const component = await prisma.component.create({
      data: {
        name: componentName,
        description: `${motherboard.socket} motherboard with ${motherboard.chipset} chipset in ${motherboard.formFactor} form factor`,
        price: price,
        stock: 10 + Math.floor(Math.random() * 15),
        imageUrl: `/products/motherboard/${motherboard.manufacturer.toLowerCase()}-${motherboard.chipset.toLowerCase()}-${motherboard.formFactor.toLowerCase()}.jpg`,
        categoryId: motherboardCategory.id,
        sku: sku,
        viewCount: Math.floor(Math.random() * 800) + 50,
        subType: 'motherboard',
        specifications: JSON.stringify({
          manufacturer: motherboard.manufacturer,
          socket: motherboard.socket,
          chipset: motherboard.chipset,
          formFactor: motherboard.formFactor
        })
      }
    });
    
    // Add to motherboard entries
    motherboards.push({
      componentId: component.id,
      ...motherboard
    });
  }

  // Insert motherboard entries
  for (const motherboard of motherboards) {
    await prisma.motherboard.upsert({
      where: { componentId: motherboard.componentId },
      update: motherboard,
      create: motherboard
    });
  }
}
