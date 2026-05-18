# Sổ tay vận hành nội bộ khách sạn

## Thông tin tài liệu

| Trường | Giá trị |
| --- | --- |
| Mã tài liệu | `HOTEL-OPS-HANDBOOK` |
| Phiên bản | `1.1` |
| Chủ sở hữu | Quản lý vận hành khách sạn |
| Đối tượng sử dụng | Lễ tân, buồng phòng, kỹ thuật, kế toán, quản lý |
| Ngày rà soát gần nhất | `2026-05-18` |

## Phạm vi sử dụng

- Tài liệu này dùng để tra cứu **quy trình, chính sách, cách xử lý tình huống và liên hệ nội bộ**.
- Dữ liệu thay đổi theo thời gian thực như booking, công nợ, phòng đang có khách, phòng trống, check-in/check-out trong ngày phải tra trên hệ thống `hotel-management`.
- Chatbot nội bộ chỉ hỗ trợ **tra cứu**; không dùng để xác nhận đã thực hiện thao tác cập nhật dữ liệu như check-in, check-out, hủy booking hoặc ghi nhận thanh toán.

---

## 1. Liên hệ nội bộ và escalation

| Bộ phận | Vai trò chính | Số nội bộ |
| --- | --- | --- |
| Lễ tân | Điều phối khách, check-in/check-out, hỗ trợ tại quầy | `100` |
| Trưởng ca lễ tân | Xác nhận ngoại lệ tại quầy, hỗ trợ tình huống khó | `110` |
| Buồng phòng | Vệ sinh phòng, xác nhận phòng sẵn sàng, xử lý đồ thất lạc ban đầu | `120` |
| Giám sát buồng phòng | Điều phối ưu tiên dọn phòng, kiểm tra phòng chưa đạt | `121` |
| Kỹ thuật | Điều hòa, điện, nước, Wi-Fi, khóa thông minh, thiết bị phòng | `130` |
| Kỹ thuật trực khẩn | Hỗ trợ kỹ thuật ngoài giờ, lỗi phòng nghiêm trọng | `139` |
| Kế toán / Thu ngân | Công nợ, xác nhận thanh toán, đối soát | `140` |
| Quản lý vận hành trực | Phê duyệt ngoại lệ, xử lý khiếu nại, leo thang sự cố | `150` |
| Quản lý vận hành dự phòng | Hỗ trợ khi quản lý trực không phản hồi trong 10 phút | `159` |
| An ninh | An toàn, mất đồ, gây rối, hỗ trợ khẩn cấp | `160` |
| Hỗ trợ hệ thống / khóa thông minh | PIN, tài khoản, lỗi kết nối hệ thống vận hành | `170` |

### 1.1 Chuyển tuyến nhanh

- Phòng bẩn, chưa sẵn sàng, thiếu đồ dùng: gọi **Buồng phòng `120`**.
- Thiết bị, điều hòa, TV, nước nóng, Wi-Fi, khóa: gọi **Kỹ thuật `130`**.
- Hóa đơn, công nợ, thu thiếu hoặc thu sai: gọi **Kế toán / Thu ngân `140`**.
- Tranh chấp, overbooking, khách có cảnh báo đặc biệt (`UG`), miễn giảm ngoài chính sách: gọi **Quản lý vận hành `150`**.
- Mất an toàn, gây rối, nghi ngờ trộm cắp, y tế khẩn cấp: gọi **An ninh `160`** và **Quản lý vận hành `150`**.

### 1.2 Escalation theo ca trực

| Ca | Khung giờ | Liên hệ đầu tiên | Liên hệ thứ hai | Tình huống chính |
| --- | --- | --- | --- | --- |
| Ca sáng | `06:00-14:00` | Trưởng ca lễ tân `110` | Quản lý vận hành trực `150` | Check-in sớm, phòng chưa sẵn sàng, ngoại lệ tại quầy |
| Ca chiều | `14:00-22:00` | Quản lý vận hành trực `150` | Giám sát buồng phòng `121` hoặc kỹ thuật `130` | Cao điểm check-in, đổi phòng, khiếu nại khách |
| Ca đêm | `22:00-06:00` | Lễ tân `100` + An ninh `160` | Quản lý vận hành dự phòng `159` | Sự cố an toàn, khách gây rối, không vào được phòng |

### 1.3 Trường hợp phải escalation ngay

- Nghi ngờ overbooking hoặc phòng có khách khác đang ở.
- Yêu cầu hoàn tiền, miễn phí hoặc giảm giá ngoài chính sách.
- Khách có cảnh báo đặc biệt (`UG`) phát sinh tranh chấp.
- Khiếu nại công khai có nguy cơ ảnh hưởng uy tín khách sạn.
- Xô xát, đe dọa, mất đồ có dấu hiệu phạm pháp.
- Khóa thông minh lỗi, mất điện, mất nước nóng hoặc lỗi thiết bị ảnh hưởng khả năng lưu trú.

Nếu liên hệ đầu tiên không phản hồi trong `10 phút`, gọi liên hệ thứ hai của cùng ca.

---

## 2. Chính sách cốt lõi

### 2.1 Giờ vận hành chuẩn

| Nội dung | Quy định |
| --- | --- |
| Check-in chính thức | Từ `14:00` |
| Check-out chính thức | Trước `12:00` |
| Giờ yên tĩnh | `22:00-06:00` |
| Lễ tân | `24/7` |
| Buồng phòng thường trực | `06:30-22:00` |
| Kế toán / Thu ngân | `08:00-18:00` |

### 2.2 Hủy phòng, no-show và hoàn tiền

| Tình huống | Chính sách chuẩn |
| --- | --- |
| Hủy trước ít nhất `72 giờ` so với giờ check-in | Miễn phí hủy |
| Hủy từ `24 giờ` đến dưới `72 giờ` | Thu `50%` tiền đêm đầu tiên |
| Hủy dưới `24 giờ` hoặc trong ngày check-in | Thu `100%` tiền đêm đầu tiên |
| No-show | Thu `100%` tiền đêm đầu tiên |
| Giá khuyến mại không hoàn hủy | Áp dụng điều kiện gói giá nếu điều kiện đó chặt hơn chính sách chuẩn |
| Lưu trú dài hạn / hợp đồng tháng | Ưu tiên điều khoản hợp đồng đã ký |

Quy tắc hoàn tiền:

1. Chỉ hoàn phần đủ điều kiện theo chính sách hoặc quyết định đã phê duyệt.
2. Không hoàn các đêm khách đã sử dụng hoặc dịch vụ đã phát sinh.
3. Ưu tiên hoàn về cùng phương thức thanh toán ban đầu khi có thể.
4. Thời gian xử lý hoàn tiền chuẩn: tối đa `7 ngày làm việc` sau khi được duyệt.

### 2.3 Check-in sớm

| Thời điểm nhận phòng | Phụ thu chuẩn |
| --- | --- |
| Trước `09:00` | `100%` tiền một đêm |
| `09:00-11:59` | `50%` tiền một đêm |
| `12:00-13:59` | Miễn phí nếu phòng đã sẵn sàng |

Quy tắc:

- Chỉ xác nhận sau khi kiểm tra phòng đã sẵn sàng.
- Nếu phòng chưa sẵn sàng, lễ tân phải cập nhật tình hình và phối hợp buồng phòng.
- Ngoại lệ miễn giảm ngoài chính sách cần quản lý vận hành phê duyệt.

### 2.4 Check-out muộn

| Thời điểm trả phòng | Phụ thu chuẩn |
| --- | --- |
| Đến `12:30` | Miễn phí nếu không ảnh hưởng booking tiếp theo |
| `12:31-15:00` | `30%` tiền một đêm |
| `15:01-18:00` | `50%` tiền một đêm |
| Sau `18:00` | `100%` tiền một đêm |

Quy tắc:

- Phải kiểm tra booking tiếp theo trước khi hứa với khách.
- Nếu có booking kế tiếp trong ngày, lễ tân không tự cam kết check-out muộn sau `12:30`.
- Ngoại lệ ngoài chính sách cần quản lý vận hành phê duyệt.

### 2.5 Chính sách thú cưng

1. Chỉ nhận thú cưng tại phòng hoặc cơ sở được cấu hình cho phép.
2. Khách phải báo trước khi check-in.
3. Tối đa `2` thú cưng/phòng, mỗi thú cưng không quá `10 kg`.
4. Phụ thu chuẩn: `250.000 VND/thú cưng/đêm`, tối đa `2.000.000 VND` cho một kỳ lưu trú.
5. Đặt cọc hoàn lại: `1.000.000 VND/phòng`.
6. Thú cưng không được vào khu vực ăn uống, hồ bơi, phòng gym và buffet.
7. Hư hại, mùi hoặc vệ sinh vượt mức bình thường được tính theo chi phí thực tế sau kiểm tra phòng.
8. Trường hợp thú cưng gây nguy hiểm hoặc gây ồn kéo dài phải chuyển quản lý vận hành.

### 2.6 Quyền xem ghi chú nhạy cảm của khách

| Mức ghi chú | Ví dụ | Quyền xem |
| --- | --- | --- |
| Thông thường | Yêu cầu gối thêm, giờ đến dự kiến, lưu ý phòng | Nhân viên vận hành có quyền xem booking |
| Hạn chế | Tranh chấp thanh toán, ghi chú khách có cảnh báo đặc biệt (`UG`), khiếu nại có đền bù | Trưởng ca lễ tân, quản lý vận hành, kế toán khi liên quan tài chính |
| Nhạy cảm cao | Sự cố an ninh, giấy tờ tùy thân, nghi ngờ gian lận, biên bản nội bộ | Quản lý vận hành, tổng quản lý, an ninh khi được phân công |

Quy tắc:

- Không đọc to hoặc sao chép nguyên văn ghi chú nhạy cảm trước mặt người không liên quan.
- Không chia sẻ ảnh chụp màn hình ghi chú nhạy cảm qua kênh chat cá nhân.
- Khi trao đổi, chỉ nêu phần tối thiểu cần thiết để xử lý công việc.

---

## 3. Quy trình nghiệp vụ

### 3.1 Tra cứu booking và xác minh khách

1. Ưu tiên tìm theo mã booking.
2. Nếu không có mã booking, dùng tên khách đặt và hỏi thêm ngày lưu trú, số điện thoại, số phòng hoặc cơ sở khi cần phân biệt.
3. Khi có nhiều booking trùng tên, không trao đổi chi tiết cho đến khi xác định đúng booking.
4. Khi làm việc với khách, phải đối chiếu tối thiểu một thông tin xác minh phù hợp trước khi chia sẻ dữ liệu chi tiết.

### 3.2 Check-in

Trước khi check-in, cần kiểm tra:

- Booking đúng khách và đúng ngày nhận phòng.
- Trạng thái thanh toán hoặc công nợ.
- Phòng đã được chuẩn bị và đủ điều kiện bàn giao.
- Ghi chú vận hành quan trọng, khách có cảnh báo đặc biệt (`UG`) hoặc yêu cầu đặc biệt.
- Yêu cầu thú cưng nếu có.

Nếu phòng chưa sẵn sàng vào giờ nhận phòng:

1. Xác nhận tình trạng với buồng phòng.
2. Báo thời gian dự kiến cho khách bằng thông tin đã được xác nhận.
3. Nếu chậm kéo dài hoặc ảnh hưởng trải nghiệm khách, chuyển quản lý vận hành.

### 3.3 Direct check-in

Áp dụng khi booking đã được cấu hình direct check-in và thông tin truy cập đã được gửi hợp lệ.

Nếu khách báo không vào được phòng:

1. Xác minh đúng booking và thời gian lưu trú.
2. Kiểm tra PIN hoặc hướng dẫn truy cập đã được gửi.
3. Nếu không khắc phục được ngay, gọi hỗ trợ hệ thống / khóa thông minh `170`.
4. Nếu khách bị kẹt ngoài phòng hoặc sự cố kéo dài, gọi quản lý vận hành và kỹ thuật trực khẩn.

### 3.4 Check-out

Trước khi check-out, cần kiểm tra:

- Booking đã check-in hợp lệ.
- Các khoản phải thu, đã thu và còn lại.
- Phát sinh minibar, hư hại hoặc khoản phí liên quan nếu có.
- Tình trạng yêu cầu hoàn tiền, đặt cọc hoặc công nợ.

Quy tắc:

- Không xử lý check-out nếu booking chưa từng check-in; cần chuyển quản lý vận hành xác minh.
- Với khách trả phòng sớm, không tự hứa hoàn tiền nếu chưa đối chiếu chính sách và phê duyệt.

### 3.5 Thanh toán và công nợ

Khi khách hỏi đã thanh toán chưa:

1. Kiểm tra tổng phải thu, đã thu và số còn lại.
2. Trả lời theo dữ liệu hiện có trên hệ thống.
3. Nếu khách nói đã thanh toán nhưng hệ thống chưa ghi nhận:
   - yêu cầu chứng từ nếu quy trình cho phép,
   - chuyển kế toán / thu ngân đối soát,
   - không tự xác nhận đã thanh toán đủ trước khi có kết quả.

Khách doanh nghiệp trả sau chỉ được áp dụng nếu hồ sơ khách hàng có quyền tương ứng.

### 3.6 Phòng và buồng phòng

- Trước khi giao phòng, phải xác minh phòng đã sẵn sàng.
- Nếu phòng chưa sẵn sàng sát giờ check-in, liên hệ buồng phòng và cập nhật lễ tân.
- Sau khi khách đã check-in, buồng phòng cần tránh vào phòng ngoài quy trình.
- Khi khách yêu cầu dọn phòng trong thời gian lưu trú, cần xác nhận thời gian phù hợp trước khi phân công.

---

## 4. Xử lý tình huống bất thường

### 4.1 Khách không đến

1. Kiểm tra đúng booking và ngày nhận phòng.
2. Nếu quá `22:00` ngày check-in mà khách chưa đến và không có ghi chú đến muộn, liên hệ khách ít nhất một lần.
3. Nếu đến `12:00` ngày hôm sau vẫn không liên lạc được, chuyển quản lý vận hành xác nhận no-show.
4. Ghi rõ thời điểm đã liên hệ khách.

### 4.2 Nghi ngờ overbooking hoặc trùng phòng

1. Không hứa đổi phòng hoặc nâng hạng ngay với khách.
2. Kiểm tra booking hiện tại, booking chồng lấn và phòng thay thế khả dụng.
3. Báo quản lý vận hành ngay.
4. Ghi lại quyết định cuối cùng vào đúng booking.

### 4.3 Khách báo thiết bị hỏng

1. Ghi nhận số phòng và mô tả lỗi.
2. Chuyển kỹ thuật.
3. Nếu lỗi ảnh hưởng khả năng ở phòng, báo lễ tân và quản lý vận hành để quyết định phương án.

### 4.4 Khách báo mất đồ

1. Ghi nhận thời gian, khu vực, mô tả tài sản và thông tin liên hệ.
2. Liên hệ buồng phòng và an ninh để kiểm tra.
3. Nếu có dấu hiệu phạm pháp, bảo toàn hiện trường và báo quản lý vận hành.
4. Không cam kết kết quả khi chưa kiểm tra xong.

Lưu giữ:

| Nhóm tài sản | Thời gian lưu giữ |
| --- | --- |
| Đồ thông thường | `30 ngày` |
| Tài sản giá trị cao, giấy tờ tùy thân, tiền mặt | `90 ngày` |
| Đồ dễ hỏng hoặc thực phẩm | Xử lý trong ngày theo quy định vệ sinh |

### 4.5 Bồi thường

- Chỉ xác nhận bồi thường sau khi đã có hồ sơ sự việc, bằng chứng và kết luận trách nhiệm.
- Quản lý vận hành được phê duyệt bồi thường đến `2.000.000 VND`.
- Trên `2.000.000 VND` cần tổng quản lý phê duyệt.
- Ưu tiên bồi thường theo chi phí thực tế hợp lý; không tự đưa ra cam kết vượt thẩm quyền.

### 4.6 Khách gây rối hoặc có nguy cơ mất an toàn

1. Không tranh cãi kéo dài tại quầy.
2. Gọi an ninh và quản lý vận hành.
3. Ưu tiên bảo vệ khách khác và nhân viên.
4. Ghi nhận sự việc sau khi tình huống đã được kiểm soát.

---

## 5. Mẫu câu chuẩn dùng với khách

| Tình huống | Mẫu câu đề xuất |
| --- | --- |
| Chào đón khách | `Xin chào anh/chị, em rất vui được hỗ trợ. Anh/chị cho em xin mã đặt phòng hoặc tên khách đặt để kiểm tra thông tin.` |
| Phòng chưa sẵn sàng | `Hiện phòng của anh/chị đang được hoàn tất khâu chuẩn bị. Em sẽ kiểm tra ưu tiên với bộ phận buồng phòng và cập nhật lại sớm nhất cho anh/chị.` |
| Check-in sớm có phụ phí | `Khách sạn có thể hỗ trợ nhận phòng sớm tùy tình trạng phòng. Với khung giờ hiện tại, phụ thu áp dụng là [mức phụ thu theo khung giờ] theo chính sách của khách sạn; em sẽ kiểm tra phòng trước khi xác nhận.` |
| Check-out muộn có phụ phí | `Em sẽ kiểm tra tình trạng phòng cho ngày hôm nay. Nếu có thể hỗ trợ check-out muộn, phụ thu sẽ áp dụng theo khung giờ thực tế theo chính sách khách sạn.` |
| Còn công nợ | `Theo hệ thống hiện tại, đặt phòng của anh/chị còn số tiền cần thanh toán là [số tiền còn lại]. Em có thể hỗ trợ kiểm tra chi tiết hoặc kết nối bộ phận thu ngân nếu anh/chị cần.` |
| Chưa xác minh được thanh toán | `Em đã ghi nhận thông tin anh/chị cung cấp. Hiện em cần bộ phận thu ngân đối soát thêm trước khi xác nhận trạng thái thanh toán chính thức.` |
| Từ chối chia sẻ thông tin | `Để bảo mật thông tin khách lưu trú, em cần xác minh thêm thông tin đặt phòng trước khi hỗ trợ chi tiết.` |
| Xử lý khiếu nại | `Em xin ghi nhận vấn đề của anh/chị. Em sẽ chuyển quản lý vận hành kiểm tra và phản hồi lại theo đúng quy trình.` |
| Mất đồ | `Em đã ghi nhận mô tả tài sản của anh/chị và sẽ phối hợp với buồng phòng cùng an ninh để kiểm tra. Khi có kết quả, khách sạn sẽ liên hệ lại ngay.` |

---

## 6. Rà soát tài liệu

| Trường hợp | Thời hạn cập nhật |
| --- | --- |
| Rà soát định kỳ | Thứ Hai đầu tiên của mỗi tháng |
| Có thay đổi chính sách vận hành | Trong vòng `2 ngày làm việc` |
| Có sự cố nghiêm trọng hoặc bài học mới | Trong vòng `3 ngày làm việc` sau khi chốt biên bản |
| Có thay đổi hệ thống ảnh hưởng quy trình | Trước hoặc cùng ngày triển khai |

| Vai trò | Trách nhiệm |
| --- | --- |
| Quản lý vận hành | Chủ sở hữu nội dung, phê duyệt phiên bản mới |
| Trưởng ca lễ tân | Đề xuất cập nhật từ tình huống thực tế tại quầy |
| Giám sát buồng phòng | Cập nhật quy trình liên quan phòng và vệ sinh |
| Kế toán / Thu ngân | Cập nhật chính sách công nợ, hoàn tiền, đối soát |
| Kỹ thuật / An ninh | Cập nhật SOP sự cố và escalation |
