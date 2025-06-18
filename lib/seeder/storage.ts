import { PrismaClient } from '@prisma/client';

export async function seedStorage(prisma: PrismaClient) {
  // Iegūt visus komponentus ar apakštipu 'storage'
  const storageComponents = await prisma.component.findMany({
    where: { subType: 'storage' },
  });

  // Sagatavot krātuves ierakstus
  const storages = [];

  // Definēt krātuves tipus
  const storageTypes = ['NVMe SSD', 'SATA SSD', 'HDD'];

  // Definēt formas faktorus
  const formFactors = ['M.2 2280', 'M.2 2230', '2.5"', '3.5"'];

  // Definēt interfeisus
  const interfaces = ['PCIe 4.0', 'PCIe 3.0', 'SATA III', 'SATA III'];

  // Katram krātuves komponentam izveidot detalizētu krātuves ierakstu
  for (let i = 0; i < storageComponents.length; i++) {
    const component = storageComponents[i];

    // Parsēt esošās specifikācijas, ja tādas ir pieejamas
    const specs = component.specifications
      ? JSON.parse(component.specifications.toString())
      : {};

    const typeIndex = i % storageTypes.length;
    const formFactorIndex = typeIndex === 2 ? 3 : typeIndex === 1 ? 2 : i % 2;
    const interfaceIndex = typeIndex;

    storages.push({
      componentId: component.id,
      manufacturer:
        i % 5 === 0
          ? 'Samsung'
          : i % 5 === 1
            ? 'Western Digital'
            : i % 5 === 2
              ? 'Crucial'
              : i % 5 === 3
                ? 'Seagate'
                : 'Kingston',
      type: storageTypes[typeIndex],
      capacity: typeIndex === 2 ? (1 + (i % 6)) * 1000 : 256 * (1 + (i % 8)),
      formFactor: formFactors[formFactorIndex],
      interface: interfaces[interfaceIndex],
      readSpeed:
        typeIndex === 2
          ? 150
          : typeIndex === 1
            ? 550 + (i % 5) * 10
            : 5000 + (i % 10) * 500,
      writeSpeed:
        typeIndex === 2
          ? 140
          : typeIndex === 1
            ? 500 + (i % 5) * 10
            : 4000 + (i % 10) * 400,
      tbw: typeIndex !== 2 ? 300 + (i % 6) * 100 : null,
      cache: 64 * (1 + (i % 4)),
    });
  }
  // Pievienot 10 papildu krātuves ierīces tieši
  const additionalStorage = [
    {
      manufacturer: 'Samsung',
      type: 'NVMe SSD',
      capacity: 2000,
      formFactor: 'M.2 2280',
      interface: 'PCIe 5.0',
      readSpeed: 7500,
      writeSpeed: 6900,
      tbw: 1200,
      cache: 512,
    },
    {
      manufacturer: 'Western Digital',
      type: 'NVMe SSD',
      capacity: 4000,
      formFactor: 'M.2 2280',
      interface: 'PCIe 4.0',
      readSpeed: 5150,
      writeSpeed: 4900,
      tbw: 2400,
      cache: 256,
    },
    {
      manufacturer: 'Crucial',
      type: 'NVMe SSD',
      capacity: 1000,
      formFactor: 'M.2 2280',
      interface: 'PCIe 4.0',
      readSpeed: 4800,
      writeSpeed: 4100,
      tbw: 600,
      cache: 128,
    },
    {
      manufacturer: 'Kingston',
      type: 'SATA SSD',
      capacity: 1000,
      formFactor: '2.5"',
      interface: 'SATA III',
      readSpeed: 560,
      writeSpeed: 530,
      tbw: 600,
      cache: 256,
    },
    {
      manufacturer: 'Kioxia',
      type: 'NVMe SSD',
      capacity: 2000,
      formFactor: 'M.2 2280',
      interface: 'PCIe 4.0',
      readSpeed: 5500,
      writeSpeed: 4600,
      tbw: 800,
      cache: 256,
    },
    {
      manufacturer: 'Seagate',
      type: 'HDD',
      capacity: 8000,
      formFactor: '3.5"',
      interface: 'SATA III',
      readSpeed: 190,
      writeSpeed: 180,
      tbw: null,
      cache: 256,
    },
    {
      manufacturer: 'Western Digital',
      type: 'HDD',
      capacity: 18000,
      formFactor: '3.5"',
      interface: 'SATA III',
      readSpeed: 210,
      writeSpeed: 200,
      tbw: null,
      cache: 512,
    },
    {
      manufacturer: 'Corsair',
      type: 'NVMe SSD',
      capacity: 2000,
      formFactor: 'M.2 2280',
      interface: 'PCIe 4.0',
      readSpeed: 4950,
      writeSpeed: 4700,
      tbw: 1000,
      cache: 256,
    },
    {
      manufacturer: 'Sabrent',
      type: 'NVMe SSD',
      capacity: 4000,
      formFactor: 'M.2 2280',
      interface: 'PCIe 4.0',
      readSpeed: 7100,
      writeSpeed: 6600,
      tbw: 3000,
      cache: 256,
    },
    {
      manufacturer: 'Toshiba',
      type: 'HDD',
      capacity: 4000,
      formFactor: '3.5"',
      interface: 'SATA III',
      readSpeed: 180,
      writeSpeed: 175,
      tbw: null,
      cache: 128,
    },
  ];
  // Izveidot komponentu ierakstus jaunajām krātuves ierīcēm
  for (const storage of additionalStorage) {
    // Vispirms izveidot pamata komponentu
    const sku = `STORAGE-${storage.manufacturer.toUpperCase().replace(' ', '-')}-${storage.capacity < 1000 ? storage.capacity : storage.capacity / 1000}${storage.capacity < 1000 ? 'GB' : 'TB'}-${storage.type.replace(' ', '-')}-${Date.now().toString().slice(-6)}`;
    const sizeLabel =
      storage.capacity < 1000
        ? `${storage.capacity}GB`
        : `${storage.capacity / 1000}TB`;
    const componentName = `${storage.manufacturer} ${sizeLabel} ${storage.type} ${storage.formFactor}`;

    const categories = await prisma.componentCategory.findMany();
    const storageCategory = categories.find(c => c.slug === 'storage');
    if (!storageCategory) {
      throw new Error('Storage category not found');
    }

    // Aprēķināt saprātīgu cenu, pamatojoties uz specifikācijām
    let basePrice;
    let capacityMultiplier;

    if (storage.type === 'NVMe SSD') {
      basePrice = 90;
      capacityMultiplier = storage.capacity / 1000;
      if (storage.interface === 'PCIe 5.0') {
        basePrice *= 1.5;
      }
    } else if (storage.type === 'SATA SSD') {
      basePrice = 70;
      capacityMultiplier = storage.capacity / 500;
    } else {
      // HDD
      basePrice = 40;
      capacityMultiplier = storage.capacity / 2000;
    }

    const speedMultiplier =
      storage.type === 'NVMe SSD' ? Math.min(1.5, storage.readSpeed / 5000) : 1;

    const price = Math.round(basePrice * capacityMultiplier * speedMultiplier);

    let description = '';
    if (storage.type === 'NVMe SSD') {
      description = `${sizeLabel} ${storage.interface} NVMe SSD with up to ${storage.readSpeed}MB/s read speeds`;
    } else if (storage.type === 'SATA SSD') {
      description = `${sizeLabel} SATA SSD with ${storage.readSpeed}MB/s read speeds`;
    } else {
      description = `${sizeLabel} ${storage.manufacturer} hard drive with ${storage.cache}MB cache`;
    }

    const component = await prisma.component.create({
      data: {
        name: componentName,
        description: description,
        price: price,
        stock: 10 + Math.floor(Math.random() * 20),
        imageUrl: `/products/storage/${storage.manufacturer.toLowerCase().replace(' ', '-')}-${storage.type.toLowerCase().replace(' ', '-')}.jpg`,
        categoryId: storageCategory.id,
        sku: sku,
        viewCount: Math.floor(Math.random() * 700) + 100,
        subType: 'storage',
        specifications: JSON.stringify({
          manufacturer: storage.manufacturer,
          capacity: sizeLabel,
          type: storage.type,
          formFactor: storage.formFactor,
        }),
      },
    });

    // Pievienot krātuves ierakstiem
    storages.push({
      componentId: component.id,
      ...storage,
    });
  }

  // Ievietot krātuves ierakstus
  for (const storage of storages) {
    await prisma.storage.upsert({
      where: { componentId: storage.componentId },
      update: storage,
      create: storage,
    });
  }
}
