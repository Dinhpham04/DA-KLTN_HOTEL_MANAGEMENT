-- Remove room-change related columns from reserves table
ALTER TABLE "reserves"
DROP CONSTRAINT IF EXISTS "reserves_parent_reserve_id_fkey";

DROP INDEX IF EXISTS "reserves_parent_reserve_id_idx";

ALTER TABLE "reserves"
DROP COLUMN IF EXISTS "parent_reserve_id",
DROP COLUMN IF EXISTS "original_flag",
DROP COLUMN IF EXISTS "original_period_from",
DROP COLUMN IF EXISTS "original_period_to",
DROP COLUMN IF EXISTS "moved_facility_id",
DROP COLUMN IF EXISTS "moved_room_id",
DROP COLUMN IF EXISTS "substitute_reserve_id",
DROP COLUMN IF EXISTS "substitute_facility_id",
DROP COLUMN IF EXISTS "substitute_room_id",
DROP COLUMN IF EXISTS "substitute_room_from",
DROP COLUMN IF EXISTS "substitute_room_to",
DROP COLUMN IF EXISTS "substitute_room_note";

-- Remove room-change flags from usage statuses
ALTER TABLE "usage_statuses"
DROP COLUMN IF EXISTS "substitute_flag",
DROP COLUMN IF EXISTS "room_moved_flag";
