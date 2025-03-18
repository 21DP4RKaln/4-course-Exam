-- AlterTable
ALTER TABLE `component` ADD COLUMN `addedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `configuration` ADD COLUMN `isPublic` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `estimatedDelivery` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `role` ENUM('CLIENT', 'SPECIALIST', 'ADMIN') NOT NULL DEFAULT 'CLIENT';

-- CreateTable
CREATE TABLE `FeaturedConfiguration` (
    `id` VARCHAR(191) NOT NULL,
    `configurationId` VARCHAR(191) NOT NULL,
    `specialistId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FeaturedConfiguration_configurationId_key`(`configurationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StatusUpdate` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `configurationId` VARCHAR(191) NULL,
    `serviceOrderId` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NOT NULL,
    `oldStatus` VARCHAR(191) NOT NULL,
    `newStatus` VARCHAR(191) NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FeaturedConfiguration` ADD CONSTRAINT `FeaturedConfiguration_configurationId_fkey` FOREIGN KEY (`configurationId`) REFERENCES `Configuration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeaturedConfiguration` ADD CONSTRAINT `FeaturedConfiguration_specialistId_fkey` FOREIGN KEY (`specialistId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusUpdate` ADD CONSTRAINT `StatusUpdate_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusUpdate` ADD CONSTRAINT `StatusUpdate_configurationId_fkey` FOREIGN KEY (`configurationId`) REFERENCES `Configuration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusUpdate` ADD CONSTRAINT `StatusUpdate_serviceOrderId_fkey` FOREIGN KEY (`serviceOrderId`) REFERENCES `ServiceOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusUpdate` ADD CONSTRAINT `StatusUpdate_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
