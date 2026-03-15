-- CreateTable
CREATE TABLE "clients" (
    "client_id" SERIAL NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "data_type" SMALLINT NOT NULL,
    "client_name" VARCHAR(256) NOT NULL,
    "client_name_en" VARCHAR(256),
    "birthday" DATE,
    "sex" SMALLINT NOT NULL DEFAULT 9,
    "contact_name" VARCHAR(256),
    "contact_name_en" VARCHAR(256),
    "company_name" VARCHAR(256),
    "company_name_en" VARCHAR(256),
    "email" VARCHAR(256),
    "zip_code" VARCHAR(9),
    "company_zip_code" VARCHAR(9),
    "country_id" INTEGER,
    "address1" VARCHAR(256),
    "address2" VARCHAR(256),
    "company_address1" VARCHAR(256),
    "company_address2" VARCHAR(256),
    "tel" VARCHAR(18),
    "tel_phone" VARCHAR(18),
    "tel_emergency" VARCHAR(18),
    "company_tel" VARCHAR(16),
    "emargency_relation" VARCHAR(256),
    "fax" VARCHAR(18),
    "postpaid_flag" BOOLEAN NOT NULL DEFAULT false,
    "advertising_type" SMALLINT,
    "memo" TEXT,
    "use_count" SMALLINT NOT NULL DEFAULT 0,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "reserves" (
    "reserve_id" SERIAL NOT NULL,
    "client_id" INTEGER,
    "facility_id" INTEGER,
    "room_id" INTEGER,
    "stay_type_id" INTEGER,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "reserve_status" SMALLINT NOT NULL DEFAULT 1,
    "reserve_type" SMALLINT,
    "delete_status" SMALLINT,
    "period_from" TIMESTAMP(3),
    "period_to" TIMESTAMP(3),
    "confirm_flag" BOOLEAN NOT NULL DEFAULT false,
    "checkin_flag" BOOLEAN NOT NULL DEFAULT false,
    "checked_in_at" TIMESTAMP(3),
    "checkout_at" TIMESTAMP(3),
    "booking_unit_price" INTEGER,
    "adjustment_unit_price" INTEGER,
    "deposit" INTEGER,
    "note" VARCHAR(256),
    "memo" TEXT,
    "advertising_type" SMALLINT,
    "cancel_reason" VARCHAR(512),
    "cancelled_at" TIMESTAMP(3),
    "pet_flag" BOOLEAN NOT NULL DEFAULT false,
    "charge_staff_id" INTEGER,
    "checkin_receptionist_id" INTEGER,
    "checkout_receptionist_id" INTEGER,
    "confirm_staff_id" INTEGER,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "reserves_pkey" PRIMARY KEY ("reserve_id")
);

-- CreateTable
CREATE TABLE "reserve_occupiers" (
    "reserve_occupier_id" SERIAL NOT NULL,
    "reserve_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "occupier_name" VARCHAR(256) NOT NULL,
    "occupier_name_en" VARCHAR(256),
    "sex" SMALLINT NOT NULL DEFAULT 9,
    "tel" VARCHAR(18),
    "order_num" INTEGER,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "reserve_occupiers_pkey" PRIMARY KEY ("reserve_occupier_id")
);

-- CreateIndex
CREATE INDEX "clients_country_id_idx" ON "clients"("country_id");

-- CreateIndex
CREATE INDEX "clients_created_staff_id_idx" ON "clients"("created_staff_id");

-- CreateIndex
CREATE INDEX "clients_updated_staff_id_idx" ON "clients"("updated_staff_id");

-- CreateIndex
CREATE INDEX "clients_deleted_staff_id_idx" ON "clients"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "clients_data_status_idx" ON "clients"("data_status");

-- CreateIndex
CREATE INDEX "clients_data_type_idx" ON "clients"("data_type");

-- CreateIndex
CREATE INDEX "reserves_client_id_idx" ON "reserves"("client_id");

-- CreateIndex
CREATE INDEX "reserves_facility_id_idx" ON "reserves"("facility_id");

-- CreateIndex
CREATE INDEX "reserves_room_id_idx" ON "reserves"("room_id");

-- CreateIndex
CREATE INDEX "reserves_stay_type_id_idx" ON "reserves"("stay_type_id");

-- CreateIndex
CREATE INDEX "reserves_reserve_status_idx" ON "reserves"("reserve_status");

-- CreateIndex
CREATE INDEX "reserves_period_from_idx" ON "reserves"("period_from");

-- CreateIndex
CREATE INDEX "reserves_period_to_idx" ON "reserves"("period_to");

-- CreateIndex
CREATE INDEX "reserves_charge_staff_id_idx" ON "reserves"("charge_staff_id");

-- CreateIndex
CREATE INDEX "reserves_checkin_receptionist_id_idx" ON "reserves"("checkin_receptionist_id");

-- CreateIndex
CREATE INDEX "reserves_checkout_receptionist_id_idx" ON "reserves"("checkout_receptionist_id");

-- CreateIndex
CREATE INDEX "reserves_confirm_staff_id_idx" ON "reserves"("confirm_staff_id");

-- CreateIndex
CREATE INDEX "reserves_created_staff_id_idx" ON "reserves"("created_staff_id");

-- CreateIndex
CREATE INDEX "reserves_updated_staff_id_idx" ON "reserves"("updated_staff_id");

-- CreateIndex
CREATE INDEX "reserves_deleted_staff_id_idx" ON "reserves"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "reserves_data_status_idx" ON "reserves"("data_status");

-- CreateIndex
CREATE INDEX "reserve_occupiers_reserve_id_idx" ON "reserve_occupiers"("reserve_id");

-- CreateIndex
CREATE INDEX "reserve_occupiers_client_id_idx" ON "reserve_occupiers"("client_id");

-- CreateIndex
CREATE INDEX "reserve_occupiers_created_staff_id_idx" ON "reserve_occupiers"("created_staff_id");

-- CreateIndex
CREATE INDEX "reserve_occupiers_updated_staff_id_idx" ON "reserve_occupiers"("updated_staff_id");

-- CreateIndex
CREATE INDEX "reserve_occupiers_deleted_staff_id_idx" ON "reserve_occupiers"("deleted_staff_id");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("country_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("facility_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_stay_type_id_fkey" FOREIGN KEY ("stay_type_id") REFERENCES "stay_types"("stay_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_charge_staff_id_fkey" FOREIGN KEY ("charge_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_checkin_receptionist_id_fkey" FOREIGN KEY ("checkin_receptionist_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_checkout_receptionist_id_fkey" FOREIGN KEY ("checkout_receptionist_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_confirm_staff_id_fkey" FOREIGN KEY ("confirm_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserve_occupiers" ADD CONSTRAINT "reserve_occupiers_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "reserves"("reserve_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserve_occupiers" ADD CONSTRAINT "reserve_occupiers_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserve_occupiers" ADD CONSTRAINT "reserve_occupiers_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserve_occupiers" ADD CONSTRAINT "reserve_occupiers_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserve_occupiers" ADD CONSTRAINT "reserve_occupiers_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
