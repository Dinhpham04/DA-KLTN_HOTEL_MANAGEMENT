-- CreateTable
CREATE TABLE "request_types" (
    "request_type_id" INTEGER NOT NULL,
    "request_type_name" VARCHAR(256) NOT NULL,
    "request_type_name_en" VARCHAR(256),
    "category" VARCHAR(32) NOT NULL,
    "tax_free_default" BOOLEAN NOT NULL DEFAULT false,
    "is_refund" BOOLEAN NOT NULL DEFAULT false,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "order_num" SMALLINT NOT NULL DEFAULT 99,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "request_types_pkey" PRIMARY KEY ("request_type_id")
);

-- CreateTable
CREATE TABLE "service_prices" (
    "service_price_id" SERIAL NOT NULL,
    "request_type_id" INTEGER NOT NULL,
    "facility_id" INTEGER,
    "unit_price" BIGINT NOT NULL,
    "unit" SMALLINT NOT NULL DEFAULT 2,
    "description" VARCHAR(256),
    "effective_from" DATE,
    "effective_to" DATE,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "service_prices_pkey" PRIMARY KEY ("service_price_id")
);

-- CreateIndex
CREATE INDEX "request_types_category_idx" ON "request_types"("category");

-- CreateIndex
CREATE INDEX "request_types_data_status_idx" ON "request_types"("data_status");

-- CreateIndex
CREATE INDEX "request_types_order_num_idx" ON "request_types"("order_num");

-- CreateIndex
CREATE INDEX "service_prices_request_type_id_idx" ON "service_prices"("request_type_id");

-- CreateIndex
CREATE INDEX "service_prices_facility_id_idx" ON "service_prices"("facility_id");

-- CreateIndex
CREATE INDEX "service_prices_data_status_idx" ON "service_prices"("data_status");

-- AddForeignKey
ALTER TABLE "request_types" ADD CONSTRAINT "request_types_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_types" ADD CONSTRAINT "request_types_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_types" ADD CONSTRAINT "request_types_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_prices" ADD CONSTRAINT "service_prices_request_type_id_fkey" FOREIGN KEY ("request_type_id") REFERENCES "request_types"("request_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_prices" ADD CONSTRAINT "service_prices_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("facility_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_prices" ADD CONSTRAINT "service_prices_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_prices" ADD CONSTRAINT "service_prices_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_prices" ADD CONSTRAINT "service_prices_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
