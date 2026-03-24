---
name: convert-mysql-schema
description: Convert MySQL schema từ file hotel_management_sql_create.sql sang Prisma model trong schema.prisma. Tối ưu mapping type cho PostgreSQL (không cần giống 100%), thêm audit fields và soft delete theo convention.
---

# Convert MySQL Schema → Prisma Model

Convert MySQL schema (từ bản SQL dump) sang Prisma schema model phù hợp với PostgreSQL.

## Intent (Mục tiêu)

- **Goal**: Chuyển đổi MySQL table definition → Prisma model, tối ưu cho PostgreSQL
- **Boundaries**: Chỉ tạo Prisma model — KHÔNG tạo NestJS module (dùng `migrate-php-to-nestjs`)
- **When to use**: Sau khi `analyze-php-source`, trước khi `migrate-php-to-nestjs`

## Knowledge (Kiến thức)

### Type Mapping: MySQL → PostgreSQL (via Prisma)

*(Lưu ý: Chuyển sang PostgreSQL nên chúng ta có thể tối ưu type, không cần giống 100% MySQL)*

| MySQL (Legacy) | Prisma (PostgreSQL Target) | Notes |
|----------------|----------------------------|-------|
| `INT UNSIGNED AUTO_INCREMENT` | `Int @id @default(autoincrement())` | PK |
| `VARCHAR(n)` | `String @db.VarChar(n)` | Giữ nguyên độ dài nếu cần giới hạn |
| `TEXT` / `LONGTEXT` | `String` (Text in PG) | Bỏ `@db.Text` vì Postgres `String` mặc định là Text mở rộng |
| `TINYINT(1)` / `BOOLEAN` | `Boolean` | Convert flag sang true/false |
| `TINYINT`, `SMALLINT` | `Int @db.SmallInt` hoặc `Int` | Nếu là enum code (1,2,3), dùng `Int @db.SmallInt`|
| `INT`, `BIGINT` | `Int`, `BigInt` | |
| `DECIMAL(10,2)` | `Decimal @db.Decimal(10,2)` | |
| `DATETIME`, `TIMESTAMP` | `DateTime` | |
| `DATE` | `DateTime @db.Date` | |
| `JSON` | `Json` | Postgres hỗ trợ jsonb tốt |

### Naming Convention Mapping

| MySQL (snake_case) | Prisma field (camelCase) | DB column |
|---------------------|------------------------|-----------|
| `feature_name` | `featureName` | `@map("feature_name")` |
| `created_at` | `createdAt` | `@map("created_at")` |
| `data_status` | `dataStatus` | `@map("data_status")` |

### Required Audit Fields (Target)

Mọi model trong target PHẢI có:
```prisma
dataStatus      Int       @default(1) @map("data_status") @db.SmallInt
createdStaffId  Int       @map("created_staff_id")
updatedStaffId  Int?      @map("updated_staff_id")
deletedStaffId  Int?      @map("deleted_staff_id")
createdAt       DateTime  @default(now()) @map("created_at")
updatedAt       DateTime  @updatedAt @map("updated_at")
deletedAt       DateTime? @map("deleted_at")

createdBy       Staff     @relation("{Model}CreatedBy", fields: [createdStaffId], references: [staffId])
updatedBy       Staff?    @relation("{Model}UpdatedBy", fields: [updatedStaffId], references: [staffId])
deletedBy       Staff?    @relation("{Model}DeletedBy", fields: [deletedStaffId], references: [staffId])
```

### Source Files
- Schema Dump: `docs/hotel_management_sql_create.sql`
- Models (for relations): `aic-yokohama-weekly-mansion/app/Models/` (Optional, if needed)

### Target File
- Schema: `hotel-management-be/prisma/schema.prisma`

## Execution (Các bước thực hiện)

### Step 1: Find Table Schema in SQL Dump

Search in `docs/hotel_management_sql_create.sql` for:
- `CREATE TABLE IF NOT EXISTS \`hotel_management\`.\`{table_name}\``

Đọc các column, datatype, comment, và foreign key constraints từ schema.

### Step 2: Optimize & Clean up Japan-specific Fields

Khi thiết kế Prisma model:
- **Xóa bỏ các trường dành riêng cho Nhật Bản**: Vì dự án mới hướng tới thị trường việt nam/quốc tế, hãy MẠNH DẠN XÓA BỎ các column như `name_kana`, `name_ruby`, `furigana`, `postal_code_jp`, v.v.
- Chuyển đổi các cột như `client_name_en` thành `client_name` (tiêu chuẩn chung) thay vì giữ tiền tố `_en` dư thừa.
- Đổi các field dạng `TINYINT(1)` (flag/boolean) trong MySQL sang `Boolean` hợp lý hơn cho Postgres.
- Map kiểu dữ liệu, bỏ các thuộc tính chỉ có ở MySQL (như `UNSIGNED`).
- Không cần copy 100% schema cũ. Hãy tối ưu để chuẩn hóa database.

### Step 3: Build Prisma Model

```prisma
model Feature {
  // PK
  featureId       Int       @id @default(autoincrement()) @map("feature_id")

  // Business fields (from SQL)
  featureName     String    @map("feature_name") @db.VarChar(256)
  description     String?   @map("description")
  orderNum        Int       @default(1) @map("order_num") @db.SmallInt
  isActive        Boolean   @default(true) @map("is_active") // Được tối ưu từ TINYINT(1)

  // FK relations
  facilityId      Int       @map("facility_id")
  facility        Facility  @relation(fields: [facilityId], references: [facilityId])

  // Audit fields (ALWAYS REQUIRED)
  dataStatus      Int       @default(1) @map("data_status") @db.SmallInt
  createdStaffId  Int       @map("created_staff_id")
  updatedStaffId  Int?      @map("updated_staff_id")
  deletedStaffId  Int?      @map("deleted_staff_id")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")

  // Staff relations
  createdBy       Staff     @relation("FeatureCreatedBy", fields: [createdStaffId], references: [staffId])
  updatedBy       Staff?    @relation("FeatureUpdatedBy", fields: [updatedStaffId], references: [staffId])
  deletedBy       Staff?    @relation("FeatureDeletedBy", fields: [deletedStaffId], references: [staffId])

  // Indexes
  @@index([dataStatus], map: "features_data_status_idx")
  @@map("features")
}
```

### Step 4: Add Staff Reverse Relations

Trong Staff model (`schema.prisma`), thêm:
```prisma
createdFeatures  Feature[]  @relation("FeatureCreatedBy")
updatedFeatures  Feature[]  @relation("FeatureUpdatedBy")
deletedFeatures  Feature[]  @relation("FeatureDeletedBy")
```

### Step 5: Generate & Migrate

```bash
cd hotel-management-be
pnpm prisma:generate
pnpm prisma:migrate
```

## Verification (Kiểm tra)

```bash
pnpm prisma:generate   # No schema errors
pnpm prisma:migrate    # Migration applied successfully
pnpm run build         # TypeScript recognizes new types
```

Kiểm tra:
- Các constraint và relation đúng
- Có audit fields và soft delete đầy đủ
- Tối ưu được schema cho PostgreSQL

## Edge Cases

- **Missing Foreign Keys in MySQL**: Đôi khi MySQL cũ thiếu khai báo FK `CONSTRAINT`. Hãy chủ động thêm relation vào Prisma nếu biết nó là liên kết logic.
- **Enums**: Cân nhắc dùng string hoặc Postgres Enum thay vì dùng `TINYINT` hardcode.
- **Fields không cần thiết**: Nếu user nói cắt bớt, hãy mạnh dạn bỏ các field vô dụng.
