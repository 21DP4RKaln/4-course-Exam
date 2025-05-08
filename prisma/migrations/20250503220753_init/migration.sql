-- CreateTable
CREATE TABLE `wishlist` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `productType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `wishlist_userId_productId_productType_key`(`userId`, `productId`, `productType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wishlist` ADD CONSTRAINT `wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
