import { PrismaClient, PromoCodeScope } from '@prisma/client';

export async function seedPromoCodes(prisma: PrismaClient) {
  const now = new Date();
  // Different types of promo codes
  const promoCodes = [
    {
      code: "WELCOME10",
      discountPercentage: 10,
      maxDiscountAmount: 15000,
      minOrderValue: 5000,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      maxUsage: 1000,
      usageCount: 348,
      isActive: true,
      description: "10% discount for new customers",
      scope: PromoCodeScope.ALL
    },
    {
      code: "SUMMER25",
      discountPercentage: 25,
      maxDiscountAmount: 25000,
      minOrderValue: 50000,
      expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now (summer)
      maxUsage: 500,
      usageCount: 0,
      isActive: true,
      description: "Summer sale - 25% off high-end systems",
      scope: PromoCodeScope.ALL
    },
    {
      code: "FLAT5000",
      discountPercentage: 100, // Since Prisma schema only has discountPercentage, using 100 for flat discount
      maxDiscountAmount: 5000, // €50 flat discount
      minOrderValue: 20000,
      expiresAt: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      maxUsage: 200,
      usageCount: 87,
      isActive: true,
      description: "€50 off your purchase over €200",
      scope: PromoCodeScope.ALL
    },
    {
      code: "VIP15",
      discountPercentage: 15,
      maxDiscountAmount: null,
      minOrderValue: 0,
      expiresAt: new Date(now.getTime() + 305 * 24 * 60 * 60 * 1000), // ~10 months from now
      maxUsage: 50,
      usageCount: 12,
      isActive: true,
      description: "15% VIP customer discount",
      scope: PromoCodeScope.ALL
    },
    {
      code: "FLASH30",
      discountPercentage: 30,
      maxDiscountAmount: 30000,
      minOrderValue: 75000,
      expiresAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      maxUsage: 100,
      usageCount: 23,
      isActive: true,
      description: "Flash sale - 30% off for 48 hours",
      scope: PromoCodeScope.ALL
    },
    {
      code: "BUNDLE20",
      discountPercentage: 20,
      maxDiscountAmount: 40000,
      minOrderValue: 100000,
      expiresAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      maxUsage: 75,
      usageCount: 42,
      isActive: true,
      description: "20% off when you spend over €1000",
      scope: PromoCodeScope.ALL
    },
    {
      code: "HOLIDAY50",
      discountPercentage: 50,
      maxDiscountAmount: 100000,
      minOrderValue: 200000,
      expiresAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // yesterday (expired)
      maxUsage: 50,
      usageCount: 50,
      isActive: false,
      description: "Holiday special - 50% off premium configurations (EXPIRED)",
      scope: PromoCodeScope.ALL
    },
    {
      code: "EARLYBIRD",
      discountPercentage: 15,
      maxDiscountAmount: 20000,
      minOrderValue: 0,
      expiresAt: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days in the future
      maxUsage: 100,
      usageCount: 0,
      isActive: true,
      description: "Early bird discount for next month's sale (not active yet)",
      scope: PromoCodeScope.ALL
    },
    {
      code: "FREESHIP",
      discountPercentage: 100, // Full discount percentage
      maxDiscountAmount: 1000, // €10 shipping discount
      minOrderValue: 0,
      expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      maxUsage: null, // unlimited
      usageCount: 853,
      isActive: true,
      description: "Free shipping on all orders",
      scope: PromoCodeScope.ALL
    },
    {
      code: "EMPLOYEE50",
      discountPercentage: 50,
      maxDiscountAmount: 100000,
      minOrderValue: 0,
      expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      maxUsage: 10,
      usageCount: 4,
      isActive: true,
      description: "50% employee discount",
      scope: PromoCodeScope.ALL
    }
  ];
    // Insert promo codes
  for (const promoCode of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promoCode.code },
      update: promoCode,
      create: promoCode
    });
  }
}
