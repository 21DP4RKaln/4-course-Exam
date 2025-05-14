/*
  Warnings:

  - You are about to drop the `promo_code` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `promo_product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `marketing_campaign` DROP FOREIGN KEY `marketing_campaign_promoCodeId_fkey`;

-- DropForeignKey
ALTER TABLE `promo_product` DROP FOREIGN KEY `promo_product_promoCodeId_fkey`;

-- DropTable
DROP TABLE `promo_code`;

-- DropTable
DROP TABLE `promo_product`;

-- CreateTable
CREATE TABLE `promocode` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `discountPercentage` INTEGER NOT NULL,
    `maxDiscountAmount` DOUBLE NULL,
    `minOrderValue` DOUBLE NULL,
    `maxUsage` INTEGER NULL,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `scope` ENUM('ALL', 'SPECIFIC_PRODUCTS') NOT NULL DEFAULT 'ALL',

    UNIQUE INDEX `promocode_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promoproduct` (
    `id` VARCHAR(191) NOT NULL,
    `promoCodeId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `productType` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `promoproduct` ADD CONSTRAINT `promoproduct_promoCodeId_fkey` FOREIGN KEY (`promoCodeId`) REFERENCES `promocode`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marketing_campaign` ADD CONSTRAINT `marketing_campaign_promoCodeId_fkey` FOREIGN KEY (`promoCodeId`) REFERENCES `promocode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
