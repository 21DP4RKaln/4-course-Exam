-- AlterTable
ALTER TABLE `component` ADD COLUMN `subType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `peripheral` ADD COLUMN `subType` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `cpu` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `socket` VARCHAR(191) NOT NULL,
    `series` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `cores` INTEGER NOT NULL,
    `threads` INTEGER NOT NULL,
    `baseClock` DOUBLE NOT NULL,
    `boostClock` DOUBLE NOT NULL,
    `cache` VARCHAR(191) NOT NULL,
    `tdp` INTEGER NOT NULL,
    `architecture` VARCHAR(191) NOT NULL,
    `integratedGpu` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `cpu_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gpu` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `chipset` VARCHAR(191) NOT NULL,
    `memory` INTEGER NOT NULL,
    `memoryType` VARCHAR(191) NOT NULL,
    `coreClock` DOUBLE NOT NULL,
    `boostClock` DOUBLE NOT NULL,
    `tdp` INTEGER NOT NULL,
    `powerConnectors` VARCHAR(191) NOT NULL,
    `length` INTEGER NOT NULL,
    `width` INTEGER NOT NULL,
    `hdmiPorts` INTEGER NOT NULL,
    `displayPorts` INTEGER NOT NULL,
    `rayTracing` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `gpu_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `motherboard` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `socket` VARCHAR(191) NOT NULL,
    `chipset` VARCHAR(191) NOT NULL,
    `formFactor` VARCHAR(191) NOT NULL,
    `memoryType` VARCHAR(191) NOT NULL,
    `memorySlots` INTEGER NOT NULL,
    `maxMemory` INTEGER NOT NULL,
    `pciSlots` TEXT NOT NULL,
    `m2Slots` INTEGER NOT NULL,
    `sataConnectors` INTEGER NOT NULL,
    `wifiBuiltIn` BOOLEAN NOT NULL DEFAULT false,
    `bluetoothBuiltIn` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `motherboard_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ram` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `speed` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `modules` INTEGER NOT NULL,
    `casLatency` INTEGER NOT NULL,
    `voltage` DOUBLE NOT NULL,
    `rgb` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `ram_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `storage` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `formFactor` VARCHAR(191) NOT NULL,
    `interface` VARCHAR(191) NOT NULL,
    `readSpeed` INTEGER NOT NULL,
    `writeSpeed` INTEGER NOT NULL,
    `tbw` INTEGER NULL,
    `cache` INTEGER NULL,

    UNIQUE INDEX `storage_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `psu` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `wattage` INTEGER NOT NULL,
    `efficiency` VARCHAR(191) NOT NULL,
    `modular` VARCHAR(191) NOT NULL,
    `fanSize` INTEGER NOT NULL,
    `length` INTEGER NOT NULL,
    `atx3Support` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `psu_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `case` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `formFactor` VARCHAR(191) NOT NULL,
    `dimensions` VARCHAR(191) NOT NULL,
    `materials` VARCHAR(191) NOT NULL,
    `windowType` VARCHAR(191) NULL,
    `includedFans` INTEGER NOT NULL,
    `maxGpuLength` INTEGER NOT NULL,
    `maxCpuHeight` INTEGER NOT NULL,
    `maxPsuLength` INTEGER NOT NULL,
    `usbPorts` VARCHAR(191) NOT NULL,
    `colorVariant` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `case_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cooling` (
    `id` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `radiatorSize` INTEGER NULL,
    `fanSize` INTEGER NOT NULL,
    `fanCount` INTEGER NOT NULL,
    `rgb` BOOLEAN NOT NULL DEFAULT false,
    `noiseLevel` DOUBLE NULL,
    `maxTdp` INTEGER NOT NULL,
    `socketSupport` TEXT NOT NULL,

    UNIQUE INDEX `cooling_componentId_key`(`componentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `keyboard` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `switchType` VARCHAR(191) NULL,
    `layout` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `connection` VARCHAR(191) NOT NULL,
    `rgb` BOOLEAN NOT NULL DEFAULT false,
    `numpad` BOOLEAN NOT NULL DEFAULT true,
    `multimedia` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `keyboard_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mouse` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `dpi` INTEGER NOT NULL,
    `buttons` INTEGER NOT NULL,
    `connection` VARCHAR(191) NOT NULL,
    `rgb` BOOLEAN NOT NULL DEFAULT false,
    `weight` INTEGER NOT NULL,
    `sensor` VARCHAR(191) NOT NULL,
    `batteryLife` INTEGER NULL,

    UNIQUE INDEX `mouse_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mousepad` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `dimensions` VARCHAR(191) NOT NULL,
    `thickness` INTEGER NOT NULL,
    `material` VARCHAR(191) NOT NULL,
    `rgb` BOOLEAN NOT NULL DEFAULT false,
    `surface` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `mousepad_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `microphone` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `pattern` VARCHAR(191) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `sensitivity` VARCHAR(191) NOT NULL,
    `interface` VARCHAR(191) NOT NULL,
    `stand` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `microphone_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `camera` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `resolution` VARCHAR(191) NOT NULL,
    `fps` INTEGER NOT NULL,
    `fov` INTEGER NOT NULL,
    `microphone` BOOLEAN NOT NULL DEFAULT false,
    `autofocus` BOOLEAN NOT NULL DEFAULT false,
    `connection` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `camera_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monitor` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `size` DOUBLE NOT NULL,
    `resolution` VARCHAR(191) NOT NULL,
    `refreshRate` INTEGER NOT NULL,
    `panelType` VARCHAR(191) NOT NULL,
    `responseTime` DOUBLE NOT NULL,
    `brightness` INTEGER NOT NULL,
    `hdr` BOOLEAN NOT NULL DEFAULT false,
    `ports` TEXT NOT NULL,
    `speakers` BOOLEAN NOT NULL DEFAULT false,
    `curved` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `monitor_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `headphones` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `connection` VARCHAR(191) NOT NULL,
    `microphone` BOOLEAN NOT NULL DEFAULT false,
    `impedance` INTEGER NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `weight` INTEGER NOT NULL,
    `noiseCancelling` BOOLEAN NOT NULL DEFAULT false,
    `rgb` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `headphones_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `speakers` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `totalWattage` INTEGER NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `connections` TEXT NOT NULL,
    `bluetooth` BOOLEAN NOT NULL DEFAULT false,
    `remote` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `speakers_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gamepad` (
    `id` VARCHAR(191) NOT NULL,
    `peripheralId` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `connection` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NOT NULL,
    `layout` VARCHAR(191) NOT NULL,
    `vibration` BOOLEAN NOT NULL DEFAULT false,
    `rgb` BOOLEAN NOT NULL DEFAULT false,
    `batteryLife` INTEGER NULL,
    `programmable` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `gamepad_peripheralId_key`(`peripheralId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `case` ADD CONSTRAINT `case_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cooling` ADD CONSTRAINT `cooling_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `keyboard` ADD CONSTRAINT `keyboard_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mouse` ADD CONSTRAINT `mouse_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mousepad` ADD CONSTRAINT `mousepad_peripheralId_fkey` FOREIGN KEY (`peripheralId`) REFERENCES `peripheral`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
