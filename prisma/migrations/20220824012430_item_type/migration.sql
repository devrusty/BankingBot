-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('Casual', 'Mask', 'Weapon');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "type" "ItemType"[];
