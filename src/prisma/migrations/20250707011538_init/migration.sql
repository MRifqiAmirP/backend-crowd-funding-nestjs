/*
  Warnings:

  - You are about to drop the `supportpackage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `supportpackage` DROP FOREIGN KEY `SupportPackage_projectId_fkey`;

-- DropTable
DROP TABLE `supportpackage`;

-- CreateTable
CREATE TABLE `support_packages` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `packageName` VARCHAR(100) NOT NULL,
    `nominal` INTEGER NOT NULL,
    `benefit` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `support_packages` ADD CONSTRAINT `support_packages_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
