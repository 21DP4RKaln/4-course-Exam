import { PrismaClient, Role, ConfigStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Seed the database with initial data
 */
async function main() {
  console.log('🌱 Starting database seeding...');

  await seedUsers()

  await seedComponentCategories()

  await seedSpecificationKeys()

  await seedComponents()

  await seedConfigurations()

  console.log('Seeding completed successfully!')
}

/**
 * Delete all existing data (use with caution)
 */
async function cleanDatabase() {
  console.log('Cleaning database...')

  await prisma.order.deleteMany({})
  await prisma.configItem.deleteMany({})
  await prisma.componentSpec.deleteMany({})
  await prisma.configuration.deleteMany({})
  await prisma.component.deleteMany({})
  await prisma.specificationKey.deleteMany({})
  await prisma.componentCategory.deleteMany({})
  await prisma.user.deleteMany({})
  
  console.log('Database cleaned.')
}

/**
 * Create default users
 */
async function seedUsers() {
  console.log('Creating users...')
  
  const defaultPassword = await bcrypt.hash('admin123', 10)
  
  // Create admin user
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@ivapro.com' }
  })
  
  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: 'admin@ivapro.com',
        password: defaultPassword,
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        role: Role.ADMIN
      }
    })
    console.log('Admin user created.')
  } else {
    console.log('Admin user already exists.')
  }
  
  // Create specialist user
  const specialistExists = await prisma.user.findUnique({
    where: { email: 'specialist@ivapro.com' }
  })
  
  if (!specialistExists) {
    await prisma.user.create({
      data: {
        email: 'specialist@ivapro.com',
        password: defaultPassword,
        name: 'Specialist User',
        firstName: 'Specialist',
        lastName: 'User',
        role: Role.SPECIALIST
      }
    })
    console.log('Specialist user created.')
  } else {
    console.log('Specialist user already exists.')
  }
  
  // Create regular user
  const userExists = await prisma.user.findUnique({
    where: { email: 'user@ivapro.com' }
  })
  
  if (!userExists) {
    await prisma.user.create({
      data: {
        email: 'user@ivapro.com',
        password: defaultPassword,
        name: 'Regular User',
        firstName: 'Regular',
        lastName: 'User',
        role: Role.USER
      }
    })
    console.log('Regular user created.')
  } else {
    console.log('Regular user already exists.')
  }
}

/**
 * Create component categories
 */
async function seedComponentCategories() {
  console.log('Creating component categories...')
  
  // PC component categories
  const componentCategories = [
    { id: 'cpu', name: 'CPU', slug: 'cpu', description: 'Central Processing Unit', displayOrder: 1, type: 'component' },
    { id: 'motherboard', name: 'Motherboard', slug: 'motherboard', description: 'Computer Motherboard', displayOrder: 2, type: 'component' },
    { id: 'gpu', name: 'Graphics Card', slug: 'gpu', description: 'Graphics Processing Unit', displayOrder: 3, type: 'component' },
    { id: 'ram', name: 'Memory', slug: 'ram', description: 'Random Access Memory', displayOrder: 4, type: 'component' },
    { id: 'storage', name: 'Storage', slug: 'storage', description: 'Storage Devices', displayOrder: 5, type: 'component' },
    { id: 'psu', name: 'Power Supply', slug: 'psu', description: 'Power Supply Unit', displayOrder: 6, type: 'component' },
    { id: 'case', name: 'Case', slug: 'case', description: 'Computer Case', displayOrder: 7, type: 'component' },
    { id: 'cooling', name: 'Cooling', slug: 'cooling', description: 'CPU and System Cooling', displayOrder: 8, type: 'component' },
  ]
  
  // Peripheral categories
  const peripheralCategories = [
    { id: 'keyboards', name: 'Keyboards', slug: 'keyboards', description: 'Gaming and Office Keyboards', displayOrder: 10, type: 'peripheral' },
    { id: 'mice', name: 'Mice', slug: 'mice', description: 'Gaming and Office Mice', displayOrder: 11, type: 'peripheral' },
    { id: 'monitors', name: 'Monitors', slug: 'monitors', description: 'Computer Monitors', displayOrder: 12, type: 'peripheral' },
    { id: 'headphones', name: 'Headphones', slug: 'headphones', description: 'Gaming Headsets and Headphones', displayOrder: 13, type: 'peripheral' },
    { id: 'speakers', name: 'Speakers', slug: 'speakers', description: 'Computer Speakers', displayOrder: 14, type: 'peripheral' },
    { id: 'gamepads', name: 'Gamepads', slug: 'gamepads', description: 'Gaming Controllers', displayOrder: 15, type: 'peripheral' }
  ]
 
  const allCategories = [...componentCategories, ...peripheralCategories]

  for (const category of allCategories) {
    const exists = await prisma.componentCategory.findUnique({
      where: { id: category.id }
    })
    
    if (!exists) {
      await prisma.componentCategory.create({
        data: category
      })
      console.log(`Created category: ${category.name}`)
    } else {
      console.log(`Category ${category.name} already exists.`)
    }
  }
}

/**
 * Create specification keys for components
 */
async function seedSpecificationKeys() {
  console.log('Creating specification keys...')
  
  const specKeys = [
    // CPU specs
    { name: 'brand', displayName: 'Brand', categoryId: 'cpu' },
    { name: 'series', displayName: 'Series', categoryId: 'cpu' },
    { name: 'model', displayName: 'Model', categoryId: 'cpu' },
    { name: 'cores', displayName: 'Cores', categoryId: 'cpu' },
    { name: 'threads', displayName: 'Threads', categoryId: 'cpu' },
    { name: 'baseClock', displayName: 'Base Clock', categoryId: 'cpu' },
    { name: 'boostClock', displayName: 'Boost Clock', categoryId: 'cpu' },
    { name: 'tdp', displayName: 'TDP', categoryId: 'cpu' },
    { name: 'socket', displayName: 'Socket', categoryId: 'cpu' },
    
    // Motherboard specs
    { name: 'brand', displayName: 'Brand', categoryId: 'motherboard' },
    { name: 'chipset', displayName: 'Chipset', categoryId: 'motherboard' },
    { name: 'formFactor', displayName: 'Form Factor', categoryId: 'motherboard' },
    { name: 'socket', displayName: 'Socket', categoryId: 'motherboard' },
    { name: 'memorySlots', displayName: 'Memory Slots', categoryId: 'motherboard' },
    { name: 'maxMemory', displayName: 'Max Memory', categoryId: 'motherboard' },
    
    // GPU specs
    { name: 'brand', displayName: 'Brand', categoryId: 'gpu' },
    { name: 'chipset', displayName: 'Chipset', categoryId: 'gpu' },
    { name: 'memory', displayName: 'Memory', categoryId: 'gpu' },
    { name: 'memoryType', displayName: 'Memory Type', categoryId: 'gpu' },
    { name: 'coreClock', displayName: 'Core Clock', categoryId: 'gpu' },
    { name: 'boostClock', displayName: 'Boost Clock', categoryId: 'gpu' },
    { name: 'tdp', displayName: 'TDP', categoryId: 'gpu' },
    
    // RAM specs
    { name: 'brand', displayName: 'Brand', categoryId: 'ram' },
    { name: 'capacity', displayName: 'Capacity', categoryId: 'ram' },
    { name: 'type', displayName: 'Type', categoryId: 'ram' },
    { name: 'speed', displayName: 'Speed', categoryId: 'ram' },
    { name: 'modules', displayName: 'Modules', categoryId: 'ram' },
    { name: 'casLatency', displayName: 'CAS Latency', categoryId: 'ram' },
    
    // Storage specs
    { name: 'brand', displayName: 'Brand', categoryId: 'storage' },
    { name: 'type', displayName: 'Type', categoryId: 'storage' },
    { name: 'capacity', displayName: 'Capacity', categoryId: 'storage' },
    { name: 'interface', displayName: 'Interface', categoryId: 'storage' },
    { name: 'cacheSize', displayName: 'Cache', categoryId: 'storage' },
    { name: 'readSpeed', displayName: 'Read Speed', categoryId: 'storage' },
    { name: 'writeSpeed', displayName: 'Write Speed', categoryId: 'storage' },
    
    // PSU specs
    { name: 'brand', displayName: 'Brand', categoryId: 'psu' },
    { name: 'wattage', displayName: 'Wattage', categoryId: 'psu' },
    { name: 'efficiency', displayName: 'Efficiency', categoryId: 'psu' },
    { name: 'modular', displayName: 'Modular', categoryId: 'psu' },
    
    // Case specs
    { name: 'brand', displayName: 'Brand', categoryId: 'case' },
    { name: 'type', displayName: 'Type', categoryId: 'case' },
    { name: 'formFactor', displayName: 'Form Factor', categoryId: 'case' },
    { name: 'color', displayName: 'Color', categoryId: 'case' },
    { name: 'dimensions', displayName: 'Dimensions', categoryId: 'case' },
    
    // Cooling specs
    { name: 'brand', displayName: 'Brand', categoryId: 'cooling' },
    { name: 'type', displayName: 'Type', categoryId: 'cooling' },
    { name: 'radiatorSize', displayName: 'Radiator Size', categoryId: 'cooling' },
    { name: 'fanSize', displayName: 'Fan Size', categoryId: 'cooling' },
    { name: 'noise', displayName: 'Noise Level', categoryId: 'cooling' },
    
    // Peripheral specs - Keyboards
    { name: 'brand', displayName: 'Brand', categoryId: 'keyboards' },
    { name: 'switchType', displayName: 'Switch Type', categoryId: 'keyboards' },
    { name: 'backlight', displayName: 'Backlight', categoryId: 'keyboards' },
    { name: 'connection', displayName: 'Connection', categoryId: 'keyboards' },
    
    // Peripheral specs - Mice
    { name: 'brand', displayName: 'Brand', categoryId: 'mice' },
    { name: 'sensor', displayName: 'Sensor', categoryId: 'mice' },
    { name: 'dpi', displayName: 'DPI', categoryId: 'mice' },
    { name: 'buttons', displayName: 'Buttons', categoryId: 'mice' },
    
    // Peripheral specs - Monitors
    { name: 'brand', displayName: 'Brand', categoryId: 'monitors' },
    { name: 'size', displayName: 'Size', categoryId: 'monitors' },
    { name: 'resolution', displayName: 'Resolution', categoryId: 'monitors' },
    { name: 'refreshRate', displayName: 'Refresh Rate', categoryId: 'monitors' },
    { name: 'panelType', displayName: 'Panel Type', categoryId: 'monitors' },
    
    // Common specs
    { name: 'warranty', displayName: 'Warranty' },
    { name: 'modelNumber', displayName: 'Model Number' },
  ]
  
  for (const key of specKeys) {
 
    await prisma.specificationKey.upsert({
      where: {
        name: key.name
      },
      update: {},
      create: {
        name: key.name,
        displayName: key.displayName,
        ...(key.categoryId ? {
          componentCategory: {
            connect: { id: key.categoryId }
          }
        } : {})
      }
    })
  }
  
  console.log(`Created ${specKeys.length} specification keys.`)
}

/**
 * Seed components data
 */
async function seedComponents() {
  console.log('Creating components...')
  
  // CPU Components
  const cpus = [
    {
      id: 'cpu-intel-i9-14900k',
      name: 'Intel Core i9-14900K',
      description: 'High-end Intel processor for gaming and content creation',
      price: 569.99,
      stock: 15,
      sku: 'CPU-INT-14900K',
      categoryId: 'cpu',
      specifications: JSON.stringify({
        generation: '14th Gen',
        releaseDate: '2023'
      }),
      specValues: [
        { name: 'brand', value: 'Intel' },
        { name: 'series', value: 'Core i9' },
        { name: 'model', value: '14900K' },
        { name: 'cores', value: '24 (8P+16E)' },
        { name: 'threads', value: '32' },
        { name: 'baseClock', value: '3.2 GHz' },
        { name: 'boostClock', value: '6.0 GHz' },
        { name: 'tdp', value: '125W' },
        { name: 'socket', value: 'LGA 1700' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'cpu-intel-i7-14700k',
      name: 'Intel Core i7-14700K',
      description: 'Powerful Intel processor with excellent performance for gaming',
      price: 419.99,
      stock: 20,
      sku: 'CPU-INT-14700K',
      categoryId: 'cpu',
      specifications: JSON.stringify({
        generation: '14th Gen',
        releaseDate: '2023'
      }),
      specValues: [
        { name: 'brand', value: 'Intel' },
        { name: 'series', value: 'Core i7' },
        { name: 'model', value: '14700K' },
        { name: 'cores', value: '20 (8P+12E)' },
        { name: 'threads', value: '28' },
        { name: 'baseClock', value: '3.4 GHz' },
        { name: 'boostClock', value: '5.6 GHz' },
        { name: 'tdp', value: '125W' },
        { name: 'socket', value: 'LGA 1700' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'cpu-intel-i5-14600k',
      name: 'Intel Core i5-14600K',
      description: 'Mid-range Intel processor with great gaming performance',
      price: 329.99,
      stock: 25,
      sku: 'CPU-INT-14600K',
      categoryId: 'cpu',
      specifications: JSON.stringify({
        generation: '14th Gen',
        releaseDate: '2023'
      }),
      specValues: [
        { name: 'brand', value: 'Intel' },
        { name: 'series', value: 'Core i5' },
        { name: 'model', value: '14600K' },
        { name: 'cores', value: '14 (6P+8E)' },
        { name: 'threads', value: '20' },
        { name: 'baseClock', value: '3.5 GHz' },
        { name: 'boostClock', value: '5.3 GHz' },
        { name: 'tdp', value: '125W' },
        { name: 'socket', value: 'LGA 1700' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'cpu-amd-ryzen9-7950x',
      name: 'AMD Ryzen 9 7950X',
      description: 'High-end AMD processor for enthusiasts and content creators',
      price: 549.99,
      stock: 12,
      sku: 'CPU-AMD-7950X',
      categoryId: 'cpu',
      specifications: JSON.stringify({
        generation: 'Zen 4',
        releaseDate: '2022'
      }),
      specValues: [
        { name: 'brand', value: 'AMD' },
        { name: 'series', value: 'Ryzen 9' },
        { name: 'model', value: '7950X' },
        { name: 'cores', value: '16' },
        { name: 'threads', value: '32' },
        { name: 'baseClock', value: '4.5 GHz' },
        { name: 'boostClock', value: '5.7 GHz' },
        { name: 'tdp', value: '170W' },
        { name: 'socket', value: 'AM5' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'cpu-amd-ryzen7-7800x3d',
      name: 'AMD Ryzen 7 7800X3D',
      description: 'The ultimate gaming processor with 3D V-Cache technology',
      price: 449.99,
      stock: 18,
      sku: 'CPU-AMD-7800X3D',
      categoryId: 'cpu',
      specifications: JSON.stringify({
        generation: 'Zen 4',
        releaseDate: '2023'
      }),
      specValues: [
        { name: 'brand', value: 'AMD' },
        { name: 'series', value: 'Ryzen 7' },
        { name: 'model', value: '7800X3D' },
        { name: 'cores', value: '8' },
        { name: 'threads', value: '16' },
        { name: 'baseClock', value: '4.2 GHz' },
        { name: 'boostClock', value: '5.0 GHz' },
        { name: 'tdp', value: '120W' },
        { name: 'socket', value: 'AM5' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'cpu-amd-ryzen5-7600x',
      name: 'AMD Ryzen 5 7600X',
      description: 'Mid-range AMD processor with great gaming performance',
      price: 299.99,
      stock: 28,
      sku: 'CPU-AMD-7600X',
      categoryId: 'cpu',
      specifications: JSON.stringify({
        generation: 'Zen 4',
        releaseDate: '2022'
      }),
      specValues: [
        { name: 'brand', value: 'AMD' },
        { name: 'series', value: 'Ryzen 5' },
        { name: 'model', value: '7600X' },
        { name: 'cores', value: '6' },
        { name: 'threads', value: '12' },
        { name: 'baseClock', value: '4.7 GHz' },
        { name: 'boostClock', value: '5.3 GHz' },
        { name: 'tdp', value: '105W' },
        { name: 'socket', value: 'AM5' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'cpu-intel-i3-14100f',
      name: 'Intel Core i3-14100F',
      description: 'Budget Intel processor for entry-level systems',
      price: 129.99,
      stock: 35,
      sku: 'CPU-INT-14100F',
      categoryId: 'cpu',
      specifications: JSON.stringify({
        generation: '14th Gen',
        releaseDate: '2023'
      }),
      specValues: [
        { name: 'brand', value: 'Intel' },
        { name: 'series', value: 'Core i3' },
        { name: 'model', value: '14100F' },
        { name: 'cores', value: '4' },
        { name: 'threads', value: '8' },
        { name: 'baseClock', value: '3.5 GHz' },
        { name: 'boostClock', value: '4.7 GHz' },
        { name: 'tdp', value: '58W' },
        { name: 'socket', value: 'LGA 1700' },
        { name: 'warranty', value: '3 Years' }
      ]
    }
  ]
  
  // Motherboard components
  const motherboards = [
    {
      id: 'mb-asus-rog-z790',
      name: 'ASUS ROG Maximus Z790 Hero',
      description: 'High-end Intel Z790 motherboard with premium features',
      price: 629.99,
      stock: 8,
      sku: 'MB-ASUS-Z790-HERO',
      categoryId: 'motherboard',
      specifications: JSON.stringify({
        color: 'Black',
        generation: 'Z790'
      }),
      specValues: [
        { name: 'brand', value: 'ASUS' },
        { name: 'chipset', value: 'Intel Z790' },
        { name: 'formFactor', value: 'ATX' },
        { name: 'socket', value: 'LGA 1700' },
        { name: 'memorySlots', value: '4' },
        { name: 'maxMemory', value: '128GB' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'mb-msi-z790-tomahawk',
      name: 'MSI MAG Z790 Tomahawk WiFi',
      description: 'Mid-range Intel Z790 motherboard with great features',
      price: 299.99,
      stock: 15,
      sku: 'MB-MSI-Z790-TOMAHAWK',
      categoryId: 'motherboard',
      specifications: JSON.stringify({
        color: 'Black',
        generation: 'Z790'
      }),
      specValues: [
        { name: 'brand', value: 'MSI' },
        { name: 'chipset', value: 'Intel Z790' },
        { name: 'formFactor', value: 'ATX' },
        { name: 'socket', value: 'LGA 1700' },
        { name: 'memorySlots', value: '4' },
        { name: 'maxMemory', value: '128GB' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'mb-asus-rog-x670e',
      name: 'ASUS ROG Crosshair X670E Hero',
      description: 'Premium AMD X670E motherboard for enthusiasts',
      price: 699.99,
      stock: 6,
      sku: 'MB-ASUS-X670E-HERO',
      categoryId: 'motherboard',
      specifications: JSON.stringify({
        color: 'Black',
        generation: 'X670E'
      }),
      specValues: [
        { name: 'brand', value: 'ASUS' },
        { name: 'chipset', value: 'AMD X670E' },
        { name: 'formFactor', value: 'ATX' },
        { name: 'socket', value: 'AM5' },
        { name: 'memorySlots', value: '4' },
        { name: 'maxMemory', value: '128GB' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'mb-asrock-b650-pg',
      name: 'ASRock B650 PG Riptide WiFi',
      description: 'Mid-range AMD B650 motherboard with great value',
      price: 199.99,
      stock: 20,
      sku: 'MB-ASROCK-B650-PG',
      categoryId: 'motherboard',
      specifications: JSON.stringify({
        color: 'Black',
        generation: 'B650'
      }),
      specValues: [
        { name: 'brand', value: 'ASRock' },
        { name: 'chipset', value: 'AMD B650' },
        { name: 'formFactor', value: 'ATX' },
        { name: 'socket', value: 'AM5' },
        { name: 'memorySlots', value: '4' },
        { name: 'maxMemory', value: '128GB' },
        { name: 'warranty', value: '3 Years' }
      ]
    }
  ]
  
  // Graphics Card components
  const gpus = [
    {
      id: 'gpu-nvidia-rtx4090',
      name: 'NVIDIA GeForce RTX 4090 Founders Edition',
      description: 'Flagship NVIDIA GPU with unmatched gaming performance',
      price: 1599.99,
      stock: 5,
      sku: 'GPU-NVIDIA-RTX4090-FE',
      categoryId: 'gpu',
      specifications: JSON.stringify({
        color: 'Black/Silver',
        generation: 'Ada Lovelace'
      }),
      specValues: [
        { name: 'brand', value: 'NVIDIA' },
        { name: 'chipset', value: 'GeForce RTX 4090' },
        { name: 'memory', value: '24GB' },
        { name: 'memoryType', value: 'GDDR6X' },
        { name: 'coreClock', value: '2.23 GHz' },
        { name: 'boostClock', value: '2.52 GHz' },
        { name: 'tdp', value: '450W' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'gpu-nvidia-rtx4080',
      name: 'ASUS ROG Strix GeForce RTX 4080 OC',
      description: 'High-end RTX 4080 GPU with custom cooling solution',
      price: 1199.99,
      stock: 8,
      sku: 'GPU-ASUS-RTX4080-STRIX',
      categoryId: 'gpu',
      specifications: JSON.stringify({
        color: 'Black',
        generation: 'Ada Lovelace'
      }),
      specValues: [
        { name: 'brand', value: 'ASUS' },
        { name: 'chipset', value: 'GeForce RTX 4080' },
        { name: 'memory', value: '16GB' },
        { name: 'memoryType', value: 'GDDR6X' },
        { name: 'coreClock', value: '2.21 GHz' },
        { name: 'boostClock', value: '2.51 GHz' },
        { name: 'tdp', value: '320W' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'gpu-amd-rx7900xtx',
      name: 'AMD Radeon RX 7900 XTX',
      description: 'AMD\'s flagship RDNA 3 graphics card',
      price: 999.99,
      stock: 10,
      sku: 'GPU-AMD-RX7900XTX',
      categoryId: 'gpu',
      specifications: JSON.stringify({
        color: 'Black/Red',
        generation: 'RDNA 3'
      }),
      specValues: [
        { name: 'brand', value: 'AMD' },
        { name: 'chipset', value: 'Radeon RX 7900 XTX' },
        { name: 'memory', value: '24GB' },
        { name: 'memoryType', value: 'GDDR6' },
        { name: 'coreClock', value: '1.9 GHz' },
        { name: 'boostClock', value: '2.5 GHz' },
        { name: 'tdp', value: '355W' },
        { name: 'warranty', value: '2 Years' }
      ]
    },
    {
      id: 'gpu-nvidia-rtx4060ti',
      name: 'MSI Gaming X GeForce RTX 4060 Ti',
      description: 'Mid-range NVIDIA GPU with excellent performance per watt',
      price: 399.99,
      stock: 25,
      sku: 'GPU-MSI-RTX4060TI-GAMING',
      categoryId: 'gpu',
      specifications: JSON.stringify({
        color: 'Black/Red',
        generation: 'Ada Lovelace'
      }),
      specValues: [
        { name: 'brand', value: 'MSI' },
        { name: 'chipset', value: 'GeForce RTX 4060 Ti' },
        { name: 'memory', value: '8GB' },
        { name: 'memoryType', value: 'GDDR6' },
        { name: 'coreClock', value: '1.83 GHz' },
        { name: 'boostClock', value: '2.54 GHz' },
        { name: 'tdp', value: '160W' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'gpu-nvidia-rtx4070ti',
      name: 'NVIDIA GeForce RTX 4070 Ti Super',
      description: 'Upper mid-range NVIDIA GPU with excellent performance',
      price: 799.99,
      stock: 18,
      sku: 'GPU-NVIDIA-RTX4070TI-SUPER',
      categoryId: 'gpu',
      specifications: JSON.stringify({
        color: 'Black/Silver',
        generation: 'Ada Lovelace'
      }),
      specValues: [
        { name: 'brand', value: 'NVIDIA' },
        { name: 'chipset', value: 'GeForce RTX 4070 Ti Super' },
        { name: 'memory', value: '16GB' },
        { name: 'memoryType', value: 'GDDR6X' },
        { name: 'coreClock', value: '2.34 GHz' },
        { name: 'boostClock', value: '2.61 GHz' },
        { name: 'tdp', value: '285W' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'gpu-amd-rx7800xt',
      name: 'Sapphire Nitro+ Radeon RX 7800 XT',
      description: 'High-performance AMD RDNA 3 graphics card',
      price: 549.99,
      stock: 15,
      sku: 'GPU-SAPPHIRE-RX7800XT',
      categoryId: 'gpu',
      specifications: JSON.stringify({
        color: 'Black/Blue',
        generation: 'RDNA 3'
      }),
      specValues: [
        { name: 'brand', value: 'Sapphire' },
        { name: 'chipset', value: 'Radeon RX 7800 XT' },
        { name: 'memory', value: '16GB' },
        { name: 'memoryType', value: 'GDDR6' },
        { name: 'coreClock', value: '1.95 GHz' },
        { name: 'boostClock', value: '2.43 GHz' },
        { name: 'tdp', value: '263W' },
        { name: 'warranty', value: '3 Years' }
      ]
    }
  ]
  
  // RAM components
  const rams = [
    {
      id: 'ram-corsair-vengeance-32gb',
      name: 'Corsair Vengeance RGB Pro 32GB (2 x 16GB) DDR5-6000',
      description: 'High-performance RGB DDR5 memory kit',
      price: 189.99,
      stock: 20,
      sku: 'RAM-CORSAIR-32GB-6000',
      categoryId: 'ram',
      specifications: JSON.stringify({
        color: 'Black',
        heatsink: 'Aluminum'
      }),
      specValues: [
        { name: 'brand', value: 'Corsair' },
        { name: 'capacity', value: '32GB (2 x 16GB)' },
        { name: 'type', value: 'DDR5' },
        { name: 'speed', value: '6000 MHz' },
        { name: 'modules', value: '2' },
        { name: 'casLatency', value: 'CL36' },
        { name: 'warranty', value: 'Lifetime' }
      ]
    },
    {
      id: 'ram-gskill-trident-32gb',
      name: 'G.Skill Trident Z5 RGB 32GB (2 x 16GB) DDR5-6400',
      description: 'Premium RGB DDR5 memory with excellent overclocking potential',
      price: 209.99,
      stock: 15,
      sku: 'RAM-GSKILL-32GB-6400',
      categoryId: 'ram',
      specifications: JSON.stringify({
        color: 'Black',
        heatsink: 'Aluminum'
      }),
      specValues: [
        { name: 'brand', value: 'G.Skill' },
        { name: 'capacity', value: '32GB (2 x 16GB)' },
        { name: 'type', value: 'DDR5' },
        { name: 'speed', value: '6400 MHz' },
        { name: 'modules', value: '2' },
        { name: 'casLatency', value: 'CL32' },
        { name: 'warranty', value: 'Lifetime' }
      ]
    },
    {
      id: 'ram-kingston-fury-16gb',
      name: 'Kingston FURY Beast 16GB (2 x 8GB) DDR5-5200',
      description: 'Reliable DDR5 memory for gaming and productivity',
      price: 99.99,
      stock: 30,
      sku: 'RAM-KINGSTON-16GB-5200',
      categoryId: 'ram',
      specifications: JSON.stringify({
        color: 'Black',
        heatsink: 'Low-profile'
      }),
      specValues: [
        { name: 'brand', value: 'Kingston' },
        { name: 'capacity', value: '16GB (2 x 8GB)' },
        { name: 'type', value: 'DDR5' },
        { name: 'speed', value: '5200 MHz' },
        { name: 'modules', value: '2' },
        { name: 'casLatency', value: 'CL40' },
        { name: 'warranty', value: 'Lifetime' }
      ]
    },
    {
      id: 'ram-teamgroup-tforce-32gb',
      name: 'TeamGroup T-Force Delta RGB 32GB (2 x 16GB) DDR5-6000',
      description: 'Performance DDR5 memory with RGB lighting',
      price: 179.99,
      stock: 18,
      sku: 'RAM-TEAMGROUP-32GB-6000',
      categoryId: 'ram',
      specifications: JSON.stringify({
        color: 'White',
        heatsink: 'Aluminum'
      }),
      specValues: [
        { name: 'brand', value: 'TeamGroup' },
        { name: 'capacity', value: '32GB (2 x 16GB)' },
        { name: 'type', value: 'DDR5' },
        { name: 'speed', value: '6000 MHz' },
        { name: 'modules', value: '2' },
        { name: 'casLatency', value: 'CL38' },
        { name: 'warranty', value: 'Lifetime' }
      ]
    },
    {
      id: 'ram-crucial-64gb',
      name: 'Crucial Pro 64GB (2 x 32GB) DDR5-5600',
      description: 'High-capacity DDR5 memory for workstations',
      price: 239.99,
      stock: 10,
      sku: 'RAM-CRUCIAL-64GB-5600',
      categoryId: 'ram',
      specifications: JSON.stringify({
        color: 'Black',
        heatsink: 'Aluminum'
      }),
      specValues: [
        { name: 'brand', value: 'Crucial' },
        { name: 'capacity', value: '64GB (2 x 32GB)' },
        { name: 'type', value: 'DDR5' },
        { name: 'speed', value: '5600 MHz' },
        { name: 'modules', value: '2' },
        { name: 'casLatency', value: 'CL46' },
        { name: 'warranty', value: 'Lifetime' }
      ]
    }
  ]
  
  // Storage components
  const storages = [
    {
      id: 'storage-samsung-980pro-2tb',
      name: 'Samsung 980 PRO 2TB NVMe SSD',
      description: 'High-performance PCIe 4.0 NVMe SSD',
      price: 199.99,
      stock: 25,
      sku: 'SSD-SAMSUNG-980PRO-2TB',
      categoryId: 'storage',
      specifications: JSON.stringify({
        formFactor: 'M.2 2280'
      }),
      specValues: [
        { name: 'brand', value: 'Samsung' },
        { name: 'type', value: 'NVMe SSD' },
        { name: 'capacity', value: '2TB' },
        { name: 'interface', value: 'PCIe 4.0 x4' },
        { name: 'cacheSize', value: '2GB LPDDR4' },
        { name: 'readSpeed', value: '7000 MB/s' },
        { name: 'writeSpeed', value: '5100 MB/s' },
        { name: 'warranty', value: '5 Years' }
      ]
    },
    {
      id: 'storage-wd-black-1tb',
      name: 'Western Digital Black SN850X 1TB NVMe SSD',
      description: 'High-performance PCIe 4.0 NVMe SSD for gaming',
      price: 149.99,
      stock: 30,
      sku: 'SSD-WD-SN850X-1TB',
      categoryId: 'storage',
      specifications: JSON.stringify({
        formFactor: 'M.2 2280'
      }),
      specValues: [
        { name: 'brand', value: 'Western Digital' },
        { name: 'type', value: 'NVMe SSD' },
        { name: 'capacity', value: '1TB' },
        { name: 'interface', value: 'PCIe 4.0 x4' },
        { name: 'cacheSize', value: '1GB' },
        { name: 'readSpeed', value: '7300 MB/s' },
        { name: 'writeSpeed', value: '6300 MB/s' },
        { name: 'warranty', value: '5 Years' }
      ]
    },
    {
      id: 'storage-crucial-p3-4tb',
      name: 'Crucial P3 4TB NVMe SSD',
      description: 'High-capacity PCIe 3.0 NVMe SSD',
      price: 249.99,
      stock: 15,
      sku: 'SSD-CRUCIAL-P3-4TB',
      categoryId: 'storage',
      specifications: JSON.stringify({
        formFactor: 'M.2 2280'
      }),
      specValues: [
        { name: 'brand', value: 'Crucial' },
        { name: 'type', value: 'NVMe SSD' },
        { name: 'capacity', value: '4TB' },
        { name: 'interface', value: 'PCIe 3.0 x4' },
        { name: 'readSpeed', value: '3500 MB/s' },
        { name: 'writeSpeed', value: '3000 MB/s' },
        { name: 'warranty', value: '5 Years' }
      ]
    },
    {
      id: 'storage-seagate-firecuda-2tb',
      name: 'Seagate FireCuda 530 2TB NVMe SSD',
      description: 'High-performance PCIe 4.0 SSD for gaming',
      price: 189.99,
      stock: 22,
      sku: 'SSD-SEAGATE-FIRECUDA-2TB',
      categoryId: 'storage',
      specifications: JSON.stringify({
        formFactor: 'M.2 2280'
      }),
      specValues: [
        { name: 'brand', value: 'Seagate' },
        { name: 'type', value: 'NVMe SSD' },
        { name: 'capacity', value: '2TB' },
        { name: 'interface', value: 'PCIe 4.0 x4' },
        { name: 'cacheSize', value: '2GB DDR4' },
        { name: 'readSpeed', value: '7300 MB/s' },
        { name: 'writeSpeed', value: '6900 MB/s' },
        { name: 'warranty', value: '5 Years' }
      ]
    },
    {
      id: 'storage-samsung-870-evo-1tb',
      name: 'Samsung 870 EVO 1TB SATA SSD',
      description: 'Reliable SATA SSD for general storage',
      price: 89.99,
      stock: 40,
      sku: 'SSD-SAMSUNG-870EVO-1TB',
      categoryId: 'storage',
      specifications: JSON.stringify({
        formFactor: '2.5-inch'
      }),
      specValues: [
        { name: 'brand', value: 'Samsung' },
        { name: 'type', value: 'SATA SSD' },
        { name: 'capacity', value: '1TB' },
        { name: 'interface', value: 'SATA III' },
        { name: 'cacheSize', value: '1GB LPDDR4' },
        { name: 'readSpeed', value: '560 MB/s' },
        { name: 'writeSpeed', value: '530 MB/s' },
        { name: 'warranty', value: '5 Years' }
      ]
    },
    {
      id: 'storage-wd-blue-4tb-hdd',
      name: 'Western Digital Blue 4TB HDD',
      description: 'Large capacity hard drive for mass storage',
      price: 69.99,
      stock: 25,
      sku: 'HDD-WD-BLUE-4TB',
      categoryId: 'storage',
      specifications: JSON.stringify({
        formFactor: '3.5-inch'
      }),
      specValues: [
        { name: 'brand', value: 'Western Digital' },
        { name: 'type', value: 'HDD' },
        { name: 'capacity', value: '4TB' },
        { name: 'interface', value: 'SATA III' },
        { name: 'cacheSize', value: '256MB' },
        { name: 'rpm', value: '5400 RPM' },
        { name: 'warranty', value: '2 Years' }
      ]
    }
  ]
  
  // PSU components
  const psus = [
    {
      id: 'psu-corsair-rm850x',
      name: 'Corsair RM850x 850W 80+ Gold',
      description: 'High-quality fully modular power supply',
      price: 149.99,
      stock: 20,
      sku: 'PSU-CORSAIR-RM850X',
      categoryId: 'psu',
      specifications: JSON.stringify({
        color: 'Black',
        cabling: 'Fully Modular'
      }),
      specValues: [
        { name: 'brand', value: 'Corsair' },
        { name: 'wattage', value: '850W' },
        { name: 'efficiency', value: '80+ Gold' },
        { name: 'modular', value: 'Fully Modular' },
        { name: 'warranty', value: '10 Years' }
      ]
    },
    {
      id: 'psu-evga-supernova-1000',
      name: 'EVGA SuperNOVA 1000 GT 1000W 80+ Gold',
      description: 'High-wattage fully modular power supply',
      price: 189.99,
      stock: 15,
      sku: 'PSU-EVGA-1000GT',
      categoryId: 'psu',
      specifications: JSON.stringify({
        color: 'Black',
        cabling: 'Fully Modular'
      }),
      specValues: [
        { name: 'brand', value: 'EVGA' },
        { name: 'wattage', value: '1000W' },
        { name: 'efficiency', value: '80+ Gold' },
        { name: 'modular', value: 'Fully Modular' },
        { name: 'warranty', value: '10 Years' }
      ]
    },
    {
      id: 'psu-seasonic-focus-750',
      name: 'Seasonic FOCUS GX-750 750W 80+ Gold',
      description: 'Reliable fully modular power supply',
      price: 129.99,
      stock: 25,
      sku: 'PSU-SEASONIC-GX750',
      categoryId: 'psu',
      specifications: JSON.stringify({
        color: 'Black',
        cabling: 'Fully Modular'
      }),
      specValues: [
        { name: 'brand', value: 'Seasonic' },
        { name: 'wattage', value: '750W' },
        { name: 'efficiency', value: '80+ Gold' },
        { name: 'modular', value: 'Fully Modular' },
        { name: 'warranty', value: '10 Years' }
      ]
    }
  ]
  
  // Case components
  const cases = [
    {
      id: 'case-corsair-5000d',
      name: 'Corsair 5000D Airflow',
      description: 'Mid-tower case with excellent airflow',
      price: 174.99,
      stock: 18,
      sku: 'CASE-CORSAIR-5000D',
      categoryId: 'case',
      specifications: JSON.stringify({
        sides: 'Tempered Glass',
        included: '2x 120mm Fans'
      }),
      specValues: [
        { name: 'brand', value: 'Corsair' },
        { name: 'type', value: 'Mid Tower' },
        { name: 'formFactor', value: 'ATX, Micro-ATX, Mini-ITX' },
        { name: 'color', value: 'Black' },
        { name: 'dimensions', value: '520mm x 245mm x 520mm' },
        { name: 'warranty', value: '2 Years' }
      ]
    },
    {
      id: 'case-fractal-meshify',
      name: 'Fractal Design Meshify 2 Compact',
      description: 'Compact mid-tower case with mesh front panel',
      price: 149.99,
      stock: 20,
      sku: 'CASE-FRACTAL-MESHIFY2C',
      categoryId: 'case',
      specifications: JSON.stringify({
        sides: 'Tempered Glass',
        included: '3x 140mm Fans'
      }),
      specValues: [
        { name: 'brand', value: 'Fractal Design' },
        { name: 'type', value: 'Mid Tower' },
        { name: 'formFactor', value: 'ATX, Micro-ATX, Mini-ITX' },
        { name: 'color', value: 'Black' },
        { name: 'dimensions', value: '424mm x 210mm x 475mm' },
        { name: 'warranty', value: '2 Years' }
      ]
    },
    {
      id: 'case-lian-li-o11',
      name: 'Lian Li O11 Dynamic EVO',
      description: 'Premium dual-chamber case with excellent build quality',
      price: 189.99,
      stock: 15,
      sku: 'CASE-LIANLI-O11EVO',
      categoryId: 'case',
      specifications: JSON.stringify({
        sides: 'Tempered Glass',
        included: 'None'
      }),
      specValues: [
        { name: 'brand', value: 'Lian Li' },
        { name: 'type', value: 'Mid Tower' },
        { name: 'formFactor', value: 'ATX, Micro-ATX, Mini-ITX' },
        { name: 'color', value: 'Black' },
        { name: 'dimensions', value: '459mm x 285mm x 459mm' },
        { name: 'warranty', value: '1 Year' }
      ]
    }
  ]
  
  // Cooling components
  const coolings = [
    {
      id: 'cooling-nzxt-kraken-x63',
      name: 'NZXT Kraken X63 280mm AIO Liquid Cooler',
      description: '280mm AIO liquid CPU cooler with RGB',
      price: 149.99,
      stock: 15,
      sku: 'COOL-NZXT-KRAKENX63',
      categoryId: 'cooling',
      specifications: JSON.stringify({
        color: 'Black',
        rgb: 'Yes'
      }),
      specValues: [
        { name: 'brand', value: 'NZXT' },
        { name: 'type', value: 'Liquid Cooler (AIO)' },
        { name: 'radiatorSize', value: '280mm' },
        { name: 'fanSize', value: '2x 140mm' },
        { name: 'noise', value: '21-38 dBA' },
        { name: 'warranty', value: '6 Years' }
      ]
    },
    {
      id: 'cooling-noctua-nh-d15',
      name: 'Noctua NH-D15 Dual Tower CPU Cooler',
      description: 'Premium dual tower air CPU cooler',
      price: 99.99,
      stock: 20,
      sku: 'COOL-NOCTUA-NHD15',
      categoryId: 'cooling',
      specifications: JSON.stringify({
        color: 'Brown/Beige',
        rgb: 'No'
      }),
      specValues: [
        { name: 'brand', value: 'Noctua' },
        { name: 'type', value: 'Air Cooler' },
        { name: 'fanSize', value: '2x 140mm' },
        { name: 'noise', value: '24.6 dBA' },
        { name: 'warranty', value: '6 Years' }
      ]
    },
    {
      id: 'cooling-corsair-h150i',
      name: 'Corsair iCUE H150i ELITE CAPELLIX 360mm AIO',
      description: '360mm AIO liquid CPU cooler with RGB',
      price: 189.99,
      stock: 12,
      sku: 'COOL-CORSAIR-H150I',
      categoryId: 'cooling',
      specifications: JSON.stringify({
        color: 'Black',
        rgb: 'Yes'
      }),
      specValues: [
        { name: 'brand', value: 'Corsair' },
        { name: 'type', value: 'Liquid Cooler (AIO)' },
        { name: 'radiatorSize', value: '360mm' },
        { name: 'fanSize', value: '3x 120mm' },
        { name: 'noise', value: '10-36 dBA' },
        { name: 'warranty', value: '5 Years' }
      ]
    }
  ]
  
  // Peripheral - Keyboards
  const keyboards = [
    {
      id: 'keyboard-corsair-k100',
      name: 'Corsair K100 RGB Mechanical Gaming Keyboard',
      description: 'Premium mechanical gaming keyboard with per-key RGB lighting',
      price: 229.99,
      stock: 15,
      sku: 'KB-CORSAIR-K100',
      categoryId: 'keyboards',
      specifications: JSON.stringify({
        keycaps: 'PBT Double-shot',
        mediaControls: 'Yes'
      }),
      specValues: [
        { name: 'brand', value: 'Corsair' },
        { name: 'switchType', value: 'Cherry MX Speed' },
        { name: 'backlight', value: 'RGB' },
        { name: 'connection', value: 'Wired USB' },
        { name: 'warranty', value: '2 Years' }
      ]
    },
    {
      id: 'keyboard-logitech-g915',
      name: 'Logitech G915 TKL Wireless RGB Mechanical Keyboard',
      description: 'Low-profile wireless TKL mechanical keyboard',
      price: 199.99,
      stock: 20,
      sku: 'KB-LOGITECH-G915TKL',
      categoryId: 'keyboards',
      specifications: JSON.stringify({
        keycaps: 'ABS',
        mediaControls: 'Yes'
      }),
      specValues: [
        { name: 'brand', value: 'Logitech' },
        { name: 'switchType', value: 'GL Tactile' },
        { name: 'backlight', value: 'RGB' },
        { name: 'connection', value: 'Wireless/USB' },
        { name: 'warranty', value: '2 Years' }
      ]
    },
    {
      id: 'keyboard-ducky-one3',
      name: 'Ducky One 3 TKL Mechanical Keyboard',
      description: 'Premium TKL mechanical keyboard with hot-swappable switches',
      price: 119.99,
      stock: 12,
      sku: 'KB-DUCKY-ONE3TKL',
      categoryId: 'keyboards',
      specifications: JSON.stringify({
        keycaps: 'PBT Double-shot',
        mediaControls: 'No'
      }),
      specValues: [
        { name: 'brand', value: 'Ducky' },
        { name: 'switchType', value: 'Cherry MX Brown' },
        { name: 'backlight', value: 'RGB' },
        { name: 'connection', value: 'Wired USB-C' },
        { name: 'warranty', value: '1 Year' }
      ]
    },
    {
      id: 'keyboard-keychron-q3',
      name: 'Keychron Q3 QMK Mechanical Keyboard',
      description: 'Fully customizable 75% layout mechanical keyboard',
      price: 169.99,
      stock: 8,
      sku: 'KB-KEYCHRON-Q3',
      categoryId: 'keyboards',
      specifications: JSON.stringify({
        keycaps: 'PBT Double-shot',
        mediaControls: 'Yes'
      }),
      specValues: [
        { name: 'brand', value: 'Keychron' },
        { name: 'switchType', value: 'Gateron G Pro Red' },
        { name: 'backlight', value: 'RGB' },
        { name: 'connection', value: 'Wired USB-C' },
        { name: 'warranty', value: '1 Year' }
      ]
    }
  ]
  
  // Peripheral - Mice
  const mice = [
    {
      id: 'mouse-logitech-gpro',
      name: 'Logitech G Pro X Superlight Wireless Gaming Mouse',
      description: 'Ultra-lightweight wireless gaming mouse',
      price: 149.99,
      stock: 25,
      sku: 'MOUSE-LOGITECH-GPROX',
      categoryId: 'mice',
      specifications: JSON.stringify({
        color: 'Black',
        weight: '63g'
      }),
      specValues: [
        { name: 'brand', value: 'Logitech' },
        { name: 'sensor', value: 'HERO 25K' },
        { name: 'dpi', value: 'Up to 25,600 DPI' },
        { name: 'buttons', value: '5' },
        { name: 'warranty', value: '2 Years' }
      ]
    },
    {
      id: 'mouse-razer-viper',
      name: 'Razer Viper Ultimate Wireless Gaming Mouse',
      description: 'Lightweight wireless gaming mouse with charging dock',
      price: 129.99,
      stock: 20,
      sku: 'MOUSE-RAZER-VIPERULT',
      categoryId: 'mice',
      specifications: JSON.stringify({
        color: 'Black',
        weight: '74g'
      }),
      specValues: [
        { name: 'brand', value: 'Razer' },
        { name: 'sensor', value: 'Focus+ Optical' },
        { name: 'dpi', value: 'Up to 20,000 DPI' },
        { name: 'buttons', value: '8' },
        { name: 'warranty', value: '2 Years' }
      ]
    },{
      id: 'mouse-glorious-model-o',
      name: 'Glorious Model O Wireless Gaming Mouse',
      description: 'Ultra-lightweight honeycomb design wireless mouse',
      price: 79.99,
      stock: 22,
      sku: 'MOUSE-GLORIOUS-MODELO',
      categoryId: 'mice',
      specifications: JSON.stringify({
        color: 'White',
        weight: '69g'
      }),
      specValues: [
        { name: 'brand', value: 'Glorious' },
        { name: 'sensor', value: 'BAMF 19K' },
        { name: 'dpi', value: 'Up to 19,000 DPI' },
        { name: 'buttons', value: '6' },
        { name: 'warranty', value: '2 Years' }
      ]
    },
    {
      id: 'mouse-steelseries-aerox5',
      name: 'SteelSeries Aerox 5 Wireless Gaming Mouse',
      description: 'Lightweight wireless mouse with 9 programmable buttons',
      price: 139.99,
      stock: 15,
      sku: 'MOUSE-STEELSERIES-AEROX5',
      categoryId: 'mice',
      specifications: JSON.stringify({
        color: 'Black',
        weight: '74g'
      }),
      specValues: [
        { name: 'brand', value: 'SteelSeries' },
        { name: 'sensor', value: 'TrueMove Air' },
        { name: 'dpi', value: 'Up to 18,000 DPI' },
        { name: 'buttons', value: '9' },
        { name: 'warranty', value: '2 Years' }
      ]
    }
  ]
  
  // Peripheral - Monitors
  const monitors = [
    {
      id: 'monitor-lg-27gp950',
      name: 'LG UltraGear 27GP950-B 27" 4K 144Hz Gaming Monitor',
      description: '27" 4K Nano IPS gaming monitor with 144Hz refresh rate',
      price: 799.99,
      stock: 10,
      sku: 'MON-LG-27GP950',
      categoryId: 'monitors',
      specifications: JSON.stringify({
        hdr: 'HDR600',
        inputs: 'HDMI 2.1, DisplayPort 1.4'
      }),
      specValues: [
        { name: 'brand', value: 'LG' },
        { name: 'size', value: '27"' },
        { name: 'resolution', value: '3840 x 2160 (4K)' },
        { name: 'refreshRate', value: '144Hz' },
        { name: 'panelType', value: 'Nano IPS' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'monitor-samsung-g7',
      name: 'Samsung Odyssey G7 32" WQHD 240Hz Curved Gaming Monitor',
      description: '32" curved VA gaming monitor with 240Hz refresh rate',
      price: 699.99,
      stock: 12,
      sku: 'MON-SAMSUNG-G732',
      categoryId: 'monitors',
      specifications: JSON.stringify({
        hdr: 'HDR600',
        inputs: 'HDMI 2.0, DisplayPort 1.4'
      }),
      specValues: [
        { name: 'brand', value: 'Samsung' },
        { name: 'size', value: '32"' },
        { name: 'resolution', value: '2560 x 1440 (WQHD)' },
        { name: 'refreshRate', value: '240Hz' },
        { name: 'panelType', value: 'VA' },
        { name: 'warranty', value: '3 Years' }
      ]
    },{
      id: 'monitor-alienware-aw3423dw',
      name: 'Alienware AW3423DW 34" QD-OLED Ultrawide Monitor',
      description: '34" curved QD-OLED ultrawide gaming monitor with G-Sync Ultimate',
      price: 1099.99,
      stock: 5,
      sku: 'MON-ALIENWARE-AW3423DW',
      categoryId: 'monitors',
      specifications: JSON.stringify({
        hdr: 'DisplayHDR True Black 400',
        inputs: 'HDMI 2.0, DisplayPort 1.4'
      }),
      specValues: [
        { name: 'brand', value: 'Alienware' },
        { name: 'size', value: '34"' },
        { name: 'resolution', value: '3440 x 1440 (UWQHD)' },
        { name: 'refreshRate', value: '175Hz' },
        { name: 'panelType', value: 'QD-OLED' },
        { name: 'warranty', value: '3 Years' }
      ]
    },
    {
      id: 'monitor-msi-mag274qrf',
      name: 'MSI MAG274QRF-QD 27" Rapid IPS Gaming Monitor',
      description: '27" Rapid IPS monitor with Quantum Dot technology',
      price: 399.99,
      stock: 18,
      sku: 'MON-MSI-MAG274QRF',
      categoryId: 'monitors',
      specifications: JSON.stringify({
        hdr: 'HDR400',
        inputs: 'HDMI 2.0, DisplayPort 1.4, USB-C'
      }),
      specValues: [
        { name: 'brand', value: 'MSI' },
        { name: 'size', value: '27"' },
        { name: 'resolution', value: '2560 x 1440 (WQHD)' },
        { name: 'refreshRate', value: '165Hz' },
        { name: 'panelType', value: 'Rapid IPS' },
        { name: 'warranty', value: '3 Years' }
      ]
    }
  ]

  // Additional headphones
  const headphones = [
    {
      id: 'headphone-steelseries-arctis-7p',
      name: 'SteelSeries Arctis 7P+ Wireless Gaming Headset',
      description: 'Premium wireless gaming headset with low-latency connection',
      price: 169.99,
      stock: 20,
      sku: 'HEAD-STEELSERIES-ARCTIS7P',
      categoryId: 'headphones',
      specifications: JSON.stringify({
        color: 'White',
        batteryLife: '30 hours'
      }),
      specValues: [
        { name: 'brand', value: 'SteelSeries' },
        { name: 'type', value: 'Over-ear Wireless' },
        { name: 'driver', value: '40mm Neodymium' },
        { name: 'micType', value: 'Retractable Bidirectional' },
        { name: 'connection', value: 'USB-C Wireless' },
        { name: 'warranty', value: '2 Years' }
      ]
    },
    {
      id: 'headphone-hyperx-cloud3',
      name: 'HyperX Cloud III Gaming Headset',
      description: 'Comfortable wired gaming headset with spatial audio',
      price: 99.99,
      stock: 25,
      sku: 'HEAD-HYPERX-CLOUD3',
      categoryId: 'headphones',
      specifications: JSON.stringify({
        color: 'Red/Black',
        batteryLife: 'N/A (Wired)'
      }),
      specValues: [
        { name: 'brand', value: 'HyperX' },
        { name: 'type', value: 'Over-ear Wired' },
        { name: 'driver', value: '53mm Dynamic' },
        { name: 'micType', value: 'Detachable Directional' },
        { name: 'connection', value: 'USB-C/3.5mm' },
        { name: 'warranty', value: '2 Years' }
      ]
    }
  ]

  // Additional speakers
  const speakers = [
    {
      id: 'speaker-logitech-g560',
      name: 'Logitech G560 LIGHTSYNC PC Gaming Speakers',
      description: '2.1 gaming speakers with RGB lighting and DTS:X Ultra surround sound',
      price: 199.99,
      stock: 15,
      sku: 'SPK-LOGITECH-G560',
      categoryId: 'speakers',
      specifications: JSON.stringify({
        color: 'Black',
        totalPower: '240W Peak'
      }),
      specValues: [
        { name: 'brand', value: 'Logitech' },
        { name: 'type', value: '2.1 System' },
        { name: 'power', value: '240W Peak Power' },
        { name: 'connection', value: 'USB, 3.5mm, Bluetooth' },
        { name: 'features', value: 'RGB Lighting, DTS:X Ultra' },
        { name: 'warranty', value: '1 Year' }
      ]
    },
    {
      id: 'speaker-audioengine-a2plus',
      name: 'Audioengine A2+ Wireless Desktop Speakers',
      description: 'Premium compact powered desktop speakers with Bluetooth connectivity',
      price: 269.99,
      stock: 8,
      sku: 'SPK-AUDIOENGINE-A2PLUS',
      categoryId: 'speakers',
      specifications: JSON.stringify({
        color: 'White',
        totalPower: '60W Peak'
      }),
      specValues: [
        { name: 'brand', value: 'Audioengine' },
        { name: 'type', value: '2.0 System' },
        { name: 'power', value: '60W Peak Power' },
        { name: 'connection', value: 'USB, 3.5mm, Bluetooth' },
        { name: 'features', value: 'Built-in DAC, Subwoofer Output' },
        { name: 'warranty', value: '3 Years' }
      ]
    }
  ]

  // Additional gamepads
  const gamepads = [
    {
      id: 'gamepad-xbox-elite2',
      name: 'Xbox Elite Wireless Controller Series 2',
      description: 'Premium Xbox controller with adjustable-tension thumbsticks and paddles',
      price: 179.99,
      stock: 12,
      sku: 'PAD-XBOX-ELITE2',
      categoryId: 'gamepads',
      specifications: JSON.stringify({
        color: 'Black',
        batteryLife: 'Up to 40 hours'
      }),
      specValues: [
        { name: 'brand', value: 'Microsoft' },
        { name: 'platform', value: 'Xbox/PC' },
        { name: 'connection', value: 'Bluetooth, USB-C, Xbox Wireless' },
        { name: 'features', value: 'Adjustable thumbsticks, Hair trigger locks, Paddles' },
        { name: 'warranty', value: '1 Year' }
      ]
    },
    {
      id: 'gamepad-sony-dualsense',
      name: 'Sony DualSense Wireless Controller',
      description: 'PlayStation 5 controller with adaptive triggers and haptic feedback',
      price: 69.99,
      stock: 20,
      sku: 'PAD-SONY-DUALSENSE',
      categoryId: 'gamepads',
      specifications: JSON.stringify({
        color: 'White',
        batteryLife: 'Up to 15 hours'
      }),
      specValues: [
        { name: 'brand', value: 'Sony' },
        { name: 'platform', value: 'PlayStation 5/PC' },
        { name: 'connection', value: 'Bluetooth, USB-C' },
        { name: 'features', value: 'Adaptive triggers, Haptic feedback, Built-in microphone' },
        { name: 'warranty', value: '1 Year' }
      ]
    }
  ]

  const additionalConfigurations = [
    {
      id: 'config-streaming-setup',
      name: 'Streaming PC Setup',
      description: 'Optimized PC build for content creators and streamers',
      isTemplate: true,
      isPublic: true,
      status: ConfigStatus.APPROVED,
      components: [
        { componentId: 'cpu-amd-ryzen9-7950x', quantity: 1 },
        { componentId: 'mb-asus-rog-x670e', quantity: 1 },
        { componentId: 'gpu-nvidia-rtx4080', quantity: 1 },
        { componentId: 'ram-crucial-64gb', quantity: 1 },
        { componentId: 'storage-samsung-980pro-2tb', quantity: 1 },
        { componentId: 'storage-wd-blue-4tb-hdd', quantity: 1 },
        { componentId: 'psu-evga-supernova-1000', quantity: 1 },
        { componentId: 'case-corsair-5000d', quantity: 1 },
        { componentId: 'cooling-corsair-h150i', quantity: 1 }
      ]
    },
    {
      id: 'config-compact-gaming',
      name: 'Compact Gaming Mini-ITX Build',
      description: 'Small form factor gaming PC with premium components',
      isTemplate: true,
      isPublic: true,
      status: ConfigStatus.APPROVED,
      components: [
        { componentId: 'cpu-intel-i7-14700k', quantity: 1 },
        { componentId: 'mb-asrock-b650-pg', quantity: 1 },
        { componentId: 'gpu-nvidia-rtx4070ti', quantity: 1 },
        { componentId: 'ram-corsair-vengeance-32gb', quantity: 1 },
        { componentId: 'storage-samsung-980pro-2tb', quantity: 1 },
        { componentId: 'psu-corsair-rm850x', quantity: 1 },
        { componentId: 'case-fractal-meshify', quantity: 1 },
        { componentId: 'cooling-nzxt-kraken-x63', quantity: 1 }
      ]
    }
  ]
 
  const allComponents = [
    ...cpus,
    ...motherboards,
    ...gpus,
    ...rams,
    ...storages,
    ...psus,
    ...cases,
    ...coolings,
    ...keyboards,
    ...mice,
    ...monitors
  ]
  
  for (const component of allComponents) {
    const exists = await prisma.component.findUnique({
      where: { id: component.id }
    })
    
    if (!exists) {
      await prisma.component.create({
        data: {
          id: component.id,
          name: component.name,
          description: component.description,
          price: component.price,
          stock: component.stock,
          sku: component.sku,
          categoryId: component.categoryId,
          specifications: component.specifications,
        }
      })
    
      if (component.specValues) {
        for (const spec of component.specValues) {
          let specKey = await prisma.specificationKey.findUnique({
            where: { name: spec.name }
          })
          
          if (!specKey) {
            specKey = await prisma.specificationKey.create({
              data: {
                name: spec.name,
                displayName: spec.name.charAt(0).toUpperCase() + spec.name.slice(1),
                ...(component.categoryId ? {
                  componentCategory: {
                    connect: { id: component.categoryId }
                  }
                } : {})
              }
            })
          }
      
          await prisma.componentSpec.create({
            data: {
              componentId: component.id,
              specKeyId: specKey.id,
              value: spec.value
            }
          })
        }
      }
      
      console.log(`Created component: ${component.name}`)
    } else {
      console.log(`Component ${component.name} already exists.`)
    }
  }
}

/**
 * Seed ready-made PC configurations
 */
async function seedConfigurations() {
  console.log('Creating PC configurations...')
  
  // Sample PC configurations
  const configurations = [
    {
      id: 'config-gaming-ultimate',
      name: 'Ultimate Gaming PC',
      description: 'Our flagship gaming PC build with top-tier components for 4K gaming',
      isTemplate: true,
      isPublic: true,
      status: ConfigStatus.APPROVED,
      components: [
        { componentId: 'cpu-intel-i9-14900k', quantity: 1 },
        { componentId: 'mb-asus-rog-z790', quantity: 1 },
        { componentId: 'gpu-nvidia-rtx4090', quantity: 1 },
        { componentId: 'ram-gskill-trident-32gb', quantity: 1 },
        { componentId: 'storage-samsung-980pro-2tb', quantity: 1 },
        { componentId: 'psu-evga-supernova-1000', quantity: 1 },
        { componentId: 'case-lian-li-o11', quantity: 1 },
        { componentId: 'cooling-corsair-h150i', quantity: 1 }
      ]
    },
    {
      id: 'config-gaming-high',
      name: 'High-End Gaming PC',
      description: 'Powerful gaming PC build capable of 1440p high refresh rate gaming',
      isTemplate: true,
      isPublic: true,
      status: ConfigStatus.APPROVED,
      components: [
        { componentId: 'cpu-intel-i7-14700k', quantity: 1 },
        { componentId: 'mb-msi-z790-tomahawk', quantity: 1 },
        { componentId: 'gpu-nvidia-rtx4080', quantity: 1 },
        { componentId: 'ram-corsair-vengeance-32gb', quantity: 1 },
        { componentId: 'storage-wd-black-1tb', quantity: 1 },
        { componentId: 'psu-corsair-rm850x', quantity: 1 },
        { componentId: 'case-corsair-5000d', quantity: 1 },
        { componentId: 'cooling-nzxt-kraken-x63', quantity: 1 }
      ]
    },
    {
      id: 'config-gaming-amd',
      name: 'AMD Gaming Powerhouse',
      description: 'High-performance AMD-based gaming PC with 3D V-Cache CPU',
      isTemplate: true,
      isPublic: true,
      status: ConfigStatus.APPROVED,
      components: [
        { componentId: 'cpu-amd-ryzen7-7800x3d', quantity: 1 },
        { componentId: 'mb-asrock-b650-pg', quantity: 1 },
        { componentId: 'gpu-amd-rx7900xtx', quantity: 1 },
        { componentId: 'ram-kingston-fury-16gb', quantity: 1 },
        { componentId: 'storage-crucial-p3-4tb', quantity: 1 },
        { componentId: 'psu-seasonic-focus-750', quantity: 1 },
        { componentId: 'case-fractal-meshify', quantity: 1 },
        { componentId: 'cooling-noctua-nh-d15', quantity: 1 }
      ]
    },
    {
      id: 'config-workstation',
      name: 'Content Creator Workstation',
      description: 'High-end workstation optimized for content creation and productivity',
      isTemplate: true,
      isPublic: true,
      status: ConfigStatus.APPROVED,
      components: [
        { componentId: 'cpu-amd-ryzen9-7950x', quantity: 1 },
        { componentId: 'mb-asus-rog-x670e', quantity: 1 },
        { componentId: 'gpu-nvidia-rtx4080', quantity: 1 },
        { componentId: 'ram-gskill-trident-32gb', quantity: 1 },
        { componentId: 'storage-samsung-980pro-2tb', quantity: 1 },
        { componentId: 'storage-crucial-p3-4tb', quantity: 1 },
        { componentId: 'psu-corsair-rm850x', quantity: 1 },
        { componentId: 'case-lian-li-o11', quantity: 1 },
        { componentId: 'cooling-corsair-h150i', quantity: 1 }
      ]
    },
    {
      id: 'config-budget-gaming',
      name: 'Budget Gaming PC',
      description: 'Affordable gaming PC for 1080p gaming',
      isTemplate: true,
      isPublic: true,
      status: ConfigStatus.APPROVED,
      components: [
        { componentId: 'cpu-intel-i5-14600k', quantity: 1 },
        { componentId: 'mb-msi-z790-tomahawk', quantity: 1 },
        { componentId: 'gpu-nvidia-rtx4060ti', quantity: 1 },
        { componentId: 'ram-kingston-fury-16gb', quantity: 1 },
        { componentId: 'storage-wd-black-1tb', quantity: 1 },
        { componentId: 'psu-seasonic-focus-750', quantity: 1 },
        { componentId: 'case-fractal-meshify', quantity: 1 },
        { componentId: 'cooling-noctua-nh-d15', quantity: 1 }
      ]
    }
  ]
  
  for (const config of configurations) {
    const exists = await prisma.configuration.findUnique({
      where: { id: config.id }
    })
    
    if (!exists) {
      let totalPrice = 0
      for (const item of config.components) {
        const component = await prisma.component.findUnique({
          where: { id: item.componentId }
        })
        
        if (component) {
          totalPrice += component.price * item.quantity
        }
      }

      await prisma.configuration.create({
        data: {
          id: config.id,
          name: config.name,
          description: config.description,
          totalPrice,
          isTemplate: config.isTemplate,
          isPublic: config.isPublic,
          status: config.status,
          components: {
            create: config.components.map(comp => ({
              componentId: comp.componentId,
              quantity: comp.quantity
            }))
          }
        }
      })
      
      console.log(`Created configuration: ${config.name}`)
    } else {
      console.log(`Configuration ${config.name} already exists.`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })