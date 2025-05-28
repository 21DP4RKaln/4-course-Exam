-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `order_userId_fkey`;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `isGuestOrder` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `shippingEmail` VARCHAR(191) NULL,
    ADD COLUMN `shippingName` VARCHAR(191) NULL,
    ADD COLUMN `shippingPhone` VARCHAR(191) NULL,
    MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
