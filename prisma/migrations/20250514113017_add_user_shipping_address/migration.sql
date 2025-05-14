-- AlterTable
ALTER TABLE `user` ADD COLUMN `shippingAddress` VARCHAR(191) NULL,
    ADD COLUMN `shippingCity` VARCHAR(191) NULL,
    ADD COLUMN `shippingPostalCode` VARCHAR(191) NULL,
    ADD COLUMN `shippingCountry` VARCHAR(191) NULL;
