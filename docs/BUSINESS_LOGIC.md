# Business Logic Documentation

Tài liệu này ghi lại các nghiệp vụ (business logic) quan trọng trong hệ thống quản lý khách sạn, được phân tích từ legacy system (PHP/Laravel).

---

## Mục lục

1. [Quản lý Khách hàng (Client)](#1-quản-lý-khách-hàng-client)
2. [Quản lý Phòng (Room)](#2-quản-lý-phòng-room)
3. [Quản lý Đặt phòng (Reservation)](#3-quản-lý-đặt-phòng-reservation)
4. [Quản lý Thanh toán (Payment)](#4-quản-lý-thanh-toán-payment)

---

## 1. Quản lý Khách hàng (Client)

### 1.1 Phân loại khách hàng (data_type)

| Giá trị | Tiếng Nhật | Tiếng Việt | Mô tả |
|---------|------------|------------|-------|
| 0 | 指定なし | Không xác định | Chưa phân loại |
| 1 | 個人 | Cá nhân | Khách lẻ, cá nhân |
| 2 | 法人 | Doanh nghiệp | Công ty, tổ chức thông thường |
| 3 | 特別法人 | DN đặc biệt | Doanh nghiệp có thỏa thuận đặc biệt |

**DN đặc biệt (特別法人)** là những doanh nghiệp/tổ chức có thỏa thuận riêng với khách sạn:
- Đối tác chiến lược có hợp đồng dài hạn
- Khách hàng VIP doanh nghiệp (đặt phòng thường xuyên, số lượng lớn)
- Đại lý du lịch/OTA có thỏa thuận riêng
- **Đặc quyền**: Chỉ DN đặc biệt mới được bật `postpaid_flag` (thanh toán sau)

### 1.2 Trạng thái khách hàng (data_status)

| Giá trị | Tiếng Nhật | Tiếng Việt | Mô tả |
|---------|------------|------------|-------|
| 0 | 利用停止 | Ngừng sử dụng | Không còn khả năng sử dụng trong tương lai |
| 1 | 利用可能 | Hoạt động | Trạng thái bình thường |
| 2 | 非表示 | Ẩn | Xóa logic (vẫn giữ để tham chiếu) |

### 1.3 UG Flag (Khách không mong muốn)

**UG = Undesirable Guest** (要注意顧客)

Cờ đánh dấu khách hàng cần chú ý đặc biệt:
- Đã gây ra vấn đề trong quá khứ (phá hoại tài sản, gây rối...)
- Có hành vi không phù hợp
- Có nợ chưa thanh toán
- Được đưa vào danh sách đen

**UI Behavior**: Khi `ug_flag = true`, form khách hàng sẽ hiển thị nền màu cam (`bg-orange-300`) để cảnh báo nhân viên.

### 1.4 Postpaid Flag (Thanh toán sau)

| Giá trị | Ý nghĩa |
|---------|---------|
| 0 | Thanh toán trước/ngay (mặc định) |
| 1 | Được phép thanh toán sau (công nợ) |

**Điều kiện**: Chỉ áp dụng cho `data_type = 3` (DN đặc biệt).

### 1.5 Stay Duration Auto Flag

| Giá trị | Tiếng Nhật | Tiếng Việt |
|---------|------------|------------|
| 0 | なし | Không tự động |
| 1 | あり | Tự động tính thời gian lưu trú |

### 1.6 Used Messy Level (Mức độ sử dụng phòng)

Đánh giá mức độ "bừa bộn" khi khách sử dụng phòng:

| Giá trị | Tiếng Nhật | Tiếng Việt |
|---------|------------|------------|
| 0 | 無 | Không đánh giá |
| 1 | 普通 | Bình thường |
| 2 | 少 | Ít (sạch sẽ) |
| 3 | 多 | Nhiều (bừa bộn) |

### 1.7 Giới tính (sex)

| Giá trị | Tiếng Nhật | Tiếng Việt |
|---------|------------|------------|
| 1 | 男性 | Nam |
| 2 | 女性 | Nữ |
| 9 | 不明 | Không xác định |

---

## 2. Quản lý Phòng (Room)

### 2.1 Diện tích phòng theo Cơ sở (Room Area Master - 部屋面積マスタ)

#### 2.1.1 Tổng quan

**Room Area Master** là chức năng quản lý **diện tích (acreage/面積)** của từng loại phòng tại mỗi cơ sở (facility/店舗). Giao diện dạng bảng ma trận (matrix):

- **Hàng (rows)**: Danh sách các cơ sở (facility), sắp xếp theo `order_num`, mỗi hàng hiển thị tên và màu sắc riêng (`color_option`).
- **Cột (columns)**: Danh sách các loại phòng (room type), hiển thị tên viết tắt (`room_type_name_short`).
- **Ô giao (cells)**: Giá trị diện tích của loại phòng đó tại cơ sở đó.

#### 2.1.2 Bảng dữ liệu chính

**Bảng `facility_room_types`** — Bảng trung gian lưu diện tích theo cặp (facility, room_type):

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `facility_room_type_id` | INT (PK) | ID tự tăng |
| `facility_id` | INT (FK → facilities) | Cơ sở |
| `room_type_id` | INT (FK → room_types) | Loại phòng |
| `acreage` | VARCHAR(255) | Diện tích (m²) - nullable, kiểu chuỗi để hỗ trợ giá trị linh hoạt |
| `data_status` | TINYINT | 0=Ngừng, 1=Hoạt động, 2=Ẩn (soft delete) |
| `created_staff_id` / `updated_staff_id` / `deleted_staff_id` | INT (FK → staffs) | Audit fields |
| `deleted_at` | TIMESTAMP | Soft delete |

#### 2.1.3 Luồng nghiệp vụ

**Load dữ liệu (GET `facility/room_type`)**:

1. Lấy danh sách **facilities** có `data_status = 1` (hoạt động), sắp xếp theo `order_num`.
2. Lấy danh sách **room_types** có `data_status = 1`, sắp xếp theo `order_num`.
3. Lấy danh sách **rooms** (phòng thực tế) có `data_status = 1`, group theo `facility_id` → xác định loại phòng nào **thực sự tồn tại** tại cơ sở nào (`isExists`).
4. Lấy bảng `facility_room_types` kèm join `room_types` → lấy giá trị `acreage` đã lưu.
5. Kết hợp tất cả thành ma trận, trả về:

```json
{
  "facilities": [
    {
      "facility_id": 1,
      "facility_name": "Tên cơ sở",
      "facility_name_en": "Facility Name",
      "facility_no": 6,
      "order_num": 1,
      "color_option": "#3764A8",
      "room_types": [
        {
          "room_type_id": 1,
          "room_type_name": "Loại phòng A",
          "room_type_name_short": "A",
          "acreage": "25.5",
          "isExists": 1
        }
      ]
    }
  ]
}
```

**Cập nhật diện tích (POST `facility/room_type`)**:

1. Nhận payload chứa toàn bộ ma trận `facilities[].room_type[]` với `room_type_id` và `number` (giá trị diện tích).
2. Validation:
   - `facility_id` phải tồn tại trong bảng `facilities` với `data_status = 1` và chưa bị xóa.
   - `room_type_id` phải tồn tại trong bảng `room_types` với `data_status = 1` và chưa bị xóa.
   - `acreage` nullable (cho phép để trống).
3. Xử lý trong transaction:
   - Với mỗi cặp `(facility_id, room_type_id)`:
     - Dùng **`updateOrCreate`**: nếu đã tồn tại thì cập nhật `acreage`, nếu chưa thì tạo mới.
   - Xử lý theo batch (chunk 100 records).
   - Nếu bất kỳ record nào lưu thất bại → rollback toàn bộ.
4. Trả về `status_code: 200` nếu thành công, `500` nếu thất bại.

#### 2.1.4 Quy tắc UI

| Quy tắc | Mô tả |
|---------|-------|
| **Cell disabled (nền xám)** | Khi `isExists = 0` — cơ sở đó không có phòng thuộc loại phòng này. Vẫn cho nhập nhưng hiện nền xám `bg-gray-300` để phân biệt. |
| **Màu hàng** | Mỗi cơ sở có `color_option` riêng, dùng làm nền cho cột tên cơ sở. Mặc định `#3764A8`. |
| **Input** | Mỗi ô là input text, giá trị chính là diện tích (m²). Giá trị có thể là số hoặc chuỗi. |
| **Nút "順番を更新" (Cập nhật thứ tự)** | Submit toàn bộ form, gửi POST request cập nhật tất cả acreage. |

#### 2.1.5 Giải thích trường `isExists`

- **`isExists = 1`**: Trong bảng `rooms`, có ít nhất 1 phòng thực tế thuộc `room_type_id` này tại `facility_id` này. Đây là loại phòng đang vận hành.
- **`isExists = 0`**: Không có phòng thực tế nào thuộc loại phòng này tại cơ sở này. Ô input hiện nền xám nhưng vẫn cho nhập (phòng có thể được tạo sau).

#### 2.1.6 Mối quan hệ Entity

```
Area (khu vực)
 └── Facility (cơ sở/tòa nhà)
      ├── Room (phòng cụ thể) ──→ Room Type (loại phòng) ──→ Room Class (hạng phòng)
      └── FacilityRoomType (bảng trung gian: diện tích theo cơ sở + loại phòng)
```

### 2.2 Trạng thái phòng (Room Status)

*(Đang cập nhật - Sẽ liên quan đến dọn dẹp, có khách, phòng trống...)*

### 2.3 Loại phòng (Room Type Master)

Loại phòng (Room Type) là danh mục phân loại phòng (VD: Standard, Twin, E-FLAT, S-Class...).  
- **Quản lý dữ liệu**: Bảng `room_types` gồm `room_type_name` (Tên đầy đủ) và `room_type_name_short` (Tên viết tắt dùng để hiển thị trên các ma trận như Room Area Master).
- **Frontend**: Hiện tại FE đang sử dụng component Mock (`CustomRoomTypeModal`) và Hook `useGetRoomType`, chưa có trang CRUD hoàn chỉnh cho người dùng tác động trực tiếp.
- **Backend**: API `/api/v1/room-type` (GET, POST, PUT).
- **Mối quan hệ**: Một Loại phòng có thể thuộc nhiều Cơ sở (Facility), và sẽ có một **diện tích riêng** ứng với từng cơ sở đó (thông qua `FacilityRoomType`).

### 2.4 Cài đặt danh sách phòng vật lý (Rooms Setting)

**Màn hình:** `rooms-setting.lazy.tsx`  
**Chức năng:** Quản lý danh sách các phòng thực tế (physical rooms) của toàn bộ hệ thống.

#### 2.4.1 Cấu trúc dữ liệu chính (Bảng `rooms`)

| Trường | Ý nghĩa | Ràng buộc / Validation |
|--------|---------|------------------------|
| `facility_id` | Cơ sở (Tòa nhà) | Bắt buộc chọn từ danh sách Facility đang hoạt động |
| `room_type_id` | Loại phòng | Bắt buộc chọn từ danh sách Room Type |
| `room_number` | Số phòng / Mã phòng | Bắt buộc, Tối đa 32 ký tự |
| `quipment_ids`| Thiết bị trong phòng | Chọn nhiều từ danh mục thiết bị (`quipments`) hiển thị qua Modal |
| `pet_flag` | Cho phép thú cưng | 0 = Không (なし), 1 = Có (あり) |
| `reserved_clean_day`| Ngày dọn dẹp dự kiến | Dropdown (0 - 30 ngày) |
| `mailbox_password`| Mật khẩu hòm thư | Pass của hộp thư vật lý tại phòng đó |
| `external_flag` | Phòng ngoại biên | Cờ đánh dấu phòng thuộc dạng external (checkbox) |
| `order_num` | Thứ tự hiển thị | Số nguyên dương để sắp xếp (1 - 999999) |
| `data_status` | Trạng thái phòng | 1 = Hoạt động (bg bình thường), 0 = Ngừng hoạt động (bg-gray-400) |

#### 2.4.2 Quy tắc nghiệp vụ (Business Rules)

1. **Ràng buộc Thú cưng (Pet Flag)**:
   - Trong Cơ sở (`facility`) có cấu hình `share_place_flag`. 
   - Nếu Cơ sở có `share_place_flag = 1` hoặc `0` (tuỳ thuộc vào code FE: khi thêm mới `isPetDisabled = shared == 1`, khi update thì `shared == 0`), ô chọn Thú cưng bị **disabled** trên UI (tắt không cho chọn). Tức là phụ thuộc chặt chẽ vào cấu hình không gian dùng chung của Tòa nhà.
2. **Quy tắc Trạng thái (Data Status)**:
   - Các phòng có `data_status = 0` (Ngưng hoạt động) sẽ bị tô nền **Xám đậm (`bg-gray-400`)** trên danh sách. 
   - Khi ở trạng thái ngưng hoạt động, hệ thống **không cho sửa** các thông tin quan trọng như: Cơ sở, Loại phòng, Số phòng, Trang thiết bị, Thú cưng. Nút `Chọn thiết bị` cũng bị disable.
3. **Quản lý thiết bị (Quipments)**:
   - Phòng vật lý không lưu cứng thiết bị, mà liên kết dạng N-N với danh mục Thiết bị (`quipment_id`).
   - Modal thêm thiết bị truyền vào `initialQuipmentIds` và trả về danh sách được update (React state `selectedQuipments`).
4. **Luồng Cập nhật & Thêm mới**:
   - Sử dụng chung một Table Form (React Hook Form + Zod).
   - Thêm dòng sử dụng Component `CreateRoom` tích hợp sẵn Validation cứng theo DataSchema.
   - Khi chỉnh sửa, nhấn nút `保存` (Save) tương ứng tại từng dòng để gửi `PUT /api/v1/room/{id}`.

### 2.5 Quản lý cấu hình giá (Rents Master - 賃料マスタ)

**Màn hình:** `rents-master.lazy.tsx`  
**Chức năng:** Thiết lập biểu giá thuê phòng, phí dọn dẹp, phí điện nước, phí quản lý theo từng Gói lưu trú (Stay Type) cho mỗi Loại phòng (Room Type).

#### 2.5.1 Luồng nghiệp vụ chính
- Biểu giá được chia làm hai khu vực độc lập dựa trên việc **Có đặt cọc hay Không (Deposit Flag)**:
  - **預かり金なし (`deposit_flag = 0`)**: Gói thuê không cọc.
  - **預かり金あり (`deposit_flag = 1`)**: Gói thuê có cọc.
- Với mỗi Loại phòng được thêm vào bảng, người dùng sẽ cấu hình tối đa 7 mức giá tương ứng với 7 Gói lưu trú (`stay_type_id` từ 1 $\rightarrow$ 7, ví dụ: Ngắn ngày, Weekly, Monthly 1, Monthly 3...).

#### 2.5.2 Cấu trúc biểu phí (`Rents`)
Một bảng giá của `1 Loại phòng + 1 Gói lưu trú` gồm:
- **Tiền thuê (Rent)**: Thuê ngày (`day_rent`), Thuê tháng (`month_rent`).
- **Phí dọn dẹp (Cleaning Fee)**: Dọn ngày (`day_clean_fee`), Dọn tháng (`month_clean_fee`).
- **Phí quản lý (Maintenance Fee)**: Thu ngày (`day_mainte_fee`) hoặc chốt cứng theo tháng ở cấp độ Loại phòng (`month_mainte_fee`).
- **Phí tiện ích (Utility Fee)**: Thu ngày (`day_utility_fee`) hoặc tháng (`month_utility_fee`).
- **Tiền cọc (Deposit Pay)**: Bắt buộc khai báo nếu nằm ở bảng `deposit_flag = 1`.

#### 2.5.3 Thao tác Backend cốt lõi
- **API `GET /api/v1/rent/list`**: Trả về danh sách ma trận biểu giá phân theo `deposit_flag`.
- **API Cập nhật**: Quét hệ thống, những `room_type` không có mặt trong payload gửi lên sẽ bị `delete()` khỏi bảng giá hiện tại. Dùng logic `updateOrCreate` cho từng cặp `(room_type_id, stay_type_id)` kèm Transaction rollback an toàn.

---

## 3. Quản lý Đặt phòng (Reservation)

> **TODO**: Thêm business logic cho module Reservation

### 3.1 Trạng thái đặt phòng

*(Đang cập nhật)*

### 3.2 Quy trình đặt phòng

*(Đang cập nhật)*

---

## 4. Quản lý Thanh toán (Payment)

> **TODO**: Thêm business logic cho module Payment

### 4.1 Phương thức thanh toán

*(Đang cập nhật)*

### 4.2 Quy trình thanh toán

*(Đang cập nhật)*

---

## Changelog

| Ngày | Nội dung cập nhật |
|------|-------------------|
| 2026-03-26 | Khởi tạo tài liệu, thêm business logic Client (data_type, UG flag, postpaid_flag, etc.) |
| 2026-03-29 | Thêm business logic Room Area Master (部屋面積マスタ) — quản lý diện tích phòng theo cơ sở |
| 2026-03-29 | Bổ sung tài liệu phân loại Room Type và màn hình Cài đặt phòng vật lý (Rooms Setting) |
| 2026-03-29 | Thêm business logic Cấu hình giá (Rents Master) phân theo Gói lưu trú và Đặt cọc |

---

## Tham khảo

- **SQL Schema**: `docs/hotel_management_sql_create.sql`
- **Legacy Source**: PHP/Laravel codebase (đã migrate)
- **Frontend Constants**: `hotel-management-fe/src/constants/common.ts`
