# Whiteboard Reservation Cell — Logic Nghiệp vụ & Bảng Màu

Tài liệu mô tả logic màu sắc và trạng thái của các cell reservation trên Whiteboard
(`/whiteboard`) — đối chiếu giữa source legacy (`aic-yokohama-weekly-mansion-FE`) và
implementation hiện tại trong `hotel-management-fe` + `hotel-management-be`.

**Nguồn code chính**:
- Frontend: [WhiteboardIndicator.tsx](../hotel-management-fe/src/components/whiteboard/WhiteboardIndicator.tsx) — hàm `ReserveTimelineCells` (~L335)
- Backend: [whiteboard.service.ts](../hotel-management-be/src/modules/whiteboard/whiteboard.service.ts)
- Legacy: [RoomItemChanges.tsx:3245-3263](../aic-yokohama-weekly-mansion-FE/src/components/common/UsageStatus/RoomItemChanges.tsx)

---

## 1. Tổng quan

Whiteboard render mỗi phòng thành một timeline ngang. Trên timeline có 4 loại cell:

| Loại cell | Màu/Style | Ý nghĩa |
|-----------|-----------|---------|
| **Reservation cell** | 5 màu theo trạng thái (xem mục 2) | Một reservation đã được tạo |
| **Booking opportunity cell** | Nền trắng, chữ đỏ "Đặt phòng:〇" | Khoảng trống gợi ý có thể đặt mới |
| **Padding cell** | Sọc chéo xám `#D1D5DB`/`#E5E7EB` | Vùng đệm trước/sau (`noreserveCountBefore/After`) |
| **Empty cell** | Nền trắng, label "Phòng trống" | Phòng chưa có reservation nào |

---

## 2. 5 Trạng thái màu Reservation Cell (chính)

Đây là 5 trạng thái duy nhất một reservation cell có thể có. Điều kiện áp dụng theo
thứ tự ưu tiên — class khai báo sau override class trước (tương đương `!important`
trong legacy).

| # | Trạng thái | Màu nền | Hex | Điều kiện | Ý nghĩa nghiệp vụ |
|---|------------|---------|-----|-----------|-------------------|
| 1 | **Confirmed** | Vàng | `#FCFF61` | `hasExplicitEnd && confirmFlag && !isDraft` | Đã xác nhận, có ngày trả phòng cụ thể |
| 2 | **Tentative / Open-ended** | Xanh lá | `#8BD08E` | `(!hasExplicitEnd \|\| !confirmFlag) && !isDraft` | Tạm/chưa xác nhận, có thể gia hạn |
| 3 | **Walk-in unconfirmed** | Đỏ | `#F86F6F` | đk #2 + `clientDataType === 3` | Khách walk-in/vãng lai chưa xác nhận (cần ưu tiên xử lý) |
| 4 | **Advertising channel** | Xanh ngọc | `#4ADEDE` | `(clientAdvertisingType === 1 \|\| advertisingType === 5) && !isDraft` | Đặt qua kênh quảng cáo (Rakuten / OTA) |
| 5 | **Draft** | Đen + chữ trắng | `#000000` | `draftFlag === true` | Bản nháp/giữ chỗ chưa lưu chính thức |

**Định nghĩa biến**:
- `hasExplicitEnd = Boolean(reserve.earlyExitDatetime || reserve.periodTo)`
- `isDraft = reserve.draftFlag`

**Thứ tự ưu tiên** (cao → thấp): **Draft > Advertising > Red > Green > Yellow**.
Khi nhiều điều kiện cùng đúng (vd. draft + advertising), Draft thắng vì khai báo
sau cùng.

---

## 3. End-date Label Highlight

Nhãn ngày trả phòng (góc phải reservation cell) có thêm style phụ thuộc trạng thái:

| Style | Điều kiện |
|-------|-----------|
| `bg-[#FCFF61]` (nền vàng) | `hasExplicitEnd && confirmFlag && !isDraft` |
| `text-red font-bold` | `confirmFlag && !isDraft` |
| `font-medium` (không in đậm) | `!hasExplicitEnd` (open-ended) |

> **Lưu ý quan trọng**: nhãn end **CHỈ** được highlight vàng khi đã `confirmFlag`. Nếu
> reservation chưa xác nhận (cell xanh lá) thì dù có `periodTo` đi nữa, label cũng
> KHÔNG nền vàng. Đây là fix gần đây để khớp legacy — trước đó label hiển thị vàng
> ngay cả khi cell xanh lá, gây hiểu nhầm "đã có end rõ ràng nhưng vẫn không cho
> đặt sau".

---

## 4. Booking Opportunity Cell (gợi ý đặt phòng)

- Render trong các khoảng trống giữa hai reservation hoặc trước reservation đầu
  tiên / sau reservation cuối cùng.
- Style: nền trắng, chữ "Đặt phòng:〇" màu đỏ.
- Click → điều hướng `/reservations/create`.
- **KHÔNG** render sau reservation open-ended: khi `!confirmFlag` hoặc thiếu
  `periodTo`, hệ thống coi reservation có thể gia hạn vô thời hạn nên không
  gợi ý đặt sau (cursor null trong [`buildTimelineCells`](../hotel-management-fe/src/components/whiteboard/WhiteboardIndicator.tsx#L537)).

---

## 5. Padding Cell (vùng đệm trước/sau reservation)

Mục đích: hiển thị trực quan khoảng cấm đặt phòng quanh một reservation, ví dụ
để chừa thời gian dọn dẹp / bàn giao.

| Trường | Ý nghĩa |
|--------|---------|
| `noreserveCountBefore` | Số ngày đệm TRƯỚC `periodFrom` |
| `noreserveCountAfter` | Số ngày đệm SAU `periodTo` |

**Hành vi**:
- Cell padding hiển thị sọc chéo xám với label `← Đệm` / `Đệm →` + range ngày + số ngày.
- Khoảng booking opportunity được tự động "tránh" vùng đệm — cursor nhảy qua sau khi
  cộng padding.
- Padding bị **bỏ qua** với reservation có `draftFlag === true` hoặc `rakutenFlag === true`
  (giữ nguyên hành vi legacy — draft/rakuten không apply padding).

---

## 6. Mapping Field (Frontend ↔ Backend ↔ Legacy)

| Frontend TS | Backend Prisma | Legacy PHP/MySQL | Ghi chú |
|-------------|----------------|------------------|---------|
| `confirmFlag` | `Reserve.confirmFlag` | `confirm_flag` | Boolean |
| `draftFlag` | `Reserve.draftFlag` | `draft_flag` | Boolean |
| `rakutenFlag` | `Reserve.rakutenFlag` | `rakuten_flag` | Boolean |
| `clientDataType` | `client.dataType` (qua join) | `client.data_type` | Int — 1=cá nhân, 2=công ty, 3=walk-in |
| `clientAdvertisingType` | `client.advertisingType` | `client.advertising_type` | Int — 1 → kênh quảng cáo cá nhân |
| `advertisingType` | `Reserve.advertisingType` | `advertising_type` (trên reserve) | Int — 5 → OTA channel |
| `earlyExitDatetime` | `Reserve.earlyExitDatetime` | `early_exit_datetime` | DateTime |
| `periodFrom` / `periodTo` | `Reserve.periodFrom/To` | `reserves_period_from/to` | DateTime |
| `noreserveCountBefore/After` | `Reserve.noreserveCountBefore/After` | `noreserve_count_before/after` | Int (ngày) |
| `directcheckinFlag` | `Reserve.directcheckinFlag` | `directcheckin_flag` | → indicator "D/I" trên cell |

---

## 7. Reserve Status Codes (numeric)

`Reserve.reserveStatus` (Int, db: `reserve_status`):

| Code | Tên | Mô tả |
|------|-----|-------|
| 1 | TENTATIVE | Đặt tạm, chưa xác nhận |
| 2 | CONFIRMED | Đã xác nhận |
| 3 | CHECKED_IN | Khách đã nhận phòng |
| 4 | CHECKED_OUT | Khách đã trả phòng |
| 5 | CANCELLED | Đã huỷ |

> **Lưu ý**: `reserveStatus` **không trực tiếp** quyết định màu cell — màu dựa trên
> `confirmFlag`, `draftFlag`, `clientDataType`, `advertisingType`. Nhưng status
> thường tương quan: `status=1` thường `confirmFlag=false` (green), `status>=2`
> thường `confirmFlag=true` (yellow).

---

## 8. Indicator nhỏ trong Reservation Cell

Góc phải trên của reservation cell có chữ chỉ báo:

| Chữ | Điều kiện | Ý nghĩa |
|-----|-----------|---------|
| `D/I` | `directcheckinFlag === true` | Direct check-in (tự nhận phòng) |
| `◯` | `confirmFlag === true` (và không phải D/I) | Đã xác nhận |
| _(trống)_ | Còn lại | Chưa xác nhận |

Ngoài ra, nếu `disableReservation === true` → có thêm cell `▶` cạnh phải để báo
"không cho phép thay đổi reservation này".

---

## 9. Service Flag Icons (cell phụ bên phải reservation)

Khi reservation có yêu cầu dịch vụ phụ, một cell nhỏ hiển thị icon `B86020` (cam
nâu):

| Flag | Icon | Điều kiện |
|------|------|-----------|
| Parking | 🚗 (CarSvg) | `parkingReserveCount > 0` |
| Bicycle | 🚴 (BicycleSvg) | `bicycleParkingReserveCount > 0` |
| Pet | 🐕 (DogSvg) | `petFlag === true` |
| Box | 🗑 (TrashSVG) | `deliveryboxFlag === true` |

---

## 10. Seed Data — Demo 5 Trạng thái

Sau khi chạy `pnpm prisma:seed` (ở `hotel-management-be/`), bộ dữ liệu seed có
phần demo dành riêng cho việc test 5 trạng thái màu cell. Mở Whiteboard, chọn
khoảng `2026-05-10 → 2026-05-14`, lọc facility 01 + 02:

| Trạng thái | Phòng | Khách | Note seed |
|------------|-------|-------|-----------|
| 🟡 Yellow (Confirmed) | fac01 / 102 | Nguyễn Văn An (`client1`) | Demo: confirmed có periodTo + padding |
| 🟢 Green (Tentative) | fac01 / 202 | Park Min Young (`client5`) | Demo: chưa confirmFlag |
| 🔴 Red (Walk-in unconfirmed) | fac02 / 101 | Khách Vãng Lai (`walkInClient`, `dataType=3`) | Demo: walk-in chưa xác nhận |
| 🔵 Cyan (Advertising) | fac01 / 401 | Trần Thị Bích (`client2`) | Demo: `advertisingType=5` |
| ⚫ Black (Draft) | fac02 / 102 | John Smith (`client4`) | Demo: `draftFlag=true` |

Một thay đổi cần lưu ý ở seed: thêm 1 client mới (`client6` / `walkInClient`)
với `dataType: 3` để có thể tạo reservation đỏ.

---

## 11. Các trạng thái phụ trợ (chưa port từ legacy)

Source legacy có thêm vài loại cell mà phiên bản hiện tại **chưa** port (không
critical, có thể thêm khi cần):

| Loại | Màu | Trigger |
|------|-----|---------|
| 内見 / Preview | `#E186FF` (hồng tím) | Cell loại preview riêng (không phải reservation) |
| Rakuten parent (chưa gán phòng) | `#bf0000` (đỏ đậm) | Reservation rakuten chưa được gán slot con |
| Rakuten child (đã gán) | `#FCFF61` + viền top `#bf0000` | Slot con của Rakuten đã ghép phòng |
| Construction plate | `#8E7CC3` (tím) | Lịch sửa chữa/bảo trì phòng |
| Cleaning main staff | `#FF9902` (cam) | Slot phụ trách dọn dẹp |
| Cleaning check staff | `#1A3CEF` (xanh dương) | Slot kiểm tra dọn dẹp |

---

## 12. Hành vi & Edge Case Cần Nhớ

1. **Reservation chưa confirm chặn booking sau** — vì hệ thống coi như có thể gia
   hạn vô thời hạn. Đây là logic chủ ý, không phải bug.
2. **Padding bị bỏ qua với draft/rakuten** — không apply `noreserveCountBefore/After`.
3. **`isOpenEnded` = `!confirmFlag || !rawEnd`** — bất kỳ reservation chưa confirm
   đều bị tính là open-ended trong [`getEffectiveReservePeriod`](../hotel-management-fe/src/components/whiteboard/WhiteboardIndicator.tsx#L590).
4. **Nhãn end vàng yêu cầu confirm** — đã fix; trước đó thiếu điều kiện này gây
   hiểu nhầm.
5. **Thứ tự override màu** dựa vào tailwind-merge: class khai báo sau thắng. Đối
   chiếu với legacy dùng `!important` cho các trạng thái override.

---

_Cập nhật cuối: 2026-04-29_
