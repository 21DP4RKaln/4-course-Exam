-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN', 'SPECIALIST') NOT NULL DEFAULT 'USER',
    `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    `blockReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `profileImageUrl` VARCHAR(191) NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `componentcategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `slug` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'component',

    UNIQUE INDEX `componentcategory_name_key`(`name`),
    UNIQUE INDEX `componentcategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `component` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DOUBLE NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `imageUrl` VARCHAR(191) NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `specifications` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sku` VARCHAR(191) NULL,

    UNIQUE INDEX `component_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `peripheralcategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `peripheralcategory_name_key`(`name`),
    UNIQUE INDEX `peripheralcategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `peripheral` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DOUBLE NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `imageUrl` VARCHAR(191) NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `specifications` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sku` VARCHAR(191) NULL,

    UNIQUE INDEX `peripheral_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `specificationkey` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `componentCategoryId` VARCHAR(191) NULL,
    `peripheralCategoryId` VARCHAR(191) NULL,

    UNIQUE INDEX `specificationkey_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `componentspec` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `specKeyId` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,

    UNIQUE INDEX `componentspec_componentId_specKeyId_key`(`componentId`, `specKeyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `peripheralspec` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `specKeyId` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,

    UNIQUE INDEX `peripheralspec_peripheralId_specKeyId_key`(`peripheralId`, `specKeyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configitem` (
    `id` VARCHAR(191) NOT NULL,
    `configurationId` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuration` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `userId` VARCHAR(191) NULL,
    `totalPrice` DOUBLE NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `isTemplate` BOOLEAN NOT NULL DEFAULT false,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `category` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `repair` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('PENDING', 'DIAGNOSING', 'WAITING_FOR_PARTS', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `userId` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NULL,
    `configurationId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `estimatedCost` DOUBLE NULL,
    `finalCost` DOUBLE NULL,
    `completionDate` DATETIME(3) NULL,
    `diagnosticNotes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `repairspecialist` (
    `id` VARCHAR(191) NOT NULL,
    `repairId` VARCHAR(191) NOT NULL,
    `specialistId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,

    UNIQUE INDEX `repairspecialist_repairId_specialistId_key`(`repairId`, `specialistId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `repairpart` (
    `id` VARCHAR(191) NOT NULL,
    `repairId` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `configurationId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `totalAmount` DOUBLE NOT NULL,
    `shippingAddress` TEXT NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `component` ADD CONSTRAINT `component_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `componentcategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peripheral` ADD CONSTRAINT `peripheral_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `peripheralcategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `specificationkey` ADD CONSTRAINT `specificationkey_componentCategoryId_fkey` FOREIGN KEY (`componentCategoryId`) REFERENCES `componentcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `specificationkey` ADD CONSTRAINT `specificationkey_peripheralCategoryId_fkey` FOREIGN KEY (`peripheralCategoryId`) REFERENCES `peripheralcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `componentspec` ADD CONSTRAINT `componentspec_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `componentspec` ADD CONSTRAINT `componentspec_specKeyId_fkey` FOREIGN KEY (`specKeyId`) REFERENCES `specificationkey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peripheralspec` ADD CONSTRAINT `peripheralspec_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peripheralspec` ADD CONSTRAINT `peripheralspec_specKeyId_fkey` FOREIGN KEY (`specKeyId`) REFERENCES `specificationkey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `configitem` ADD CONSTRAINT `configitem_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `configitem` ADD CONSTRAINT `configitem_configurationId_fkey` FOREIGN KEY (`configurationId`) REFERENCES `configuration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `configuration` ADD CONSTRAINT `configuration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repair` ADD CONSTRAINT `repair_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repair` ADD CONSTRAINT `repair_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repair` ADD CONSTRAINT `repair_configurationId_fkey` FOREIGN KEY (`configurationId`) REFERENCES `configuration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repairspecialist` ADD CONSTRAINT `repairspecialist_repairId_fkey` FOREIGN KEY (`repairId`) REFERENCES `repair`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repairspecialist` ADD CONSTRAINT `repairspecialist_specialistId_fkey` FOREIGN KEY (`specialistId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repairpart` ADD CONSTRAINT `repairpart_repairId_fkey` FOREIGN KEY (`repairId`) REFERENCES `repair`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repairpart` ADD CONSTRAINT `repairpart_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_configurationId_fkey` FOREIGN KEY (`configurationId`) REFERENCES `configuration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
