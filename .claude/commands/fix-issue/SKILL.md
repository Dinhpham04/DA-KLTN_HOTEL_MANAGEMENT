---
name: fix-issue
description: Skill dùng để tìm nguyên nhân gốc rễ (root cause) và sửa lỗi khi tính năng chạy không đúng logic, bị crash, hoặc output không như user mong muốn.
---

# Fix Issue (Troubleshooting & Refinement)

Chẩn đoán và khắc phục lỗi khi code (Backend hoặc Frontend) hoạt động không đúng logic yêu cầu, sinh ra bug, hoặc output trả về sai lệch chuẩn.

## Intent (Mục tiêu)

- **Goal**: Tìm chính xác **nguyên nhân gốc rễ (root cause)** của lỗi và đưa ra giải pháp khắc phục triệt để, không dùng mẹo "workaround" (chữa cháy).
- **Boundaries**: Áp dụng cho cả Frontend và Backend.
- **When to use**: Khi User phản hồi rằng tính năng vừa làm chạy sai, API báo lỗi 500/400, UI không hiển thị đúng data, hoặc logic nghiệp vụ tính toán sai.

## Knowledge (Kiến thức)

### Context Lỗi Phổ Biến (Common Pitfalls)
1. **Frontend (React/TanStack)**:
   - Sai tên field khi mapping data từ BE trả về (ví dụ, BE trả `facilityId` nhưng FE lại dùng `facility_id`).
   - TanStack Query cache chưa được invalidate sau khi mutation (`useQueryClient().invalidateQueries(...)`).
   - Lỗi validation Zod bắt sai định dạng form (thường là type mismatch giữa string và number).
   - Render vòng lặp vô tận (Infinite loop do `useEffect` dependencies).

2. **Backend (NestJS/Prisma)**:
   - Prisma "Record to update not found" (cố update một record không tồn tại hoặc đã bị soft delete).
   - Quên `include` relationship trong Prisma query dẫn đến trả về `undefined` cho các object lồng nhau.
   - Silent Error trong `try/catch` bỏ qua lỗi mà không ném ra Exception.
   - Xử lý bất đồng bộ (Promise) sai cách trong vòng lặp `for` (ví dụ: dùng `forEach` với `await`).

## Execution (Các bước gỡ lỗi)

Tuyệt đối AI **KHÔNG ĐƯỢC ĐOÁN MÒ** (hallucinate). Thực hiện chuẩn xác 4 bước sau:

### Step 1: Gather Context (Thu thập dấu vết)
- Xin User cung cấp **Console Error Line** hoặc **Network Tab Response** (nếu là lỗi FE).
- Xin User cung cấp **Backend Terminal Log / Error Message** (nếu là lỗi BE).
- Nếu không có log, yêu cầu User mô tả: *"Hành vi bạn mong muốn là gì vs. Hành vi thực tế đang xảy ra là gì?"*

### Step 2: Trace Data Flow (Dò ngược luồng dữ liệu)
Truy vết ngược từ nơi phát ra lỗi để tìm nguồn gốc.
*(Ví dụ: UI không hiện tên Staff -> Kiểm tra Hook `useGetStaff` -> Kiểm tra DTO của FE -> Kiểm tra Controller BE -> Kiểm tra Prisma Query BE).* Đọc các file liên quan trên đường dẫn này.

### Step 3: Root Cause Analysis (Xác định "Bệnh")
- Phải chỉ ra cho User thấy đúng điểm nghẽn. Ví dụ: *"Nguyên nhân do biến A đang là chuỗi '1' thay vì số 1, khiến Prisma query bị lỗi type mismatch."*

### Step 4: Implement Fix (Tiến hành mổ/Sửa lỗi)
- Viết lại/Sửa phần code bị lỗi. Đảm bảo tuân thủ đúng chuẩn clean code.
- **Quan trọng**: Nếu sửa thay đổi cấu trúc API từ Backend (đổi tên biến, thêm field), bắt buộc phải sang Frontend để update file `types/` và file UI tương ứng để đồng bộ. Tránh tình trạng BE chạy được mà FE lại gãy.

## Verification (Kiểm tra chéo)

- [ ] Lỗi cũ đã được giải quyết chưa?
- [ ] Fix này có gây ảnh hưởng phụ (Side effect) làm hỏng tính năng khác không?
- [ ] Chạy `pnpm build` (ở FE/BE) để đảm bảo code không có lỗi Typecript ẩn.
- [ ] Đã dọn dẹp các lệnh `console.log()` dùng để debug ra khỏi code chưa?

## Edge Cases (Trường hợp ngoại lệ)

- **Do data rác ở Database**: Đôi khi code hoàn toàn đúng nhưng DB dính data rác (cũ) vi phạm foreign key. => Fix bằng việc xóa data rác hoặc thêm check null.
- **Lỗi từ thư viện**: Gặp lỗi không rõ nguyên nhân từ nội bộ thư viện (ví dụ TanStack Router vỡ URL), ưu tiên check lại Docs thư viện hoặc dùng `search_web`.
