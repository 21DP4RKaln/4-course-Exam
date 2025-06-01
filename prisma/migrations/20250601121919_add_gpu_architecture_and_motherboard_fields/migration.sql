-- AlterTable
ALTER TABLE `gpu` ADD COLUMN `architecture` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `motherboard` ADD COLUMN `compatibility` VARCHAR(191) NULL,
    ADD COLUMN `formFactors` VARCHAR(191) NULL;
