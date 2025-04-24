/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `Component` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ComponentCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `ComponentCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `ComponentCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `component` ADD COLUMN `sku` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `componentcategory` ADD COLUMN `displayOrder` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `SpecificationKey` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,

    UNIQUE INDEX `SpecificationKey_name_key`(`name`),
    INDEX `SpecificationKey_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ComponentSpec` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `specKeyId` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,

    INDEX `ComponentSpec_specKeyId_value_idx`(`specKeyId`, `value`(191)),
    UNIQUE INDEX `ComponentSpec_componentId_specKeyId_key`(`componentId`, `specKeyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Component_sku_key` ON `Component`(`sku`);

-- CreateIndex
CREATE INDEX `Component_categoryId_sku_idx` ON `Component`(`categoryId`, `sku`);

-- CreateIndex
CREATE UNIQUE INDEX `ComponentCategory_name_key` ON `ComponentCategory`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `ComponentCategory_slug_key` ON `ComponentCategory`(`slug`);

-- AddForeignKey
ALTER TABLE `SpecificationKey` ADD CONSTRAINT `SpecificationKey_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ComponentCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ComponentSpec` ADD CONSTRAINT `ComponentSpec_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `Component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ComponentSpec` ADD CONSTRAINT `ComponentSpec_specKeyId_fkey` FOREIGN KEY (`specKeyId`) REFERENCES `SpecificationKey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
