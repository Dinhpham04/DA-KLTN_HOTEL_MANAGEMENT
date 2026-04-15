-- AlterTable
ALTER TABLE "reserves" ADD COLUMN     "amendment" VARCHAR(128),
ADD COLUMN     "announcement" VARCHAR(1024),
ADD COLUMN     "auto_extend_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "box_usage_end_date" DATE,
ADD COLUMN     "box_usage_period_type" SMALLINT,
ADD COLUMN     "box_usage_start_date" DATE,
ADD COLUMN     "campaign_price_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cat_count" SMALLINT,
ADD COLUMN     "charge_staff_id2" INTEGER,
ADD COLUMN     "check_keys_datetime" DATE,
ADD COLUMN     "checkin_date" TIMESTAMP(3),
ADD COLUMN     "checkout_receptionist_id_2" INTEGER,
ADD COLUMN     "contacted_flag" BOOLEAN,
ADD COLUMN     "deliverybox_card_number" VARCHAR(16),
ADD COLUMN     "deliverybox_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "di_contact_staff_id" INTEGER,
ADD COLUMN     "directcheckin_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "directcheckin_note" VARCHAR(256),
ADD COLUMN     "directcheckin_type" SMALLINT,
ADD COLUMN     "disable_reservation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dog_count" SMALLINT,
ADD COLUMN     "draft_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "early_exit_datetime" TIMESTAMP(3),
ADD COLUMN     "eternity_draft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "expired_date" SMALLINT,
ADD COLUMN     "extension_time" SMALLINT,
ADD COLUMN     "futon_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_seen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_key_in_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "key_return_contact_type" SMALLINT,
ADD COLUMN     "key_return_datetime" TIMESTAMP(3),
ADD COLUMN     "key_return_flag" BOOLEAN,
ADD COLUMN     "keybox_id" INTEGER,
ADD COLUMN     "keybox_password" VARCHAR(32),
ADD COLUMN     "last_stay_date" TIMESTAMP(3),
ADD COLUMN     "memo_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moved_facility_id" INTEGER,
ADD COLUMN     "moved_room_id" INTEGER,
ADD COLUMN     "noreserve_count_after" SMALLINT,
ADD COLUMN     "noreserve_count_before" SMALLINT,
ADD COLUMN     "notice_comment" VARCHAR(1024),
ADD COLUMN     "original_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "original_period_from" TIMESTAMP(3),
ADD COLUMN     "original_period_to" TIMESTAMP(3),
ADD COLUMN     "other_count" SMALLINT,
ADD COLUMN     "overdue_debt_note" TEXT,
ADD COLUMN     "parent_reserve_id" INTEGER,
ADD COLUMN     "payment_due_date" TIMESTAMP(3),
ADD COLUMN     "period_before" TIMESTAMP(3),
ADD COLUMN     "period_type" VARCHAR(32),
ADD COLUMN     "pet_note" VARCHAR(256),
ADD COLUMN     "pre_delivery_key_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rakuten_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rental_keys" SMALLINT,
ADD COLUMN     "request_announcement" VARCHAR(1024),
ADD COLUMN     "return_keys" SMALLINT,
ADD COLUMN     "room_dirty_level" SMALLINT,
ADD COLUMN     "sale_announcement" VARCHAR(1024),
ADD COLUMN     "substitute_facility_id" INTEGER,
ADD COLUMN     "substitute_reserve_id" INTEGER,
ADD COLUMN     "substitute_room_from" TIMESTAMP(3),
ADD COLUMN     "substitute_room_id" INTEGER,
ADD COLUMN     "substitute_room_note" VARCHAR(1024),
ADD COLUMN     "substitute_room_to" TIMESTAMP(3),
ADD COLUMN     "survey_answer" TEXT,
ADD COLUMN     "time_extend_num" SMALLINT;

-- CreateTable
CREATE TABLE "usage_statuses" (
    "usage_status_id" SERIAL NOT NULL,
    "reserve_id" INTEGER,
    "construction_id" INTEGER,
    "area_id" INTEGER NOT NULL,
    "facility_id" INTEGER,
    "room_id" INTEGER,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "target" VARCHAR(32) NOT NULL,
    "period_from" TIMESTAMP(3),
    "period_to" TIMESTAMP(3),
    "reserve_status" SMALLINT NOT NULL,
    "substitute_flag" BOOLEAN NOT NULL DEFAULT false,
    "room_moved_flag" BOOLEAN NOT NULL DEFAULT false,
    "direct_checkin_flag" BOOLEAN NOT NULL DEFAULT false,
    "campaign_price_flag" BOOLEAN NOT NULL DEFAULT false,
    "extension_flag" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT NOT NULL DEFAULT '',
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "usage_statuses_pkey" PRIMARY KEY ("usage_status_id")
);

-- CreateIndex
CREATE INDEX "usage_statuses_reserve_id_idx" ON "usage_statuses"("reserve_id");

-- CreateIndex
CREATE INDEX "usage_statuses_area_id_idx" ON "usage_statuses"("area_id");

-- CreateIndex
CREATE INDEX "usage_statuses_facility_id_idx" ON "usage_statuses"("facility_id");

-- CreateIndex
CREATE INDEX "usage_statuses_room_id_idx" ON "usage_statuses"("room_id");

-- CreateIndex
CREATE INDEX "usage_statuses_construction_id_idx" ON "usage_statuses"("construction_id");

-- CreateIndex
CREATE INDEX "usage_statuses_created_staff_id_idx" ON "usage_statuses"("created_staff_id");

-- CreateIndex
CREATE INDEX "usage_statuses_updated_staff_id_idx" ON "usage_statuses"("updated_staff_id");

-- CreateIndex
CREATE INDEX "usage_statuses_deleted_staff_id_idx" ON "usage_statuses"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "reserves_parent_reserve_id_idx" ON "reserves"("parent_reserve_id");

-- CreateIndex
CREATE INDEX "reserves_charge_staff_id2_idx" ON "reserves"("charge_staff_id2");

-- CreateIndex
CREATE INDEX "reserves_di_contact_staff_id_idx" ON "reserves"("di_contact_staff_id");

-- CreateIndex
CREATE INDEX "reserves_checkout_receptionist_id_2_idx" ON "reserves"("checkout_receptionist_id_2");

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_parent_reserve_id_fkey" FOREIGN KEY ("parent_reserve_id") REFERENCES "reserves"("reserve_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_charge_staff_id2_fkey" FOREIGN KEY ("charge_staff_id2") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_di_contact_staff_id_fkey" FOREIGN KEY ("di_contact_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_checkout_receptionist_id_2_fkey" FOREIGN KEY ("checkout_receptionist_id_2") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_statuses" ADD CONSTRAINT "usage_statuses_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "reserves"("reserve_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_statuses" ADD CONSTRAINT "usage_statuses_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("facility_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_statuses" ADD CONSTRAINT "usage_statuses_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_statuses" ADD CONSTRAINT "usage_statuses_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_statuses" ADD CONSTRAINT "usage_statuses_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_statuses" ADD CONSTRAINT "usage_statuses_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
