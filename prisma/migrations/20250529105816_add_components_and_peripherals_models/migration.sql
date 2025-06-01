/*
  Warnings:

  - You are about to drop the column `manufacturer` on the `camera` table. All the data in the column will be lost.
  - You are about to alter the column `fps` on the `camera` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `fov` on the `camera` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the column `colorVariant` on the `case` table. All the data in the column will be lost.
  - You are about to drop the column `dimensions` on the `case` table. All the data in the column will be lost.
  - You are about to drop the column `formFactor` on the `case` table. All the data in the column will be lost.
  - You are about to drop the column `includedFans` on the `case` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `case` table. All the data in the column will be lost.
  - You are about to drop the column `materials` on the `case` table. All the data in the column will be lost.
  - You are about to drop the column `maxCpuHeight` on the `case` table. All the data in the column will be lost.
  - You are about to drop the column `maxGpuLength` on the `case` table. All the data in the column will be lost.
  - You are about to drop the column `maxPsuLength` on the `case` table. All the data in the column will be lost.
  - You are about to drop the column `usbPorts` on the `case` table. All the data in the column will be lost.
  - You are about to drop the column `windowType` on the `case` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `component` table. All the data in the column will be lost.
  - You are about to drop the column `specifications` on the `component` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `component` table. All the data in the column will be lost.
  - You are about to drop the column `fanCount` on the `cooling` table. All the data in the column will be lost.
  - You are about to drop the column `fanSize` on the `cooling` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `cooling` table. All the data in the column will be lost.
  - You are about to drop the column `maxTdp` on the `cooling` table. All the data in the column will be lost.
  - You are about to drop the column `noiseLevel` on the `cooling` table. All the data in the column will be lost.
  - You are about to drop the column `radiatorSize` on the `cooling` table. All the data in the column will be lost.
  - You are about to drop the column `rgb` on the `cooling` table. All the data in the column will be lost.
  - You are about to drop the column `socketSupport` on the `cooling` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `cooling` table. All the data in the column will be lost.
  - You are about to drop the column `architecture` on the `cpu` table. All the data in the column will be lost.
  - You are about to drop the column `baseClock` on the `cpu` table. All the data in the column will be lost.
  - You are about to drop the column `boostClock` on the `cpu` table. All the data in the column will be lost.
  - You are about to drop the column `cache` on the `cpu` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `cpu` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `cpu` table. All the data in the column will be lost.
  - You are about to drop the column `tdp` on the `cpu` table. All the data in the column will be lost.
  - You are about to drop the column `threads` on the `cpu` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `gamepad` table. All the data in the column will be lost.
  - You are about to drop the column `boostClock` on the `gpu` table. All the data in the column will be lost.
  - You are about to drop the column `chipset` on the `gpu` table. All the data in the column will be lost.
  - You are about to drop the column `coreClock` on the `gpu` table. All the data in the column will be lost.
  - You are about to drop the column `displayPorts` on the `gpu` table. All the data in the column will be lost.
  - You are about to drop the column `hdmiPorts` on the `gpu` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `gpu` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `gpu` table. All the data in the column will be lost.
  - You are about to drop the column `memory` on the `gpu` table. All the data in the column will be lost.
  - You are about to drop the column `powerConnectors` on the `gpu` table. All the data in the column will be lost.
  - You are about to drop the column `rayTracing` on the `gpu` table. All the data in the column will be lost.
  - You are about to drop the column `tdp` on the `gpu` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `gpu` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `headphones` table. All the data in the column will be lost.
  - You are about to alter the column `weight` on the `headphones` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the column `manufacturer` on the `keyboard` table. All the data in the column will be lost.
  - You are about to drop the column `multimedia` on the `keyboard` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `keyboard` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `microphone` table. All the data in the column will be lost.
  - You are about to alter the column `frequency` on the `microphone` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `sensitivity` on the `microphone` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.
  - You are about to drop the column `manufacturer` on the `monitor` table. All the data in the column will be lost.
  - You are about to drop the column `bluetoothBuiltIn` on the `motherboard` table. All the data in the column will be lost.
  - You are about to drop the column `chipset` on the `motherboard` table. All the data in the column will be lost.
  - You are about to drop the column `formFactor` on the `motherboard` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `motherboard` table. All the data in the column will be lost.
  - You are about to drop the column `maxMemory` on the `motherboard` table. All the data in the column will be lost.
  - You are about to drop the column `memoryType` on the `motherboard` table. All the data in the column will be lost.
  - You are about to drop the column `pciSlots` on the `motherboard` table. All the data in the column will be lost.
  - You are about to drop the column `sataConnectors` on the `motherboard` table. All the data in the column will be lost.
  - You are about to drop the column `wifiBuiltIn` on the `motherboard` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `mouse` table. All the data in the column will be lost.
  - You are about to alter the column `weight` on the `mouse` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the column `manufacturer` on the `mousepad` table. All the data in the column will be lost.
  - You are about to alter the column `thickness` on the `mousepad` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the column `imageUrl` on the `peripheral` table. All the data in the column will be lost.
  - You are about to drop the column `specifications` on the `peripheral` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `peripheral` table. All the data in the column will be lost.
  - You are about to drop the column `displayOrder` on the `peripheralcategory` table. All the data in the column will be lost.
  - You are about to drop the column `atx3Support` on the `psu` table. All the data in the column will be lost.
  - You are about to drop the column `efficiency` on the `psu` table. All the data in the column will be lost.
  - You are about to drop the column `fanSize` on the `psu` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `psu` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `psu` table. All the data in the column will be lost.
  - You are about to drop the column `modular` on the `psu` table. All the data in the column will be lost.
  - You are about to drop the column `wattage` on the `psu` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `ram` table. All the data in the column will be lost.
  - You are about to drop the column `casLatency` on the `ram` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `ram` table. All the data in the column will be lost.
  - You are about to drop the column `modules` on the `ram` table. All the data in the column will be lost.
  - You are about to drop the column `rgb` on the `ram` table. All the data in the column will be lost.
  - You are about to drop the column `speed` on the `ram` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ram` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `speakers` table. All the data in the column will be lost.
  - You are about to drop the column `cache` on the `storage` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `storage` table. All the data in the column will be lost.
  - You are about to drop the column `formFactor` on the `storage` table. All the data in the column will be lost.
  - You are about to drop the column `interface` on the `storage` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `storage` table. All the data in the column will be lost.
  - You are about to drop the column `tbw` on the `storage` table. All the data in the column will be lost.
  - You are about to alter the column `readSpeed` on the `storage` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `writeSpeed` on the `storage` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the `componentspec` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `peripheralspec` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `specificationkey` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `brand` to the `camera` table without a default value. This is not possible if the table is not empty.
  - Added the required column `audioIn` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `audioOut` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `material` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `powerSupplyIncluded` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slots25` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slots35` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slots525` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usb2` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usb3` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usb32` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usbTypeC` to the `case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waterCoolingSupport` to the `case` table without a default value. This is not possible if the table is not empty.
  - Made the column `sku` on table `component` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subType` on table `component` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `brand` to the `cooling` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fanDiameter` to the `cooling` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fanSpeed` to the `cooling` table without a default value. This is not possible if the table is not empty.
  - Added the required column `socket` to the `cooling` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frequency` to the `cpu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxRamCapacity` to the `cpu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxRamFrequency` to the `cpu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `multithreading` to the `cpu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `gamepad` table without a default value. This is not possible if the table is not empty.
  - Made the column `batteryLife` on table `gamepad` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `brand` to the `gpu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chipType` to the `gpu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fanCount` to the `gpu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasDVI` to the `gpu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasDisplayPort` to the `gpu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasHDMI` to the `gpu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasVGA` to the `gpu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoMemoryCapacity` to the `gpu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `headphones` table without a default value. This is not possible if the table is not empty.
  - Made the column `impedance` on table `headphones` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `brand` to the `keyboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `form` to the `keyboard` table without a default value. This is not possible if the table is not empty.
  - Made the column `switchType` on table `keyboard` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `brand` to the `microphone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `monitor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `motherboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxMemoryFrequency` to the `motherboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxRamCapacity` to the `motherboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxVideoCards` to the `motherboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memoryTypeSupported` to the `motherboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nvmeSupport` to the `motherboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processorSupport` to the `motherboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sataPorts` to the `motherboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sliCrossfireSupport` to the `motherboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wifiBluetooth` to the `motherboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batteryType` to the `mouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `mouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `mouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `mouse` table without a default value. This is not possible if the table is not empty.
  - Made the column `batteryLife` on table `mouse` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `brand` to the `mousepad` table without a default value. This is not possible if the table is not empty.
  - Made the column `sku` on table `peripheral` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subType` on table `peripheral` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `brand` to the `psu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasFan` to the `psu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `molexPataConnections` to the `psu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pciEConnections` to the `psu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pfc` to the `psu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `power` to the `psu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sataConnections` to the `psu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `backlighting` to the `ram` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `ram` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxFrequency` to the `ram` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memoryType` to the `ram` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleCount` to the `ram` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `speakers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `storage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `compatibility` to the `storage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nvme` to the `storage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `storage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volume` to the `storage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `componentspec` DROP FOREIGN KEY `componentspec_componentId_fkey`;

-- DropForeignKey
ALTER TABLE `componentspec` DROP FOREIGN KEY `componentspec_specKeyId_fkey`;

-- DropForeignKey
ALTER TABLE `peripheralspec` DROP FOREIGN KEY `peripheralspec_peripheralId_fkey`;

-- DropForeignKey
ALTER TABLE `peripheralspec` DROP FOREIGN KEY `peripheralspec_specKeyId_fkey`;

-- DropForeignKey
ALTER TABLE `specificationkey` DROP FOREIGN KEY `specificationkey_componentCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `specificationkey` DROP FOREIGN KEY `specificationkey_peripheralCategoryId_fkey`;

-- AlterTable
ALTER TABLE `camera` DROP COLUMN `manufacturer`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    MODIFY `fps` DOUBLE NOT NULL,
    MODIFY `fov` DOUBLE NOT NULL,
    ALTER COLUMN `microphone` DROP DEFAULT,
    ALTER COLUMN `autofocus` DROP DEFAULT;

-- AlterTable
ALTER TABLE `case` DROP COLUMN `colorVariant`,
    DROP COLUMN `dimensions`,
    DROP COLUMN `formFactor`,
    DROP COLUMN `includedFans`,
    DROP COLUMN `manufacturer`,
    DROP COLUMN `materials`,
    DROP COLUMN `maxCpuHeight`,
    DROP COLUMN `maxGpuLength`,
    DROP COLUMN `maxPsuLength`,
    DROP COLUMN `usbPorts`,
    DROP COLUMN `windowType`,
    ADD COLUMN `audioIn` BOOLEAN NOT NULL,
    ADD COLUMN `audioOut` BOOLEAN NOT NULL,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `color` VARCHAR(191) NOT NULL,
    ADD COLUMN `material` VARCHAR(191) NOT NULL,
    ADD COLUMN `powerSupplyIncluded` BOOLEAN NOT NULL,
    ADD COLUMN `slots25` INTEGER NOT NULL,
    ADD COLUMN `slots35` INTEGER NOT NULL,
    ADD COLUMN `slots525` INTEGER NOT NULL,
    ADD COLUMN `usb2` INTEGER NOT NULL,
    ADD COLUMN `usb3` INTEGER NOT NULL,
    ADD COLUMN `usb32` INTEGER NOT NULL,
    ADD COLUMN `usbTypeC` INTEGER NOT NULL,
    ADD COLUMN `waterCoolingSupport` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `component` DROP COLUMN `imageUrl`,
    DROP COLUMN `specifications`,
    DROP COLUMN `stock`,
    ADD COLUMN `imagesUrl` TEXT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 0,
    MODIFY `sku` VARCHAR(191) NOT NULL,
    MODIFY `subType` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `cooling` DROP COLUMN `fanCount`,
    DROP COLUMN `fanSize`,
    DROP COLUMN `manufacturer`,
    DROP COLUMN `maxTdp`,
    DROP COLUMN `noiseLevel`,
    DROP COLUMN `radiatorSize`,
    DROP COLUMN `rgb`,
    DROP COLUMN `socketSupport`,
    DROP COLUMN `type`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `fanDiameter` DOUBLE NOT NULL,
    ADD COLUMN `fanSpeed` INTEGER NOT NULL,
    ADD COLUMN `socket` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `cpu` DROP COLUMN `architecture`,
    DROP COLUMN `baseClock`,
    DROP COLUMN `boostClock`,
    DROP COLUMN `cache`,
    DROP COLUMN `manufacturer`,
    DROP COLUMN `model`,
    DROP COLUMN `tdp`,
    DROP COLUMN `threads`,
    ADD COLUMN `frequency` DOUBLE NOT NULL,
    ADD COLUMN `maxRamCapacity` INTEGER NOT NULL,
    ADD COLUMN `maxRamFrequency` INTEGER NOT NULL,
    ADD COLUMN `multithreading` BOOLEAN NOT NULL,
    ALTER COLUMN `integratedGpu` DROP DEFAULT;

-- AlterTable
ALTER TABLE `gamepad` DROP COLUMN `manufacturer`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ALTER COLUMN `vibration` DROP DEFAULT,
    ALTER COLUMN `rgb` DROP DEFAULT,
    MODIFY `batteryLife` INTEGER NOT NULL,
    ALTER COLUMN `programmable` DROP DEFAULT;

-- AlterTable
ALTER TABLE `gpu` DROP COLUMN `boostClock`,
    DROP COLUMN `chipset`,
    DROP COLUMN `coreClock`,
    DROP COLUMN `displayPorts`,
    DROP COLUMN `hdmiPorts`,
    DROP COLUMN `length`,
    DROP COLUMN `manufacturer`,
    DROP COLUMN `memory`,
    DROP COLUMN `powerConnectors`,
    DROP COLUMN `rayTracing`,
    DROP COLUMN `tdp`,
    DROP COLUMN `width`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `chipType` VARCHAR(191) NOT NULL,
    ADD COLUMN `fanCount` INTEGER NOT NULL,
    ADD COLUMN `hasDVI` BOOLEAN NOT NULL,
    ADD COLUMN `hasDisplayPort` BOOLEAN NOT NULL,
    ADD COLUMN `hasHDMI` BOOLEAN NOT NULL,
    ADD COLUMN `hasVGA` BOOLEAN NOT NULL,
    ADD COLUMN `videoMemoryCapacity` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `headphones` DROP COLUMN `manufacturer`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ALTER COLUMN `microphone` DROP DEFAULT,
    MODIFY `impedance` DOUBLE NOT NULL,
    MODIFY `weight` DOUBLE NOT NULL,
    ALTER COLUMN `noiseCancelling` DROP DEFAULT,
    ALTER COLUMN `rgb` DROP DEFAULT;

-- AlterTable
ALTER TABLE `keyboard` DROP COLUMN `manufacturer`,
    DROP COLUMN `multimedia`,
    DROP COLUMN `size`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `form` VARCHAR(191) NOT NULL,
    MODIFY `switchType` VARCHAR(191) NOT NULL,
    ALTER COLUMN `rgb` DROP DEFAULT,
    ALTER COLUMN `numpad` DROP DEFAULT;

-- AlterTable
ALTER TABLE `microphone` DROP COLUMN `manufacturer`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    MODIFY `frequency` INTEGER NOT NULL,
    MODIFY `sensitivity` DOUBLE NOT NULL,
    ALTER COLUMN `stand` DROP DEFAULT;

-- AlterTable
ALTER TABLE `monitor` DROP COLUMN `manufacturer`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ALTER COLUMN `hdr` DROP DEFAULT,
    MODIFY `ports` VARCHAR(191) NOT NULL,
    ALTER COLUMN `speakers` DROP DEFAULT,
    ALTER COLUMN `curved` DROP DEFAULT;

-- AlterTable
ALTER TABLE `motherboard` DROP COLUMN `bluetoothBuiltIn`,
    DROP COLUMN `chipset`,
    DROP COLUMN `formFactor`,
    DROP COLUMN `manufacturer`,
    DROP COLUMN `maxMemory`,
    DROP COLUMN `memoryType`,
    DROP COLUMN `pciSlots`,
    DROP COLUMN `sataConnectors`,
    DROP COLUMN `wifiBuiltIn`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `maxMemoryFrequency` INTEGER NOT NULL,
    ADD COLUMN `maxRamCapacity` INTEGER NOT NULL,
    ADD COLUMN `maxVideoCards` INTEGER NOT NULL,
    ADD COLUMN `memoryTypeSupported` VARCHAR(191) NOT NULL,
    ADD COLUMN `nvmeSupport` BOOLEAN NOT NULL,
    ADD COLUMN `processorSupport` VARCHAR(191) NOT NULL,
    ADD COLUMN `sataPorts` INTEGER NOT NULL,
    ADD COLUMN `sliCrossfireSupport` BOOLEAN NOT NULL,
    ADD COLUMN `wifiBluetooth` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `mouse` DROP COLUMN `manufacturer`,
    ADD COLUMN `batteryType` VARCHAR(191) NOT NULL,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `color` VARCHAR(191) NOT NULL,
    ALTER COLUMN `rgb` DROP DEFAULT,
    MODIFY `weight` DOUBLE NOT NULL,
    MODIFY `batteryLife` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `mousepad` DROP COLUMN `manufacturer`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    MODIFY `thickness` DOUBLE NOT NULL,
    ALTER COLUMN `rgb` DROP DEFAULT;

-- AlterTable
ALTER TABLE `peripheral` DROP COLUMN `imageUrl`,
    DROP COLUMN `specifications`,
    DROP COLUMN `stock`,
    ADD COLUMN `imagesUrl` TEXT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 0,
    MODIFY `sku` VARCHAR(191) NOT NULL,
    MODIFY `subType` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `peripheralcategory` DROP COLUMN `displayOrder`,
    ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'peripheral';

-- AlterTable
ALTER TABLE `psu` DROP COLUMN `atx3Support`,
    DROP COLUMN `efficiency`,
    DROP COLUMN `fanSize`,
    DROP COLUMN `length`,
    DROP COLUMN `manufacturer`,
    DROP COLUMN `modular`,
    DROP COLUMN `wattage`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `hasFan` BOOLEAN NOT NULL,
    ADD COLUMN `molexPataConnections` INTEGER NOT NULL,
    ADD COLUMN `pciEConnections` INTEGER NOT NULL,
    ADD COLUMN `pfc` BOOLEAN NOT NULL,
    ADD COLUMN `power` INTEGER NOT NULL,
    ADD COLUMN `sataConnections` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ram` DROP COLUMN `capacity`,
    DROP COLUMN `casLatency`,
    DROP COLUMN `manufacturer`,
    DROP COLUMN `modules`,
    DROP COLUMN `rgb`,
    DROP COLUMN `speed`,
    DROP COLUMN `type`,
    ADD COLUMN `backlighting` BOOLEAN NOT NULL,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `maxFrequency` INTEGER NOT NULL,
    ADD COLUMN `memoryType` VARCHAR(191) NOT NULL,
    ADD COLUMN `moduleCount` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `speakers` DROP COLUMN `manufacturer`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    MODIFY `connections` VARCHAR(191) NOT NULL,
    ALTER COLUMN `bluetooth` DROP DEFAULT,
    ALTER COLUMN `remote` DROP DEFAULT;

-- AlterTable
ALTER TABLE `storage` DROP COLUMN `cache`,
    DROP COLUMN `capacity`,
    DROP COLUMN `formFactor`,
    DROP COLUMN `interface`,
    DROP COLUMN `manufacturer`,
    DROP COLUMN `tbw`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `compatibility` VARCHAR(191) NOT NULL,
    ADD COLUMN `nvme` BOOLEAN NOT NULL,
    ADD COLUMN `size` VARCHAR(191) NOT NULL,
    ADD COLUMN `volume` INTEGER NOT NULL,
    MODIFY `readSpeed` DOUBLE NOT NULL,
    MODIFY `writeSpeed` DOUBLE NOT NULL;

-- DropTable
DROP TABLE `componentspec`;

-- DropTable
DROP TABLE `peripheralspec`;

-- DropTable
DROP TABLE `specificationkey`;
