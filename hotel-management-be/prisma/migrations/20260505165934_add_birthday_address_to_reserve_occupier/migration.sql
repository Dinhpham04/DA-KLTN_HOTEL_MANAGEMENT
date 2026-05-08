/*
  Warnings:

  - You are about to drop the column `occupier_name_en` on the `reserve_occupiers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "reserve_occupiers" DROP CONSTRAINT "reserve_occupiers_client_id_fkey";

-- AlterTable
ALTER TABLE "reserve_occupiers" DROP COLUMN "occupier_name_en",
ADD COLUMN     "address1" VARCHAR(256),
ADD COLUMN     "birthday" DATE,
ALTER COLUMN "client_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "reserve_occupiers" ADD CONSTRAINT "reserve_occupiers_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE SET NULL ON UPDATE CASCADE;
