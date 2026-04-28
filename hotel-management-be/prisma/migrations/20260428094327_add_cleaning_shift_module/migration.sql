-- CreateTable
CREATE TABLE "cleans" (
    "clean_id" SERIAL NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "cleaning_date" DATE NOT NULL,
    "note" VARCHAR(1024),
    "rest_time_from" TIMESTAMP(3),
    "rest_time_to" TIMESTAMP(3),
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cleans_pkey" PRIMARY KEY ("clean_id")
);

-- CreateTable
CREATE TABLE "cleaning_details" (
    "cleaning_detail_id" SERIAL NOT NULL,
    "clean_id" INTEGER NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "room_id" INTEGER,
    "reserve_id" INTEGER,
    "data_type" SMALLINT NOT NULL,
    "area_name" VARCHAR(256),
    "main_staff_id" INTEGER,
    "sub_staff_id" INTEGER,
    "check_staff_id" INTEGER,
    "main_staff_external_flag" BOOLEAN NOT NULL DEFAULT false,
    "sub_staff_external_flag" BOOLEAN NOT NULL DEFAULT false,
    "check_staff_external_flag" BOOLEAN NOT NULL DEFAULT false,
    "scheduled_date" DATE,
    "start_datetime" TIMESTAMP(3),
    "end_datetime" TIMESTAMP(3),
    "finish_datetime" TIMESTAMP(3),
    "clean_status" SMALLINT NOT NULL DEFAULT 1,
    "check_safety_flag" BOOLEAN NOT NULL DEFAULT false,
    "room_pin_credential_id" INTEGER,
    "pin_revoked_confirmed_at" TIMESTAMP(3),
    "comment" VARCHAR(1024),
    "report_img1" VARCHAR(512),
    "report_img2" VARCHAR(512),
    "report_img3" VARCHAR(512),
    "report_img4" VARCHAR(512),
    "order_num" SMALLINT,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cleaning_details_pkey" PRIMARY KEY ("cleaning_detail_id")
);

-- CreateTable
CREATE TABLE "clean_detail_notes" (
    "clean_detail_note_id" SERIAL NOT NULL,
    "cleaning_detail_id" INTEGER NOT NULL,
    "note_content" VARCHAR(2048) NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clean_detail_notes_pkey" PRIMARY KEY ("clean_detail_note_id")
);

-- CreateIndex
CREATE INDEX "cleans_cleaning_date_idx" ON "cleans"("cleaning_date");

-- CreateIndex
CREATE INDEX "cleans_facility_id_idx" ON "cleans"("facility_id");

-- CreateIndex
CREATE INDEX "cleans_created_staff_id_idx" ON "cleans"("created_staff_id");

-- CreateIndex
CREATE INDEX "cleans_updated_staff_id_idx" ON "cleans"("updated_staff_id");

-- CreateIndex
CREATE INDEX "cleans_deleted_staff_id_idx" ON "cleans"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "cleans_data_status_idx" ON "cleans"("data_status");

-- CreateIndex
CREATE UNIQUE INDEX "cleans_facility_date_uniq" ON "cleans"("facility_id", "cleaning_date");

-- CreateIndex
CREATE INDEX "cleaning_details_clean_id_idx" ON "cleaning_details"("clean_id");

-- CreateIndex
CREATE INDEX "cleaning_details_facility_date_idx" ON "cleaning_details"("facility_id", "scheduled_date");

-- CreateIndex
CREATE INDEX "cleaning_details_room_id_idx" ON "cleaning_details"("room_id");

-- CreateIndex
CREATE INDEX "cleaning_details_reserve_id_idx" ON "cleaning_details"("reserve_id");

-- CreateIndex
CREATE INDEX "cleaning_details_type_status_idx" ON "cleaning_details"("data_type", "clean_status");

-- CreateIndex
CREATE INDEX "cleaning_details_room_pin_credential_id_idx" ON "cleaning_details"("room_pin_credential_id");

-- CreateIndex
CREATE INDEX "cleaning_details_main_staff_id_idx" ON "cleaning_details"("main_staff_id");

-- CreateIndex
CREATE INDEX "cleaning_details_sub_staff_id_idx" ON "cleaning_details"("sub_staff_id");

-- CreateIndex
CREATE INDEX "cleaning_details_check_staff_id_idx" ON "cleaning_details"("check_staff_id");

-- CreateIndex
CREATE INDEX "cleaning_details_created_staff_id_idx" ON "cleaning_details"("created_staff_id");

-- CreateIndex
CREATE INDEX "cleaning_details_updated_staff_id_idx" ON "cleaning_details"("updated_staff_id");

-- CreateIndex
CREATE INDEX "cleaning_details_deleted_staff_id_idx" ON "cleaning_details"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "cleaning_details_data_status_idx" ON "cleaning_details"("data_status");

-- CreateIndex
CREATE INDEX "clean_detail_notes_detail_id_idx" ON "clean_detail_notes"("cleaning_detail_id");

-- CreateIndex
CREATE INDEX "clean_detail_notes_created_staff_id_idx" ON "clean_detail_notes"("created_staff_id");

-- CreateIndex
CREATE INDEX "clean_detail_notes_updated_staff_id_idx" ON "clean_detail_notes"("updated_staff_id");

-- CreateIndex
CREATE INDEX "clean_detail_notes_deleted_staff_id_idx" ON "clean_detail_notes"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "clean_detail_notes_data_status_idx" ON "clean_detail_notes"("data_status");

-- AddForeignKey
ALTER TABLE "cleans" ADD CONSTRAINT "cleans_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleans" ADD CONSTRAINT "cleans_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleans" ADD CONSTRAINT "cleans_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleans" ADD CONSTRAINT "cleans_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_details" ADD CONSTRAINT "cleaning_details_clean_id_fkey" FOREIGN KEY ("clean_id") REFERENCES "cleans"("clean_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_details" ADD CONSTRAINT "cleaning_details_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_details" ADD CONSTRAINT "cleaning_details_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_details" ADD CONSTRAINT "cleaning_details_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "reserves"("reserve_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_details" ADD CONSTRAINT "cleaning_details_main_staff_id_fkey" FOREIGN KEY ("main_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_details" ADD CONSTRAINT "cleaning_details_sub_staff_id_fkey" FOREIGN KEY ("sub_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_details" ADD CONSTRAINT "cleaning_details_check_staff_id_fkey" FOREIGN KEY ("check_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_details" ADD CONSTRAINT "cleaning_details_room_pin_credential_id_fkey" FOREIGN KEY ("room_pin_credential_id") REFERENCES "room_pin_credentials"("room_pin_credential_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_details" ADD CONSTRAINT "cleaning_details_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_details" ADD CONSTRAINT "cleaning_details_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_details" ADD CONSTRAINT "cleaning_details_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clean_detail_notes" ADD CONSTRAINT "clean_detail_notes_cleaning_detail_id_fkey" FOREIGN KEY ("cleaning_detail_id") REFERENCES "cleaning_details"("cleaning_detail_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clean_detail_notes" ADD CONSTRAINT "clean_detail_notes_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clean_detail_notes" ADD CONSTRAINT "clean_detail_notes_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clean_detail_notes" ADD CONSTRAINT "clean_detail_notes_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
