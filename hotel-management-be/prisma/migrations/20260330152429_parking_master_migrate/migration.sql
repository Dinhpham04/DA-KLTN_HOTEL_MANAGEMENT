-- CreateTable
CREATE TABLE "parkings" (
    "parking_id" SERIAL NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "parent_facility_id" INTEGER NOT NULL,
    "number" VARCHAR(32) NOT NULL,
    "height_limit" DOUBLE PRECISION NOT NULL,
    "notice" VARCHAR(512),
    "order_num" SMALLINT NOT NULL DEFAULT 99,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "parkings_pkey" PRIMARY KEY ("parking_id")
);

-- CreateTable
CREATE TABLE "parking_rents" (
    "parking_rent_id" SERIAL NOT NULL,
    "parking_id" INTEGER NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "facility_id" INTEGER NOT NULL,
    "stay_type_id" INTEGER NOT NULL,
    "unit" SMALLINT NOT NULL DEFAULT 0,
    "rent" INTEGER NOT NULL DEFAULT 0,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "parking_rents_pkey" PRIMARY KEY ("parking_rent_id")
);

-- CreateIndex
CREATE INDEX "parkings_parent_facility_id_idx" ON "parkings"("parent_facility_id");

-- CreateIndex
CREATE INDEX "parkings_created_staff_id_idx" ON "parkings"("created_staff_id");

-- CreateIndex
CREATE INDEX "parkings_updated_staff_id_idx" ON "parkings"("updated_staff_id");

-- CreateIndex
CREATE INDEX "parkings_deleted_staff_id_idx" ON "parkings"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "parkings_data_status_idx" ON "parkings"("data_status");

-- CreateIndex
CREATE INDEX "parking_rents_parking_id_idx" ON "parking_rents"("parking_id");

-- CreateIndex
CREATE INDEX "parking_rents_facility_id_idx" ON "parking_rents"("facility_id");

-- CreateIndex
CREATE INDEX "parking_rents_stay_type_id_idx" ON "parking_rents"("stay_type_id");

-- CreateIndex
CREATE INDEX "parking_rents_created_staff_id_idx" ON "parking_rents"("created_staff_id");

-- CreateIndex
CREATE INDEX "parking_rents_updated_staff_id_idx" ON "parking_rents"("updated_staff_id");

-- CreateIndex
CREATE INDEX "parking_rents_deleted_staff_id_idx" ON "parking_rents"("deleted_staff_id");

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_parent_facility_id_fkey" FOREIGN KEY ("parent_facility_id") REFERENCES "facilities"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_rents" ADD CONSTRAINT "parking_rents_parking_id_fkey" FOREIGN KEY ("parking_id") REFERENCES "parkings"("parking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_rents" ADD CONSTRAINT "parking_rents_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_rents" ADD CONSTRAINT "parking_rents_stay_type_id_fkey" FOREIGN KEY ("stay_type_id") REFERENCES "stay_types"("stay_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_rents" ADD CONSTRAINT "parking_rents_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_rents" ADD CONSTRAINT "parking_rents_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_rents" ADD CONSTRAINT "parking_rents_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
