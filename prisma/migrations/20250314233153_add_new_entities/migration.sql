/*
  Warnings:

  - You are about to drop the column `specs` on the `component` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `component` table. All the data in the column will be lost.
  - You are about to alter the column `category` on the `component` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.
  - You are about to alter the column `name` on the `component` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `manufacturer` on the `component` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.
  - You are about to alter the column `name` on the `configuration` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `email` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - Added the required column `specifications` to the `Component` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `component` DROP COLUMN `specs`,
    DROP COLUMN `stock`,
    ADD COLUMN `availabilityStatus` VARCHAR(191) NOT NULL DEFAULT 'pieejams',
    ADD COLUMN `specifications` TEXT NOT NULL,
    MODIFY `category` VARCHAR(30) NOT NULL,
    MODIFY `name` VARCHAR(50) NOT NULL,
    MODIFY `manufacturer` VARCHAR(30) NOT NULL,
    MODIFY `price` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `configuration` MODIFY `name` VARCHAR(50) NOT NULL,
    MODIFY `totalPrice` DECIMAL(10, 2) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'saglabāts';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `registrationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `surname` VARCHAR(30) NOT NULL,
    MODIFY `email` VARCHAR(50) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL,
    MODIFY `name` VARCHAR(30) NOT NULL;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(15) NOT NULL,
    `configurationId` VARCHAR(191) NOT NULL,
    `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'jauns',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    UNIQUE INDEX `Order_configurationId_key`(`configurationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceOrder` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `problemDescription` TEXT NOT NULL,
    `deviceType` VARCHAR(50) NOT NULL,
    `cost` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'jauns',
    `deliveryDate` DATETIME(3) NULL,
    `completionDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceComponent` (
    `id` VARCHAR(191) NOT NULL,
    `serviceOrderId` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `damageType` VARCHAR(100) NOT NULL,
    `requiredWork` TEXT NOT NULL,
    `workAmount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_configurationId_fkey` FOREIGN KEY (`configurationId`) REFERENCES `Configuration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceOrder` ADD CONSTRAINT `ServiceOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceComponent` ADD CONSTRAINT `ServiceComponent_serviceOrderId_fkey` FOREIGN KEY (`serviceOrderId`) REFERENCES `ServiceOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceComponent` ADD CONSTRAINT `ServiceComponent_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `Component`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
