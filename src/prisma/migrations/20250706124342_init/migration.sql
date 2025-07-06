/*
  Warnings:

  - You are about to drop the column `comentar` on the `project_comments` table. All the data in the column will be lost.
  - Added the required column `commentar` to the `project_comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `project_comments` DROP COLUMN `comentar`,
    ADD COLUMN `commentar` LONGTEXT NOT NULL;
