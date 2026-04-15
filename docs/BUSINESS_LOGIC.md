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

### 3.1 Kiến trúc & Bảng dữ liệu

**Bảng chính:**
- **`reserves`**: Lưu thông tin đặt phòng.
Các field chính của 予約情報 và ý nghĩa chi tiết theo nghiệp vụ đang thể hiện trong màn hình của bạn:

エリア area_id
Ý nghĩa: Khu vực quản lý (vùng địa lý hoặc cụm cơ sở).
Bạn chọn field này trước để lọc danh sách 店舗.
Nghiệp vụ: Đây là “cấp 1” trong chuỗi chọn phòng.

店舗 facility_id
Ý nghĩa: Cơ sở/tòa nhà cụ thể thuộc エリア.
Sau khi chọn 店舗 thì mới xác định được ルームタイプ và ルーム番号.
Nghiệp vụ: Đây là “cấp 2” để định vị inventory phòng.

ルームタイプ room_type_id
Ý nghĩa: Loại phòng (studio, 1K, 1LDK… tùy hệ thống).
Nghiệp vụ: Dùng để:

lọc danh sách phòng thực tế
tính đơn giá/rent tương ứng
ルーム番号 room_id
Ý nghĩa: Phòng cụ thể khách sẽ ở.
Nghiệp vụ:
là khóa chính để xác định đặt phòng thực tế
khi đổi room, hệ thống tự tính lại 後× theo cấu hình phòng + mức độ bẩn khách
前× noreserve_count_before
Ý nghĩa nghiệp vụ thường gặp: số “đệm” trước kỳ ở (số ngày/số lượt block trước khi bắt đầu booking).
Thực tế trong code đang cho chọn số 1-50.
Bạn có thể hiểu là buffer trước khi check-in để đảm bảo vận hành.

後× noreserve_count_after
Ý nghĩa: số “đệm” sau kỳ ở.
Field này được auto set khi chọn room (dựa trên reserved_clean_day và used_messy_level), nhưng vẫn cho chỉnh tay.
Nghiệp vụ: dành thời gian vệ sinh/chuẩn bị phòng trước booking tiếp theo.

利用期間 period_from, period_to
Ý nghĩa: Ngày bắt đầu và ngày kết thúc lưu trú.
Nghiệp vụ:

hiển thị số đêm
là cơ sở tính loại lưu trú, billing period, và kiểm tra hợp lệ ngày (to phải >= from)
利用区分 stay_type_id
Ý nghĩa: Phân loại thời hạn ở (ngắn hạn/tuần/tháng/quý...).
Nghiệp vụ:
auto tính từ 利用期間
có thể chỉnh tay nếu cần override
ảnh hưởng trực tiếp đến tính giá thuê
自動延長しない auto_extend_flag
Ý nghĩa: Không cho tự động gia hạn.
Nghiệp vụ: khi bật, reservation sẽ không tự kéo dài theo logic gia hạn tự động của hệ thống.

確定 confirm_flag
Ý nghĩa: Trạng thái reservation (未定: chưa chốt, 確定: đã chốt).
Nghiệp vụ:

ảnh hưởng luồng xử lý kế toán/thuế ở một số dòng billing
cũng là cờ quan trọng cho vận hành biết booking đã final hay chưa
入居方法 directcheckin_type
Ý nghĩa: Phương thức vào ở (ví dụ trực tiếp, remote, v.v. tùy enum).
Nghiệp vụ:
nếu chọn option “3” thì directcheckin_flag tự bật
phản ánh cách giao nhận chìa khóa/check-in
ダイレクトチェックイン設定 directcheckin_flag
Ý nghĩa: Bật/tắt chế độ direct check-in.
Nghiệp vụ:
liên kết 2 chiều với directcheckin_type
bật sẽ phát sinh thêm trường vận hành liên quan keybox, liên hệ, giờ checkin...
広告媒体 advertising_type
Ý nghĩa: Nguồn lead/nguồn quảng cáo khách đến từ đâu.
Nghiệp vụ: phục vụ tracking marketing và báo cáo hiệu quả kênh.

鍵 (rental_keys)
Ý nghĩa: số chìa khóa cấp cho khách.
Trong UI đang để disabled (không cho sửa trực tiếp trong ngữ cảnh này).

入居予定時間 period_from_time
Ý nghĩa: giờ dự kiến check-in trong ngày bắt đầu.
Nghiệp vụ:

bắt buộc
dùng để ghép thành period_from datetime khi gửi payload API
お支払い期限 payment_due_date
Ý nghĩa: hạn thanh toán của booking.
Nghiệp vụ: dùng cho kiểm soát công nợ/nhắc thanh toán.

予約メモ note
Ý nghĩa: ghi chú reservation tổng quát (vận hành, lưu ý khách...).
Nghiệp vụ: thông tin mềm cho đội vận hành.

滞納メモ overdue_debt_note
Ý nghĩa: ghi chú riêng về công nợ trễ hạn.
Nghiệp vụ: phục vụ thu hồi công nợ và kiểm soát rủi ro khách.

この予約以降、後続の予約を許可しない disable_reservation
Ý nghĩa: khóa không cho đặt tiếp sau reservation này (trên cùng phòng/chuỗi liên quan).
Nghiệp vụ: dùng khi muốn chặn booking kế tiếp vì lý do vận hành đặc biệt.

Box keybox_name và 暗証番号 keybox_password
Ý nghĩa: chọn hộp chìa khóa và mã mở.
Nghiệp vụ:

nếu chọn “メールボックス” thì password có thể lấy theo mailbox của room và bị disable
còn lại có thể nhập/chỉnh tay
予約担当 di_contact_staff_id
Ý nghĩa: nhân sự phụ trách reservation/check-in liên lạc.
Nghiệp vụ: dùng cho phân công và truy vết trách nhiệm.

連絡済み contacted_flag và 日時 checkin_date
Ý nghĩa:

contacted_flag: đã liên hệ khách chưa
checkin_date: thời điểm liên hệ/nhận check-in (theo luồng màn này)
Nghiệp vụ: tracking trạng thái chăm sóc trước nhận phòng.
Box使用期間 box_usage_period_type, box_usage_start_date, box_usage_end_date
Ý nghĩa: kiểu thời gian dùng Box và khoảng ngày áp dụng.
Nghiệp vụ:
phục vụ kiểm soát cấp phát box/chìa theo thời gian
có validate end_date phải sau hoặc bằng start_date
Các field hay gây nhầm lẫn nhất và cách nhớ nhanh:

前× / 後×: buffer vận hành trước-sau kỳ ở, không phải ngày ở của khách.
利用区分: loại lưu trú để tính giá, không phải trạng thái booking.
確定: trạng thái chốt booking, không phải trạng thái thanh toán.
directcheckin_type vs directcheckin_flag: một cái là “loại”, một cái là “bật/tắt chế độ”.
period_from_time: giờ check-in dự kiến, ghép vào ngày bắt đầu khi submit.
- **`usage_statuses`**: Trạng thái sử dụng phòng thực tế (mapping reserve → room). Là bảng then chốt để **check trùng lịch (overlap)**.
- **`reserve_previews`**: View tổng hợp cho danh sách đặt phòng (join reserve + client + room + facility).

**Bảng phụ thuộc (tạo trong cùng Transaction khi đặt phòng):**
- `request_details`: Chi tiết khoản phải thu (Request/Hóa đơn).
- `sale_details`: Chi tiết khoản đã thu (Sale/Thanh toán).
- `reserve_occupiers`: Bảng trung gian mapping người ở thực tế ↔ đặt phòng (many-to-many).
- `parking_reserves`: Đặt chỗ bãi xe ô tô.
- `bicycle_parking_reserves`: Đặt chỗ xe đạp.
- `trunkroom_reserves`: Đặt tủ/kho giữ đồ.
- `cleaning_details`: Lịch dọn dẹp (tạo tự động).

### 3.2 Enum & Hằng số

#### 3.2.1 DeleteStatus (Trạng thái xóa đặt phòng)

| Giá trị | Tên | Ý nghĩa |
|---------|-----|---------|
| NULL | — | Đặt phòng bình thường (chưa xóa/hủy) |
| 1 | DELETE | Đã xóa |
| 2 | CANCEL | Đã hủy |
| 3 | NO_SHOW | Khách không đến |

#### 3.2.2 StayType (Loại hình lưu trú — tự tính từ khoảng thời gian)

| ID | Ý nghĩa | Khoảng thời gian |
|----|---------|------------------|
| 1 | 1–6 đêm | 0–6 ngày |
| 2 | 7 đêm ~ dưới 1 tháng | 7–29 ngày (không tròn tháng) |
| 3 | Thanh toán theo tuần | — |
| 4 | Từ 1 tháng trở lên | ≥ 27 ngày, hoặc ngày 1→cuối tháng |
| 5 | 1–3 tháng | 1 < tháng < 3 |
| 6 | 3–7 tháng | 3 ≤ tháng < 7 |
| 7 | Trên 7 tháng | ≥ 7 tháng |

#### 3.2.3 ReserveType (Loại đặt phòng)

| Giá trị | Ý nghĩa |
|---------|---------|
| 0 | Nội địa (Domestic) |
| 1 | Tiếng Anh / Quốc tế |

#### 3.2.4 DirectCheckinType (Kiểu check-in)

| ID | Ý nghĩa |
|----|---------|
| 1 | Đến trực tiếp (来店) |
| 2 | Tòa nhà 6 |
| 3 | D/I (Direct check-in tự phục vụ) |
| 4 | YCAT |
| 5 | Giao chìa khóa tại phòng |

#### 3.2.5 KeyReturnContractType (Cách trả khóa)

| ID | Ý nghĩa |
|----|---------|
| 1 | BRING — Mang đến trả trực tiếp |
| 2 | TEL — Liên hệ qua điện thoại |
| 3 | EARLY_EXIT — Đã trả sớm |
| 4 | NOT_YET — Chưa trả |
| 5 | CHECK_OUT — Check-out hoàn tất |

#### 3.2.6 AdvertisingType (Kênh quảng cáo / Nguồn khách)

| ID | Ý nghĩa |
|----|---------|
| 1 | Khách cũ quay lại (Repeat) |
| 2 | Walk-in |
| 3 | Website (HP) |
| 4 | Rakuten |
| 5 | Khác |

#### 3.2.7 Cờ (Flags) quan trọng trên Reserve

| Flag | Ý nghĩa |
|------|---------|
| `draft_flag` | Bản nháp (0 = chính thức) |
| `rakuten_flag` | Đặt từ Rakuten |
| `memo_flag` | Ghi chú/memo |
| `confirm_flag` | 0 = Chưa xác nhận (tạm), 1 = Đã xác nhận |
| `directcheckin_flag` | Direct check-in (tự phục vụ) |
| `pet_flag` | Có mang thú cưng |
| `futon_flag` | Cần nệm/futon thêm |
| `deliverybox_flag` | Sử dụng hộp nhận hàng |
| `campaign_price_flag` | Áp dụng giá khuyến mãi |
| `auto_extend_flag` | Tự động gia hạn |
| `checkin_flag` | Đã check-in |
| `disable_reservation` | Vô hiệu hóa (không cho đặt tiếp) |
| `pre_delivery_key_flag` | Giao chìa khóa trước |
| `original_flag` | Đánh dấu reserve gốc (trong chuỗi child reserves) |

### 3.3 Lifecycle đặt phòng

```
Draft → Confirmed → Checked-In → Checked-Out
                  ↘ Cancelled / Deleted / No-Show
```

### 3.4 Scope lọc mặc định (`isAvailable`)

```
data_status = 1 (AVAILABLE)
AND draft_flag = 0
AND rakuten_flag = 0
AND memo_flag = 0
```

### 3.5 Tạo Đặt Phòng (Create Reserve)

#### 3.5.1 Luồng tổng quan

```
[Validate Request]
→ [Check Room Overlap]
→ [BEGIN TRANSACTION]
  → Tạo/Cập nhật Client (nếu khách mới)
  → Tạo Reserve (reserves)
  → Tạo Usage Status (usage_statuses)
  → Tạo Bicycle Parking Reserve (nếu có)
  → Tạo Trunkroom Reserve + Request Detail tương ứng (nếu có)
  → Tạo Parking Reserve (nếu có)
  → Tạo/Cập nhật KeyBox (nếu Direct Check-in)
  → Tạo Substitute Reserve (nếu có phòng thay thế)
  → Tạo Request Details — khoản phải thu (Normal)
  → Tạo Sale Details — khoản đã thu (nếu có, match qua trường index)
  → Tạo Request Advance + Sale Detail (phí đăng ký, nếu có)
  → Tạo Occupiers + reserve_occupiers
  → Tạo Cleaning Details (tự động nếu period_to = hôm nay)
→ [COMMIT TRANSACTION]
→ Cập nhật last_used_service_ids trên Client (pet → id=4, deliverybox → id=5)
```

#### 3.5.2 Check trùng lịch phòng (Room Overlap)

1. Tìm reserve gần nhất có cùng `room_id`, `period_to <= period_from` mới.
2. Nếu reserve đó **chưa xác nhận** (`confirm_flag = FALSE`) VÀ **chưa trả key** (`key_return_datetime IS NULL`) → **REJECT** ("Lịch trùng với đặt phòng khác").
3. Kiểm tra trực tiếp overlap khoảng thời gian trên tất cả reserve hoạt động cùng phòng.

**Trunkroom overlap:** Kiểm tra riêng theo từng loại (BOX, Small, Medium, Large). Reject nếu cùng `trunkroom_id` có khoảng thời gian trùng.

#### 3.5.3 Tạo Client inline (Khách mới)

- Nếu `client_id` trống VÀ có object `client` trong request → Tạo Client mới ngay trong Transaction.
- Tạo kèm `identifications` (giấy tờ tùy thân) + upload ảnh lên storage/S3.
- Hash `login_password`, set `use_count = 1`.

#### 3.5.4 Tính toán tự động

**`calculRentalTime(periodFrom, periodTo)` → `period_type`:**

| Số ngày | Kết quả |
|---------|---------|
| 1–7 ngày | `'A'` |
| 8–29 ngày | `'B'` |
| ≥ 30 ngày | `'C'` |
| Không xác định | `''` |

**`calculStayType(periodFrom, periodTo)` → `stay_type_id`:**
- 0–6 ngày → 1
- 7 ngày ~ dưới 1 tháng (không tròn tháng) → 2
- ~1 tháng (ngày 1→cuối tháng hoặc ≥27 ngày && ≤31 ngày hoặc monthDiff ≥ 1) → 4
- 1–3 tháng → 5
- 3–7 tháng → 6
- ≥ 7 tháng → 7

> **Note:** Logic xét "1 tháng" phức tạp — check nhiều điều kiện (ngày đầu/cuối tháng, `dayDiff >= 27`, `monthDiff >= 1`).

#### 3.5.5 Tạo Usage Status

```
usage_statuses = {
  reserve_id, area_id, facility_id, room_id,
  reserve_status: 1, substitute_flag: 1, extension_flag: 1,
  period_from, period_to
}
```
Bảng trung tâm track **phòng nào → reserve nào → khoảng thời gian nào**.

#### 3.5.6 Tạo Parking / Bicycle / Trunkroom Reserve

- **Parking Reserve**: tra bảng `parking_rents` để lấy `booking_unit_price` dựa trên `stay_type_id` + `parking_id`. Lưu thêm `car_type`, `license_plate`.
- **Trunkroom Reserve**: Sau khi tạo, tự động tạo `request_detail` tương ứng với loại kho (RequestType 47/56/57/58) và link `trunkroom_reserve_id`.
- **Bicycle Parking Reserve**: Đơn giản, không tự sinh request_detail.

#### 3.5.7 Substitute Room (Phòng thay thế)

Khi khách cần chuyển phòng tạm thời (sửa chữa, sự cố kỹ thuật...):
1. Tạo Reserve mới với `substitute_reserve_id = reserve_gốc.reserve_id`.
2. Tạo `usage_status` mới cho phòng thay thế.
3. Tự tính `stay_type_id` từ khoảng thời gian phòng thay thế.
4. Phải check overlap riêng cho phòng thay thế.

#### 3.5.8 Tạo Cleaning Detail tự động

- Nếu `period_to` = **hôm nay** → tự tạo 2 `cleaning_detail`:
  - `data_type = ROOM_CLEANING (1)`: Dọn phòng.
  - `data_type = KEY_COLLECTION (3)`: Thu key.
- Gắn vào `clean_id = YYYYMMDD` (format ngày).

#### 3.5.9 Cập nhật Client khi tạo Reserve

- `use_count += 1`.
- Nếu `pet_flag = 1` → thêm `{id: 4}` vào `last_used_service_ids`.
- Nếu `deliverybox_flag = 1` → thêm `{id: 5}`.
- Cập nhật `postpaid_flag` và `memo` từ form.

### 3.6 Cập Nhật Đặt Phòng (Update Reserve)

#### 3.6.1 Luồng tổng quan

```
[Load Reserve + UsageStatus + Occupier]
→ [Validate]
→ [BEGIN TRANSACTION]
  → fill() các trường từ request
  → Validate: phải check-in trước khi check-out
  → Validate: không thể hủy check-out nếu reserve mới đã check-in
  → Tính lại period_type
  → Cập nhật KeyBox
  → Cập nhật Usage Status (area, facility, room, period)
  → Xử lý Substitute Room (tạo mới hoặc update existing)
  → Sync Request Normal (xóa bỏ cũ, cập nhật, tạo mới)
  → Sync Request Advance
  → Sync Trunkroom Reserve nếu liên quan
  → Sync Occupiers
→ [COMMIT TRANSACTION]
```

#### 3.6.2 Validation đặc biệt

1. **Check-out trước Check-in**: Nếu set `key_return_contact_type` mà `checkin_flag = FALSE` → throw "Phòng chưa check-in".
2. **Hủy check-out khi reserve mới đã check-in**: Nếu bỏ `return_keys` hoặc `checkout_receptionist_id`, mà reserve tiếp theo trên cùng phòng đã check-in → throw "Phòng đã có người check-in mới".

#### 3.6.3 Sync Request Details

- Lấy danh sách `request_detail_id` từ request.
- **Xóa**: Request Detail nào của reserve này mà KHÔNG có trong danh sách → soft delete.
- **Cập nhật**: Nếu có `request_detail_id` → update fields.
- **Tạo mới**: Nếu không có `request_detail_id` → insert new.
- **Trunkroom**: nếu request type là 47/56/57/58 → phải check overlap trunkroom và sync trunkroom_reserve tương ứng.

### 3.7 Trả Key / Check-out (Key Return)

#### 3.7.1 Luồng

```
[Load Reserve]
→ [Validate checkin_flag = TRUE]
→ [Validate: không thể hủy check-out nếu reserve mới đã check-in cùng phòng]
→ [BEGIN TRANSACTION]
  → fill: key_return_contact_type, checkout_receptionist_id, return_keys
  → Nếu return_keys > rental_keys VÀ có checkout_receptionist_id:
    → Set key_return_datetime = today
    → Set early_exit_datetime = today
  → Tạo/Cập nhật Cleaning Detail cho ngày check-out
  → Xóa cleaning_detail ngày mai (nếu checkout sớm hơn dự kiến)
→ [COMMIT TRANSACTION]
```

#### 3.7.2 Xác định đã Check-out hoàn tất

```
return_keys IS NOT NULL
AND return_keys >= rental_keys
AND checkout_receptionist_id IS NOT NULL
AND key_return_datetime IS NOT NULL
AND delete_status IS NULL
```

### 3.8 Xóa Đặt Phòng (Delete Reserve)

**Cascade Delete** (qua Model `boot()`): khi soft-delete 1 reserve, tự động xóa kèm:
1. Tất cả `requestDetails`, `saleDetails`
2. `parkingReserves`, `bicycleParkingReserves`, `trunkRoomsReserve`
3. `usageStatus`, `cleaningDetails`
4. **Giảm `use_count` trên Client**

**Cascade Update Status**: Khi `data_status` thay đổi → lan truyền tới tất cả reserve con, sale_details, parking_reserves, bicycle_parking_reserves, usage_statuses, cleaning_details.

### 3.9 Draft Reserve (Đặt phòng nháp)

- `draft_flag = 1`, `eternity_draft = 0`, có `expired_date` để tự hết hạn.
- Draft KHÔNG hiện trong danh sách chính (scope `isAvailable` lọc bỏ).
- Khi đặt phòng chính thức: update `draft_flag = FALSE`, bỏ `expired_date`.
- API riêng: `reservation-draft`, `check-reservation-draft`.

### 3.10 Child Reserve / Split Reserve

- Reserve có thể có `parent_reserve_id` → Child reserve (self-referencing `hasMany`).
- Dùng khi chia nhỏ 1 đặt phòng dài thành nhiều giai đoạn.
- `original_flag` đánh dấu reserve gốc, `original_period_from/to` giữ mốc ban đầu.
- Kiểm tra xem reserve mới cùng phòng đã check-in chưa (`checkCheckInNewReserve`) — nếu rồi thì không cho hủy check-out reserve cũ.

### 3.11 Exit Management (Quản lý trả phòng)

- Lọc reserve có `period_to` hoặc `last_stay_date` = ngày hiện tại.
- Tính thêm: `rental_time` (số ngày thuê), `new_reserves_date` (ngày đặt phòng kế tiếp trên cùng phòng), `request_deposit_flag` (có khoản deposit request_type 10/11 không), `sale_deposit_flag` (deposit đã thanh toán đủ chưa).
- **Dashboard filter**: Nếu `dashboard_flag = TRUE` → chỉ hiện reserve mà nhân viên đang đăng nhập là người dọn dẹp (`main_staff_id`, `check_staff_id`) hoặc người thu key (`checkout_receptionist_id`).

### 3.12 Ràng buộc nghiệp vụ tổng hợp

1. **Không được check-out trước khi check-in** (`checkin_flag` phải = 1).
2. **Không được hủy check-out nếu reserve tiếp theo đã check-in** (trên cùng phòng).
3. **Khoảng thời gian không được trùng** với reserve khác trên cùng phòng.
4. **`Client.use_count`** tăng +1 khi tạo reserve, giảm -1 khi xóa.
5. **Cleaning Detail** tự động tạo khi `period_to` = hôm nay.
6. **Trunkroom** phải check overlap riêng theo từng loại (BOX, S, M, L).
7. **Request Advance** (phí đăng ký) luôn tạo Sale Detail cùng lúc (vì đã thu tiền).
8. **`period_type`** và **`stay_type_id`** được tính tự động từ khoảng thời gian lưu trú.

### 3.13 Sơ đồ quan hệ dữ liệu

```
                    ┌──────────┐
                    │  staffs  │
                    └────┬─────┘
                         │ charge_staff_id / created/updated_staff_id
  ┌──────────┐     ┌─────▼─────┐      ┌────────────────┐
  │ clients  │◄────┤  reserves │─────►│ usage_statuses │
  └──────────┘     └──┬────┬───┘      └───────┬────────┘
       │               │    │                  │
       │               │    │           ┌──────▼───────┐
       │               │    │           │    rooms     │
       │               │    │           └──────────────┘
       │         ┌─────▼────▼──────┐
       │         │reserve_occupiers│    ┌──────────────┐
       │         └─────────────────┘    │ facilities   │
       │                                └──────────────┘
       │   ┌────────────────┐    ┌───────────────┐
       │   │request_details │───►│ sale_details  │
       │   └────────────────┘    └───────────────┘
       │
       │   ┌───────────────────┐  ┌─────────────────────┐
       ├──►│ parking_reserves  │  │ trunkroom_reserves  │
       │   └───────────────────┘  └─────────────────────┘
       │   ┌────────────────────────────┐
       └──►│ bicycle_parking_reserves   │
           └────────────────────────────┘
```

### 3.14 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/reservation` | Danh sách đặt phòng |
| GET | `/reservation/{id}` | Chi tiết đặt phòng |
| POST | `/reservation` | Tạo đặt phòng |
| PUT | `/reservation/{id}` | Cập nhật đặt phòng |
| DELETE | `/reservation/{id}` | Xóa đặt phòng |
| POST | `/reservation-draft` | Tạo bản nháp |
| PUT | `/key-return/{id}` | Trả key / Check-out |
| GET | `/exit_management` | Danh sách quản lý trả phòng |
| PUT | `/reservation/{id}/substitute-room` | Cập nhật phòng thay thế |
| PUT | `/reservation/{id}/early_exit` | Trả phòng sớm |

---

## 4. Quản lý Thanh toán (Payment)

### 4.1 Cấu trúc Request / Sale

Hệ thống sử dụng mô hình **2 bảng song song**:
- **Request Detail** (`request_details`): Khoản **phải thu** — hệ thống tự tạo dựa trên cấu hình giá.
- **Sale Detail** (`sale_details`): Khoản **đã thu** — nhân viên tạo khi khách thanh toán, link qua `request_detail_id`.

Mỗi request detail có thể có 0 hoặc nhiều sale details (thu nhiều lần, thu một phần).

### 4.2 Loại khoản thu (RequestType) — 58+ loại

**Nhóm chính:**

| Nhóm | Các loại | ID |
|------|----------|-----|
| **Tiền thuê phòng** | Thuê thường (1), Thuê KM (2), Thuê một phần (3), Tiền còn lại (4), Hoàn thuê (5), Thuê gộp (13) | 1–5, 13 |
| **Phí tiện ích** | Điện nước thực tế (6), Điện nước monthly (8), Quản lý monthly (7), Dọn dẹp monthly (9) | 6–9 |
| **Đặt cọc** | Đặt cọc (10), Hoàn cọc (11) | 10, 11 |
| **Bãi xe** | Phí đỗ xe (16), Xe đạp (17), Đỗ xe theo tòa nhà (40, 49–55) | 16, 17, 40, 49–55 |
| **Kho giữ đồ** | Trunkroom BOX (47), Small (56), Medium (57), Large (58) | 47, 56–58 |
| **Phí phát sinh** | Hủy (22), Đổi phòng (23), Gia hạn (24), Vi phạm (25), Sửa chữa (33) | 22–25, 33 |
| **Phí đăng ký** | Phí đăng ký (998), Hoàn phí đăng ký (999) | 998, 999 |

### 4.3 Phương thức thanh toán (PaymentTypeId)

| ID | Phương thức |
|----|-------------|
| 1 | Tiền mặt |
| 2 | JCB Credit |
| 3 | UC Credit |
| 4 | PayPay |
| 5 | JCB Net Transfer |
| 6 | UC Net Transfer |
| 7 | LINE Pay |
| 8–11 | Chuyển khoản ngân hàng (Yokohama, Sumitomo, Mitsubishi UFJ) |
| 12 | Rakuten Online |
| 13 | Now Room |

### 4.4 Request Advance vs Request Normal

| Loại | `advance_flag` | Mô tả | Tạo Sale cùng lúc? |
|------|---------------|-------|---------------------|
| **Normal** | 0 | Khoản thu thông thường (thuê phòng, phí dịch vụ...) | Không bắt buộc |
| **Advance** | 1 | Phí đăng ký (Application Fee) — thu trước | **CÓ** — luôn tạo Sale Detail cùng lúc |

### 4.5 Matching Request ↔ Sale

- Khi tạo reserve, mỗi `request_normal` item có trường `index`.
- `sale_detail` items cũng có `index` tương ứng.
- Hệ thống match qua `index` để link `sale_detail.request_detail_id = request_detail.request_detail_id`.

---

## Changelog

| Ngày | Nội dung cập nhật |
|------|-------------------|
| 2026-03-26 | Khởi tạo tài liệu, thêm business logic Client (data_type, UG flag, postpaid_flag, etc.) |
| 2026-03-29 | Thêm business logic Room Area Master (部屋面積マスタ) — quản lý diện tích phòng theo cơ sở |
| 2026-03-29 | Bổ sung tài liệu phân loại Room Type và màn hình Cài đặt phòng vật lý (Rooms Setting) |
| 2026-03-29 | Thêm business logic Cấu hình giá (Rents Master) phân theo Gói lưu trú và Đặt cọc |
| 2026-03-30 | Thêm business logic Đặt phòng (Reservation) — create/update/delete/check-out/draft/split/substitute/exit |
| 2026-03-30 | Thêm business logic Thanh toán (Payment) — request types, payment methods, advance vs normal |

---

## Tham khảo

- **SQL Schema**: `docs/hotel_management_sql_create.sql`
- **Legacy Source**: PHP/Laravel codebase (đã migrate)
- **Frontend Constants**: `hotel-management-fe/src/constants/common.ts`
