-- CreateTable
CREATE TABLE "parking_reserves" (
    "parking_reserve_id" SERIAL NOT NULL,
    "parking_id" INTEGER NOT NULL,
    "reserve_id" INTEGER,
    "client_id" INTEGER,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "period_from" DATE NOT NULL,
    "period_to" DATE,
    "stay_type_id" INTEGER,
    "confirm_flag" BOOLEAN NOT NULL DEFAULT false,
    "checkin_flag" BOOLEAN NOT NULL DEFAULT false,
    "checkout_flag" BOOLEAN NOT NULL DEFAULT false,
    "car_type" VARCHAR(128),
    "license_plate" VARCHAR(128),
    "note" VARCHAR(512),
    "sale_date" DATE,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "parking_reserves_pkey" PRIMARY KEY ("parking_reserve_id")
);

-- CreateTable
CREATE TABLE "bicycle_parking_reserves" (
    "bicycle_parking_reserve_id" SERIAL NOT NULL,
    "bicycle_parking_id" INTEGER NOT NULL,
    "reserve_id" INTEGER,
    "client_id" INTEGER,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "period_from" DATE NOT NULL,
    "period_to" DATE,
    "stay_type_id" INTEGER,
    "confirm_flag" BOOLEAN NOT NULL DEFAULT false,
    "checkin_flag" BOOLEAN NOT NULL DEFAULT false,
    "checkout_flag" BOOLEAN NOT NULL DEFAULT false,
    "bicycle_type_note" VARCHAR(256),
    "note" VARCHAR(512),
    "sale_date" DATE,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bicycle_parking_reserves_pkey" PRIMARY KEY ("bicycle_parking_reserve_id")
);

-- CreateIndex
CREATE INDEX "parking_reserves_parking_id_idx" ON "parking_reserves"("parking_id");

-- CreateIndex
CREATE INDEX "parking_reserves_reserve_id_idx" ON "parking_reserves"("reserve_id");

-- CreateIndex
CREATE INDEX "parking_reserves_client_id_idx" ON "parking_reserves"("client_id");

-- CreateIndex
CREATE INDEX "parking_reserves_period_from_idx" ON "parking_reserves"("period_from");

-- CreateIndex
CREATE INDEX "parking_reserves_created_staff_id_idx" ON "parking_reserves"("created_staff_id");

-- CreateIndex
CREATE INDEX "parking_reserves_updated_staff_id_idx" ON "parking_reserves"("updated_staff_id");

-- CreateIndex
CREATE INDEX "parking_reserves_deleted_staff_id_idx" ON "parking_reserves"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "parking_reserves_data_status_idx" ON "parking_reserves"("data_status");

-- CreateIndex
CREATE INDEX "bicycle_parking_reserves_bicycle_parking_id_idx" ON "bicycle_parking_reserves"("bicycle_parking_id");

-- CreateIndex
CREATE INDEX "bicycle_parking_reserves_reserve_id_idx" ON "bicycle_parking_reserves"("reserve_id");

-- CreateIndex
CREATE INDEX "bicycle_parking_reserves_client_id_idx" ON "bicycle_parking_reserves"("client_id");

-- CreateIndex
CREATE INDEX "bicycle_parking_reserves_period_from_idx" ON "bicycle_parking_reserves"("period_from");

-- CreateIndex
CREATE INDEX "bicycle_parking_reserves_created_staff_id_idx" ON "bicycle_parking_reserves"("created_staff_id");

-- CreateIndex
CREATE INDEX "bicycle_parking_reserves_updated_staff_id_idx" ON "bicycle_parking_reserves"("updated_staff_id");

-- CreateIndex
CREATE INDEX "bicycle_parking_reserves_deleted_staff_id_idx" ON "bicycle_parking_reserves"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "bicycle_parking_reserves_data_status_idx" ON "bicycle_parking_reserves"("data_status");

-- AddForeignKey
ALTER TABLE "parking_reserves" ADD CONSTRAINT "parking_reserves_parking_id_fkey" FOREIGN KEY ("parking_id") REFERENCES "parkings"("parking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_reserves" ADD CONSTRAINT "parking_reserves_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "reserves"("reserve_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_reserves" ADD CONSTRAINT "parking_reserves_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_reserves" ADD CONSTRAINT "parking_reserves_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_reserves" ADD CONSTRAINT "parking_reserves_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_reserves" ADD CONSTRAINT "parking_reserves_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bicycle_parking_reserves" ADD CONSTRAINT "bicycle_parking_reserves_bicycle_parking_id_fkey" FOREIGN KEY ("bicycle_parking_id") REFERENCES "bicycle_parkings"("bicycle_parking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bicycle_parking_reserves" ADD CONSTRAINT "bicycle_parking_reserves_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "reserves"("reserve_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bicycle_parking_reserves" ADD CONSTRAINT "bicycle_parking_reserves_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bicycle_parking_reserves" ADD CONSTRAINT "bicycle_parking_reserves_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bicycle_parking_reserves" ADD CONSTRAINT "bicycle_parking_reserves_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bicycle_parking_reserves" ADD CONSTRAINT "bicycle_parking_reserves_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
