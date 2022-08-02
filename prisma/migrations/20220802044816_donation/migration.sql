-- CreateTable
CREATE TABLE "Donation" (
    "id" SERIAL NOT NULL,
    "donator" TEXT NOT NULL,
    "reciever" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_id_key" ON "Donation"("id");
