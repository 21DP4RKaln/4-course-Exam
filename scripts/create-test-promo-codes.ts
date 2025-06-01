import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestPromoCodes() {
  try {
    await prisma.promoCode.upsert({
      where: { code: 'TEST20' },
      update: {},
      create: {
        code: 'TEST20',
        description: 'Test promo code for 20% discount',
        discountPercentage: 20,
        isActive: true,
        expiresAt: new Date('2025-12-31T23:59:59Z'),
      }
    })

    await prisma.promoCode.upsert({
      where: { code: 'TEST50' },
      update: {},
      create: {
        code: 'TEST50',
        description: 'Test promo code for 50% discount',
        discountPercentage: 50,
        isActive: true,
        expiresAt: new Date('2025-12-31T23:59:59Z'),
      }
    })

    await prisma.promoCode.upsert({
      where: { code: 'TEST100' },
      update: {},
      create: {
        code: 'TEST100',
        description: 'Test promo code for 100% discount',
        discountPercentage: 100,
        isActive: true,
        expiresAt: new Date('2025-12-31T23:59:59Z'),
      }
    })

    console.log('Test promo codes created successfully!')
  } catch (error) {
    console.error('Error creating test promo codes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPromoCodes()
