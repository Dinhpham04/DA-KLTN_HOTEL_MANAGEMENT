-- CreateTable
CREATE TABLE "memos" (
    "memo_id" SERIAL NOT NULL,
    "facility_id" INTEGER,
    "room_id" INTEGER,
    "memo" TEXT,
    "date_from" DATE,
    "date_to" DATE,
    "memo_flag" BOOLEAN NOT NULL DEFAULT false,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "memos_pkey" PRIMARY KEY ("memo_id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "announcement_id" SERIAL NOT NULL,
    "detail" VARCHAR(2048) NOT NULL,
    "order_num" SMALLINT NOT NULL DEFAULT 1,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("announcement_id")
);

-- CreateTable
CREATE TABLE "residual_rooms" (
    "id" VARCHAR(8) NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 0,
    "created_staff_id" INTEGER,
    "updated_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "residual_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_settings" (
    "setting_id" SERIAL NOT NULL,
    "default_sale_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_settings_pkey" PRIMARY KEY ("setting_id")
);

-- CreateIndex
CREATE INDEX "memos_facility_id_idx" ON "memos"("facility_id");

-- CreateIndex
CREATE INDEX "memos_room_id_idx" ON "memos"("room_id");

-- CreateIndex
CREATE INDEX "memos_data_status_idx" ON "memos"("data_status");

-- CreateIndex
CREATE INDEX "announcements_created_at_idx" ON "announcements"("created_at");

-- CreateIndex
CREATE INDEX "announcements_data_status_idx" ON "announcements"("data_status");

-- CreateIndex
CREATE INDEX "announcements_created_staff_id_idx" ON "announcements"("created_staff_id");

-- AddForeignKey
ALTER TABLE "memos" ADD CONSTRAINT "memos_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("facility_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memos" ADD CONSTRAINT "memos_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memos" ADD CONSTRAINT "memos_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memos" ADD CONSTRAINT "memos_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memos" ADD CONSTRAINT "memos_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residual_rooms" ADD CONSTRAINT "residual_rooms_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residual_rooms" ADD CONSTRAINT "residual_rooms_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
