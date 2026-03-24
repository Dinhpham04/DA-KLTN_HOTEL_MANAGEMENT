-- CreateTable
CREATE TABLE "identifications" (
    "identification_id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "identification_type" SMALLINT NOT NULL,
    "identification_type_input" VARCHAR(32),
    "identification_input_type" SMALLINT DEFAULT 1,
    "image_path" VARCHAR(1024),
    "identification_number" VARCHAR(32),
    "expiration_date" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "identifications_pkey" PRIMARY KEY ("identification_id")
);

-- CreateTable
CREATE TABLE "image_identifications" (
    "image_identification_id" SERIAL NOT NULL,
    "image_path" VARCHAR(1024),
    "image_name" VARCHAR(255),
    "assign_status" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "image_identifications_pkey" PRIMARY KEY ("image_identification_id")
);

-- CreateIndex
CREATE INDEX "identifications_client_id_idx" ON "identifications"("client_id");

-- CreateIndex
CREATE INDEX "identifications_created_staff_id_idx" ON "identifications"("created_staff_id");

-- CreateIndex
CREATE INDEX "identifications_updated_staff_id_idx" ON "identifications"("updated_staff_id");

-- CreateIndex
CREATE INDEX "identifications_deleted_staff_id_idx" ON "identifications"("deleted_staff_id");

-- AddForeignKey
ALTER TABLE "identifications" ADD CONSTRAINT "identifications_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identifications" ADD CONSTRAINT "identifications_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identifications" ADD CONSTRAINT "identifications_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identifications" ADD CONSTRAINT "identifications_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
