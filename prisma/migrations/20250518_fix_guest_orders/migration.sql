-- Update the user relation in the Order model to be truly optional
-- This is a schema-only change to ensure Prisma treats guest orders properly

-- AlterTable
ALTER TABLE `order` MODIFY COLUMN `userId` VARCHAR(191) NULL;
