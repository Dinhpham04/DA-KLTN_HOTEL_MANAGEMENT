# Migrate `cleans-shift-management` → `cleaning-shift` (Phase 1)

## Context

Trang **`aic-yokohama-weekly-mansion-FE/src/routes/_layout/cleans-shift-management.tsx`** (2228 dòng) là màn hình quản lý ca dọn phòng theo ngày của hệ thống cũ. Nó tổng hợp 4 sub-feature: **Type 1** (dọn phòng theo reservation), **Type 2** (khu vực chung), **Type 3** (thu chìa khóa + safety check), **Gym**, kèm bảng điểm danh nhân viên có drag-drop và 2 PDF report. Backend Laravel cung cấp ~23 endpoint (`/api/v1/clean*`) và 1 cronjob daily 00:02.

Mục tiêu lần này: dựng bản tương đương trên `hotel-management-be` (NestJS+Prisma) và `hotel-management-fe` (React+TanStack), **gọn gàng và bám convention dự án mới**, không port từng dòng. Đặc biệt:

- **Type 3 đổi semantic**: thay vì thu chìa khóa vật lý (legacy fields `rental_keys`, `return_keys`, `key_return_datetime`...), Type 3 trong hệ mới = staff xác nhận (a) phòng an toàn sau checkout và (b) mã PIN smart-lock đã được hủy. Tận dụng model `RoomPinCredential` đã có (`schema.prisma:751`).
- **Gym, staff attendance editor, 2 PDF report, daily cronjob**: out of scope phase 1, chỉ ghi placeholder cho phase 2.
- **i18n**: hardcode tiếng Việt trong JSX (theo yêu cầu user, vi phạm tạm thời convention `vi.json` — đánh dấu `// TODO(i18n)` để dễ sweep sau).

Outcome mong muốn: 1 module BE `cleaning-shift` + 1 trang FE `/_authenticated/cleaning` đầy đủ 3 tab (Type 1/2/3), CRUD chi tiết + notes, tích hợp smart-lock cho Type 3.

---

## 1. Backend — `hotel-management-be/`

### 1.1 Prisma schema

File: `prisma/schema.prisma`. Thêm 3 model mới + back-relations:

**`Cleans`** (header theo ngày × facility)
- `cleanId` Int autoincrement PK
- `cleaningDate` Date, `facilityId` Int FK
- `note` VarChar(1024) nullable, `restTimeFrom`/`restTimeTo` DateTime nullable
- Audit: `dataStatus`, `createdStaffId`/`updatedStaffId`/`deletedStaffId`, `createdAt`/`updatedAt`/`deletedAt`
- `@@unique([facilityId, cleaningDate])` — chặn race khi auto-create
- Relation: `facility`, `createdBy`/`updatedBy`/`deletedBy` Staff, `details CleaningDetail[]`

**`CleaningDetail`** (1 record per phòng/khu vực/khóa)
- `cleaningDetailId` PK
- FKs: `cleanId`, `facilityId`, `roomId?`, `reserveId?`
- `dataType` SmallInt (1=ROOM, 2=COMMON_AREA, 3=KEY_SAFETY)
- Staff: `mainStaffId?`, `subStaffId?`, `checkStaffId?` + 3 `*ExternalFlag` Boolean
- Schedule: `scheduledDate` Date, `startDatetime`/`endDatetime`/`finishDatetime`
- Status: `cleanStatus` SmallInt (1–7), `checkSafetyFlag` Boolean (Type 3)
- `comment` VarChar(1024), `reportImg1..4` VarChar(512)
- **NEW (Type 3 smart-lock)**: `roomPinCredentialId?` FK → `RoomPinCredential`, `pinRevokedConfirmedAt?` DateTime
- `orderNum` SmallInt
- Audit fields như trên
- Indexes: `cleanId`, `(facilityId, scheduledDate)`, `roomId`, `reserveId`, `(dataType, cleanStatus)`, `dataStatus`

**`CleanDetailNote`**
- `cleanDetailNoteId` PK, `cleaningDetailId` FK, `noteContent` VarChar(2048)
- Audit fields

**Back-relations cần thêm** vào model có sẵn:
- `Staff`: 10 named relations (3 model × {createdBy, updatedBy, deletedBy} + Cleans → 9, plus mainStaff/subStaff/checkStaff trên CleaningDetail = 10 named tổng)
- `Facility`: `cleans Cleans[]`, `cleaningDetails CleaningDetail[]`
- `Room`: `cleaningDetails CleaningDetail[]`
- `Reserve`: `cleaningDetails CleaningDetail[]`
- `RoomPinCredential`: `cleaningDetails CleaningDetail[]`

**Quyết định: dùng `Int` + TS enum** (giống `dataStatus`, `staffType` hiện tại), không dùng Postgres enum, để tránh migration phức tạp.

**Migration**: `pnpm prisma migrate dev --name add_cleaning_shift_module` trong `hotel-management-be/`.

### 1.2 Module skeleton

Tạo `src/modules/cleaning-shift/` theo pattern `src/modules/parking-reserve/`:

```
cleaning-shift/
├── cleaning-shift.module.ts
├── cleaning-shift.controller.ts
├── cleaning-shift.service.ts
├── cleaning-shift.repository.ts
├── enums/
│   ├── index.ts
│   ├── cleaning-data-type.enum.ts   # 1/2/3 + label map
│   └── cleaning-status.enum.ts      # 1..7 + transitions Record
└── dto/
    ├── index.ts                                  # barrel
    ├── cleaning-shift-filter.dto.ts              # cleaningDate, facilityId, dataType
    ├── create-cleans.dto.ts
    ├── update-cleans.dto.ts                      # note, restTimeFrom/To
    ├── create-cleaning-detail.dto.ts
    ├── update-cleaning-detail.dto.ts
    ├── update-cleaning-detail-type1.dto.ts
    ├── update-cleaning-detail-type2.dto.ts
    ├── update-cleaning-detail-type3.dto.ts       # checkSafetyFlag, pinRevokedConfirmedAt, roomPinCredentialId
    ├── update-cleaning-status.dto.ts
    ├── update-main-staff.dto.ts
    ├── create-clean-detail-note.dto.ts
    ├── update-clean-detail-note.dto.ts
    ├── cleans-response.dto.ts
    ├── cleaning-detail-response.dto.ts           # nested pinInfo
    └── clean-detail-note-response.dto.ts
```

Đăng ký `CleaningShiftModule` trong `src/app.module.ts` (cùng chỗ với `ParkingReserveModule`).

### 1.3 Controller — endpoints (Phase 1)

`@ApiTags('Cleaning Shifts')` + `@UseGuards(AuthGuard('jwt'), RolesGuard)`. Path đặt trực tiếp trong từng decorator (giống `parking-reserve.controller.ts`).

| Method | Path | Service method |
|---|---|---|
| GET    | `/cleaning-shifts`                            | `findAll(filter)` — trả `Cleans` + nested `details[]`, mỗi detail Type 3 kèm `pinInfo` |
| POST   | `/cleaning-shifts`                            | `upsertCleans(dto, staffId)` — idempotent theo `(facilityId, cleaningDate)` |
| PATCH  | `/cleaning-shifts/:cleanId`                   | `updateCleans(...)` — note, restTime |
| POST   | `/cleaning-shifts/:cleanId/details`           | `createDetail(...)` |
| GET    | `/cleaning-shifts/details/:id`                | `findDetailById(id)` |
| PATCH  | `/cleaning-shifts/details/:id`                | `updateDetail(...)` (generic) |
| PATCH  | `/cleaning-shifts/details/:id/type1`          | `updateDetailType1(...)` |
| PATCH  | `/cleaning-shifts/details/:id/type2`          | `updateDetailType2(...)` |
| PATCH  | `/cleaning-shifts/details/:id/type3`          | `updateDetailType3(...)` — guard pin |
| PATCH  | `/cleaning-shifts/details/:id/status`         | `updateStatus(...)` — validate transition |
| PATCH  | `/cleaning-shifts/details/:id/main-staff`     | `updateMainStaff(...)` |
| POST   | `/cleaning-shifts/details/:id/copy`           | `copyDetail(...)` (sang ngày kế) |
| DELETE | `/cleaning-shifts/details/:id`                | `softDeleteDetail(...)` |
| GET    | `/cleaning-shifts/details/:id/notes`          | `findNotes(detailId)` |
| POST   | `/cleaning-shifts/details/:id/notes`          | `addNote(...)` |
| PATCH  | `/cleaning-shifts/notes/:noteId`              | `updateNote(...)` |
| DELETE | `/cleaning-shifts/notes/:noteId`              | `removeNote(...)` |

**Bỏ trong phase 1** (tag `// TODO(phase2)`): gym endpoints, `create_daily` cronjob, 2 PDF report endpoints, `clean-master/facility` endpoints.

### 1.4 Smart-lock integration cho Type 3

Trong `repository.findAllWithDetails()`:
- Khi detail có `dataType=3` và có `roomId+reserveId`, lookup `RoomPinCredential`:
  ```ts
  prisma.roomPinCredential.findFirst({
    where: { roomId, reserveId, deletedAt: null },
    orderBy: { validTo: 'desc' },
    select: { roomPinCredentialId: true, maskedPin: true, status: true,
              validFrom: true, validTo: true, revokedAt: true, expiredAt: true }
  })
  ```
- Ưu tiên `detail.roomPinCredentialId` nếu đã set; nếu chưa thì lazy-link credential mới nhất.
- Trả về trong response DTO:
  ```ts
  pinInfo?: { roomPinCredentialId, maskedPin, status, validFrom, validTo,
              revokedAt, expiredAt, revokedOk: boolean }
  ```
  `revokedOk = status !== 1 || now > validTo`.

Trong `service.updateDetailType3()`:
- Nếu `dto.checkSafetyFlag === true` mà `pinInfo.revokedOk === false` → ném `BadRequestException('Mã PIN cho phòng chưa được hủy')`.

### 1.5 Status state machine

Trong `enums/cleaning-status.enum.ts`:
```ts
export enum CleaningStatus { NOT_STARTED=1, IN_PROGRESS=2, PAUSED=3, FINISHED=4, CHECKED=5, REOPENED=6, CANCELLED=7 }
export const ALLOWED_TRANSITIONS: Record<CleaningStatus, CleaningStatus[]> = {
  1: [2, 7], 2: [3, 4, 7], 3: [2, 7], 4: [5, 6], 5: [6], 6: [2], 7: []
}
```
Service.updateStatus validate `from → to` thuộc `ALLOWED_TRANSITIONS[from]`.

### 1.6 Reference files (đọc trước khi code)

- `hotel-management-be/CLAUDE.md` — convention bắt buộc
- `hotel-management-be/src/modules/parking-reserve/{controller,service,repository,module}.ts` — template structure
- `hotel-management-be/src/modules/parking-reserve/dto/index.ts` — barrel pattern
- `hotel-management-be/prisma/schema.prisma:14` (Staff), `:751` (RoomPinCredential)
- `aic-yokohama-weekly-mansion/app/Http/Actions/Api/Clean/` — 23 PHP actions, source of behavior

---

## 2. Frontend — `hotel-management-fe/`

### 2.1 Routing

Thay file placeholder hiện tại:
- **Xóa**: `src/routes/_authenticated/cleaning.tsx` (file 30 dòng "Chức năng đang phát triển")
- **Tạo**: `src/routes/_authenticated/cleaning.lazy.tsx`
  ```ts
  import { createLazyFileRoute } from '@tanstack/react-router'
  import { CleaningShiftPage } from '@/components/cleaning-shift/CleaningShiftPage'
  export const Route = createLazyFileRoute('/_authenticated/cleaning')({ component: CleaningShiftPage })
  ```
- Chạy `pnpm gen:routes` (hoặc dev sẽ auto regenerate `routeTree.gen.ts`).

### 2.2 API layer

`src/api/cleaning-shift.api.ts` — pattern theo `src/api/parking-reserve.api.ts`:
```ts
export const cleaningShiftApi = {
  getAll, upsertCleans, updateCleans,
  createDetail, getDetail, updateDetail,
  updateDetailType1, updateDetailType2, updateDetailType3,
  updateStatus, updateMainStaff, copyDetail, deleteDetail,
  getNotes, addNote, updateNote, deleteNote,
}
```

### 2.3 Hooks (TanStack Query v5)

Queries (`src/hooks/queries/`):
- `useGetCleaningShifts.ts` — key `['cleaning-shifts', filter]`
- `useGetCleaningDetail.ts`
- `useGetCleanDetailNotes.ts`

Mutations (`src/hooks/mutations/`):
- `useUpsertCleans`, `useUpdateCleans`
- `useCreateCleaningDetail`, `useUpdateCleaningDetail`
- `useUpdateCleaningDetailType1`, `Type2`, `Type3`
- `useUpdateCleaningStatus`, `useUpdateCleaningMainStaff`
- `useCopyCleaningDetail`, `useDeleteCleaningDetail`
- `useCreateCleanDetailNote`, `useUpdateCleanDetailNote`, `useDeleteCleanDetailNote`

**Lưu ý**: KHÔNG dùng `onSuccess`/`onError` trong `useQuery` (đã bị xóa ở v5 — convention dự án). Dùng `useEffect` watch `data`/`error` nếu cần side-effect.

### 2.4 Types

`src/types/cleaning-shift.ts`:
- `Cleans`, `CleaningDetail`, `CleanDetailNote`, `PinInfo`
- Enum `CleaningDataType` (1/2/3), `CleaningStatus` (1..7)
- `CleaningShiftFilterParams`, `Create*Body`, `Update*Body`

### 2.5 Components — `src/components/cleaning-shift/`

- **`CleaningShiftPage.tsx`** — page chủ:
  - Header: `CustomDatePicker` (default = ngày mai), `CustomSelect` chọn facility, button "Tạo bản nháp" (gọi upsertCleans)
  - Khu rest-time + note (textarea)
  - Tabs `Type 1 / Type 2 / Type 3` — tab nào active mới render bảng tương ứng (giảm re-render)

- **`CleanRoomTable.tsx`** (Type 1) — **viết mới từ spec, không port 91KB legacy**. Cap ~400 dòng. Cột:
  - Phòng (room.roomNumber + facility.facilityName)
  - Reservation (client name + checkout date) — qua `reserve` relation
  - Main / Sub / Check staff — `CustomSelect` với option staff
  - External flag — checkbox cạnh selector
  - Schedule: scheduled / start / finish — datetime
  - Status badge + nút action chuyển trạng thái
  - Comment (textarea inline)
  - Report images (4 slot, dùng `uploadApi`)
  - Notes drawer (button → mở `CustomDialog` chứa list note CRUD)

- **`CleaningCommonAreasTable.tsx`** (Type 2) — đơn giản hơn:
  - Tên khu (lưu trong `comment` hoặc `room.roomNumber` nếu room=null thì hiển thị placeholder)
  - Staff (main/check), External flag
  - Status, Comment, Notes drawer

- **`RetailTable.tsx`** (Type 3 — key/safety, **đổi semantic sang smart-lock**):
  - Phòng + reservation (client checkout)
  - **Mã PIN (masked)** từ `pinInfo.maskedPin`
  - **Hiệu lực đến** `pinInfo.validTo`
  - **Trạng thái PIN** badge: Hoạt động (xanh) / Đã hủy (xám) / Hết hạn (vàng)
  - Checkbox "Đã kiểm tra an toàn" → `checkSafetyFlag`
  - Nút "Xác nhận hủy PIN" → set `pinRevokedConfirmedAt = now()` (gọi `/details/:id/type3`)
  - **Bỏ hoàn toàn** các cột legacy: `rental_keys`, `return_keys`, `key_return_datetime`
  - Notes drawer

- **`CleaningStatusBadge.tsx`** — render màu theo `CleaningStatus`
- **`PinStatusBadge.tsx`** — render màu theo `pinInfo.status` + `revokedOk`
- **`NoteDrawer.tsx`** — `CustomDialog` chứa CRUD note cho 1 detail

### 2.6 Reuse từ codebase hiện tại

- `src/components/common/CustomDatePicker.tsx`, `CustomInput.tsx`, `CustomSelect*`, `CustomDialog`
- `src/components/ui/*` (shadcn) — Button, Card, Tabs, Badge, Table
- `src/api/upload.api.ts` (đã có) — upload report images
- Pattern `src/api/parking-reserve.api.ts` + `src/hooks/queries/useGetRooms.ts`

### 2.7 Reference files

- `hotel-management-fe/CLAUDE.md` — Biome rules, no semicolons, single quotes, 100-col
- `hotel-management-fe/src/api/parking-reserve.api.ts` — API shape mẫu
- `hotel-management-fe/src/hooks/queries/useGetRooms.ts` — query hook mẫu
- `hotel-management-fe/src/components/whiteboard/*` — grid/badge mẫu
- `aic-yokohama-weekly-mansion-FE/src/routes/_layout/cleans-shift-management.tsx` — đọc để hiểu state flow, KHÔNG port nguyên xi
- `aic-yokohama-weekly-mansion-FE/src/components/commonTable/{CleanRoomTable,CleaningCommonAreasTable,RetailTable}.tsx` — đọc để map cột, refactor, KHÔNG copy

---

## 3. Verification

### 3.1 Seed data
- 1 facility, 3 rooms, 4 staff (1 admin, 2 cleaner, 1 supervisor).
- 2 reservations checkout hôm nay; 1 có `RoomPinCredential` active, 1 đã `revokedAt`.
- Insert thủ công 1 `Cleans` + 4 `CleaningDetail` (2 Type 1, 1 Type 2, 1 Type 3) qua Prisma Studio cho data ngày hiện tại.

### 3.2 BE smoke (Swagger `/api/docs`)
- `GET /cleaning-shifts?cleaningDate=YYYY-MM-DD&facilityId=1` → header + nested details, Type 3 row có `pinInfo` đầy đủ.
- Type 1 status walk: 1 → 2 → 4 → 5; xác minh `startDatetime`, `finishDatetime`, `checkStaffId` set tự động.
- Type 3 happy + sad path: PIN active → reject "Mã PIN chưa hủy"; PIN revoked → 200 + `pinRevokedConfirmedAt` set.
- Notes CRUD trên 1 detail (add 2, edit 1, delete 1).
- Soft delete detail; xác minh không còn trong `findAll` nhưng `deletedAt` set.

### 3.3 FE click-through (`/cleaning`)
- Page load: date picker default ngày mai, facility select default first, 3 tab hiển thị.
- Tab "Phòng": đổi main staff, click "Bắt đầu" → status badge update; React Query devtools confirm refetch.
- Tab "Khu chung": edit comment, save, F5 → persist.
- Tab "Khóa & An toàn": bảng hiển thị masked PIN + valid-to + status badge; tick "kiểm tra an toàn" với PIN active → toast lỗi VN; với PIN revoked → success.
- Notes drawer: add/edit/delete; counter đúng.
- Image upload Type 1 row slot 1 → reload → image vẫn hiển thị.

### 3.4 Build gates
- BE: `pnpm prisma:generate && pnpm run build` → exit 0
- FE: `pnpm check && pnpm type-check && pnpm build` → exit 0

---

## 4. Phase 2 placeholder (chưa làm lần này)

- **Gym cleaning** (`CleanGymDetail`): thêm model + 4 endpoint, mở rộng `CleaningShiftModule` (không tách module). FE thêm tab thứ 4 `CleanGymTable.tsx`.
- **Daily cronjob 00:02**: `@nestjs/schedule` `CronJob` trong `cleaning-shift.scheduler.ts` — auto-create `Cleans` + `CleaningDetail` initial cho mọi reservation checkout ngày hôm đó.
- **2 PDF report endpoints**: tạo `report.module.ts` riêng, reuse `CleaningShiftService.findAll`, render bằng `pdfkit` hoặc `puppeteer`.
- **Staff attendance editor + drag-drop**: module `attendance` riêng + page FE riêng (consume `Staff.displayInAttendance`, model mới `StaffAttendanceShift`).
- **i18n sweep**: grep `// TODO(i18n)` để extract toàn bộ string tiếng Việt sang `vi.json`.

---

## 5. Risks & Trade-offs

1. **`clean_id` semantic change** (legacy `YYYYMMDD` Int → autoincrement + cột `cleaningDate` Date riêng): silent date-math bug nếu code mới treat `cleanId` như date. Mitigation: response DTO trả cả `cleanId` + `cleaningDate`; FE chỉ dùng `cleaningDate` cho display/filter, `cleanId` chỉ cho mutation reference.
2. **Type 3 PIN ambiguity**: 1 reserve có thể có nhiều `RoomPinCredential`. Lookup "latest by validTo" có thể chọn nhầm. Mitigation: ưu tiên `detail.roomPinCredentialId` đã set → fallback active-status → fallback latest. Có nút "Relink" trong `RetailTable`.
3. **Legacy file size**: CleanRoomTable 91KB chứa code chết, JP labels, mega-component. Risk: copy nguyên gây bloat + fail Biome lint. Mitigation: rebuild từ spec, cap ~400 dòng/component, tách row component.
4. **Status state machine drift**: legacy có 7 status với transition implicit. Mitigation: encode `ALLOWED_TRANSITIONS` record, validate trong service.
5. **Audit relation explosion trên `Staff`**: thêm 10 named relation. Acceptable theo convention, tăng nhẹ `prisma generate` time.
6. **i18n debt**: hardcode VN trái với FE CLAUDE.md. Đã được user chấp nhận. Mitigation: tag `// TODO(i18n)` mọi chỗ hardcode.
7. **Race khi auto-create Cleans**: 2 user mở page cùng lúc cùng ngày/facility. Mitigation: `prisma.cleans.upsert` theo `@@unique([facilityId, cleaningDate])`.

---

## 6. Critical files (đầy đủ paths)

**Sẽ tạo mới (BE)**:
- `hotel-management-be/src/modules/cleaning-shift/cleaning-shift.{module,controller,service,repository}.ts`
- `hotel-management-be/src/modules/cleaning-shift/dto/*.ts` (17 file)
- `hotel-management-be/src/modules/cleaning-shift/enums/{cleaning-data-type,cleaning-status,index}.ts`
- `hotel-management-be/prisma/migrations/<timestamp>_add_cleaning_shift_module/migration.sql`

**Sẽ chỉnh sửa (BE)**:
- `hotel-management-be/prisma/schema.prisma` — thêm 3 model + back-relations
- `hotel-management-be/src/app.module.ts` — register `CleaningShiftModule`

**Sẽ tạo mới (FE)**:
- `hotel-management-fe/src/routes/_authenticated/cleaning.lazy.tsx`
- `hotel-management-fe/src/api/cleaning-shift.api.ts`
- `hotel-management-fe/src/types/cleaning-shift.ts`
- `hotel-management-fe/src/hooks/queries/{useGetCleaningShifts,useGetCleaningDetail,useGetCleanDetailNotes}.ts`
- `hotel-management-fe/src/hooks/mutations/use*.ts` (~13 file)
- `hotel-management-fe/src/components/cleaning-shift/{CleaningShiftPage,CleanRoomTable,CleaningCommonAreasTable,RetailTable,CleaningStatusBadge,PinStatusBadge,NoteDrawer}.tsx`

**Sẽ xóa (FE)**:
- `hotel-management-fe/src/routes/_authenticated/cleaning.tsx` (placeholder cũ)

**Reference (chỉ đọc)**:
- `hotel-management-be/CLAUDE.md`, `hotel-management-fe/CLAUDE.md`
- `hotel-management-be/src/modules/parking-reserve/` (template)
- `hotel-management-be/prisma/schema.prisma:14,751` (Staff, RoomPinCredential)
- `aic-yokohama-weekly-mansion/app/Http/Actions/Api/Clean/` (23 PHP actions)
- `aic-yokohama-weekly-mansion-FE/src/routes/_layout/cleans-shift-management.tsx`
- `aic-yokohama-weekly-mansion-FE/src/components/commonTable/{CleanRoomTable,CleaningCommonAreasTable,RetailTable}.tsx`
