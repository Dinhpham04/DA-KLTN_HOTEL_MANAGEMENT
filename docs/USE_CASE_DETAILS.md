# Mô tả chi tiết các Use Case trọng tâm (hotel-management)

Tài liệu này mô tả các use case chính của hệ thống **hotel-management** (giả định đã migrate hoàn toàn và tích hợp AI + n8n). Nội dung dùng để đưa trực tiếp vào Chương 2 của báo cáo.

---

## 1) Phạm vi và giả định

- Hệ thống là ứng dụng web hỗ trợ vận hành khách sạn/căn hộ cho thuê theo tuần–tháng.
- Các phân hệ trọng tâm: **Đặt phòng (Reservation)**, **Phòng (Room Master + trạng thái)**, **Khách hàng (Client)**, **Check-in/Check-out**, **Hóa đơn & Thanh toán**, **Dọn dẹp**, **Báo cáo/Dashboard**, **Whiteboard điều phối**.
- Tích hợp ngoài:
  - **AI**: OCR giấy tờ, trợ lý tra cứu/tóm tắt, gợi ý phòng; được trình bày thành use case riêng để làm rõ cách người dùng tương tác với AI Assistant.
  - **n8n**: tự động nhắc việc/nhắc thanh toán, tự động tạo task dọn dẹp sau check-out, tự động gửi báo cáo định kỳ; được trình bày thành use case riêng để làm rõ vai trò tự động hóa phía sau nghiệp vụ.
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
Tạo một đặt phòng hợp lệ từ nhu cầu lưu trú của khách, gắn đúng hồ sơ khách hàng, cơ sở, phòng, thời gian ở và thông tin tính phí; đồng thời bảo đảm không trùng lịch phòng và sẵn sàng cho các bước check-in, thanh toán, tự động nhắc việc.

### Tác nhân
Nhân viên vận hành/Lễ tân (chính), Quản lý (có thể tạo/duyệt), Khách hàng (cung cấp thông tin), n8n Automation (nhận sự kiện sau khi đặt phòng được tạo).

### Tiền điều kiện
- Người dùng đã đăng nhập.
- Người dùng có quyền tạo đặt phòng.
- Dữ liệu nền đã có và đang hoạt động: cơ sở/tòa nhà, phòng, hạng phòng, loại phòng, loại lưu trú, bảng giá/chính sách tính phí.
- Khách hàng đã tồn tại hoặc có đủ thông tin tối thiểu để tạo nhanh hồ sơ khách hàng.
- Khoảng thời gian nhận/trả phòng nằm trong giới hạn nghiệp vụ cho phép.

### Kích hoạt
Nhân viên tiếp nhận yêu cầu đặt phòng từ khách qua điện thoại, trực tiếp, email, kênh bán hàng hoặc từ dữ liệu đã nhập trong hệ thống.

### Luồng chính
1. Nhân viên mở màn hình tạo đặt phòng.
2. Nhân viên tìm khách hàng bằng tên, số điện thoại, email hoặc mã khách hàng.
3. Nếu khách chưa có hồ sơ, nhân viên tạo nhanh hồ sơ khách hàng với các thông tin bắt buộc.
4. Nhân viên nhập nhu cầu lưu trú: cơ sở/tòa nhà, loại phòng, ngày/giờ đến, ngày/giờ đi, số khách hoặc tiêu chí phòng.
5. Hệ thống kiểm tra định dạng dữ liệu, tính hợp lệ của ngày đến/ngày đi và quyền thao tác của người dùng.
6. Hệ thống truy vấn lịch phòng để tìm các phòng còn trống trong toàn bộ khoảng thời gian lưu trú.
7. Nhân viên chọn phòng cụ thể từ danh sách phòng còn trống.
8. Hệ thống kiểm tra lại xung đột lịch tại thời điểm xác nhận để tránh trường hợp phòng vừa được đặt bởi người khác.
9. Nhân viên nhập thông tin bổ sung: người ở cùng, ghi chú vận hành, yêu cầu đặc biệt, nguồn đặt phòng, cấu hình direct check-in, đặt cọc hoặc công nợ ban đầu nếu có.
10. Hệ thống tính hoặc gợi ý các khoản tiền dự kiến: tiền phòng, phụ phí, đặt cọc, thuế/phí.
11. Nhân viên kiểm tra thông tin tổng hợp và xác nhận tạo đặt phòng.
12. Hệ thống lưu đặt phòng, sinh mã đặt phòng, cập nhật lịch phòng.
13. Hệ thống phát sự kiện `reservation.created` để các thành phần tự động hóa xử lý nhắc việc, hướng dẫn check-in hoặc nhắc thanh toán.
14. Hệ thống hiển thị chi tiết đặt phòng vừa tạo và cho phép chuyển nhanh sang in/xuất xác nhận, tạo hóa đơn tạm tính hoặc mở trên Whiteboard.


### Luồng mở rộng — Tự động hóa sau khi tạo
1. Sau khi đặt phòng được lưu thành công, hệ thống phát sự kiện nghiệp vụ.
2. n8n nhận sự kiện và xử lý các workflow hậu trường:
   - Nhắc trước check-in.
   - Gửi hướng dẫn direct check-in nếu đặt phòng bật chế độ tự check-in.
   - Nhắc thanh toán nếu còn đặt cọc/công nợ.
   - Thông báo nội bộ cho nhân viên phụ trách nếu đặt phòng có ghi chú đặc biệt.
   - Tạo nhiệm vụ dọn dẹp nếu tùy theo trạng thái vệ sinh phòng.

### Luồng thay thế/ngoại lệ
- Không tìm thấy khách hàng → cho phép tạo nhanh hồ sơ khách hàng trước khi tiếp tục.
- Thiếu dữ liệu bắt buộc hoặc dữ liệu sai định dạng → báo lỗi tại trường tương ứng, không cho lưu.
- Không có phòng trống theo tiêu chí đã chọn → hiển thị danh sách tiêu chí gây giới hạn và gợi ý đổi ngày, đổi loại phòng hoặc đổi cơ sở.
- Phòng vừa bị đặt bởi giao dịch khác trong lúc nhân viên đang thao tác → hệ thống từ chối lưu, làm mới danh sách phòng trống và yêu cầu chọn lại.
- n8n tạm thời lỗi → đặt phòng vẫn được tạo nếu dữ liệu nghiệp vụ hợp lệ; hệ thống cho phép chạy lại tự động hóa.

### Hậu điều kiện
- Đặt phòng được tạo ở trạng thái phù hợp, có mã đặt phòng và lịch phòng được giữ chỗ.
- Đặt phòng xuất hiện trên danh sách đặt phòng, Whiteboard và các màn hình vận hành liên quan.
- Các sự kiện hậu xử lý được phát để n8n/các dịch vụ tích hợp tiếp tục xử lý khi cần.

---

## Use Case 6 — Whiteboard: xem và điều phối phòng/lịch ở

### Mục tiêu
Hiển thị màn hình **Tình trạng sử dụng** theo dạng Whiteboard để người dùng xem lịch sử dụng phòng theo cơ sở, hạng/loại phòng và khoảng ngày. Màn hình hỗ trợ lọc, xem trạng thái phòng/đặt phòng, mở nhanh chi tiết đặt phòng và tạo đặt phòng hoặc đặt tạm từ khoảng trống trên lịch. Use case này không có chức năng đổi phòng trực tiếp.

### Tác nhân
Quản lý (chính), Nhân viên vận hành/Lễ tân.

### Tiền điều kiện
- Người dùng đã đăng nhập và có quyền truy cập màn hình **Tình trạng sử dụng**.
- Hệ thống đã có dữ liệu cơ sở, phòng, hạng phòng/loại phòng.
- Hệ thống có dữ liệu đặt phòng để hiển thị trên timeline nếu phòng đã có lịch sử dụng.

### Kích hoạt
Người dùng mở menu **Tình trạng sử dụng** để kiểm tra phòng trống, phòng đang sử dụng, đặt phòng đã có, đặt phòng nháp hoặc tìm khoảng trống phù hợp để tạo đặt phòng.

### Luồng chính
1. Người dùng mở màn hình Whiteboard.
2. Hệ thống hiển thị khu vực tìm kiếm
3. Người dùng nhập hoặc chọn điều kiện lọc và bấm **Tìm kiếm**.
4. Hệ thống gọi lọc với các tham số lọc tương ứng.
5. Hệ thống hiển thị dữ liệu theo từng cơ sở; mỗi cơ sở có tiêu đề riêng, màu cơ sở, số phòng trống/tổng phòng, số bãi đỗ đã dùng/tổng bãi đỗ và các biểu tượng dịch vụ đang áp dụng.
6. Trong từng cơ sở, hệ thống nhóm phòng theo loại/hạng phòng và hiển thị thông tin giá thuê/ngày, diện tích nếu có.
7. Hệ thống hiển thị từng phòng trên timeline:
   - Số phòng.
   - Các block đặt phòng theo thời gian.
   - Tên người ở hoặc tên khách.
   - Ngày bắt đầu/kết thúc.
   - Ký hiệu direct check-in hoặc đã xác nhận nếu có.
   - Biểu tượng dịch vụ đi kèm như bãi đỗ xe, xe đạp, thú cưng, hộp đồ.
8. Hệ thống hiển thị chú giải màu để người dùng phân biệt trạng thái như đang sử dụng, đã đặt, bản nháp.
9. Người dùng bấm vào block đặt phòng để mở màn hình chỉnh sửa/chi tiết đặt phòng tương ứng.
10. Người dùng có thể bấm **Xóa điều kiện đã chọn** để xóa bộ lọc và tải lại danh sách mặc định.
11. Khi cuộn xuống cuối danh sách, hệ thống tự tải thêm cơ sở nếu còn dữ liệu phân trang.

### Luồng mở rộng — Tạo đặt phòng từ khoảng trống
1. Hệ thống hiển thị khoảng trống trên timeline dưới dạng ô có thể đặt phòng.
2. Người dùng bấm vào khoảng trống của một phòng.
3. Hệ thống hiển thị lựa chọn **Đặt phòng** hoặc **Đặt tạm**.
4. Nếu chọn **Đặt phòng**, hệ thống chuyển người dùng sang màn hình tạo đặt phòng.
5. Nếu chọn **Đặt tạm**, hệ thống mở hộp thoại đặt phòng tạm với cơ sở/phòng và khoảng thời gian được điền sẵn.
6. Người dùng chọn khách hàng, thời hạn giữ chỗ, khoảng thời gian và ghi chú.
7. Hệ thống tạo đặt phòng tạm; sau khi thành công, dữ liệu Whiteboard được tải lại.

### Luồng mở rộng — Xem đặt phòng nháp
1. Hệ thống hiển thị đặt phòng nháp bằng màu riêng theo chú giải.
2. Hệ thống hiển thị các đặt phòng tạm hoặc đặt phòng theo kênh/quảng cáo bằng màu riêng nếu dữ liệu có cờ tương ứng.
3. Người dùng bấm vào block để mở đặt phòng và xử lý ở màn hình đặt phòng.


### Luồng thay thế/ngoại lệ
- Không có dữ liệu theo bộ lọc → hệ thống hiển thị thông báo không có dữ liệu.
- Người dùng chọn đặt tạm nhưng chưa chọn khách hàng hoặc ngày kết thúc không sau ngày bắt đầu → hệ thống báo lỗi trong hộp thoại đặt tạm.
- Tạo đặt phòng tạm thất bại → hệ thống hiển thị thông báo lỗi và giữ hộp thoại để người dùng kiểm tra lại.
- Người dùng cần chỉnh sửa lịch ở → thực hiện tại màn hình đặt phòng, không thực hiện trực tiếp trên Whiteboard.

### Hậu điều kiện
- Người dùng xem được tình trạng sử dụng phòng theo điều kiện lọc.
- Người dùng có thể mở nhanh đặt phòng từ timeline.
- Người dùng có thể khởi tạo đặt phòng hoặc đặt phòng tạm từ khoảng trống trên timeline.

---

## Use Case 7 — Nhận phòng

### Mục tiêu
Xác nhận khách bắt đầu lưu trú, kiểm tra đủ điều kiện nhận phòng, cập nhật trạng thái đặt phòng/phòng, ghi nhận thời điểm nhận phòng và hỗ trợ quy trình tự check-in có cấp mã khóa nếu hệ thống sử dụng Smart Lock.

### Tác nhân
Nhân viên vận hành/Lễ tân (chính), Khách hàng, Smart Lock API, n8n Automation (gửi hướng dẫn/nhắc trước check-in).

### Tiền điều kiện
- Đặt phòng hợp lệ và đến ngày check-in .
- Phòng sẵn sàng (không bảo trì/không đang dọn).
- Đặt phòng chưa bị hủy và chưa check-in trước đó.
- Các giấy tờ/thông tin khách bắt buộc đã được cung cấp hoặc sẽ được bổ sung tại bước check-in.
- Nếu sử dụng direct check-in/Smart Lock, thông tin liên hệ của khách và cấu hình khóa phải hợp lệ.

### Kích hoạt
Khách đến nhận phòng tại quầy, khách thực hiện tự check-in, hoặc nhân viên chủ động check-in đặt phòng khi đã đủ điều kiện vận hành.

### Luồng chính (check-in tại quầy)
1. Nhân viên mở chi tiết đặt phòng.
2. Hệ thống hiển thị thông tin cần đối soát: khách chính, người ở cùng, thời gian lưu trú, phòng, trạng thái thanh toán, ghi chú đặc biệt.
3. Nhân viên xác minh giấy tờ/thông tin liên hệ của khách và bổ sung dữ liệu còn thiếu nếu cần.
4. Hệ thống kiểm tra điều kiện check-in: đặt phòng còn hiệu lực, phòng đã sẵn sàng, không trùng trạng thái với đặt phòng khác, không có chặn nghiệp vụ bắt buộc.
5. Nếu còn khoản cần thu trước khi nhận phòng, hệ thống cảnh báo để nhân viên xử lý theo chính sách.
6. Nhân viên xác nhận check-in.
7. Hệ thống ghi nhận thời điểm check-in thực tế, người thực hiện và ghi lịch sử thao tác.
8. Hệ thống cập nhật trạng thái đặt phòng sang đã check-in/đang lưu trú.
9. Hệ thống cập nhật trạng thái phòng sang “đang ở/occupied” hoặc trạng thái tương đương.
10. Hệ thống phát sự kiện `reservation.checked_in` để các tác vụ liên quan tiếp tục xử lý.
11. Hệ thống hiển thị kết quả check-in và các thao tác tiếp theo

### Luồng mở rộng — Direct check-in (tự check-in)
1. Nhân viên bật chế độ direct check-in cho đặt phòng hoặc hệ thống bật theo chính sách của cơ sở.
2. Hệ thống kiểm tra thông tin bắt buộc: email/số điện thoại, thời gian hiệu lực, phòng, trạng thái thanh toán tối thiểu, giấy tờ khách nếu yêu cầu.
3. Hệ thống chuẩn bị nội dung hướng dẫn check-in, đường dẫn xác nhận và thông tin nhận phòng.
4. n8n tự động gửi hướng dẫn qua Email/SMS theo lịch đã cấu hình.
5. Khách mở đường dẫn direct check-in, xác nhận thông tin và gửi các dữ liệu còn thiếu.
6. Hệ thống kiểm tra dữ liệu khách gửi lên và cập nhật vào đặt phòng.
7. Khi đủ điều kiện, hệ thống ghi nhận khách đã hoàn tất bước tự check-in

### Luồng mở rộng — Cấp PIN khóa cửa
1. Khi direct check-in được bật hoặc theo thao tác nhân viên, hệ thống gọi Smart Lock API để tạo PIN.
2. PIN có thời gian hiệu lực theo khoảng ở (validFrom/validTo).
3. Hệ thống lưu thông tin PIN đã mã hóa/ẩn một phần và liên kết với đặt phòng.
4. Hệ thống gửi PIN cho khách qua kênh đã cấu hình hoặc chỉ hiển thị cho nhân viên có quyền.

### Luồng thay thế/ngoại lệ
- Phòng chưa sẵn sàng → hệ thống từ chối check-in hoặc yêu cầu xử lý
- Đặt phòng đã bị hủy/đã check-in/đã check-out → hệ thống từ chối thao tác và hiển thị trạng thái hiện tại.
- Smart Lock API lỗi/timeout → hệ thống ghi nhận lỗi, không làm mất trạng thái đặt phòng; cho phép cấp lại PIN hoặc chuyển sang quy trình nhận chìa thủ công.

### Hậu điều kiện
- Đặt phòng ở trạng thái đã check-in/đang lưu trú.
- Phòng ở trạng thái đang sử dụng và hiển thị đúng trên Whiteboard.
- Thời điểm check-in thực tế, người thực hiện, dữ liệu giấy tờ/bổ sung và lịch sử thao tác được lưu.

---

## Use Case 8 — Check-out (Trả phòng)

### Mục tiêu
Kết thúc kỳ lưu trú của khách, ghi nhận thời điểm trả phòng thực tế, kiểm tra nghĩa vụ thanh toán/dịch vụ phát sinh, cập nhật trạng thái phòng và kích hoạt các tác vụ sau check-out như dọn dẹp, thu hồi PIN khóa cửa, nhắc công nợ hoặc báo cáo vận hành.

### Tác nhân
Nhân viên vận hành/Lễ tân (chính), Quản lý vệ sinh, Nhân viên vệ sinh, n8n Automation (tạo task/thông báo), Smart Lock API (thu hồi PIN), Email/SMS gateway.

### Tiền điều kiện
- Đặt phòng đã check-in.
- Đặt phòng chưa check-out trước đó.
- Người dùng có quyền thực hiện check-out.
- Các khoản dịch vụ/phụ phí phát sinh đã được cập nhật hoặc có quy trình ghi nhận tại thời điểm check-out.

### Kích hoạt
Khách trả phòng tại quầy, nhân viên xác nhận khách đã rời phòng.

### Luồng chính
1. Nhân viên mở chi tiết đặt phòng.
2. Hệ thống hiển thị thông tin lưu trú: khách, phòng, thời gian check-in, ngày trả dự kiến, trạng thái thanh toán, hóa đơn và các ghi chú vận hành.
3. Nhân viên kiểm tra các khoản phát sinh: tiền phòng còn lại, phụ phí, dịch vụ, bồi thường hư hỏng, phí trả muộn nếu có.
4. Hệ thống đối chiếu trạng thái hóa đơn/thanh toán và cảnh báo các khoản bắt buộc cần xử lý trước khi trả phòng.
5. Nhân viên cập nhật hoặc xác nhận các khoản phát sinh cuối cùng.
6. Nếu cần thu tiền, nhân viên chuyển sang quy trình thanh toán rồi quay lại check-out.
7. Nhân viên xác nhận check-out.
8. Hệ thống ghi nhận thời điểm check-out thực tế, người thực hiện và lịch sử thao tác.
9. Hệ thống cập nhật trạng thái đặt phòng sang đã check-out/hoàn tất lưu trú.
10. Hệ thống cập nhật trạng thái phòng sang “chờ dọn”.
11. Hệ thống phát sự kiện `reservation.checked_out`.

### Luồng mở rộng — n8n tạo task dọn dẹp
1. Sau check-out, hệ thống phát sự kiện nghiệp vụ.
2. n8n nhận sự kiện và tự động tạo nhiệm vụ dọn dẹp cho phòng.
3. Workflow xác định mức ưu tiên dựa trên thời gian check-in kế tiếp, trạng thái phòng, ghi chú đặc biệt.
4. n8n thông báo cho Quản lý vệ sinh/nhóm dọn dẹp qua kênh đã cấu hình.

### Luồng thay thế/ngoại lệ
- Chưa thể check-out do còn công nợ bắt buộc phải thanh toán theo quy định → hệ thống cảnh báo và yêu cầu xử lý thanh toán trước.
- Đặt phòng chưa check-in hoặc đã check-out → hệ thống từ chối thao tác và hiển thị trạng thái hiện tại.
- Không tạo được task dọn dẹp tự động → check-out vẫn hoàn tất; hệ thống cho phép tạo task thủ công.

### Hậu điều kiện
- Đặt phòng kết thúc và có thời điểm check-out thực tế.
- Phòng chuyển sang trạng thái phục vụ dọn dẹp, hiển thị đúng trên Whiteboard.
- Các hóa đơn/công nợ cuối kỳ được cập nhật.
- Sự kiện sau check-out được phát để tạo task dọn dẹp, thu hồi quyền truy cập và gửi thông báo cần thiết.

---

## Use Case 9 — Lập hóa đơn & quản lý công nợ

### Mục tiêu
Tạo hóa đơn chính xác cho đặt phòng và các dịch vụ phát sinh, theo dõi số tiền phải thu, số đã ghi nhận, số còn nợ, trạng thái hóa đơn và xuất chứng từ phục vụ khách hàng/quản lý. Use case này tập trung vào hóa đơn và công nợ, không mô tả cách khách thực hiện chi trả.

### Tác nhân
Nhân viên vận hành/Lễ tân (chính), Khách hàng, n8n Automation (nhắc công nợ/gửi chứng từ), Email/SMS gateway.

### Tiền điều kiện
- Có đặt phòng hợp lệ; phát sinh doanh thu cần thu.
- Người dùng có quyền tạo hóa đơn, cập nhật hóa đơn hoặc quản lý công nợ.
- Thông tin bảng giá, phụ phí, dịch vụ và chính sách công nợ đã được cấu hình hoặc có thể nhập thủ công theo quyền.
- Hóa đơn chưa bị khóa/chốt ở trạng thái không cho phép chỉnh sửa.

### Kích hoạt
Nhân viên cần lập hóa đơn tạm tính/chính thức, cập nhật khoản phải thu, chốt hóa đơn khi check-out, theo dõi công nợ hoặc xuất chứng từ cho khách hàng.

### Luồng chính
1. Nhân viên mở đặt phòng và chọn chức năng tạo hóa đơn.
2. Hệ thống tải dữ liệu đặt phòng: khách, phòng, thời gian ở, loại lưu trú, giá phòng, dịch vụ, phụ phí, khoản đã ghi nhận và các khoản phát sinh.
3. Hệ thống tạo danh sách hạng mục hóa đơn dự kiến: tiền phòng, dịch vụ, phụ phí, giảm trừ, thuế/phí nếu có.
4. Nhân viên kiểm tra hạng mục, bổ sung hoặc điều chỉnh trong phạm vi quyền được cấp.
5. Hệ thống tính tổng tiền phải thu, tổng số đã ghi nhận, số còn phải thu và trạng thái công nợ.
6. Nhân viên kiểm tra thông tin tổng hợp: khách hàng, kỳ lưu trú, danh sách hạng mục, tổng tiền, số còn nợ, hạn công nợ nếu có.
7. Nhân viên lưu hóa đơn nháp hoặc chốt hóa đơn tùy theo quy trình.
8. Khi có số tiền đã thu cần cập nhật, nhân viên ghi nhận số tiền, ngày ghi nhận, ghi chú và chứng từ tham chiếu nếu có.
9. Hệ thống kiểm tra số tiền ghi nhận không vượt quá giới hạn cho phép và cập nhật số đã ghi nhận/công nợ còn lại.
10. Nếu số tiền đã ghi nhận đủ, hệ thống cập nhật hóa đơn sang trạng thái đã thu đủ; nếu chưa đủ, giữ trạng thái còn công nợ/thu một phần.
11. Hệ thống ghi lịch sử thao tác, người thực hiện, thời điểm cập nhật và lý do điều chỉnh nếu có.
12. Nhân viên xuất PDF hóa đơn/phiếu xác nhận công nợ hoặc gửi chứng từ cho khách qua kênh đã cấu hình.

### Luồng mở rộng — Cập nhật công nợ
1. Nhân viên hoặc Kế toán mở hóa đơn còn công nợ.
2. Hệ thống hiển thị tổng tiền phải thu, số đã ghi nhận, số còn nợ, hạn xử lý và lịch sử cập nhật.
3. Người dùng cập nhật số đã ghi nhận hoặc điều chỉnh hạn/ghi chú công nợ trong phạm vi quyền.
4. Hệ thống tính lại công nợ còn lại và trạng thái hóa đơn.
5. Nếu công nợ đã hết, hệ thống đóng trạng thái công nợ; nếu vẫn còn, hệ thống giữ hóa đơn trong danh sách cần theo dõi.

### Luồng mở rộng — n8n nhắc công nợ
1. Nếu hóa đơn còn công nợ, hệ thống tạo sự kiện công nợ.
2. n8n gửi nhắc công nợ định kỳ qua Email/SMS theo cấu hình.
3. Khi công nợ được cập nhật hết, hệ thống dừng hoặc cập nhật lịch nhắc công nợ.

### Luồng thay thế/ngoại lệ
- Số đã ghi nhận không khớp với số tiền trên chứng từ/đối soát nội bộ → hệ thống đánh dấu cần kiểm tra.
- Người dùng không đủ quyền sửa hóa đơn đã chốt → hệ thống từ chối và ghi log.
- Không xuất được PDF/gửi chứng từ → hóa đơn/công nợ vẫn được lưu; hệ thống cho phép xuất/gửi lại.
- Còn công nợ nhưng check-out yêu cầu xử lý đủ công nợ → hệ thống chặn check-out cho đến khi xử lý theo Use Case 8.

### Hậu điều kiện
- Hóa đơn được tạo/cập nhật với trạng thái công nợ chính xác.
- Tổng tiền phải thu, số đã ghi nhận và số còn nợ được tính nhất quán.
- Công nợ của đặt phòng/khách hàng được cập nhật.
- Hóa đơn hoặc phiếu xác nhận công nợ có thể xuất PDF/gửi cho khách.
- Các sự kiện nhắc công nợ/gửi chứng từ được phát cho n8n khi cần.


### Mục tiêu
Cung cấp tổng quan vận hành và doanh thu, hỗ trợ quản lý ra quyết định.

### Tác nhân
Quản lý (chính), Admin (xem), n8n (tự động gửi báo cáo định kỳ).

### Tiền điều kiện
- Có dữ liệu phòng/đặt phòng/hóa đơn.

### Luồng chính
1. Người dùng mở Dashboard.
2. Hệ thống hiển thị các chỉ số: tình trạng phòng, số check-in/out, công suất, công nợ.
3. Người dùng mở báo cáo vận hành ngày hoặc báo cáo doanh thu.
4. Chọn bộ lọc (thời gian, facility, loại phòng…) và xem kết quả.
5. Xuất báo cáo (Excel/PDF) nếu cần.

### Luồng mở rộng — Kích hoạt gửi báo cáo định kỳ qua n8n
1. Người dùng có quyền cấu hình lịch gửi báo cáo theo ngày/tuần/tháng và nhóm người nhận.
2. Hệ thống lưu cấu hình báo cáo định kỳ.

### Luồng thay thế/ngoại lệ
- Không đủ quyền xem báo cáo nhạy cảm → từ chối truy cập.

### Hậu điều kiện
- Quản lý nắm được tình hình vận hành và doanh thu theo kỳ.

---

## Use Case 12 — Trợ lý AI tra cứu & tóm tắt (AI Assistant)

### Mục tiêu
Hỗ trợ người dùng tra cứu nhanh và tóm tắt dữ liệu vận hành đã có trong hệ thống, ví dụ thông tin đặt phòng, khách hàng, phòng, công nợ và nhiệm vụ dọn dẹp. AI Assistant đóng vai trò trợ lý giải thích/tóm tắt, không thay thế các màn hình nghiệp vụ và không tự động thay đổi dữ liệu.

### Tác nhân
Quản lý, Nhân viên vận hành/Lễ tân, Quản lý vệ sinh (trong phạm vi dữ liệu được cấp quyền), AI Engine, hệ thống hotel-management.

### Tiền điều kiện
- Người dùng đã đăng nhập.
- Người dùng có quyền xem màn hình hoặc bản ghi liên quan.
- AI Engine đã được tích hợp ở mức gửi câu hỏi và nhận câu trả lời.
- Hệ thống có API nội bộ để lấy dữ liệu cần tóm tắt như đặt phòng, khách hàng, phòng, hóa đơn/công nợ và dọn dẹp.
- Dữ liệu gửi cho AI là dữ liệu đã được hệ thống lọc theo quyền người dùng.

### Kích hoạt
Người dùng mở AI Assistant từ thanh công cụ chung hoặc từ một màn hình cụ thể như chi tiết đặt phòng, khách hàng, hóa đơn/công nợ, phòng, Dashboard hoặc danh sách dọn dẹp.

### Phạm vi hỗ trợ
- Tóm tắt một bản ghi đang mở: đặt phòng, khách hàng, hóa đơn/công nợ, phòng hoặc nhiệm vụ dọn dẹp.
- Trả lời câu hỏi đơn giản dựa trên dữ liệu hệ thống đã truy vấn được, ví dụ công nợ còn bao nhiêu, khách đang ở phòng nào, hôm nay có bao nhiêu check-out.
- Gợi ý phòng từ danh sách phòng trống do hệ thống đã lọc sẵn; AI chỉ sắp xếp/giải thích lý do đề xuất.
- Tóm tắt nhanh dữ liệu Dashboard như nhận phòng, trả phòng, phòng chờ dọn, công nợ nổi bật.
- Không tự động tạo, sửa, xóa, check-in, check-out, chốt hóa đơn hoặc cập nhật công nợ.

### Luồng chính
1. Người dùng mở AI Assistant và nhập câu hỏi hoặc chọn một mẫu có sẵn, ví dụ: “Tóm tắt đặt phòng này”, “Khách này còn công nợ không?”, “Hôm nay phòng nào cần dọn gấp?”.
2. Hệ thống xác định ngữ cảnh hiện tại: màn hình đang mở, mã bản ghi đang xem và vai trò của người dùng.
3. Hệ thống truy vấn dữ liệu cần thiết từ API nội bộ theo quyền của người dùng.
4. Hệ thống tạo ngữ cảnh ngắn gọn gồm các trường cần thiết, tránh gửi toàn bộ dữ liệu thô không liên quan.
5. Hệ thống gửi câu hỏi và ngữ cảnh đã chuẩn bị sang AI Engine.
6. AI Engine trả về câu trả lời dạng tóm tắt, danh sách ý chính hoặc gợi ý bước kiểm tra tiếp theo.
7. Hệ thống hiển thị câu trả lời trong giao diện AI Assistant, kèm liên kết tới bản ghi nguồn nếu có.
8. Người dùng xem câu trả lời, mở bản ghi nguồn để kiểm tra hoặc đặt câu hỏi tiếp theo.
9. Nếu cần thao tác nghiệp vụ, người dùng thực hiện ở màn hình chức năng tương ứng thay vì thao tác trực tiếp qua AI.

### Luồng mở rộng — Tóm tắt đặt phòng/khách hàng
1. Người dùng mở chi tiết đặt phòng hoặc khách hàng và chọn “Tóm tắt bằng AI”.
2. Hệ thống lấy dữ liệu liên quan như thông tin khách, thời gian lưu trú, phòng, ghi chú, trạng thái check-in/check-out và công nợ.
3. AI tạo bản tóm tắt ngắn gồm các điểm quan trọng cần biết.
4. Hệ thống hiển thị tóm tắt và liên kết tới các màn hình liên quan như đặt phòng, hóa đơn/công nợ hoặc phòng.

### Luồng mở rộng — Gợi ý phòng khi tạo đặt phòng
1. Nhân viên nhập tiêu chí đặt phòng ở Use Case 4 như ngày đến/ngày đi, cơ sở, loại phòng và số khách.
2. Hệ thống tự kiểm tra lịch phòng và tạo danh sách phòng trống hợp lệ.
3. Nhân viên yêu cầu AI gợi ý phòng từ danh sách này.
4. Hệ thống gửi cho AI danh sách phòng trống đã lọc cùng các tiêu chí đặt phòng.
5. AI sắp xếp hoặc chọn một số phòng phù hợp và nêu lý do đơn giản, ví dụ đúng loại phòng, đủ sức chứa, trạng thái sẵn sàng, ít ảnh hưởng lịch dọn.
6. Nhân viên chọn hoặc bỏ qua gợi ý; hệ thống vẫn kiểm tra điều kiện đặt phòng trước khi lưu.

### Luồng thay thế/ngoại lệ
- Câu hỏi vượt phạm vi dữ liệu cho phép → hệ thống không gửi dữ liệu bị hạn chế sang AI và trả lời rằng người dùng không có đủ quyền truy cập.
- Câu hỏi mơ hồ hoặc thiếu mã đặt phòng/khách hàng → hệ thống yêu cầu người dùng nhập thêm thông tin hoặc chọn bản ghi cụ thể.
- Không tìm thấy dữ liệu phù hợp → AI thông báo không có dữ liệu để tóm tắt và gợi ý người dùng kiểm tra lại bộ lọc/từ khóa.
- AI lỗi hoặc phản hồi quá lâu → hệ thống thông báo lỗi và cho phép người dùng thử lại.
- Dữ liệu vừa thay đổi sau khi AI trả lời → người dùng cần làm mới bản ghi nguồn trước khi ra quyết định.
- Người dùng yêu cầu AI cập nhật dữ liệu → hệ thống từ chối thao tác trực tiếp và hướng dẫn mở màn hình nghiệp vụ tương ứng.

### Hậu điều kiện
- Người dùng nhận được câu trả lời hoặc bản tóm tắt dựa trên dữ liệu được phép xem.
- Người dùng có thể mở bản ghi nguồn để kiểm tra và thực hiện thao tác nghiệp vụ nếu cần.
- Không có dữ liệu nghiệp vụ nào bị thay đổi bởi AI Assistant.
- Hệ thống có thể lưu lịch sử câu hỏi/câu trả lời ở mức cơ bản để phục vụ kiểm tra và cải thiện chất lượng.

---

## Use Case 13 — Tự động hóa n8n cho vận hành khách sạn

### Mục tiêu
Tự động hóa các tác vụ lặp lại trong vận hành khách sạn như gửi nhắc check-in, gửi hướng dẫn direct check-in, nhắc thanh toán, tạo task dọn dẹp sau check-out và gửi báo cáo định kỳ; giúp giảm thao tác thủ công và bảo đảm thông báo được gửi đúng thời điểm.

### Tác nhân
n8n Automation (chính), hệ thống hotel-management, Nhân viên vận hành/Lễ tân, Quản lý, Quản lý vệ sinh, Khách hàng, Email/SMS gateway, Cổng thanh toán (nếu dùng).

### Tiền điều kiện
- n8n đã được tích hợp thành công với hệ thống hotel-management qua webhook/API hoặc hàng đợi sự kiện.
- Các workflow n8n đã được cấu hình, kích hoạt và có thông tin xác thực hợp lệ.
- Hệ thống phát sự kiện nghiệp vụ sau các thao tác quan trọng: tạo đặt phòng, cập nhật đặt phòng, check-in, check-out, tạo hóa đơn, phát sinh công nợ, hoàn tất thanh toán.
- Email/SMS gateway hoặc kênh thông báo nội bộ đã sẵn sàng.
- Mẫu nội dung thông báo, lịch gửi, điều kiện gửi và danh sách người nhận đã được cấu hình.

### Kích hoạt
n8n được kích hoạt bởi webhook/sự kiện nghiệp vụ từ hệ thống, bởi lịch chạy định kỳ, hoặc bởi thao tác chạy lại thủ công từ người dùng có quyền.

### Luồng chính — Xử lý sự kiện đặt phòng
1. Hệ thống tạo hoặc cập nhật đặt phòng thành công và phát sự kiện tương ứng.
2. n8n nhận sự kiện, xác thực chữ ký/token và kiểm tra dữ liệu bắt buộc.
3. n8n truy vấn thêm dữ liệu cần thiết từ hệ thống nếu payload sự kiện chưa đủ: khách hàng, phòng, thời gian ở, trạng thái thanh toán, cấu hình direct check-in.
4. n8n xác định các workflow cần chạy: nhắc check-in,, gửi xác nhận đặt phòng, gửi hướng dẫn direct check-in.
5. n8n tạo lịch gửi hoặc gửi thông báo ngay tùy theo điều kiện nghiệp vụ.

### Luồng chính — Tự động hóa check-in/direct check-in
1. Trước thời điểm check-in theo cấu hình, n8n quét các đặt phòng đủ điều kiện hoặc nhận sự kiện đã lên lịch.
2. n8n kiểm tra trạng thái đặt phòng: chưa hủy, chưa check-in, có thông tin liên hệ hợp lệ, đã đủ điều kiện gửi hướng dẫn.
3. Nếu direct check-in được bật, n8n gửi hướng dẫn tự check-in, đường dẫn xác nhận và thông tin cần chuẩn bị.
4. n8n ghi log gửi thành công/thất bại và cập nhật trạng thái về hệ thống.

### Luồng chính — Tự động hóa sau check-out
1. Khi hệ thống phát sự kiện check-out thành công, n8n nhận thông tin phòng, thời điểm check-out, thời điểm check-in kế tiếp.
2. n8n tạo task dọn dẹp gắn với phòng, cơ sở.
3. n8n thông báo cho Quản lý vệ sinh hoặc nhóm dọn dẹp.
4. Nếu đặt phòng còn công nợ, n8n lên lịch nhắc thanh toán sau check-out.

### Luồng chính — Nhắc thanh toán và gửi biên nhận
1. Khi hóa đơn được tạo hoặc còn công nợ, hệ thống phát sự kiện thanh toán/công nợ.
2. n8n xác định số tiền cần nhắc, hạn thanh toán, kênh gửi và mẫu nội dung.
3. n8n gửi nhắc thanh toán cho khách.
4. Khi hệ thống ghi nhận thanh toán đủ, n8n dừng các lịch nhắc còn lại.
5. Nếu cấu hình yêu cầu, n8n gửi biên nhận/hóa đơn PDF cho khách sau khi thanh toán thành công.

### Luồng thay thế/ngoại lệ
- Sự kiện nhận được thiếu dữ liệu hoặc sai chữ ký xác thực → n8n từ chối xử lý, ghi log và trả lỗi về hệ thống.
- Email/SMS gateway lỗi → n8n retry theo cấu hình; nếu vẫn thất bại, tạo cảnh báo cho nhân viên phụ trách.
- Workflow chạy trùng do nhận lại webhook → n8n kiểm tra mã sự kiện/idempotency key để tránh gửi thông báo hoặc tạo task trùng.
- Khách đã thanh toán đủ trước lịch nhắc công nợ → n8n dừng workflow nhắc thanh toán.
- Không tạo được task dọn dẹp → n8n gửi cảnh báo cho Quản lý vệ sinh và ghi trạng thái thất bại để tạo thủ công.

### Hậu điều kiện
- Các thông báo, nhắc việc, task dọn dẹp và báo cáo được tạo/gửi đúng điều kiện cấu hình.
- Trạng thái workflow và log xử lý được lưu để người dùng đối soát.
- Các tác vụ tự động không làm thay đổi dữ liệu nghiệp vụ cốt lõi nếu không có API hợp lệ từ hệ thống.
- Khi workflow thất bại, hệ thống có cảnh báo và cơ chế chạy lại/thao tác thủ công để không làm gián đoạn vận hành.

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
