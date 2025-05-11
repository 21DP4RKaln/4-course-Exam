-- AlterTable
ALTER TABLE `component` ADD COLUMN `discountExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `discountPrice` DOUBLE NULL;

-- AlterTable
ALTER TABLE `configuration` ADD COLUMN `discountExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `discountPrice` DOUBLE NULL;

-- AlterTable
ALTER TABLE `peripheral` ADD COLUMN `discountExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `discountPrice` DOUBLE NULL;
