/*
  Warnings:

  - You are about to drop the column `country_name_jp` on the `countries` table. All the data in the column will be lost.
  - You are about to drop the column `country_name_kana` on the `countries` table. All the data in the column will be lost.
  - Added the required column `country_name_en` to the `countries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "countries" DROP COLUMN "country_name_jp",
DROP COLUMN "country_name_kana",
ADD COLUMN     "country_name_en" VARCHAR(128) NOT NULL;
