import { PrismaClient } from '@prisma/client';

export async function seedCases(prisma: PrismaClient) {
  // Get all components with subType 'case'
  const caseComponents = await prisma.component.findMany({
    where: { subType: 'case' }
  });

  // Prepare Case entries
  const cases = [];

  // For each Case component, create a detailed Case entry
  for (let i = 0; i < caseComponents.length; i++) {
    const component = caseComponents[i];
    
    // Parse existing specifications if available
    const specs = component.specifications ? JSON.parse(component.specifications.toString()) : {};
    
    // Manufacturers
    const manufacturers = ['Corsair', 'NZXT', 'Fractal Design', 'Lian Li', 'Phanteks', 'Cooler Master'];
    const manufacturer = specs.manufacturer || manufacturers[i % manufacturers.length];
    
    // Form factors
    const formFactors = ['ATX Full Tower', 'ATX Mid Tower', 'ATX Mid Tower', 'Micro-ATX', 'Mini-ITX'];
    const formFactor = specs.formFactor || formFactors[i % formFactors.length];
      // Models by manufacturer
    const models: Record<string, string[]> = {
      'Corsair': ['4000D', '5000D', 'iCUE 5000X', 'iCUE 7000X'],
      'NZXT': ['H510', 'H710', 'H7 Flow', 'H9 Elite'],
      'Fractal Design': ['Meshify C', 'Define 7', 'Pop Air', 'North'],
      'Lian Li': ['PC-O11D', 'Lancool II', 'O11 Dynamic EVO', 'A4-H2O'],
      'Phanteks': ['Eclipse P300A', 'Eclipse P500A', 'Enthoo Pro 2', 'Evolv X'],
      'Cooler Master': ['MasterBox TD500', 'H500P', 'HAF 700 EVO', 'Q300L']
    };
    
    // Ensure manufacturer is a valid key in the models object
    const validManufacturer = Object.keys(models).includes(manufacturer) ? manufacturer : 'Corsair';
    const model = specs.model || models[validManufacturer][i % models[validManufacturer].length];
    
    // Colors
    const colors = ['Black', 'White', 'Gray', 'Black/RGB', 'White/RGB'];
    const color = specs.color || colors[i % colors.length];
    
    // Side panel types
    const sidePanels = ['Tempered Glass', 'Tempered Glass', 'Acrylic', 'Solid'];
    const sidePanel = specs.sidePanel || sidePanels[i % sidePanels.length];
      // Store additional specs that aren't in the schema
    const additionalSpecs = {
      model,
      color,
      sidePanel,
      expansionSlots: 7 + (i % 3),
      radiatorSupport: ['120mm', '240mm', '280mm', '360mm', 'None'][i % 5],
      psuMount: ['Bottom', 'Top'][i % 2],
      weight: `${4 + (i % 10) * 0.5}kg`
    };
    
    // Update component specifications with the additional case specs
    await prisma.component.update({
      where: { id: component.id },
      data: {
        specifications: JSON.stringify({ ...specs, ...additionalSpecs })
      }
    });
    
    // Map materials from material
    const materialOptions = ['Steel', 'Aluminum', 'Steel/Tempered Glass', 'Steel/Aluminum'];
    const material = materialOptions[i % materialOptions.length];
    
    cases.push({
      componentId: component.id,
      manufacturer,
      formFactor,
      dimensions: `${400 + i % 100}mm x ${200 + i % 50}mm x ${450 + i % 100}mm`,
      materials: material,
      windowType: sidePanel,
      includedFans: i % 4,
      maxGpuLength: 320 + (i % 10) * 10,
      maxCpuHeight: 160 + (i % 5) * 5,
      maxPsuLength: 200 + (i % 8) * 10,
      usbPorts: `${i % 2 + 1}x USB 3.0, ${i % 2}x USB 2.0, ${i % 2 === 0 ? '1x USB-C' : ''}`.trim(),
      colorVariant: color
    });
  }
  // Add 10 more cases directly
  const additionalCases = [
    {
      manufacturer: 'be quiet!',
      formFactor: 'ATX Mid Tower',
      dimensions: '495mm x 232mm x 514mm',
      materials: 'Steel/Tempered Glass',
      windowType: 'Tempered Glass',
      includedFans: 3,
      maxGpuLength: 430,
      maxCpuHeight: 185,
      maxPsuLength: 288,
      usbPorts: '2x USB 3.0, 1x USB-C',
      colorVariant: 'Black',
      model: 'Pure Base 500DX',
      color: 'Black',
      sidePanel: 'Tempered Glass',
      expansionSlots: 7,
      radiatorSupport: '360mm',
      psuMount: 'Bottom',
      weight: '7.8kg'
    },
    {
      manufacturer: 'Fractal Design',
      formFactor: 'ATX Mid Tower',
      dimensions: '497mm x 240mm x 474mm',
      materials: 'Steel/Tempered Glass',
      windowType: 'Tempered Glass',
      includedFans: 3,
      maxGpuLength: 431,
      maxCpuHeight: 185,
      maxPsuLength: 250,
      usbPorts: '2x USB 3.0, 1x USB-C',
      colorVariant: 'Black',
      model: 'Torrent RGB',
      color: 'Black',
      sidePanel: 'Tempered Glass',
      expansionSlots: 7,
      radiatorSupport: '360mm',
      psuMount: 'Bottom',
      weight: '8.3kg'
    },
    {
      manufacturer: 'NZXT',
      formFactor: 'Mini-ITX',
      dimensions: '210mm x 210mm x 349mm',
      materials: 'Steel/Tempered Glass',
      windowType: 'Tempered Glass',
      includedFans: 2,
      maxGpuLength: 322,
      maxCpuHeight: 165,
      maxPsuLength: 125,
      usbPorts: '1x USB 3.0, 1x USB-C',
      colorVariant: 'White',
      model: 'H1 V2',
      color: 'White',
      sidePanel: 'Tempered Glass',
      expansionSlots: 2,
      radiatorSupport: '140mm',
      psuMount: 'Integrated',
      weight: '6.8kg'
    },
    {
      manufacturer: 'Corsair',
      formFactor: 'ATX Full Tower',
      dimensions: '560mm x 248mm x 570mm',
      materials: 'Steel/Tempered Glass',
      windowType: 'Tempered Glass',
      includedFans: 4,
      maxGpuLength: 450,
      maxCpuHeight: 190,
      maxPsuLength: 225,
      usbPorts: '4x USB 3.0, 1x USB-C',
      colorVariant: 'Black',
      model: '7000D Airflow',
      color: 'Black',
      sidePanel: 'Tempered Glass',
      expansionSlots: 9,
      radiatorSupport: '420mm',
      psuMount: 'Bottom',
      weight: '15.6kg'
    },
    {
      manufacturer: 'Lian Li',
      formFactor: 'ATX Mid Tower',
      dimensions: '462mm x 220mm x 450mm',
      materials: 'Aluminum/Tempered Glass',
      windowType: 'Tempered Glass',
      includedFans: 3,
      maxGpuLength: 380,
      maxCpuHeight: 172,
      maxPsuLength: 220,
      usbPorts: '2x USB 3.0, 1x USB-C',
      colorVariant: 'White',
      model: 'O11 Air Mini',
      color: 'White',
      sidePanel: 'Tempered Glass',
      expansionSlots: 7,
      radiatorSupport: '280mm',
      psuMount: 'Bottom',
      weight: '7.2kg'
    },
    {
      manufacturer: 'Phanteks',
      formFactor: 'ATX Full Tower',
      dimensions: '580mm x 240mm x 560mm',
      materials: 'Steel/Tempered Glass',
      windowType: 'Tempered Glass',
      includedFans: 3,
      maxGpuLength: 503,
      maxCpuHeight: 195,
      maxPsuLength: 240,
      usbPorts: '2x USB 3.0, 1x USB-C',
      colorVariant: 'White/RGB',
      model: 'Enthoo 719',
      color: 'White',
      sidePanel: 'Tempered Glass',
      expansionSlots: 8,
      radiatorSupport: '480mm',
      psuMount: 'Bottom',
      weight: '13.8kg'
    },
    {
      manufacturer: 'Cooler Master',
      formFactor: 'Micro-ATX',
      dimensions: '398mm x 209mm x 411mm',
      materials: 'Steel/Acrylic',
      windowType: 'Acrylic',
      includedFans: 2,
      maxGpuLength: 360,
      maxCpuHeight: 166,
      maxPsuLength: 180,
      usbPorts: '2x USB 3.0',
      colorVariant: 'Black/RGB',
      model: 'MB311L',
      color: 'Black',
      sidePanel: 'Acrylic',
      expansionSlots: 4,
      radiatorSupport: '240mm',
      psuMount: 'Bottom',
      weight: '5.3kg'
    },
    {
      manufacturer: 'Silverstone',
      formFactor: 'Mini-ITX',
      dimensions: '376mm x 176mm x 285mm',
      materials: 'Aluminum/Steel',
      windowType: 'Solid',
      includedFans: 1,
      maxGpuLength: 330,
      maxCpuHeight: 82,
      maxPsuLength: 150,
      usbPorts: '2x USB 3.0',
      colorVariant: 'Black',
      model: 'SG13',
      color: 'Black',
      sidePanel: 'Solid',
      expansionSlots: 2,
      radiatorSupport: '120mm',
      psuMount: 'Front',
      weight: '2.5kg'
    },
    {
      manufacturer: 'Thermaltake',
      formFactor: 'ATX Mid Tower',
      dimensions: '462mm x 227mm x 479mm',
      materials: 'Steel/Tempered Glass',
      windowType: 'Tempered Glass',
      includedFans: 3,
      maxGpuLength: 366,
      maxCpuHeight: 180,
      maxPsuLength: 220,
      usbPorts: '2x USB 3.0, 1x USB-C',
      colorVariant: 'Black/RGB',
      model: 'View 371',
      color: 'Black',
      sidePanel: 'Tempered Glass',
      expansionSlots: 7,
      radiatorSupport: '360mm',
      psuMount: 'Bottom',
      weight: '9.5kg'
    },
    {
      manufacturer: 'DeepCool',
      formFactor: 'ATX Mid Tower',
      dimensions: '480mm x 230mm x 505mm',
      materials: 'Steel/Tempered Glass',
      windowType: 'Tempered Glass',
      includedFans: 4,
      maxGpuLength: 380,
      maxCpuHeight: 175,
      maxPsuLength: 200,
      usbPorts: '2x USB 3.0, 1x USB-C',
      colorVariant: 'Black',
      model: 'CK560',
      color: 'Black',
      sidePanel: 'Tempered Glass',
      expansionSlots: 7,
      radiatorSupport: '360mm',
      psuMount: 'Bottom',
      weight: '8.7kg'
    }
  ];
  
  // Create component entries for the new cases
  for (const caseItem of additionalCases) {
    // Create a base component first
    const sku = `CASE-${caseItem.manufacturer.toUpperCase().replace(' ', '-').replace('!', '')}-${caseItem.model.replace(' ', '-')}-${Date.now().toString().slice(-6)}`;
    const componentName = `${caseItem.manufacturer} ${caseItem.model} ${caseItem.formFactor} ${caseItem.colorVariant}`;
    
    const categories = await prisma.componentCategory.findMany();
    const caseCategory = categories.find(c => c.slug === 'case');
    if (!caseCategory) {
      throw new Error('Case category not found');
    }
    
    // Calculate a reasonable price based on specs
    const basePrice = 80;
    
    const formFactorMultiplier = 
      caseItem.formFactor === 'ATX Full Tower' ? 1.5 :
      caseItem.formFactor === 'ATX Mid Tower' ? 1.2 :
      caseItem.formFactor === 'Mini-ITX' ? 1.1 : 1.0;
    
    const materialMultiplier = 
      caseItem.materials.includes('Aluminum') ? 1.3 : 1.0;
      
    const fansMultiplier = 1 + (caseItem.includedFans * 0.1);
    
    const price = Math.round(basePrice * formFactorMultiplier * materialMultiplier * fansMultiplier);
    
    const component = await prisma.component.create({
      data: {
        name: componentName,
        description: `${caseItem.manufacturer} ${caseItem.model} ${caseItem.formFactor} PC case with ${caseItem.windowType} window and ${caseItem.includedFans} included fans`,
        price: price,
        stock: 5 + Math.floor(Math.random() * 10),
        imageUrl: `/products/case/${caseItem.manufacturer.toLowerCase().replace(' ', '-').replace('!', '')}-${caseItem.model.toLowerCase().replace(' ', '-')}.jpg`,
        categoryId: caseCategory.id,
        sku: sku,
        viewCount: Math.floor(Math.random() * 500) + 50,
        subType: 'case',
        specifications: JSON.stringify({
          manufacturer: caseItem.manufacturer,
          model: caseItem.model,
          formFactor: caseItem.formFactor,
          color: caseItem.color,
          sidePanel: caseItem.sidePanel,
          expansionSlots: caseItem.expansionSlots,
          radiatorSupport: caseItem.radiatorSupport,
          psuMount: caseItem.psuMount,
          weight: caseItem.weight
        })
      }
    });
    
    // Add to case entries
    cases.push({
      componentId: component.id,
      manufacturer: caseItem.manufacturer,
      formFactor: caseItem.formFactor,
      dimensions: caseItem.dimensions,
      materials: caseItem.materials,
      windowType: caseItem.windowType,
      includedFans: caseItem.includedFans,
      maxGpuLength: caseItem.maxGpuLength,
      maxCpuHeight: caseItem.maxCpuHeight,
      maxPsuLength: caseItem.maxPsuLength,
      usbPorts: caseItem.usbPorts,
      colorVariant: caseItem.colorVariant
    });
  }

  // Insert Case entries
  for (const caseItem of cases) {
    await prisma.case.upsert({
      where: { componentId: caseItem.componentId },
      update: caseItem,
      create: caseItem
    });
  }
}
