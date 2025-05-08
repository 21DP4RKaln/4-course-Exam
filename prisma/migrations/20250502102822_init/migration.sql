-- AlterTable
ALTER TABLE `component` ADD COLUMN `viewCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `configuration` ADD COLUMN `viewCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `peripheral` ADD COLUMN `viewCount` INTEGER NOT NULL DEFAULT 0;
