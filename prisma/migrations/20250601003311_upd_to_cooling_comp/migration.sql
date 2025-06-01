/*
  Warnings:

  - You are about to drop the column `type` on the `cooling` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `cooling` DROP COLUMN `type`,
    ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `radiatorSize` VARCHAR(191) NULL,
    ADD COLUMN `subCategory` VARCHAR(191) NULL;
