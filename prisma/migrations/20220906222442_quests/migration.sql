/*
  Warnings:

  - You are about to drop the column `income` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `Bug` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "QuestGoal" AS ENUM ('Cash', 'Level', 'Item');

-- CreateEnum
CREATE TYPE "QuestReward" AS ENUM ('Cash', 'XP', 'Item');

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "income";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "completedQuests" INTEGER[],
ADD COLUMN     "quests" INTEGER[],
ALTER COLUMN "cash" SET DEFAULT 2500;

-- DropTable
DROP TABLE "Bug";

-- CreateTable
CREATE TABLE "Quest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "goal" "QuestGoal" NOT NULL,
    "requiredLevel" INTEGER NOT NULL,
    "reward" "QuestReward" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quest_id_key" ON "Quest"("id");
