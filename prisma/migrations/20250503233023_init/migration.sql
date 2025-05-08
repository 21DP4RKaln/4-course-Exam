-- CreateTable
CREATE TABLE `promo_code` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `discountPercentage` INTEGER NOT NULL,
    `maxDiscountAmount` DOUBLE NULL,
    `minOrderValue` DOUBLE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `maxUsage` INTEGER NOT NULL DEFAULT 1000,
    `scope` ENUM('ALL', 'SPECIFIC_PRODUCTS') NOT NULL DEFAULT 'ALL',
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `promo_code_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promo_product` (
    `id` VARCHAR(191) NOT NULL,
    `promoCodeId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `productType` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `promo_product_promoCodeId_productId_productType_key`(`promoCodeId`, `productId`, `productType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `promo_product` ADD CONSTRAINT `promo_product_promoCodeId_fkey` FOREIGN KEY (`promoCodeId`) REFERENCES `promo_code`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
