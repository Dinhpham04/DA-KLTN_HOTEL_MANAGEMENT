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

> **TODO**: Thêm business logic cho module Room

### 2.1 Trạng thái phòng

*(Đang cập nhật)*

### 2.2 Loại phòng

*(Đang cập nhật)*

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

---

## Tham khảo

- **SQL Schema**: `docs/hotel_management_sql_create.sql`
- **Legacy Source**: PHP/Laravel codebase (đã migrate)
- **Frontend Constants**: `hotel-management-fe/src/constants/common.ts`
