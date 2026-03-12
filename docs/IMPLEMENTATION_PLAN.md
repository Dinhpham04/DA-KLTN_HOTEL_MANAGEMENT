# Hotel Management Backend - Implementation Plan

> Phân tích từ module tham khảo `aic-yokohama-weekly-mansion` (110+ tables) và hiện trạng `hotel-management-be`.
> Ngày tạo: 2026-03-12

---

## Hiện trạng hotel-management-be

| Hạng mục | Trạng thái |
|---|---|
| Framework | NestJS 11 + Prisma v7 + PostgreSQL 17 |
| Auth | Login / Refresh / Me (JWT + bcrypt) |
| Database model | Chỉ có `Staff` (1 model) |
| Infrastructure | Rate limit, Exception filter, Response transform, Logging, Swagger, Docker, RBAC guard (chưa dùng) |
| Patterns đã define | Repository, UseCase, Specification, DomainEvent interfaces |
| Frontend | Login + Dashboard (hiện tại), placeholder cho Rooms, Reservations, Clients, Billing, Cleaning |

---

## Nguyên tắc ưu tiên

1. **Dependency order** - Không thể làm Reservation nếu chưa có Room và Client
2. **Frontend alignment** - Ưu tiên các module mà FE đã có API client (`roomApi`, `reservationApi`, `dashboardApi`)
3. **Business value** - Core business flow: Room → Reservation → Check-in/out → Billing → Cleaning
4. **Incremental delivery** - Mỗi phase tạo ra giá trị sử dụng được ngay

---

## Phase 1: Master Data & Room Management (Tuần 1-2)

**Mục tiêu:** Xây dựng nền tảng dữ liệu cơ bản và quản lý phòng.

### 1.1 Prisma Schema - Master Models

Thêm các model vào `prisma/schema.prisma`:

| Model | Table | Mô tả | Quan hệ |
|---|---|---|---|
| `Country` | `countries` | Quốc gia | - |
| `Facility` | `facilities` | Cơ sở/tòa nhà | Staff (audit) |
| `RoomClass` | `room_classes` | Hạng phòng (Standard, Deluxe...) | Staff (audit) |
| `RoomType` | `room_types` | Loại phòng (Single, Double...) | → RoomClass, Staff |
| `Room` | `rooms` | Phòng cụ thể | → RoomType, Facility, Staff |
| `StayType` | `stay_types` | Loại lưu trú (ngày/tuần/tháng) | Staff (audit) |

### 1.2 Module: Staff Management (CRUD)

> Staff model đã có, nhưng chưa có CRUD API.

```
POST   /api/v1/staffs          - Tạo nhân viên (Admin only)
GET    /api/v1/staffs          - Danh sách nhân viên (pagination)
GET    /api/v1/staffs/:id      - Chi tiết nhân viên
PATCH  /api/v1/staffs/:id      - Cập nhật nhân viên
DELETE /api/v1/staffs/:id      - Soft delete nhân viên
```

**Chi tiết:**
- `StaffModule` → `StaffController` + `StaffService` + `StaffRepository`
- Áp dụng `IRepository` interface đã define
- RBAC: Admin/Manager mới được CRUD staff
- Soft delete qua `deletedAt` + `deletedStaffId`

### 1.3 Module: Room Management

```
POST   /api/v1/rooms           - Tạo phòng
GET    /api/v1/rooms           - Danh sách phòng (filter by status, floor, type)
GET    /api/v1/rooms/:id       - Chi tiết phòng
PATCH  /api/v1/rooms/:id       - Cập nhật phòng
DELETE /api/v1/rooms/:id       - Soft delete phòng
PATCH  /api/v1/rooms/:id/status - Thay đổi trạng thái phòng
```

**Chi tiết:**
- `RoomModule` → `RoomController` + `RoomService` + `RoomRepository`
- Trạng thái phòng: available, occupied, cleaning, maintenance, reserved
- Filter + search + pagination
- FE đã có `roomApi` sẵn sàng kết nối

### 1.4 Module: Room Class & Room Type (Master data)

```
GET    /api/v1/room-classes     - Danh sách hạng phòng
POST   /api/v1/room-classes     - Tạo hạng phòng
GET    /api/v1/room-types       - Danh sách loại phòng
POST   /api/v1/room-types       - Tạo loại phòng
```

### 1.5 Seed Data

- Tạo `prisma/seed.ts` với dữ liệu mẫu:
  - 1 Facility (khách sạn chính)
  - 3-5 Room Classes
  - 5-8 Room Types
  - 20-30 Rooms
  - 5-10 Staff (Admin, Manager, Staff)
  - Các stay types (Daily, Weekly, Monthly)
  - Danh sách countries

**Deliverables Phase 1:**
- [x] Thao tác CRUD phòng đầy đủ
- [x] Quản lý staff (ngoài auth)
- [x] Master data cơ bản
- [x] Seed data để demo

---

## Phase 2: Client & Reservation Management (Tuần 3-4)

**Mục tiêu:** Xây dựng luồng đặt phòng chính - core business.

### 2.1 Prisma Schema - Booking Models

| Model | Table | Mô tả | Quan hệ |
|---|---|---|---|
| `Client` | `clients` | Khách hàng | → Country, Staff |
| `Reserve` | `reserves` | Đặt phòng | → Client, Room, Facility, StayType, Staff |
| `ReserveOccupier` | `reserve_occupiers` | Người ở cùng | → Reserve, Country |

### 2.2 Module: Client Management

```
POST   /api/v1/clients          - Tạo khách hàng
GET    /api/v1/clients          - Danh sách (search by name, phone, email)
GET    /api/v1/clients/:id      - Chi tiết khách hàng
PATCH  /api/v1/clients/:id      - Cập nhật
DELETE /api/v1/clients/:id      - Soft delete
```

**Chi tiết:**
- Hỗ trợ khách cá nhân và doanh nghiệp
- Search full-text theo tên/email/phone
- Quốc tịch liên kết với `Country`

### 2.3 Module: Reservation Management

```
POST   /api/v1/reservations              - Tạo đặt phòng
GET    /api/v1/reservations              - Danh sách (filter by status, date range, client)
GET    /api/v1/reservations/:id          - Chi tiết đặt phòng
PATCH  /api/v1/reservations/:id          - Cập nhật đặt phòng
DELETE /api/v1/reservations/:id          - Hủy đặt phòng
POST   /api/v1/reservations/:id/confirm  - Xác nhận đặt phòng
POST   /api/v1/reservations/:id/check-in - Check-in
POST   /api/v1/reservations/:id/check-out- Check-out
POST   /api/v1/reservations/:id/cancel   - Hủy với lý do
```

**Business Logic quan trọng:**
- **Kiểm tra phòng trống:** Không cho đặt chồng lịch (overlap detection) - dùng `ERROR_MESSAGES.ROOM_OVERLAP` đã define
- **State machine:** pending → confirmed → checked_in → checked_out (hoặc → cancelled)
- **Auto-update room status:** Check-in → room = occupied, Check-out → room = cleaning
- **Domain Events:** Emit `ReservationCreated`, `CheckedIn`, `CheckedOut` events (dùng EventEmitter đã register)
- FE đã có `reservationApi` + `useCheckIn/useCheckOut` hooks sẵn sàng

### 2.4 Reservation State Machine

```
                    ┌─────────┐
          ┌────────►│CANCELLED│
          │         └─────────┘
          │
    ┌─────┴──┐    confirm    ┌──────────┐   check-in   ┌───────────┐  check-out  ┌────────────┐
    │PENDING │──────────────►│CONFIRMED │──────────────►│CHECKED_IN │────────────►│CHECKED_OUT │
    └────────┘               └─────┬────┘               └───────────┘             └────────────┘
                                   │
                                   └──────────►┌─────────┐
                                               │CANCELLED│
                                               └─────────┘
```

**Deliverables Phase 2:**
- [x] Quản lý khách hàng đầy đủ
- [x] Đặt phòng với kiểm tra chồng lịch
- [x] Luồng check-in / check-out
- [x] State machine cho reservation
- [x] Domain events

---

## Phase 3: Billing & Cleaning (Tuần 5-6)

**Mục tiêu:** Hoàn thành business cycle: đặt phòng → ở → thanh toán → dọn phòng.

### 3.1 Prisma Schema - Billing & Cleaning Models

| Model | Table | Mô tả | Quan hệ |
|---|---|---|---|
| `BillingItem` | `billing_items` | Hạng mục tính phí | Staff |
| `PaymentMethod` | `payment_methods` | Phương thức thanh toán | Staff |
| `Sale` | `sales` | Hóa đơn | → Reserve, Client, Facility, Staff |
| `SaleDetail` | `sale_details` | Chi tiết hóa đơn | → Sale, BillingItem, Staff |
| `Clean` | `cleans` | Ca dọn phòng | → Facility, Staff |
| `CleaningDetail` | `cleaning_details` | Chi tiết dọn phòng | → Clean, Room, Staff |

### 3.2 Module: Billing / Sales

```
POST   /api/v1/sales                    - Tạo hóa đơn (auto từ check-out hoặc manual)
GET    /api/v1/sales                    - Danh sách hóa đơn
GET    /api/v1/sales/:id               - Chi tiết hóa đơn
POST   /api/v1/sales/:id/payment       - Ghi nhận thanh toán
GET    /api/v1/billing-items           - Danh sách hạng mục tính phí
GET    /api/v1/payment-methods         - Danh sách phương thức thanh toán
```

**Business Logic:**
- Auto tạo sale khi check-out (tính tiền phòng theo stay_type + số ngày)
- Hỗ trợ thanh toán một phần (partial payment)
- Trạng thái: unpaid → partial → paid (hoặc refunded)
- Tính tiền phòng dựa trên `Rent` (giá theo loại phòng + kỳ hạn)

### 3.3 Module: Cleaning Management

```
POST   /api/v1/cleaning                 - Tạo ca dọn phòng
GET    /api/v1/cleaning                 - Danh sách (filter by date, status)
GET    /api/v1/cleaning/:id            - Chi tiết
PATCH  /api/v1/cleaning/:id            - Cập nhật trạng thái
POST   /api/v1/cleaning/:id/complete   - Hoàn thành dọn phòng
POST   /api/v1/cleaning/:id/assign     - Phân công nhân viên
```

**Business Logic:**
- Auto tạo cleaning task khi check-out (listen `CheckedOut` event)
- Trạng thái: pending → in_progress → completed / skipped
- Khi completed → auto update room status = available
- Phân công nhân viên dọn phòng

### 3.4 Event-Driven Automation

```
CheckedOut event:
  1. Tạo Sale (tính tiền)
  2. Tạo CleaningDetail (phân công dọn phòng)
  3. Update Room status → cleaning

CleaningCompleted event:
  1. Update Room status → available
```

**Deliverables Phase 3:**
- [x] Hóa đơn tự động từ check-out
- [x] Thanh toán (full/partial)
- [x] Dọn phòng tự động từ check-out
- [x] Pipeline: checkout → billing → cleaning → room available

---

## Phase 4: Dashboard & Reporting (Tuần 7)

**Mục tiêu:** Tổng hợp dữ liệu, cung cấp cái nhìn tổng quan.

### 4.1 Module: Dashboard

```
GET    /api/v1/dashboard/stats          - Thống kê tổng quan
GET    /api/v1/dashboard/today          - Hoạt động hôm nay
GET    /api/v1/dashboard/revenue        - Doanh thu (theo tháng/ngày)
```

**Response `/dashboard/stats`:**
```json
{
  "totalRooms": 30,
  "occupiedRooms": 18,
  "availableRooms": 10,
  "todayCheckIns": 5,
  "todayCheckOuts": 3,
  "pendingCleanings": 4,
  "monthlyRevenue": 125000000,
  "occupancyRate": 0.6
}
```

> FE đã có `dashboardApi` + `useDashboardStats()` hook sẵn sàng.

### 4.2 Scheduled Tasks (Cron)

- **Daily room stats aggregation:** Chạy 00:00 mỗi ngày, tổng hợp dữ liệu phòng vào `daily_room_stats`
- **Auto-cancel expired reservations:** Chạy mỗi giờ, auto-cancel reservation pending quá 24h

**Deliverables Phase 4:**
- [x] Dashboard API khớp với FE
- [x] Thống kê doanh thu
- [x] Cron jobs cho aggregation

---

## Phase 5: Mở rộng (Tuần 8+)

Sau khi core business hoàn thành, mở rộng theo nhu cầu:

### 5.1 Parking Management
- Quản lý bãi đỗ xe (ô tô + xe đạp)
- Đặt chỗ đỗ xe gắn với reservation

### 5.2 Equipment & Inventory
- Quản lý thiết bị theo phòng
- Log lịch sử di chuyển thiết bị

### 5.3 Facility Management
- Multi-property support
- Quản lý khu vực (areas + zones)

### 5.4 Arrangement / Services
- Dịch vụ bổ sung cho reservation (đồ ăn, dọn phòng extra, ...)

### 5.5 Staff Attendance
- Chấm công nhân viên
- Quản lý ca làm việc

### 5.6 Notifications & Announcements
- Thông báo nội bộ
- Push notification cho staff

### 5.7 Survey System
- Khảo sát khách hàng sau check-out
- Đánh giá chất lượng dịch vụ

### 5.8 AI Chatbot (nếu cần)
- Chatbot hỗ trợ khách đặt phòng
- Multi-language support

---

## Dependency Graph tổng thể

```
Phase 1 (Foundation)
├── Countries, StayTypes (master data, no deps)
├── Facilities (→ Staff)
├── RoomClass (→ Staff)
├── RoomType (→ RoomClass, Staff)
├── Rooms (→ RoomType, Facility, Staff)
└── Staff CRUD (→ Staff model exists)

Phase 2 (Core Booking)
├── Clients (→ Country, Staff)
└── Reservations (→ Client, Room, Facility, StayType, Staff)

Phase 3 (Business Cycle)
├── BillingItems, PaymentMethods (master data)
├── Sales (→ Reserve, Client, Facility, Staff)
├── SaleDetails (→ Sale, BillingItem)
├── Cleans (→ Facility, Staff)
└── CleaningDetails (→ Clean, Room, Staff)

Phase 4 (Analytics)
└── Dashboard (→ Room, Reserve, Sale, Cleaning)

Phase 5+ (Extensions)
├── Parking (→ Facility, Reserve, Client)
├── Equipment (→ Facility, Room)
├── Arrangements (→ Reserve, Room)
├── Attendance (→ Staff)
├── Surveys (→ Reserve)
└── AI Chat (→ Staff, Facility, RoomType)
```

---

## Recommendations kỹ thuật

### Áp dụng cho mỗi module mới:

1. **Structure**: Theo pattern NestJS module
   ```
   src/modules/{module}/
   ├── {module}.module.ts
   ├── {module}.controller.ts
   ├── {module}.service.ts
   ├── {module}.repository.ts      # Implement IRepository
   ├── dto/
   │   ├── create-{module}.dto.ts
   │   ├── update-{module}.dto.ts
   │   └── query-{module}.dto.ts   # Filter + pagination
   └── entities/                    # Domain types (nếu cần)
   ```

2. **Repository Pattern**: Dùng `IRepository` interface đã define, mỗi module implement riêng
3. **Soft Delete**: Tất cả entity dùng `deletedAt` + `deletedStaffId`, filter `deletedAt: null` ở repository
4. **Audit Trail**: Mọi mutation ghi `createdStaffId`, `updatedStaffId` từ `@CurrentUser()`
5. **Pagination**: Dùng `PaginationDto` + `IPaginated` đã define
6. **Validation**: class-validator DTOs, Swagger auto-generated từ decorators
7. **Testing**: Unit test cho service logic, E2E test cho API endpoints

### Database Migration Strategy:

```bash
# Mỗi phase thêm models mới:
npx prisma migrate dev --name "phase-1-room-management"
npx prisma migrate dev --name "phase-2-reservation"
npx prisma migrate dev --name "phase-3-billing-cleaning"
```

---

## Tóm tắt ưu tiên

| # | Phase | Tuần | Module chính | Lý do ưu tiên |
|---|---|---|---|---|
| 1 | Master Data & Rooms | 1-2 | Staff CRUD, Room, RoomType, RoomClass, Facility, Seed | Nền tảng - mọi thứ phụ thuộc vào đây |
| 2 | Client & Reservation | 3-4 | Client, Reservation (với state machine) | Core business - luồng đặt phòng |
| 3 | Billing & Cleaning | 5-6 | Sale, Cleaning, Event-driven automation | Hoàn thành business cycle |
| 4 | Dashboard & Reporting | 7 | Dashboard stats, Cron jobs | FE đã sẵn sàng, tổng hợp dữ liệu |
| 5 | Extensions | 8+ | Parking, Equipment, Attendance, Survey... | Nice-to-have, mở rộng theo nhu cầu |

> **Khuyến nghị bắt đầu ngay:** Phase 1 - tạo Prisma schema cho Room domain + Staff CRUD. Đây là bước blocking cho tất cả các phase sau.
