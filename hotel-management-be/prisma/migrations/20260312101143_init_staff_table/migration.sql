-- CreateTable
CREATE TABLE "staffs" (
    "staff_id" SERIAL NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "staff_type" SMALLINT NOT NULL,
    "staff_name" VARCHAR(256) NOT NULL,
    "staff_name_en" VARCHAR(256),
    "staff_name_short" VARCHAR(32),
    "sex" SMALLINT NOT NULL DEFAULT 9,
    "zip_code" VARCHAR(9),
    "address" VARCHAR(256),
    "mail" VARCHAR(256) NOT NULL,
    "login_password" VARCHAR(256) NOT NULL,
    "tel" VARCHAR(18),
    "business_tel" VARCHAR(18),
    "emergency_tel" VARCHAR(18),
    "order_num" SMALLINT DEFAULT 1,
    "display_in_attendance" BOOLEAN NOT NULL DEFAULT true,
    "created_staff_id" INTEGER,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "staffs_pkey" PRIMARY KEY ("staff_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staffs_mail_key" ON "staffs"("mail");

-- CreateIndex
CREATE INDEX "staffs_created_staff_id_idx" ON "staffs"("created_staff_id");

-- CreateIndex
CREATE INDEX "staffs_updated_staff_id_idx" ON "staffs"("updated_staff_id");

-- CreateIndex
CREATE INDEX "staffs_deleted_staff_id_idx" ON "staffs"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "staffs_data_status_idx" ON "staffs"("data_status");

-- AddForeignKey
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
