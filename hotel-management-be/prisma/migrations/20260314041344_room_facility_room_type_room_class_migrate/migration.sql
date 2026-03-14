-- CreateTable
CREATE TABLE "countries" (
    "country_id" SERIAL NOT NULL,
    "country_name" VARCHAR(128) NOT NULL,
    "country_name_kana" VARCHAR(128) NOT NULL,
    "country_name_jp" VARCHAR(128) NOT NULL,
    "code" VARCHAR(255),
    "order_num" SMALLINT NOT NULL DEFAULT 196,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "countries_pkey" PRIMARY KEY ("country_id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "facility_id" SERIAL NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "facility_type" SMALLINT NOT NULL DEFAULT 1,
    "facility_no" VARCHAR(3) NOT NULL,
    "facility_name" VARCHAR(256) NOT NULL,
    "facility_name_en" VARCHAR(256) NOT NULL,
    "zip_code" VARCHAR(9) NOT NULL,
    "address" VARCHAR(256) NOT NULL,
    "address_en" VARCHAR(512) NOT NULL,
    "key_function" BOOLEAN NOT NULL DEFAULT false,
    "share_place_flag" BOOLEAN NOT NULL DEFAULT false,
    "parking_flag" BOOLEAN NOT NULL DEFAULT false,
    "parking_img" VARCHAR(512) NOT NULL DEFAULT '',
    "bicycle_parking_flag" BOOLEAN NOT NULL DEFAULT false,
    "bicycle_parking_img" VARCHAR(512) NOT NULL DEFAULT '',
    "deliverybox_flag" BOOLEAN NOT NULL DEFAULT false,
    "memo" VARCHAR(1024),
    "order_num" SMALLINT NOT NULL DEFAULT 1,
    "color_option" VARCHAR(128),
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("facility_id")
);

-- CreateTable
CREATE TABLE "room_classes" (
    "room_class_id" SERIAL NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "room_class_name" VARCHAR(256) NOT NULL,
    "order_num" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "room_classes_pkey" PRIMARY KEY ("room_class_id")
);

-- CreateTable
CREATE TABLE "room_types" (
    "room_type_id" SERIAL NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "room_class_id" INTEGER NOT NULL,
    "room_type_name" VARCHAR(32) NOT NULL,
    "room_type_name_short" VARCHAR(32) NOT NULL,
    "acreage" INTEGER,
    "order_num" SMALLINT NOT NULL DEFAULT 1,
    "order_num_deposit" SMALLINT,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "room_types_pkey" PRIMARY KEY ("room_type_id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "room_id" SERIAL NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "room_type_id" INTEGER NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "room_number" VARCHAR(32) NOT NULL,
    "key_type" INTEGER,
    "room_status" SMALLINT NOT NULL,
    "reserved_clean_day" SMALLINT NOT NULL DEFAULT 0,
    "deliverybox_flag" BOOLEAN NOT NULL DEFAULT false,
    "pet_flag" BOOLEAN NOT NULL DEFAULT false,
    "mailbox_password" VARCHAR(64) NOT NULL,
    "order_num" SMALLINT NOT NULL DEFAULT 1,
    "external_flag" BOOLEAN NOT NULL DEFAULT false,
    "external_date_from" DATE,
    "external_date_to" DATE,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "stay_types" (
    "stay_type_id" SERIAL NOT NULL,
    "stay_contract_type_id" SMALLINT NOT NULL DEFAULT 1,
    "stay_type_name" VARCHAR(64) NOT NULL,
    "stay_type_name_en" VARCHAR(128) NOT NULL,
    "stay_type_name_short" VARCHAR(4) NOT NULL,
    "order_num" SMALLINT NOT NULL DEFAULT 99,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stay_types_pkey" PRIMARY KEY ("stay_type_id")
);

-- CreateIndex
CREATE INDEX "countries_created_staff_id_idx" ON "countries"("created_staff_id");

-- CreateIndex
CREATE INDEX "countries_updated_staff_id_idx" ON "countries"("updated_staff_id");

-- CreateIndex
CREATE INDEX "countries_deleted_staff_id_idx" ON "countries"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "facilities_facility_no_idx" ON "facilities"("facility_no");

-- CreateIndex
CREATE INDEX "facilities_created_staff_id_idx" ON "facilities"("created_staff_id");

-- CreateIndex
CREATE INDEX "facilities_updated_staff_id_idx" ON "facilities"("updated_staff_id");

-- CreateIndex
CREATE INDEX "facilities_deleted_staff_id_idx" ON "facilities"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "facilities_data_status_idx" ON "facilities"("data_status");

-- CreateIndex
CREATE INDEX "room_classes_created_staff_id_idx" ON "room_classes"("created_staff_id");

-- CreateIndex
CREATE INDEX "room_classes_updated_staff_id_idx" ON "room_classes"("updated_staff_id");

-- CreateIndex
CREATE INDEX "room_classes_deleted_staff_id_idx" ON "room_classes"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "room_classes_data_status_idx" ON "room_classes"("data_status");

-- CreateIndex
CREATE INDEX "room_types_room_class_id_idx" ON "room_types"("room_class_id");

-- CreateIndex
CREATE INDEX "room_types_created_staff_id_idx" ON "room_types"("created_staff_id");

-- CreateIndex
CREATE INDEX "room_types_updated_staff_id_idx" ON "room_types"("updated_staff_id");

-- CreateIndex
CREATE INDEX "room_types_deleted_staff_id_idx" ON "room_types"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "room_types_data_status_idx" ON "room_types"("data_status");

-- CreateIndex
CREATE INDEX "rooms_facility_id_idx" ON "rooms"("facility_id");

-- CreateIndex
CREATE INDEX "rooms_room_type_id_idx" ON "rooms"("room_type_id");

-- CreateIndex
CREATE INDEX "rooms_created_staff_id_idx" ON "rooms"("created_staff_id");

-- CreateIndex
CREATE INDEX "rooms_updated_staff_id_idx" ON "rooms"("updated_staff_id");

-- CreateIndex
CREATE INDEX "rooms_deleted_staff_id_idx" ON "rooms"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "rooms_data_status_idx" ON "rooms"("data_status");

-- CreateIndex
CREATE INDEX "rooms_room_status_idx" ON "rooms"("room_status");

-- CreateIndex
CREATE INDEX "stay_types_created_staff_id_idx" ON "stay_types"("created_staff_id");

-- CreateIndex
CREATE INDEX "stay_types_updated_staff_id_idx" ON "stay_types"("updated_staff_id");

-- CreateIndex
CREATE INDEX "stay_types_deleted_staff_id_idx" ON "stay_types"("deleted_staff_id");

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_classes" ADD CONSTRAINT "room_classes_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_classes" ADD CONSTRAINT "room_classes_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_classes" ADD CONSTRAINT "room_classes_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_room_class_id_fkey" FOREIGN KEY ("room_class_id") REFERENCES "room_classes"("room_class_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("room_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stay_types" ADD CONSTRAINT "stay_types_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stay_types" ADD CONSTRAINT "stay_types_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stay_types" ADD CONSTRAINT "stay_types_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
