import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  try {
    const categoryData = [
      { name: 'CPU', description: 'Central Processing Unit' },
      { name: 'Motherboard', description: 'Main circuit board' },
      { name: 'GPU', description: 'Graphics Processing Unit' },
      { name: 'RAM', description: 'Random Access Memory' },
      { name: 'Storage', description: 'Data storage devices' },
      { name: 'Case', description: 'Computer chassis' },
      { name: 'Cooling', description: 'Cooling solutions' },
      { name: 'PSU', description: 'Power Supply Unit' },
    ]

    console.log('Creating component categories...')
    for (const category of categoryData) {
      await prisma.componentCategory.upsert({
        where: { id: category.name.toLowerCase() },
        update: {},
        create: {
          id: category.name.toLowerCase(),
          name: category.name,
          description: category.description,
        },
      })
    }
 
    const cpuComponents = [
      {
        name: 'Intel Core i9-14900K',
        description: 'High-end desktop CPU with 24 cores and 32 threads',
        price: 649.99,
        stock: 12,
        categoryId: 'cpu',
      },
      {
        name: 'AMD Ryzen 9 7950X',
        description: '16-core, 32-thread desktop CPU with high multi-thread performance',
        price: 599.99,
        stock: 8,
        categoryId: 'cpu',
      },
      {
        name: 'Intel Core i7-14700K',
        description: 'High-performance CPU with 20 cores and 28 threads',
        price: 449.99,
        stock: 15,
        categoryId: 'cpu',
      },
      {
        name: 'AMD Ryzen 7 7800X3D',
        description: '8-core CPU with 3D V-Cache, excellent for gaming',
        price: 479.99,
        stock: 10,
        categoryId: 'cpu',
      },
      {
        name: 'Intel Core i5-14600K',
        description: 'Mid-range CPU with 14 cores and 20 threads',
        price: 329.99,
        stock: 20,
        categoryId: 'cpu',
      },
    ]

    console.log('Creating CPU components...')
    for (const component of cpuComponents) {
      await prisma.component.upsert({
        where: { id: `${component.categoryId}-${component.name}` },
        update: {},
        create: {
          id: `${component.categoryId}-${component.name}`,
          ...component,
        },
      })
    }

    // Create GPU components
    const gpuComponents = [
      {
        name: 'NVIDIA GeForce RTX 4090',
        description: 'Flagship graphics card with 24GB GDDR6X memory',
        price: 1599.99,
        stock: 5,
        categoryId: 'gpu',
      },
      {
        name: 'AMD Radeon RX 7900 XTX',
        description: 'High-end graphics card with 24GB GDDR6 memory',
        price: 999.99,
        stock: 7,
        categoryId: 'gpu',
      },
      {
        name: 'NVIDIA GeForce RTX 4080',
        description: 'High-performance graphics card with 16GB GDDR6X memory',
        price: 1199.99,
        stock: 10,
        categoryId: 'gpu',
      },
      {
        name: 'AMD Radeon RX 7800 XT',
        description: 'High-value graphics card with 16GB GDDR6 memory',
        price: 499.99,
        stock: 12,
        categoryId: 'gpu',
      },
      {
        name: 'NVIDIA GeForce RTX 4060 Ti',
        description: 'Mid-range graphics card with 8GB GDDR6 memory',
        price: 399.99,
        stock: 15,
        categoryId: 'gpu',
      },
    ]

    console.log('Creating GPU components...')
    for (const component of gpuComponents) {
      await prisma.component.upsert({
        where: { id: `${component.categoryId}-${component.name}` },
        update: {},
        create: {
          id: `${component.categoryId}-${component.name}`,
          ...component,
        },
      })
    }

    // Create Motherboard components
    const motherboardComponents = [
      {
        name: 'ASUS ROG Maximus Z790',
        description: 'High-end motherboard for Intel 12th-14th gen CPUs',
        price: 549.99,
        stock: 8,
        categoryId: 'motherboard',
      },
      {
        name: 'MSI MEG X670E ACE',
        description: 'Premium motherboard for AMD AM5 socket CPUs',
        price: 599.99,
        stock: 6,
        categoryId: 'motherboard',
      },
      {
        name: 'GIGABYTE Z790 AORUS MASTER',
        description: 'Feature-rich motherboard for Intel 12th-14th gen CPUs',
        price: 499.99,
        stock: 9,
        categoryId: 'motherboard',
      },
      {
        name: 'ASRock B650 PG Riptide',
        description: 'Mid-range motherboard for AMD AM5 socket CPUs',
        price: 189.99,
        stock: 14,
        categoryId: 'motherboard',
      },
      {
        name: 'MSI MAG B760 TOMAHAWK',
        description: 'Mid-range motherboard for Intel 12th-14th gen CPUs',
        price: 199.99,
        stock: 12,
        categoryId: 'motherboard',
      },
    ]

    console.log('Creating Motherboard components...')
    for (const component of motherboardComponents) {
      await prisma.component.upsert({
        where: { id: `${component.categoryId}-${component.name}` },
        update: {},
        create: {
          id: `${component.categoryId}-${component.name}`,
          ...component,
        },
      })
    }

    // Create RAM components
    const ramComponents = [
      {
        name: 'Corsair Dominator Platinum RGB 32GB (2x16GB) DDR5-6000',
        description: 'High-performance RGB RAM for gaming and content creation',
        price: 189.99,
        stock: 10,
        categoryId: 'ram',
      },
      {
        name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6400',
        description: 'Premium RGB RAM with tight timings',
        price: 199.99,
        stock: 8,
        categoryId: 'ram',
      },
      {
        name: 'Kingston FURY Beast 32GB (2x16GB) DDR5-5600',
        description: 'High-performance memory for gaming PCs',
        price: 164.99,
        stock: 15,
        categoryId: 'ram',
      },
      {
        name: 'Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4-3600',
        description: 'RGB RAM for systems using DDR4',
        price: 124.99,
        stock: 20,
        categoryId: 'ram',
      },
      {
        name: 'G.Skill Ripjaws V 16GB (2x8GB) DDR4-3200',
        description: 'Reliable memory for budget builds',
        price: 69.99,
        stock: 25,
        categoryId: 'ram',
      },
    ]

    console.log('Creating RAM components...')
    for (const component of ramComponents) {
      await prisma.component.upsert({
        where: { id: `${component.categoryId}-${component.name}` },
        update: {},
        create: {
          id: `${component.categoryId}-${component.name}`,
          ...component,
        },
      })
    }

    // Create Storage components
    const storageComponents = [
      {
        name: 'Samsung 990 PRO 2TB NVMe SSD',
        description: 'High-performance NVMe SSD with PCIe 4.0',
        price: 199.99,
        stock: 15,
        categoryId: 'storage',
      },
      {
        name: 'WD_BLACK SN850X 1TB NVMe SSD',
        description: 'Gaming-focused NVMe SSD with heatsink option',
        price: 149.99,
        stock: 20,
        categoryId: 'storage',
      },
      {
        name: 'Crucial T700 2TB NVMe SSD',
        description: 'PCIe 5.0 NVMe SSD for maximum performance',
        price: 299.99,
        stock: 8,
        categoryId: 'storage',
      },
      {
        name: 'Samsung 870 EVO 1TB SATA SSD',
        description: 'Reliable SATA SSD for older systems',
        price: 89.99,
        stock: 25,
        categoryId: 'storage',
      },
      {
        name: 'Seagate Barracuda 4TB HDD',
        description: '3.5" hard drive for mass storage',
        price: 94.99,
        stock: 30,
        categoryId: 'storage',
      },
    ]

    console.log('Creating Storage components...')
    for (const component of storageComponents) {
      await prisma.component.upsert({
        where: { id: `${component.categoryId}-${component.name}` },
        update: {},
        create: {
          id: `${component.categoryId}-${component.name}`,
          ...component,
        },
      })
    }

    // Create PSU components
    const psuComponents = [
      {
        name: 'Corsair RM1000x 1000W',
        description: '80+ Gold fully modular power supply',
        price: 189.99,
        stock: 12,
        categoryId: 'psu',
      },
      {
        name: 'EVGA SuperNOVA 850 G6',
        description: '80+ Gold compact fully modular power supply',
        price: 149.99,
        stock: 18,
        categoryId: 'psu',
      },
      {
        name: 'Seasonic PRIME TX-1300',
        description: '80+ Titanium fully modular power supply',
        price: 349.99,
        stock: 5,
        categoryId: 'psu',
      },
      {
        name: 'be quiet! Straight Power 11 750W',
        description: '80+ Gold modular power supply with silent operation',
        price: 139.99,
        stock: 15,
        categoryId: 'psu',
      },
      {
        name: 'Corsair CX650M 650W',
        description: '80+ Bronze semi-modular power supply',
        price: 89.99,
        stock: 22,
        categoryId: 'psu',
      },
    ]

    console.log('Creating PSU components...')
    for (const component of psuComponents) {
      await prisma.component.upsert({
        where: { id: `${component.categoryId}-${component.name}` },
        update: {},
        create: {
          id: `${component.categoryId}-${component.name}`,
          ...component,
        },
      })
    }

    // Create Case components
    const caseComponents = [
      {
        name: 'Lian Li O11 Dynamic EVO',
        description: 'Premium mid-tower case with excellent airflow',
        price: 159.99,
        stock: 10,
        categoryId: 'case',
      },
      {
        name: 'Fractal Design Meshify 2',
        description: 'High-airflow mid-tower case with mesh front panel',
        price: 149.99,
        stock: 12,
        categoryId: 'case',
      },
      {
        name: 'Corsair 5000D Airflow',
        description: 'Mid-tower case optimized for airflow',
        price: 169.99,
        stock: 8,
        categoryId: 'case',
      },
      {
        name: 'NZXT H7 Flow',
        description: 'Modern mid-tower case with clean design',
        price: 129.99,
        stock: 15,
        categoryId: 'case',
      },
      {
        name: 'Phanteks Eclipse P500A',
        description: 'High-performance airflow case',
        price: 139.99,
        stock: 9,
        categoryId: 'case',
      },
    ]

    console.log('Creating Case components...')
    for (const component of caseComponents) {
      await prisma.component.upsert({
        where: { id: `${component.categoryId}-${component.name}` },
        update: {},
        create: {
          id: `${component.categoryId}-${component.name}`,
          ...component,
        },
      })
    }

    // Create Cooling components
    const coolingComponents = [
      {
        name: 'NZXT Kraken Z73',
        description: '360mm AIO liquid cooler with LCD display',
        price: 249.99,
        stock: 7,
        categoryId: 'cooling',
      },
      {
        name: 'Corsair iCUE H150i ELITE',
        description: '360mm AIO liquid cooler with RGB',
        price: 189.99,
        stock: 10,
        categoryId: 'cooling',
      },
      {
        name: 'Noctua NH-D15',
        description: 'Premium dual-tower air cooler',
        price: 89.99,
        stock: 15,
        categoryId: 'cooling',
      },
      {
        name: 'be quiet! Dark Rock Pro 4',
        description: 'Silent high-performance air cooler',
        price: 84.99,
        stock: 12,
        categoryId: 'cooling',
      },
      {
        name: 'Arctic Liquid Freezer II 240',
        description: 'Value 240mm AIO liquid cooler',
        price: 99.99,
        stock: 18,
        categoryId: 'cooling',
      },
    ]

    console.log('Creating Cooling components...')
    for (const component of coolingComponents) {
      await prisma.component.upsert({
        where: { id: `${component.categoryId}-${component.name}` },
        update: {},
        create: {
          id: `${component.categoryId}-${component.name}`,
          ...component,
        },
      })
    }

    // Create an admin user
    console.log('Creating admin user...')
    await prisma.user.upsert({
      where: { email: 'admin@ivapro.com' },
      update: {},
      create: {
        email: 'admin@ivapro.com',
        password: '$2a$10$NUYSUzxsUPWOAEGgCuPOHOdpCzYjoGvHJRRTfOxwP4mh6uJUcJDaC', // Password: admin123
        name: 'Admin User',
        role: 'ADMIN',
      },
    })

    // Create a specialist user
    console.log('Creating specialist user...')
    await prisma.user.upsert({
      where: { email: 'specialist@ivapro.com' },
      update: {},
      create: {
        email: 'specialist@ivapro.com',
        password: '$2a$10$NUYSUzxsUPWOAEGgCuPOHOdpCzYjoGvHJRRTfOxwP4mh6uJUcJDaC', // Password: admin123
        name: 'Specialist User',
        role: 'SPECIALIST',
      },
    })

    // Create a regular user
    console.log('Creating regular user...')
    await prisma.user.upsert({
      where: { email: 'user@ivapro.com' },
      update: {},
      create: {
        email: 'user@ivapro.com',
        password: '$2a$10$NUYSUzxsUPWOAEGgCuPOHOdpCzYjoGvHJRRTfOxwP4mh6uJUcJDaC', // Password: admin123
        name: 'Test User',
        role: 'USER',
      },
    })

    console.log('Seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Execute the seed function
seed()
  .then(() => console.log('Seeding completed!'))
  .catch(e => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })