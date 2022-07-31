-- CreateTable
CREATE TABLE "PersonalShop" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "items" INTEGER[],

    CONSTRAINT "PersonalShop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalShop_id_key" ON "PersonalShop"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalShop_ownerId_key" ON "PersonalShop"("ownerId");
