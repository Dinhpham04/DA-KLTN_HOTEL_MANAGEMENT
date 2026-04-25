-- CreateTable
CREATE TABLE "room_pin_credentials" (
    "room_pin_credential_id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "reserve_id" INTEGER,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "encrypted_pin" VARCHAR(512) NOT NULL,
    "masked_pin" VARCHAR(32) NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "issued_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "provider_credential_id" VARCHAR(128),
    "provider_payload" JSONB,
    "last_sync_at" TIMESTAMP(3),
    "sync_error" VARCHAR(512),
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "room_pin_credentials_pkey" PRIMARY KEY ("room_pin_credential_id")
);

-- Drop legacy keybox fields
ALTER TABLE "reserves"
    DROP COLUMN IF EXISTS "keybox_id",
    DROP COLUMN IF EXISTS "keybox_password",
    DROP COLUMN IF EXISTS "box_usage_period_type",
    DROP COLUMN IF EXISTS "box_usage_start_date",
    DROP COLUMN IF EXISTS "box_usage_end_date";

-- CreateIndex
CREATE INDEX "room_pin_credentials_room_id_idx" ON "room_pin_credentials"("room_id");
CREATE INDEX "room_pin_credentials_reserve_id_idx" ON "room_pin_credentials"("reserve_id");
CREATE INDEX "room_pin_credentials_status_idx" ON "room_pin_credentials"("status");
CREATE INDEX "room_pin_credentials_valid_from_idx" ON "room_pin_credentials"("valid_from");
CREATE INDEX "room_pin_credentials_valid_to_idx" ON "room_pin_credentials"("valid_to");
CREATE INDEX "room_pin_credentials_created_staff_id_idx" ON "room_pin_credentials"("created_staff_id");
CREATE INDEX "room_pin_credentials_updated_staff_id_idx" ON "room_pin_credentials"("updated_staff_id");
CREATE INDEX "room_pin_credentials_deleted_staff_id_idx" ON "room_pin_credentials"("deleted_staff_id");
CREATE INDEX "room_pin_credentials_data_status_idx" ON "room_pin_credentials"("data_status");

-- AddForeignKey
ALTER TABLE "room_pin_credentials"
    ADD CONSTRAINT "room_pin_credentials_room_id_fkey"
    FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "room_pin_credentials"
    ADD CONSTRAINT "room_pin_credentials_reserve_id_fkey"
    FOREIGN KEY ("reserve_id") REFERENCES "reserves"("reserve_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "room_pin_credentials"
    ADD CONSTRAINT "room_pin_credentials_created_staff_id_fkey"
    FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "room_pin_credentials"
    ADD CONSTRAINT "room_pin_credentials_updated_staff_id_fkey"
    FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "room_pin_credentials"
    ADD CONSTRAINT "room_pin_credentials_deleted_staff_id_fkey"
    FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
