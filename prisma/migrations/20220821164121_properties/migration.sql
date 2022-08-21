-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('House', 'Apartment', 'Mansion', 'Hillside', 'Commercial');

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_id_key" ON "Property"("id");
