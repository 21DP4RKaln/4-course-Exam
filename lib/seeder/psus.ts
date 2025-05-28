import { PrismaClient } from '@prisma/client';

export async function seedPSUs(prisma: PrismaClient) {
  // Get all components with subType 'psu'
  const psuComponents = await prisma.component.findMany({
    where: { subType: 'psu' }
  });

  // Prepare PSU entries
  const psus = [];

  // For each PSU component, create a detailed PSU entry
  for (let i = 0; i < psuComponents.length; i++) {
    const component = psuComponents[i];
    
    // Parse existing specifications if available
    const specs = component.specifications ? JSON.parse(component.specifications.toString()) : {};      // Manufacturers
    const manufacturers = ['Corsair', 'EVGA', 'Seasonic', 'be quiet!', 'Thermaltake', 'Cooler Master', 'Fractal Design', 'SilverStone', 'ASUS', 'MSI'] as const;
    type ManufacturerType = typeof manufacturers[number] | string;
    const manufacturer = (specs.manufacturer || manufacturers[i % manufacturers.length]) as ManufacturerType;
      // Models by manufacturer
    const models: Record<string, string[]> = {
      'Corsair': ['RM Series', 'HX Series', 'AX Series'],
      'EVGA': ['SuperNOVA', 'BQ Series', 'G Series'],
      'Seasonic': ['Prime', 'Focus', 'Core'],
      'be quiet!': ['Straight Power', 'Pure Power', 'Dark Power'],
      'Thermaltake': ['Toughpower', 'Smart', 'Grand RGB'],
      'Cooler Master': ['MWE Gold', 'V Series', 'MasterWatt'],
      'Fractal Design': ['Ion+', 'Ion Gold', 'Newton'],
      'SilverStone': ['Strider', 'SX Series', 'Essential'],
      'ASUS': ['ROG Thor', 'ROG Strix', 'TUF Gaming'],
      'MSI': ['MPG Series', 'MAG Series', 'MEG Series']
    };
    
    const modelSeries = models[manufacturer][i % models[manufacturer].length];
    
    // Common PSU wattages
    const wattages = [550, 650, 750, 850, 1000, 1200];
    const wattage = specs.wattage || wattages[i % wattages.length];
    
    // 80 Plus certifications
    const certifications = ['80 PLUS Bronze', '80 PLUS Silver', '80 PLUS Gold', '80 PLUS Platinum', '80 PLUS Titanium'];
    const certification = specs.certification || certifications[i % certifications.length];
      // Additional specifications that don't match the schema
    const additionalSpecs = {
      model: `${modelSeries} ${wattage}W`,
      atx_version: `ATX 3.${i % 2}`,
      pcie_gen5: i % 2 === 0,
      dimensions: `150mm x 86mm x ${140 + (i % 4) * 5}mm`,
      warranty: [5, 7, 10][i % 3]
    };
    
    psus.push({
      componentId: component.id,
      manufacturer,
      wattage,
      efficiency: certification,
      modular: i % 3 === 0 ? 'Full' : (i % 3 === 1 ? 'Semi' : 'None'),
      fanSize: [120, 135, 140][i % 3],
      length: 140 + (i % 4) * 5, // Extract length in mm from dimensions
      atx3Support: i % 2 === 0, // Use the correct field name from schema
      additionalSpecs // Save for updating specifications later
    });
  }  // Add 10 more PSUs directly
  const additionalPSUs = [
    {
      manufacturer: 'Corsair',
      wattage: 1600,
      efficiency: '80 PLUS Titanium',
      modular: 'Full',
      fanSize: 140,
      length: 200,
      atx3Support: true,
      additionalSpecs: {
        model: 'AX Series 1600W',
        atx_version: 'ATX 3.1',
        pcie_gen5: true,
        dimensions: '200mm x 86mm x 150mm',
        warranty: 10
      }
    },
    {
      manufacturer: 'EVGA',
      wattage: 1300,
      efficiency: '80 PLUS Platinum',
      modular: 'Full',
      fanSize: 135,
      length: 190,
      atx3Support: true,
      additionalSpecs: {
        model: 'SuperNOVA 1300 P+',
        atx_version: 'ATX 3.0',
        pcie_gen5: true,
        dimensions: '190mm x 86mm x 150mm',
        warranty: 10
      }
    },
    {
      manufacturer: 'Seasonic',
      wattage: 1000,
      efficiency: '80 PLUS Gold',
      modular: 'Full',
      fanSize: 135,
      length: 170,
      atx3Support: true,
      additionalSpecs: {
        model: 'Focus GX-1000',
        atx_version: 'ATX 3.0',
        pcie_gen5: true,
        dimensions: '170mm x 86mm x 150mm',
        warranty: 10
      }
    },
    {
      manufacturer: 'be quiet!',
      wattage: 1200,
      efficiency: '80 PLUS Titanium',
      modular: 'Full',
      fanSize: 135,
      length: 180,
      atx3Support: true,
      additionalSpecs: {
        model: 'Dark Power Pro 12 1200W',
        atx_version: 'ATX 3.0',
        pcie_gen5: true,
        dimensions: '180mm x 86mm x 150mm',
        warranty: 10
      }
    },
    {
      manufacturer: 'Thermaltake',
      wattage: 1500,
      efficiency: '80 PLUS Gold',
      modular: 'Full',
      fanSize: 140,
      length: 180,
      atx3Support: true,
      additionalSpecs: {
        model: 'Toughpower GF3 1500W',
        atx_version: 'ATX 3.0',
        pcie_gen5: true,
        dimensions: '180mm x 86mm x 150mm',
        warranty: 10
      }
    },
    {
      manufacturer: 'Cooler Master',
      wattage: 850,
      efficiency: '80 PLUS Gold',
      modular: 'Semi',
      fanSize: 120,
      length: 160,
      atx3Support: true,
      additionalSpecs: {
        model: 'MWE Gold 850 V2',
        atx_version: 'ATX 3.0',
        pcie_gen5: true,
        dimensions: '160mm x 86mm x 150mm',
        warranty: 5
      }
    },
    {
      manufacturer: 'Fractal Design',
      wattage: 750,
      efficiency: '80 PLUS Gold',
      modular: 'Full',
      fanSize: 140,
      length: 150,
      atx3Support: true,
      additionalSpecs: {
        model: 'Ion+ 2 Platinum 750W',
        atx_version: 'ATX 3.0',
        pcie_gen5: true,
        dimensions: '150mm x 86mm x 150mm',
        warranty: 10
      }
    },
    {
      manufacturer: 'SilverStone',
      wattage: 700,
      efficiency: '80 PLUS Gold',
      modular: 'Full',
      fanSize: 120,
      length: 140,
      atx3Support: false,
      additionalSpecs: {
        model: 'SX700-G',
        atx_version: 'ATX 2.4',
        pcie_gen5: false,
        dimensions: '140mm x 86mm x 150mm',
        warranty: 3
      }
    },
    {
      manufacturer: 'ASUS',
      wattage: 1200,
      efficiency: '80 PLUS Platinum',
      modular: 'Full',
      fanSize: 135,
      length: 170,
      atx3Support: true,
      additionalSpecs: {
        model: 'ROG Thor 1200P2',
        atx_version: 'ATX 3.0',
        pcie_gen5: true,
        dimensions: '170mm x 86mm x 150mm',
        warranty: 10
      }
    },
    {
      manufacturer: 'MSI',
      wattage: 1000,
      efficiency: '80 PLUS Gold',
      modular: 'Full',
      fanSize: 135,
      length: 160,
      atx3Support: true,
      additionalSpecs: {
        model: 'MPG A1000G',
        atx_version: 'ATX 3.0',
        pcie_gen5: true,
        dimensions: '160mm x 86mm x 150mm',
        warranty: 10
      }
    }
  ];
  
  // Create component entries for the new PSUs
  for (const psu of additionalPSUs) {
    // Create a base component first
    const sku = `PSU-${psu.manufacturer.toUpperCase().replace(' ', '-').replace('!', '')}-${psu.wattage}W-${psu.efficiency.replace(/\\s+/g, '-')}-${Date.now().toString().slice(-6)}`;
    const componentName = `${psu.manufacturer} ${psu.additionalSpecs.model}`;
    
    const categories = await prisma.componentCategory.findMany();
    const psuCategory = categories.find(c => c.slug === 'psu');
    if (!psuCategory) {
      throw new Error('PSU category not found');
    }
    
    // Calculate a reasonable price based on specs
    const basePrice = 80;
    const wattageMultiplier = psu.wattage / 500;
    
    const efficiencyMultiplier = 
      psu.efficiency.includes('Titanium') ? 1.8 :
      psu.efficiency.includes('Platinum') ? 1.5 :
      psu.efficiency.includes('Gold') ? 1.2 :
      psu.efficiency.includes('Silver') ? 1.1 : 1.0;
    
    const modularMultiplier = 
      psu.modular === 'Full' ? 1.2 :
      psu.modular === 'Semi' ? 1.1 : 1.0;
      
    const price = Math.round(basePrice * wattageMultiplier * efficiencyMultiplier * modularMultiplier);
    
    const component = await prisma.component.create({
      data: {
        name: componentName,
        description: `${psu.wattage}W ${psu.efficiency} ${psu.modular} modular power supply${psu.atx3Support ? ' with ATX 3.0 support' : ''}`,
        price: price,
        stock: 5 + Math.floor(Math.random() * 15),
        imageUrl: `/products/psu/${psu.manufacturer.toLowerCase().replace(' ', '-').replace('!', '')}-${psu.wattage.toString()}.jpg`,
        categoryId: psuCategory.id,
        sku: sku,
        viewCount: Math.floor(Math.random() * 500) + 50,
        subType: 'psu',
        specifications: JSON.stringify({
          manufacturer: psu.manufacturer,
          wattage: psu.wattage,
          efficiency: psu.efficiency,
          modular: psu.modular,
          fanSize: psu.fanSize,
          length: psu.length,
          atx3Support: psu.atx3Support,
          ...psu.additionalSpecs
        })
      }
    });
    
    // Add to PSU entries
    psus.push({
      componentId: component.id,
      manufacturer: psu.manufacturer,
      wattage: psu.wattage,
      efficiency: psu.efficiency,
      modular: psu.modular,
      fanSize: psu.fanSize,
      length: psu.length,
      atx3Support: psu.atx3Support,
      additionalSpecs: psu.additionalSpecs
    });
  }

  // Insert PSU entries
  for (const psu of psus) {
    // Extract additionalSpecs before creating the PSU
    const { additionalSpecs, ...psuData } = psu;
    
    // Create or update the PSU with schema-compliant data
    await prisma.pSU.upsert({
      where: { componentId: psuData.componentId },
      update: psuData,
      create: psuData
    });
    
    // Update the component with the additional specifications
    await prisma.component.update({
      where: { id: psuData.componentId },
      data: {
        specifications: JSON.stringify({
          manufacturer: psuData.manufacturer,
          wattage: psuData.wattage,
          efficiency: psuData.efficiency,
          modular: psuData.modular,
          fanSize: psuData.fanSize,
          length: psuData.length,
          atx3Support: psuData.atx3Support,
          ...additionalSpecs
        })
      }
    });
  }
}
