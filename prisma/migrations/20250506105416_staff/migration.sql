-- CreateTable
CREATE TABLE `audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL DEFAULT '',
    `details` TEXT NOT NULL,
    `ipAddress` VARCHAR(191) NULL DEFAULT '',
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_log_userId_idx`(`userId`),
    INDEX `audit_log_action_idx`(`action`),
    INDEX `audit_log_entityType_idx`(`entityType`),
    INDEX `audit_log_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketing_campaign` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `targetAudience` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `content` TEXT NULL,
    `bannerImageUrl` VARCHAR(191) NULL,
    `promoCodeId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaign_metrics` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `impressions` INTEGER NOT NULL DEFAULT 0,
    `clicks` INTEGER NOT NULL DEFAULT 0,
    `conversions` INTEGER NOT NULL DEFAULT 0,
    `lastUpdated` DATETIME(3) NOT NULL,

    UNIQUE INDEX `campaign_metrics_campaignId_key`(`campaignId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marketing_campaign` ADD CONSTRAINT `marketing_campaign_promoCodeId_fkey` FOREIGN KEY (`promoCodeId`) REFERENCES `promo_code`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_metrics` ADD CONSTRAINT `campaign_metrics_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `marketing_campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
