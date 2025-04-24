-- DropForeignKey
ALTER TABLE `componentspec` DROP FOREIGN KEY `ComponentSpec_componentId_fkey`;

-- DropForeignKey
ALTER TABLE `componentspec` DROP FOREIGN KEY `ComponentSpec_specKeyId_fkey`;

-- DropForeignKey
ALTER TABLE `specificationkey` DROP FOREIGN KEY `SpecificationKey_categoryId_fkey`;

-- DropIndex
DROP INDEX `ComponentCategory_name_key` ON `componentcategory`;

-- DropIndex
DROP INDEX `ComponentCategory_slug_key` ON `componentcategory`;
