-- AlterTable
ALTER TABLE `case` ADD COLUMN `form` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `motherboard` ADD COLUMN `form` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `psu` ADD COLUMN `energyEfficiency` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ram` ADD COLUMN `gb` INTEGER NULL;
