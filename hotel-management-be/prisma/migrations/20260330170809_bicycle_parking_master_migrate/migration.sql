-- CreateTable
CREATE TABLE "bicycle_parkings" (
    "bicycle_parking_id" SERIAL NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "parent_facility_id" INTEGER NOT NULL,
    "number" VARCHAR(32) NOT NULL,
    "notice" TEXT,
    "order_num" SMALLINT NOT NULL DEFAULT 99,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bicycle_parkings_pkey" PRIMARY KEY ("bicycle_parking_id")
);

-- CreateIndex
CREATE INDEX "bicycle_parkings_parent_facility_id_idx" ON "bicycle_parkings"("parent_facility_id");

-- CreateIndex
CREATE INDEX "bicycle_parkings_created_staff_id_idx" ON "bicycle_parkings"("created_staff_id");

-- CreateIndex
CREATE INDEX "bicycle_parkings_updated_staff_id_idx" ON "bicycle_parkings"("updated_staff_id");

-- CreateIndex
CREATE INDEX "bicycle_parkings_deleted_staff_id_idx" ON "bicycle_parkings"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "bicycle_parkings_data_status_idx" ON "bicycle_parkings"("data_status");

-- AddForeignKey
ALTER TABLE "bicycle_parkings" ADD CONSTRAINT "bicycle_parkings_parent_facility_id_fkey" FOREIGN KEY ("parent_facility_id") REFERENCES "facilities"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bicycle_parkings" ADD CONSTRAINT "bicycle_parkings_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bicycle_parkings" ADD CONSTRAINT "bicycle_parkings_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bicycle_parkings" ADD CONSTRAINT "bicycle_parkings_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
