-- AlterTable
ALTER TABLE `cpu` ADD COLUMN `powerConsumption` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `gpu` ADD COLUMN `powerConsumption` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `subBrand` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ram` ADD COLUMN `powerConsumption` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `storage` ADD COLUMN `powerConsumption` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
