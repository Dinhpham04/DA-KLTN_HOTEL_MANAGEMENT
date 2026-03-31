-- CreateTable
CREATE TABLE "rents" (
    "rent_id" SERIAL NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "deposit_flag" SMALLINT NOT NULL DEFAULT 0,
    "room_type_id" INTEGER NOT NULL,
    "stay_type_id" INTEGER NOT NULL,
    "deposit_pay" BIGINT,
    "deposit_pay_over3" BIGINT,
    "day_rent" INTEGER,
    "month_rent" BIGINT,
    "day_rent_over3" INTEGER,
    "month_rent_over3" BIGINT,
    "day_clean_fee" INTEGER,
    "month_clean_fee" BIGINT,
    "day_clean_fee_over3" INTEGER,
    "month_clean_fee_over3" BIGINT,
    "day_mainte_fee" INTEGER,
    "month_mainte_fee" BIGINT,
    "day_utility_fee" INTEGER,
    "month_utility_fee" BIGINT,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rents_pkey" PRIMARY KEY ("rent_id")
);

-- CreateIndex
CREATE INDEX "rents_room_type_id_idx" ON "rents"("room_type_id");

-- CreateIndex
CREATE INDEX "rents_stay_type_id_idx" ON "rents"("stay_type_id");

-- CreateIndex
CREATE INDEX "rents_deposit_flag_idx" ON "rents"("deposit_flag");

-- CreateIndex
CREATE INDEX "rents_created_staff_id_idx" ON "rents"("created_staff_id");

-- CreateIndex
CREATE INDEX "rents_updated_staff_id_idx" ON "rents"("updated_staff_id");

-- CreateIndex
CREATE INDEX "rents_deleted_staff_id_idx" ON "rents"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "rents_data_status_idx" ON "rents"("data_status");

-- AddForeignKey
ALTER TABLE "rents" ADD CONSTRAINT "rents_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("room_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rents" ADD CONSTRAINT "rents_stay_type_id_fkey" FOREIGN KEY ("stay_type_id") REFERENCES "stay_types"("stay_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rents" ADD CONSTRAINT "rents_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rents" ADD CONSTRAINT "rents_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rents" ADD CONSTRAINT "rents_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
