-- CreateTable
CREATE TABLE "facility_room_types" (
    "facility_room_type_id" SERIAL NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "facility_id" INTEGER NOT NULL,
    "room_type_id" INTEGER NOT NULL,
    "acreage" VARCHAR(255),
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "facility_room_types_pkey" PRIMARY KEY ("facility_room_type_id")
);

-- CreateIndex
CREATE INDEX "facility_room_types_facility_id_idx" ON "facility_room_types"("facility_id");

-- CreateIndex
CREATE INDEX "facility_room_types_room_type_id_idx" ON "facility_room_types"("room_type_id");

-- CreateIndex
CREATE INDEX "facility_room_types_created_staff_id_idx" ON "facility_room_types"("created_staff_id");

-- CreateIndex
CREATE INDEX "facility_room_types_updated_staff_id_idx" ON "facility_room_types"("updated_staff_id");

-- CreateIndex
CREATE INDEX "facility_room_types_deleted_staff_id_idx" ON "facility_room_types"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "facility_room_types_data_status_idx" ON "facility_room_types"("data_status");

-- CreateIndex
CREATE UNIQUE INDEX "facility_room_types_facility_id_room_type_id_key" ON "facility_room_types"("facility_id", "room_type_id");

-- AddForeignKey
ALTER TABLE "facility_room_types" ADD CONSTRAINT "facility_room_types_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_room_types" ADD CONSTRAINT "facility_room_types_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("room_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_room_types" ADD CONSTRAINT "facility_room_types_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_room_types" ADD CONSTRAINT "facility_room_types_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_room_types" ADD CONSTRAINT "facility_room_types_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
