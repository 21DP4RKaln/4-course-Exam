import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

/**
 * Add sample configurations to the database for testing
 */
async function addSampleConfigurations() {
  console.log('Adding sample configurations...')
  
  // Check if any configurations already exist
  const configCount = await prisma.configuration.count()
  console.log(`Found ${configCount} existing configurations.`)
  
  if (configCount >= 4) {
    console.log('Already have enough configurations. No need to add more.')
    return
  }
  
  const samplePCs = [
    {
      name: 'Gaming Beast',
      description: 'High-performance gaming PC with RTX 4080 and Intel i9',
      totalPrice: 2599.99,
      status: 'APPROVED',
      isTemplate: true,
      isPublic: true,
      category: 'Gaming',
      imageUrl: '/products/sample-pc-gaming.jpg',
      viewCount: 23
    },
    {
      name: 'Office Pro',
      description: 'Reliable office workstation for productivity and multitasking',
      totalPrice: 899.99,
      status: 'APPROVED',
      isTemplate: true,
      isPublic: true,
      category: 'Office',
      imageUrl: '/products/sample-pc-office.jpg',
      viewCount: 12
    },
    {
      name: 'Creator Studio',
      description: 'Content creation powerhouse with 64GB RAM and RTX 4070',
      totalPrice: 1899.99,
      status: 'APPROVED',
      isTemplate: true,
      isPublic: true,
      category: 'Creator',
      imageUrl: '/products/sample-pc-creator.jpg',
      viewCount: 18
    },
    {
      name: 'Budget Gamer',
      description: 'Affordable gaming PC that can handle most modern games',
      totalPrice: 699.99,
      status: 'APPROVED',
      isTemplate: true,
      isPublic: true,
      category: 'Gaming',
      imageUrl: '/products/sample-pc-budget.jpg',
      viewCount: 15,
      discountPrice: 649.99
    },
    {
      name: 'Ultra Workstation',
      description: 'Professional workstation for CAD, 3D rendering and scientific computing',
      totalPrice: 3299.99,
      status: 'APPROVED',
      isTemplate: true,
      isPublic: true,
      category: 'Workstation',
      imageUrl: '/products/sample-pc-workstation.jpg',
      viewCount: 8
    }
  ]
  
  // Add necessary number of configurations
  const configsToAdd = samplePCs.slice(0, Math.min(samplePCs.length, 8 - configCount))
  
  for (const config of configsToAdd) {
    await prisma.configuration.create({
      data: {
        id: randomUUID(),
        name: config.name,
        description: config.description,
        totalPrice: config.totalPrice,
        status: config.status as any,
        isTemplate: config.isTemplate,
        isPublic: config.isPublic,
        category: config.category,
        imageUrl: config.imageUrl,
        viewCount: config.viewCount,
        discountPrice: config.discountPrice
      }
    })
    console.log(`Added configuration: ${config.name}`)
  }
  
  console.log(`Added ${configsToAdd.length} new configurations.`)
}

// Run the function
addSampleConfigurations()
  .catch((e) => {
    console.error('Error adding sample configurations:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
