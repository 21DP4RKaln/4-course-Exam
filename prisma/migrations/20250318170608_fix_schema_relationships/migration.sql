/*
  Warnings:

  - You are about to drop the column `estimatedDelivery` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `statusupdate` table. All the data in the column will be lost.
  - You are about to drop the column `configurationId` on the `statusupdate` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `statusupdate` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `featuredconfiguration` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `serviceOrderId` on table `statusupdate` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `featuredconfiguration` DROP FOREIGN KEY `FeaturedConfiguration_configurationId_fkey`;

-- DropForeignKey
ALTER TABLE `featuredconfiguration` DROP FOREIGN KEY `FeaturedConfiguration_specialistId_fkey`;

-- DropForeignKey
ALTER TABLE `statusupdate` DROP FOREIGN KEY `StatusUpdate_configurationId_fkey`;

-- DropForeignKey
ALTER TABLE `statusupdate` DROP FOREIGN KEY `StatusUpdate_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `statusupdate` DROP FOREIGN KEY `StatusUpdate_serviceOrderId_fkey`;

-- DropIndex
DROP INDEX `StatusUpdate_configurationId_fkey` ON `statusupdate`;

-- DropIndex
DROP INDEX `StatusUpdate_orderId_fkey` ON `statusupdate`;

-- DropIndex
DROP INDEX `StatusUpdate_serviceOrderId_fkey` ON `statusupdate`;

-- AlterTable
ALTER TABLE `configuration` ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `estimatedDelivery`;

-- AlterTable
ALTER TABLE `statusupdate` DROP COLUMN `comment`,
    DROP COLUMN `configurationId`,
    DROP COLUMN `orderId`,
    MODIFY `serviceOrderId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `isActive`,
    ADD COLUMN `blocked` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `featuredconfiguration`;

-- CreateTable
CREATE TABLE `StatusChange` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `oldStatus` VARCHAR(191) NOT NULL,
    `newStatus` VARCHAR(191) NOT NULL,
    `changedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Configuration` ADD CONSTRAINT `Configuration_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusChange` ADD CONSTRAINT `StatusChange_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusChange` ADD CONSTRAINT `StatusChange_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusUpdate` ADD CONSTRAINT `StatusUpdate_serviceOrderId_fkey` FOREIGN KEY (`serviceOrderId`) REFERENCES `ServiceOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
