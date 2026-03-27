-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "stay_duration_auto_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ug_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "used_messy_level" SMALLINT;
