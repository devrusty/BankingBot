/*
  Warnings:

  - You are about to drop the column `coins` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "coins",
ADD COLUMN     "cash" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "inventory" TEXT[];
