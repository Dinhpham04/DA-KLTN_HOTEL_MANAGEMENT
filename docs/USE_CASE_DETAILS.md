# Mô tả chi tiết các Use Case trọng tâm (hotel-management)

Tài liệu này mô tả các use case chính của hệ thống **hotel-management** (giả định đã migrate hoàn toàn và tích hợp AI + n8n). Nội dung dùng để đưa trực tiếp vào Chương 2 của báo cáo.

---

## 1) Phạm vi và giả định

- Hệ thống là ứng dụng web hỗ trợ vận hành khách sạn/căn hộ cho thuê theo tuần–tháng.
- Các phân hệ trọng tâm: **Đặt phòng (Reservation)**, **Phòng (Room Master + trạng thái)**, **Khách hàng (Client)**, **Check-in/Check-out**, **Hóa đơn & Thanh toán**, **Dọn dẹp**, **Báo cáo/Dashboard**, **Whiteboard điều phối**.
- Tích hợp ngoài:
  - **AI**: OCR giấy tờ, trợ lý tra cứu/tóm tắt, gợi ý phòng.
  - **n8n**: tự động nhắc việc/nhắc thanh toán, tự động tạo task dọn dẹp sau check-out, tự động gửi báo cáo định kỳ.
  - **Smart Lock API** (nếu dùng): cấp PIN theo thời gian hiệu lực.
  - **Email/SMS**: gửi thông báo cho khách/nhân viên.
  - **Cổng thanh toán** (nếu dùng): ghi nhận/đối soát giao dịch.

---

## 2) Tác nhân (Actors)

- **Admin**: quản trị hệ thống, cấu hình dữ liệu nền, phân quyền.
- **Quản lý**: theo dõi vận hành, điều phối, xem báo cáo.
- **Nhân viên vận hành/Lễ tân**: xử lý đặt phòng, check-in/out, hóa đơn, giao tiếp khách.
- **Quản lý vệ sinh**: lập ca, phân công, giám sát dọn dẹp.
- **Nhân viên vệ sinh**: cập nhật trạng thái dọn dẹp.
- **AI Engine** (hệ thống ngoài): OCR, trợ lý, gợi ý.
- **n8n Automation** (hệ thống ngoài): workflow tự động hóa.
- **Smart Lock API**, **Cổng thanh toán**, **Email/SMS gateway**: hệ thống ngoài.

---

## Use Case 1 — Đăng nhập/Đăng xuất

### Mục tiêu
Người dùng truy cập hệ thống đúng vai trò và thực hiện được các chức năng được cấp quyền.

### Tác nhân
Admin, Quản lý, Nhân viên vận hành/Lễ tân, Quản lý vệ sinh, Nhân viên vệ sinh.

### Tiền điều kiện
- Tài khoản đã được tạo và đang hoạt động.
- Người dùng có thông tin đăng nhập hợp lệ.

### Kích hoạt
Người dùng mở trang đăng nhập và nhập thông tin.

### Luồng chính
1. Người dùng nhập email/tên đăng nhập và mật khẩu.
2. Hệ thống kiểm tra hợp lệ dữ liệu (định dạng, không rỗng).
3. Hệ thống xác thực thông tin đăng nhập.
4. Hệ thống trả về thông tin người dùng và phiên làm việc (token/phiên).
5. Hệ thống điều hướng tới trang phù hợp theo vai trò (dashboard hoặc màn hình nghiệp vụ).

### Luồng thay thế/ngoại lệ
- Sai mật khẩu/tài khoản không tồn tại → thông báo lỗi, cho nhập lại.
- Tài khoản bị khóa/không hoạt động → từ chối đăng nhập, hiển thị lý do.
- Phiên hết hạn → yêu cầu đăng nhập lại.

### Hậu điều kiện
- Đăng nhập thành công: người dùng vào hệ thống với quyền tương ứng.
- Đăng xuất: phiên làm việc kết thúc, người dùng về màn hình đăng nhập.

---

## Use Case 2 — Cấu hình dữ liệu nền (Master Data)

### Mục tiêu
Thiết lập dữ liệu nền phục vụ vận hành: cơ sở/tòa nhà, hạng phòng, loại phòng, phòng, loại lưu trú, quốc gia…

### Tác nhân
Admin (chính), Quản lý (có thể được cấp quyền xem/tra cứu).

### Tiền điều kiện
- Người dùng đã đăng nhập và có quyền quản trị dữ liệu nền.

### Luồng chính (tổng quát)
1. Admin truy cập màn hình quản lý danh mục.
2. Admin tạo mới hoặc cập nhật các danh mục:
   - Cơ sở/tòa nhà (Facility)
   - Hạng phòng (Room Class)
   - Loại phòng (Room Type)
   - Phòng (Room)
   - Loại lưu trú (Stay Type)
   - Quốc gia (Country)
3. Hệ thống kiểm tra ràng buộc dữ liệu (bắt buộc, trùng mã/tên theo quy ước).
4. Hệ thống lưu dữ liệu và ghi nhận lịch sử (ai tạo/cập nhật, thời điểm).
5. Hệ thống hiển thị danh sách đã cập nhật để đối soát.

### Luồng thay thế/ngoại lệ
- Trùng mã danh mục/thiếu trường bắt buộc → báo lỗi và không cho lưu.
- Danh mục đang được sử dụng (ví dụ Room Type đã gán cho Room) → hạn chế xóa cứng; áp dụng xóa mềm hoặc từ chối xóa theo quy tắc.

### Hậu điều kiện
- Dữ liệu nền được thiết lập đúng và sẵn sàng phục vụ các use case đặt phòng/vận hành.

---

## Use Case 3 — Quản lý khách hàng

### Mục tiêu
Tạo và quản lý hồ sơ khách hàng đầy đủ, hỗ trợ tra cứu nhanh khi đặt phòng.

### Tác nhân
Nhân viên vận hành/Lễ tân (chính), Quản lý (xem), Admin (xem/quản trị).

### Tiền điều kiện
- Người dùng đã đăng nhập.

### Luồng chính (tạo mới khách hàng)
1. Nhân viên mở màn hình tạo khách hàng.
2. Nhập thông tin cơ bản: họ tên/tên công ty, số điện thoại, email, địa chỉ, quốc gia…
3. (Tùy chọn) Tải ảnh giấy tờ.
4. Hệ thống kiểm tra hợp lệ dữ liệu (định dạng email/sđt, trường bắt buộc).
5. Hệ thống lưu hồ sơ khách hàng.
6. Hệ thống hiển thị chi tiết khách hàng vừa tạo.


### Luồng thay thế/ngoại lệ
- Trùng số điện thoại/email → cảnh báo và yêu cầu xác nhận có tạo mới hay không (để tránh trùng hồ sơ).

### Hậu điều kiện
- Hồ sơ khách hàng được tạo/cập nhật; có thể dùng để tạo đặt phòng.

---

## Use Case 4 — Tạo đặt phòng (Reservation create)

### Mục tiêu
Tạo một đặt phòng hợp lệ, không trùng lịch, gắn đúng khách hàng và phòng/cơ sở.

### Tác nhân
Nhân viên vận hành/Lễ tân (chính), Quản lý (có thể tạo), AI Engine (gợi ý), n8n (tạo workflow nhắc việc).

### Tiền điều kiện
- Người dùng đã đăng nhập.
- Dữ liệu nền đã có (facility/room/room type/stay type).
- Khách hàng đã tồn tại hoặc được tạo mới trước đó.

### Luồng chính
1. Nhân viên mở màn hình tạo đặt phòng.
2. Chọn khách hàng (hoặc tạo mới nhanh nếu cần).
3. Chọn cơ sở/tòa nhà, loại lưu trú, thời gian đến/đi.
4. Chọn phòng cụ thể (hoặc tiêu chí phòng) theo nhu cầu.
5. Hệ thống kiểm tra phòng trống và xung đột lịch.
6. Nhân viên nhập thông tin bổ sung: ghi chú, người ở cùng, cấu hình vận hành (nếu có).
7. Xác nhận tạo đặt phòng.
8. Hệ thống lưu đặt phòng và trả về mã/chi tiết đặt phòng.

### Luồng mở rộng — Gợi ý phòng bằng AI
1. Khi người dùng nhập thời gian, cơ sở và loại phòng, hệ thống gọi AI để đề xuất phòng phù hợp.
2. Hệ thống hiển thị danh sách gợi ý (ưu tiên phòng trống, phù hợp loại phòng, tối ưu vận hành).
3. Nhân viên chọn phòng từ gợi ý và tiếp tục tạo đặt phòng.

### Luồng mở rộng — Tự động hóa n8n sau khi tạo
1. Sau khi tạo đặt phòng thành công, hệ thống phát sự kiện nghiệp vụ.
2. n8n nhận sự kiện và tạo các workflow:
   - Nhắc trước check-in (gửi hướng dẫn/nhắc thanh toán nếu cần).
   - Lên lịch gửi thông tin tự check-in (nếu bật).

### Luồng thay thế/ngoại lệ
- Phòng không còn trống (xung đột lịch) → yêu cầu chọn phòng khác hoặc đổi thời gian.
- Thiếu dữ liệu bắt buộc → báo lỗi tại trường tương ứng.

### Hậu điều kiện
- Đặt phòng được tạo; có thể xem trên danh sách/whiteboard và thực hiện check-in/out.

---

## Use Case 5 — Điều chỉnh / Gia hạn / Hủy đặt phòng

### Mục tiêu
Cập nhật đặt phòng theo tình huống thực tế (đổi phòng, đổi lịch, gia hạn, hủy) nhưng vẫn đảm bảo không trùng lịch và giữ đúng lịch sử.

### Tác nhân
Nhân viên vận hành/Lễ tân (chính), Quản lý.

### Tiền điều kiện
- Đặt phòng tồn tại.
- Người dùng có quyền sửa/hủy.

### Luồng chính (điều chỉnh đặt phòng)
1. Người dùng tìm và mở chi tiết đặt phòng.
2. Chỉnh sửa các thông tin cần thiết (thời gian, phòng, người ở cùng, ghi chú…).
3. Hệ thống kiểm tra xung đột lịch nếu thay đổi phòng/thời gian.
4. Người dùng xác nhận lưu.
5. Hệ thống cập nhật đặt phòng và ghi nhận lịch sử thay đổi.

### Luồng chính (gia hạn)
1. Người dùng mở đặt phòng và chọn chức năng gia hạn.
2. Nhập thời gian mới (ngày đi mới).
3. Hệ thống kiểm tra phòng còn trống trong khoảng gia hạn.
4. Xác nhận gia hạn; hệ thống cập nhật.

### Luồng chính (hủy)
1. Người dùng chọn hủy đặt phòng.
2. Nhập lý do hủy (nếu quy định).
3. Hệ thống cập nhật trạng thái đặt phòng sang hủy và giải phóng tài nguyên.

### Luồng thay thế/ngoại lệ
- Không cho phép sửa/hủy khi đã check-out hoặc đã chốt hóa đơn theo quy định → hệ thống từ chối và hiển thị lý do.
- Xung đột lịch sau khi đổi phòng/đổi ngày → yêu cầu chọn phương án khác.

### Hậu điều kiện
- Đặt phòng được cập nhật theo thao tác; dữ liệu nhất quán với lịch phòng.

---

## Use Case 6 — Whiteboard: xem và điều phối phòng/lịch ở

### Mục tiêu
Giám sát và điều phối tình trạng phòng theo thời gian, hỗ trợ thao tác nhanh cho vận hành.

### Tác nhân
Quản lý (chính), Nhân viên vận hành/Lễ tân.

### Tiền điều kiện
- Có dữ liệu phòng và đặt phòng.

### Luồng chính
1. Người dùng mở màn hình Whiteboard.
2. Hệ thống hiển thị danh sách phòng theo facility/tầng/loại phòng và timeline ngày/tuần.
3. Người dùng lọc theo điều kiện (facility, loại phòng, trạng thái, từ khóa phòng…).
4. Người dùng mở chi tiết đặt phòng từ Whiteboard để xem nhanh.
5. (Nếu được cấp quyền) Người dùng thực hiện điều phối:
   - Đổi phòng cho đặt phòng.
   - Dời lịch ở.
6. Hệ thống kiểm tra xung đột và cập nhật dữ liệu.

### Luồng thay thế/ngoại lệ
- Không đủ quyền điều phối → chỉ cho phép xem.
- Điều phối gây trùng lịch → từ chối cập nhật và gợi ý phương án.

### Hậu điều kiện
- Whiteboard phản ánh trạng thái mới sau điều phối.

---

## Use Case 7 — Check-in (kèm Direct check-in & Smart Lock)

### Mục tiêu
Xác nhận khách nhận phòng, cập nhật trạng thái đặt phòng và trạng thái phòng; hỗ trợ self check-in.

### Tác nhân
Nhân viên vận hành/Lễ tân (chính), Khách (gián tiếp), Smart Lock API (nếu dùng), n8n (gửi hướng dẫn), AI (hỗ trợ tra cứu/tóm tắt).

### Tiền điều kiện
- Đặt phòng hợp lệ và đến ngày check-in (hoặc được phép check-in sớm theo quy định).
- Phòng sẵn sàng (không bảo trì/không đang dọn).

### Luồng chính (check-in tại quầy)
1. Nhân viên mở chi tiết đặt phòng.
2. Xác nhận thông tin khách và điều kiện check-in.
3. Thực hiện check-in, hệ thống ghi nhận thời điểm check-in.
4. Hệ thống cập nhật trạng thái phòng sang “đang ở/occupied” (hoặc trạng thái tương đương).

### Luồng mở rộng — Direct check-in (tự check-in)
1. Nhân viên bật chế độ direct check-in cho đặt phòng (nếu chưa bật).
2. Hệ thống chuẩn bị nội dung hướng dẫn check-in.
3. n8n tự động gửi hướng dẫn qua Email/SMS theo lịch (trước giờ check-in).

### Luồng mở rộng — Cấp PIN khóa cửa
1. Khi direct check-in được bật hoặc theo thao tác nhân viên, hệ thống gọi Smart Lock API để tạo PIN.
2. PIN có thời gian hiệu lực theo khoảng ở (validFrom/validTo).
3. Hệ thống lưu PIN và liên kết với đặt phòng.

### Luồng thay thế/ngoại lệ
- Phòng chưa sẵn sàng → từ chối check-in hoặc yêu cầu xử lý (đổi phòng/đợi dọn).
- Smart Lock API lỗi → ghi nhận lỗi và cho phép cấp lại sau.

### Hậu điều kiện
- Đặt phòng ở trạng thái đã check-in; phòng ở trạng thái đang sử dụng.

---

## Use Case 8 — Check-out (kèm tự động hóa tạo task dọn dẹp)

### Mục tiêu
Kết thúc lưu trú, cập nhật phòng sang trạng thái chờ dọn và kích hoạt các tác vụ sau check-out.

### Tác nhân
Nhân viên vận hành/Lễ tân (chính), Quản lý vệ sinh (phụ), n8n (tạo task), Email/SMS (thông báo nếu cần).

### Tiền điều kiện
- Đặt phòng đã check-in.

### Luồng chính
1. Nhân viên mở chi tiết đặt phòng.
2. Kiểm tra các khoản phát sinh và tình trạng thanh toán.
3. Xác nhận check-out.
4. Hệ thống ghi nhận thời điểm check-out.
5. Hệ thống cập nhật trạng thái phòng sang “chờ dọn/đang dọn” theo quy trình.

### Luồng mở rộng — n8n tạo task dọn dẹp
1. Sau check-out, hệ thống phát sự kiện nghiệp vụ.
2. n8n nhận sự kiện và tự động tạo nhiệm vụ dọn dẹp cho phòng.
3. Thông báo cho quản lý vệ sinh/nhóm dọn dẹp (Email/SMS hoặc kênh nội bộ).

### Luồng thay thế/ngoại lệ
- Chưa thể check-out do còn công nợ bắt buộc phải thanh toán theo quy định → hệ thống cảnh báo và yêu cầu xử lý trước.

### Hậu điều kiện
- Đặt phòng kết thúc; phòng chuyển sang trạng thái phục vụ dọn dẹp.

---

## Use Case 9 — Lập hóa đơn & ghi nhận thanh toán

### Mục tiêu
Tạo hóa đơn cho đặt phòng, ghi nhận thanh toán, xuất biên nhận/hóa đơn.

### Tác nhân
Nhân viên vận hành/Lễ tân (chính), Quản lý (xem/đối soát), Cổng thanh toán (nếu tích hợp), n8n (nhắc công nợ), Email/SMS (gửi biên nhận/nhắc).

### Tiền điều kiện
- Có đặt phòng hợp lệ; phát sinh doanh thu cần thu.

### Luồng chính
1. Nhân viên mở đặt phòng và chọn chức năng tạo hóa đơn.
2. Hệ thống tạo danh sách hạng mục (tiền phòng, dịch vụ, phụ phí…) theo dữ liệu đặt phòng.
3. Nhân viên kiểm tra, bổ sung hoặc điều chỉnh hạng mục theo quyền.
4. Hệ thống tính tổng tiền và lưu hóa đơn.
5. Nhân viên ghi nhận thanh toán (tiền mặt/chuyển khoản/thẻ…).
6. Hệ thống cập nhật trạng thái thanh toán và công nợ.
7. Xuất PDF biên nhận/hóa đơn.

### Luồng mở rộng — Thanh toán qua cổng thanh toán
1. Nhân viên chọn phương thức thanh toán qua cổng.
2. Hệ thống chuyển yêu cầu sang cổng thanh toán.
3. Nhận kết quả giao dịch và cập nhật trạng thái.

### Luồng mở rộng — n8n nhắc công nợ
1. Nếu hóa đơn còn công nợ, hệ thống tạo sự kiện công nợ.
2. n8n gửi nhắc thanh toán định kỳ (Email/SMS) theo cấu hình.

### Luồng thay thế/ngoại lệ
- Giao dịch thất bại/timeout → hệ thống giữ trạng thái chờ và cho phép thử lại.
- Không đủ quyền sửa hóa đơn đã chốt → từ chối và ghi log.

### Hậu điều kiện
- Hóa đơn được tạo; thanh toán được ghi nhận; có chứng từ xuất ra.

---

## Use Case 10 — Dọn dẹp: lập ca, phân công, cập nhật trạng thái

### Mục tiêu
Quản lý công việc dọn dẹp theo ca và theo trạng thái phòng để đảm bảo phòng sẵn sàng cho khách mới.

### Tác nhân
Quản lý vệ sinh (chính), Nhân viên vệ sinh (chính), Quản lý/Lễ tân (xem).

### Tiền điều kiện
- Có danh sách phòng và các sự kiện check-out.

### Luồng chính
1. Quản lý vệ sinh tạo ca dọn dẹp theo ngày.
2. Hệ thống gợi ý danh sách phòng cần dọn (từ phòng vừa check-out hoặc phòng được đánh dấu cần dọn).
3. Quản lý vệ sinh phân công phòng cho nhân viên.
4. Nhân viên vệ sinh mở danh sách công việc và cập nhật trạng thái: chưa dọn → đang dọn → đã dọn.
5. Hệ thống cập nhật trạng thái phòng khi hoàn tất (ví dụ chuyển sang “trống/sẵn sàng”).

### Luồng thay thế/ngoại lệ
- Phòng phát sinh sự cố (hỏng thiết bị) → nhân viên đánh dấu sự cố, hệ thống chuyển trạng thái phù hợp và thông báo cho vận hành.

### Hậu điều kiện
- Tình trạng dọn dẹp được cập nhật; phòng sẵn sàng đưa vào kinh doanh.

---

## Use Case 11 — Báo cáo & Dashboard (kèm tự động gửi báo cáo)

### Mục tiêu
Cung cấp tổng quan vận hành và doanh thu, hỗ trợ quản lý ra quyết định.

### Tác nhân
Quản lý (chính), Admin (xem), n8n (tự động gửi báo cáo định kỳ).

### Tiền điều kiện
- Có dữ liệu phòng/đặt phòng/hóa đơn.

### Luồng chính
1. Người dùng mở Dashboard.
2. Hệ thống hiển thị các chỉ số: tình trạng phòng, số check-in/out, công suất, công nợ, doanh thu.
3. Người dùng mở báo cáo vận hành ngày hoặc báo cáo doanh thu.
4. Chọn bộ lọc (thời gian, facility, loại phòng…) và xem kết quả.
5. Xuất báo cáo (Excel/PDF) nếu cần.

### Luồng mở rộng — n8n gửi báo cáo định kỳ
1. Theo lịch cấu hình, n8n tự động chạy workflow tổng hợp báo cáo.
2. Gửi báo cáo cho quản lý qua Email/SMS hoặc kênh nội bộ.

### Luồng thay thế/ngoại lệ
- Không đủ quyền xem báo cáo nhạy cảm → từ chối truy cập.

### Hậu điều kiện
- Quản lý nắm được tình hình vận hành và doanh thu theo kỳ.

---

## Use Case 12 — Trợ lý AI tra cứu & tóm tắt (AI Assistant)

### Mục tiêu
Giảm thời gian tìm kiếm thông tin và hỗ trợ nhân viên ra quyết định nhanh.

### Tác nhân
Quản lý, Nhân viên vận hành/Lễ tân, AI Engine.

### Tiền điều kiện
- Người dùng đã đăng nhập.
- Người dùng có quyền truy cập dữ liệu mà AI được phép trả lời.

### Luồng chính
1. Người dùng nhập câu hỏi (ví dụ: “đặt phòng X tình trạng thanh toán thế nào?”, “hôm nay có bao nhiêu check-out?”).
2. Hệ thống thu thập ngữ cảnh dữ liệu theo quyền truy cập.
3. Gửi yêu cầu tới AI để tạo câu trả lời dạng tóm tắt.
4. Hiển thị kết quả, kèm liên kết điều hướng tới màn hình liên quan (đặt phòng/khách hàng/hóa đơn) để kiểm tra.

### Luồng thay thế/ngoại lệ
- Câu hỏi vượt phạm vi dữ liệu cho phép → AI trả lời không đủ thông tin và đề nghị truy cập màn hình phù hợp.
- AI lỗi/timeout → hệ thống thông báo và cho phép thử lại.

### Hậu điều kiện
- Người dùng nhận được tóm tắt nhanh; giảm thao tác tra cứu thủ công.

---

## Gợi ý cách đưa vào báo cáo

- Bạn có thể giữ nguyên cấu trúc từng use case như trên.
- Nếu cần đúng “chuẩn mẫu” của khoa/trường (có bảng), có thể chuyển mỗi use case thành bảng gồm:
  - Tên use case
  - Tác nhân
  - Tiền điều kiện
  - Luồng chính
  - Ngoại lệ
  - Hậu điều kiện
