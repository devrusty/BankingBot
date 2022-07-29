-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 100
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
