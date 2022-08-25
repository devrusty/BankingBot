-- CreateEnum
CREATE TYPE "HeistDifficulty" AS ENUM ('Cakewalk', 'Easy', 'Medium', 'Hard', 'Extreme', 'Nightmare');

-- CreateTable
CREATE TABLE "Heist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minPayout" INTEGER NOT NULL,
    "requiredLevel" INTEGER NOT NULL,
    "avaliable" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" "HeistDifficulty" NOT NULL,

    CONSTRAINT "Heist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Heist_id_key" ON "Heist"("id");
