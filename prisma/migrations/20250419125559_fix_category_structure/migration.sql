-- First check if unique index on name exists
SET @indexExists = (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'ComponentCategory' AND index_name = 'ComponentCategory_name_key');

-- Create unique index if it doesn't exist
SET @createIndexSQL = IF(@indexExists = 0, 'CREATE UNIQUE INDEX ComponentCategory_name_key ON ComponentCategory(name)', 'SELECT 1');
PREPARE stmt FROM @createIndexSQL;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add the slug column
ALTER TABLE `ComponentCategory` ADD COLUMN IF NOT EXISTS `slug` VARCHAR(191) NULL;

-- Add the displayOrder column with default value
ALTER TABLE `ComponentCategory` ADD COLUMN IF NOT EXISTS `displayOrder` INTEGER NOT NULL DEFAULT 0;

-- Create SpecificationKey table if it doesn't exist
CREATE TABLE IF NOT EXISTS `SpecificationKey` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,

    UNIQUE INDEX `SpecificationKey_name_key`(`name`),
    INDEX `SpecificationKey_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create ComponentSpec table if it doesn't exist
CREATE TABLE IF NOT EXISTS `ComponentSpec` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `specKeyId` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,

    UNIQUE INDEX `ComponentSpec_componentId_specKeyId_key`(`componentId`, `specKeyId`),
    INDEX `ComponentSpec_specKeyId_value_idx`(`specKeyId`, `value`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add sku column to Component table if it doesn't exist
ALTER TABLE `Component` ADD COLUMN IF NOT EXISTS `sku` VARCHAR(191) NULL;

-- Create unique index on sku if it doesn't exist
SET @skuIndexExists = (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'Component' AND index_name = 'Component_sku_key');

SET @createSkuIndexSQL = IF(@skuIndexExists = 0, 'CREATE UNIQUE INDEX Component_sku_key ON Component(sku)', 'SELECT 1');
PREPARE stmt FROM @createSkuIndexSQL;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create index on categoryId and sku if it doesn't exist
SET @catSkuIndexExists = (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'Component' AND index_name = 'Component_categoryId_sku_idx');

SET @createCatSkuIndexSQL = IF(@catSkuIndexExists = 0, 'CREATE INDEX Component_categoryId_sku_idx ON Component(categoryId, sku)', 'SELECT 1');
PREPARE stmt FROM @createCatSkuIndexSQL;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraints if they don't exist
-- First check if the foreign key exists
SET @fk1Exists = (SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_schema = DATABASE() AND table_name = 'SpecificationKey' AND constraint_name = 'SpecificationKey_categoryId_fkey');

SET @addFK1SQL = IF(@fk1Exists = 0, 'ALTER TABLE `SpecificationKey` ADD CONSTRAINT `SpecificationKey_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ComponentCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @addFK1SQL;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if the other foreign keys exist
SET @fk2Exists = (SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_schema = DATABASE() AND table_name = 'ComponentSpec' AND constraint_name = 'ComponentSpec_componentId_fkey');

SET @addFK2SQL = IF(@fk2Exists = 0, 'ALTER TABLE `ComponentSpec` ADD CONSTRAINT `ComponentSpec_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `Component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @addFK2SQL;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk3Exists = (SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_schema = DATABASE() AND table_name = 'ComponentSpec' AND constraint_name = 'ComponentSpec_specKeyId_fkey');

SET @addFK3SQL = IF(@fk3Exists = 0, 'ALTER TABLE `ComponentSpec` ADD CONSTRAINT `ComponentSpec_specKeyId_fkey` FOREIGN KEY (`specKeyId`) REFERENCES `SpecificationKey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @addFK3SQL;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;