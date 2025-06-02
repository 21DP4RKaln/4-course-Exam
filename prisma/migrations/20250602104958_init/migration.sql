-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
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
    `shippingAddress` VARCHAR(191) NULL,
    `shippingCity` VARCHAR(191) NULL,
    `shippingPostalCode` VARCHAR(191) NULL,
    `shippingCountry` VARCHAR(191) NULL,

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
CREATE TABLE `configitem` (
    `id` VARCHAR(191) NOT NULL,
    `configurationId` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,

    INDEX `configitem_componentId_idx`(`componentId`),
    INDEX `configitem_configurationId_idx`(`configurationId`),
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
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `discountExpiresAt` DATETIME(3) NULL,
    `discountPrice` DOUBLE NULL,

    INDEX `configuration_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `peripheralcategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'peripheral',

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
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `discountExpiresAt` DATETIME(3) NULL,
    `discountPrice` DOUBLE NULL,
    `subType` VARCHAR(191) NOT NULL,
    `imagesUrl` TEXT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `rating` DOUBLE NULL DEFAULT 0,
    `ratingCount` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `peripheral_sku_key`(`sku`),
    INDEX `peripheral_categoryId_idx`(`categoryId`),
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

    INDEX `repair_configurationId_idx`(`configurationId`),
    INDEX `repair_peripheralId_idx`(`peripheralId`),
    INDEX `repair_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `repairspecialist` (
    `id` VARCHAR(191) NOT NULL,
    `repairId` VARCHAR(191) NOT NULL,
    `specialistId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,

    INDEX `repairspecialist_specialistId_idx`(`specialistId`),
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

    INDEX `repairpart_componentId_idx`(`componentId`),
    INDEX `repairpart_repairId_idx`(`repairId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `configurationId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `totalAmount` DOUBLE NOT NULL,
    `shippingAddress` TEXT NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `shippingMethod` VARCHAR(191) NULL,
    `isGuestOrder` BOOLEAN NOT NULL DEFAULT false,
    `shippingEmail` VARCHAR(191) NULL,
    `shippingName` VARCHAR(191) NULL,
    `shippingPhone` VARCHAR(191) NULL,
    `discount` DOUBLE NULL DEFAULT 0,
    `shippingCost` DOUBLE NULL DEFAULT 10,
    `locale` VARCHAR(191) NULL DEFAULT 'en',

    INDEX `order_configurationId_idx`(`configurationId`),
    INDEX `order_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `productType` ENUM('CONFIGURATION', 'COMPONENT', 'PERIPHERAL') NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `purchaseDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `review_productId_productType_idx`(`productId`, `productType`),
    UNIQUE INDEX `review_userId_productId_productType_key`(`userId`, `productId`, `productType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_helpful` (
    `id` VARCHAR(191) NOT NULL,
    `reviewId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `isHelpful` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `review_helpful_userId_idx`(`userId`),
    UNIQUE INDEX `review_helpful_reviewId_userId_key`(`reviewId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `order_item` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `productType` ENUM('CONFIGURATION', 'COMPONENT', 'PERIPHERAL') NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DOUBLE NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    INDEX `order_item_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promocode` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `discountPercentage` INTEGER NOT NULL,
    `maxDiscountAmount` DOUBLE NULL,
    `minOrderValue` DOUBLE NULL,
    `maxUsage` INTEGER NULL,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `scope` ENUM('ALL', 'SPECIFIC_PRODUCTS') NOT NULL DEFAULT 'ALL',

    UNIQUE INDEX `promocode_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promoproduct` (
    `id` VARCHAR(191) NOT NULL,
    `promoCodeId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `productType` VARCHAR(191) NOT NULL,

    INDEX `promoproduct_promoCodeId_idx`(`promoCodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `metadata` TEXT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `marketing_campaign_promoCodeId_idx`(`promoCodeId`),
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

-- CreateTable
CREATE TABLE `accounts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    INDEX `accounts_userId_idx`(`userId`),
    UNIQUE INDEX `accounts_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sessions_sessionToken_key`(`sessionToken`),
    INDEX `sessions_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_token_key`(`token`),
    INDEX `password_reset_tokens_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verificationtokens` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `verificationtokens_token_key`(`token`),
    UNIQUE INDEX `verificationtokens_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `component` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DOUBLE NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `discountExpiresAt` DATETIME(3) NULL,
    `discountPrice` DOUBLE NULL,
    `subType` VARCHAR(191) NOT NULL,
    `imagesUrl` TEXT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `rating` DOUBLE NULL DEFAULT 0,
    `ratingCount` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `component_sku_key`(`sku`),
    INDEX `component_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cpu` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `socket` VARCHAR(191) NOT NULL,
    `series` VARCHAR(191) NOT NULL,
    `cores` INTEGER NOT NULL,
    `integratedGpu` BOOLEAN NOT NULL,
    `frequency` DOUBLE NOT NULL,
    `maxRamCapacity` INTEGER NOT NULL,
    `maxRamFrequency` INTEGER NOT NULL,
    `multithreading` BOOLEAN NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `powerConsumption` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `cpu_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gpu` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `memoryType` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `chipType` VARCHAR(191) NOT NULL,
    `fanCount` INTEGER NOT NULL,
    `hasDVI` BOOLEAN NOT NULL,
    `hasDisplayPort` BOOLEAN NOT NULL,
    `hasHDMI` BOOLEAN NOT NULL,
    `hasVGA` BOOLEAN NOT NULL,
    `videoMemoryCapacity` INTEGER NOT NULL,
    `powerConsumption` DOUBLE NOT NULL DEFAULT 0,
    `subBrand` VARCHAR(191) NULL,
    `architecture` VARCHAR(191) NULL,

    UNIQUE INDEX `gpu_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `motherboard` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `socket` VARCHAR(191) NOT NULL,
    `memorySlots` INTEGER NOT NULL,
    `m2Slots` INTEGER NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `maxMemoryFrequency` INTEGER NOT NULL,
    `maxRamCapacity` INTEGER NOT NULL,
    `maxVideoCards` INTEGER NOT NULL,
    `memoryTypeSupported` VARCHAR(191) NOT NULL,
    `nvmeSupport` BOOLEAN NOT NULL,
    `processorSupport` VARCHAR(191) NOT NULL,
    `sataPorts` INTEGER NOT NULL,
    `sliCrossfireSupport` BOOLEAN NOT NULL,
    `wifiBluetooth` BOOLEAN NOT NULL,
    `form` VARCHAR(191) NULL,
    `compatibility` VARCHAR(191) NULL,

    UNIQUE INDEX `motherboard_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ram` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `voltage` DOUBLE NOT NULL,
    `backlighting` BOOLEAN NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `maxFrequency` INTEGER NOT NULL,
    `memoryType` VARCHAR(191) NOT NULL,
    `moduleCount` INTEGER NOT NULL,
    `powerConsumption` DOUBLE NOT NULL DEFAULT 0,
    `gb` INTEGER NULL,

    UNIQUE INDEX `ram_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `storage` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `readSpeed` DOUBLE NOT NULL,
    `writeSpeed` DOUBLE NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `compatibility` VARCHAR(191) NOT NULL,
    `nvme` BOOLEAN NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `volume` INTEGER NOT NULL,
    `powerConsumption` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `storage_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `psu` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `hasFan` BOOLEAN NOT NULL,
    `molexPataConnections` INTEGER NOT NULL,
    `pciEConnections` INTEGER NOT NULL,
    `pfc` BOOLEAN NOT NULL,
    `power` INTEGER NOT NULL,
    `sataConnections` INTEGER NOT NULL,
    `energyEfficiency` VARCHAR(191) NULL,

    UNIQUE INDEX `psu_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cooling` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `fanDiameter` DOUBLE NOT NULL,
    `fanSpeed` INTEGER NOT NULL,
    `socket` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `radiatorSize` VARCHAR(191) NULL,
    `subCategory` VARCHAR(191) NULL,

    UNIQUE INDEX `cooling_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `case` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `audioIn` BOOLEAN NOT NULL,
    `audioOut` BOOLEAN NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `material` VARCHAR(191) NOT NULL,
    `powerSupplyIncluded` BOOLEAN NOT NULL,
    `slots25` INTEGER NOT NULL,
    `slots35` INTEGER NOT NULL,
    `slots525` INTEGER NOT NULL,
    `usb2` INTEGER NOT NULL,
    `usb3` INTEGER NOT NULL,
    `usb32` INTEGER NOT NULL,
    `usbTypeC` INTEGER NOT NULL,
    `waterCoolingSupport` BOOLEAN NOT NULL,
    `form` VARCHAR(191) NULL,

    UNIQUE INDEX `case_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `keyboard` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `switchType` VARCHAR(191) NOT NULL,
    `layout` VARCHAR(191) NOT NULL,
    `connection` VARCHAR(191) NOT NULL,
    `rgb` BOOLEAN NOT NULL,
    `numpad` BOOLEAN NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `form` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `keyboard_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mouse` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `dpi` INTEGER NOT NULL,
    `buttons` INTEGER NOT NULL,
    `connection` VARCHAR(191) NOT NULL,
    `rgb` BOOLEAN NOT NULL,
    `weight` DOUBLE NOT NULL,
    `sensor` VARCHAR(191) NOT NULL,
    `batteryLife` INTEGER NOT NULL,
    `batteryType` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `mouse_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `microphone` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `pattern` VARCHAR(191) NOT NULL,
    `frequency` INTEGER NOT NULL,
    `sensitivity` DOUBLE NOT NULL,
    `interface` VARCHAR(191) NOT NULL,
    `stand` BOOLEAN NOT NULL,
    `brand` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `microphone_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `camera` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `resolution` VARCHAR(191) NOT NULL,
    `fps` DOUBLE NOT NULL,
    `fov` DOUBLE NOT NULL,
    `microphone` BOOLEAN NOT NULL,
    `autofocus` BOOLEAN NOT NULL,
    `connection` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `camera_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monitor` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `size` DOUBLE NOT NULL,
    `resolution` VARCHAR(191) NOT NULL,
    `refreshRate` INTEGER NOT NULL,
    `panelType` VARCHAR(191) NOT NULL,
    `responseTime` DOUBLE NOT NULL,
    `brightness` INTEGER NOT NULL,
    `hdr` BOOLEAN NOT NULL,
    `ports` VARCHAR(191) NOT NULL,
    `speakers` BOOLEAN NOT NULL,
    `curved` BOOLEAN NOT NULL,
    `brand` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `monitor_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `headphones` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `connection` VARCHAR(191) NOT NULL,
    `microphone` BOOLEAN NOT NULL,
    `impedance` DOUBLE NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `noiseCancelling` BOOLEAN NOT NULL,
    `rgb` BOOLEAN NOT NULL,
    `brand` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `headphones_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `speakers` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `totalWattage` INTEGER NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `connections` VARCHAR(191) NOT NULL,
    `bluetooth` BOOLEAN NOT NULL,
    `remote` BOOLEAN NOT NULL,
    `brand` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `speakers_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gamepad` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `connection` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NOT NULL,
    `layout` VARCHAR(191) NOT NULL,
    `vibration` BOOLEAN NOT NULL,
    `rgb` BOOLEAN NOT NULL,
    `batteryLife` INTEGER NOT NULL,
    `programmable` BOOLEAN NOT NULL,
    `brand` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `gamepad_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mousepad` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `dimensions` VARCHAR(191) NOT NULL,
    `thickness` DOUBLE NOT NULL,
    `material` VARCHAR(191) NOT NULL,
    `rgb` BOOLEAN NOT NULL,
    `surface` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `mousepad_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `configitem` ADD CONSTRAINT `config_item_component_fk` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `configitem` ADD CONSTRAINT `config_item_configuration_fk` FOREIGN KEY (`configurationId`) REFERENCES `configuration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `configuration` ADD CONSTRAINT `configuration_user_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peripheral` ADD CONSTRAINT `peripheral_category_fk` FOREIGN KEY (`categoryId`) REFERENCES `peripheralcategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repair` ADD CONSTRAINT `repair_configuration_fk` FOREIGN KEY (`configurationId`) REFERENCES `configuration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repair` ADD CONSTRAINT `repair_peripheral_fk` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repair` ADD CONSTRAINT `repair_user_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repairspecialist` ADD CONSTRAINT `repair_specialist_repair_fk` FOREIGN KEY (`repairId`) REFERENCES `repair`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repairspecialist` ADD CONSTRAINT `repair_specialist_user_fk` FOREIGN KEY (`specialistId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repairpart` ADD CONSTRAINT `repair_part_component_fk` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repairpart` ADD CONSTRAINT `repair_part_repair_fk` FOREIGN KEY (`repairId`) REFERENCES `repair`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_configuration_fk` FOREIGN KEY (`configurationId`) REFERENCES `configuration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_user_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_helpful` ADD CONSTRAINT `review_helpful_review_fk` FOREIGN KEY (`reviewId`) REFERENCES `review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_helpful` ADD CONSTRAINT `review_helpful_user_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist` ADD CONSTRAINT `wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_order_fk` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promoproduct` ADD CONSTRAINT `promo_product_promo_code_fk` FOREIGN KEY (`promoCodeId`) REFERENCES `promocode`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marketing_campaign` ADD CONSTRAINT `marketing_campaign_promo_code_fk` FOREIGN KEY (`promoCodeId`) REFERENCES `promocode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_metrics` ADD CONSTRAINT `campaign_metrics_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `marketing_campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `account_user_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `session_user_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_token_user_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `component` ADD CONSTRAINT `component_category_fk` FOREIGN KEY (`categoryId`) REFERENCES `componentcategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpu` ADD CONSTRAINT `cpu_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gpu` ADD CONSTRAINT `gpu_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `motherboard` ADD CONSTRAINT `motherboard_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ram` ADD CONSTRAINT `ram_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `storage` ADD CONSTRAINT `storage_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `psu` ADD CONSTRAINT `psu_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cooling` ADD CONSTRAINT `cooling_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `case` ADD CONSTRAINT `case_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `keyboard` ADD CONSTRAINT `keyboard_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mouse` ADD CONSTRAINT `mouse_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `microphone` ADD CONSTRAINT `microphone_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `camera` ADD CONSTRAINT `camera_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `monitor` ADD CONSTRAINT `monitor_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `headphones` ADD CONSTRAINT `headphones_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `speakers` ADD CONSTRAINT `speakers_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gamepad` ADD CONSTRAINT `gamepad_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mousepad` ADD CONSTRAINT `mousepad_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
