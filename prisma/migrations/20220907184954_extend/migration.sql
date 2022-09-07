/*
  Warnings:

  - Added the required column `goalType` to the `Quest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardType` to the `Quest` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `goal` on the `Quest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `reward` on the `Quest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Quest" ADD COLUMN     "goalType" "QuestGoal" NOT NULL,
ADD COLUMN     "rewardType" "QuestReward" NOT NULL,
DROP COLUMN "goal",
ADD COLUMN     "goal" INTEGER NOT NULL,
DROP COLUMN "reward",
ADD COLUMN     "reward" INTEGER NOT NULL;
