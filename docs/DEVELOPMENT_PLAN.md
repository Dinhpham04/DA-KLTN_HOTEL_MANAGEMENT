# 📋 KẾ HOẠCH PHÁT TRIỂN HỆ THỐNG QUẢN LÝ WEEKLY MANSION

## 📊 TỔNG QUAN DỰ ÁN

**Tên dự án:** AKEBONO 予約管理システム (Hệ thống Quản lý Đặt phòng AKEBONO)

**Loại hình:** Hệ thống quản lý căn hộ cho thuê ngắn hạn (Weekly Mansion) tại Yokohama, Nhật Bản

**Mục tiêu:** Quản lý toàn bộ quy trình từ đặt phòng, khách hàng, dọn dẹp, thanh toán đến báo cáo doanh thu cho hệ thống căn hộ cho thuê ngắn hạn (1 tuần đến vài tháng).

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Frontend Stack
- **Framework:** React 18 + TypeScript + Vite
- **Router:** TanStack Router (file-based routing)
- **State Management:** Valtio + React Query (TanStack Query)
- **Styling:** Tailwind CSS + SASS + Bootstrap
- **UI Components:** Radix UI + shadcn/ui
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Ky

### Tính năng đặc biệt
- **AI/ML:** OpenAI integration
- **OCR:** Tesseract.js + OpenCV.js (scan CCCD/Passport)
- **PDF:** jsPDF, pdfmake, React PDF, html2pdf.js
- **Charts:** Chart.js, Recharts
- **i18n:** i18next (Đa ngôn ngữ)
- **Drag & Drop:** dnd-kit

---

## 🎯 CHIẾN LƯỢC PHÁT TRIỂN

### Nguyên tắc
1. **MVP First:** Triển khai tính năng cốt lõi trước
2. **Data-Driven:** Ưu tiên các tính năng tạo doanh thu và quản lý khách hàng
3. **Scalable:** Thiết kế để mở rộng sau này
4. **User-Centric:** Tối ưu trải nghiệm cho 7 nhóm người dùng khác nhau

---

## 📈 LỘ TRÌNH PHÁT TRIỂN CHI TIẾT

### **PHASE 1: CORE BUSINESS - Nền tảng kinh doanh** ⭐⭐⭐⭐⭐
**Thời gian ước tính:** 8-10 tuần

| # | Tính năng | Mô tả chi tiết | Độ phức tạp | Thời gian | API cần |
|---|-----------|----------------|-------------|-----------|---------|
| **1.1** | **Authentication & Authorization** | - Đăng nhập đa cổng (4 cổng khác nhau)<br>- Phân quyền 7 roles<br>- JWT token management<br>- Role-based redirect | Cao | 2 tuần | `/auth/login`, `/user/info` |
| **1.2** | **Dashboard** | - Tổng quan phòng trống/đã thuê<br>- Thống kê doanh thu theo ngày/tuần/tháng<br>- Biểu đồ xu hướng<br>- Quick actions | Trung bình | 1.5 tuần | `/dashboard/stats`, `/dashboard/charts` |
| **1.3** | **Whiteboard (Usage Situation)** | - Hiển thị trạng thái phòng real-time<br>- Drag & drop đặt phòng<br>- Color-coded status<br>- Filter theo tòa nhà/khu vực<br>- Timeline view | Rất cao | 3 tuần | `/room/status`, `/reservation/calendar` |
| **1.4** | **Customer Management** | - CRUD khách hàng (cá nhân/doanh nghiệp)<br>- OCR scan CCCD/Passport<br>- Image storage<br>- Search & filter<br>- Customer history<br>- Tags & categories | Cao | 2 tuần | `/client`, `/client/scan-id` |
| **1.5** | **Room Master** | - Quản lý phòng, loại phòng<br>- Trạng thái phòng (available, occupied, cleaning, maintenance)<br>- Giá theo mùa<br>- Ảnh phòng<br>- Thiết bị đi kèm | Trung bình | 1 tuần | `/room`, `/room-type`, `/room-class` |
| **1.6** | **Reservation Management** | - Tạo booking mới<br>- Check-in/Check-out<br>- Gia hạn (extend)<br>- Hủy booking<br>- Room assignment<br>- Guest information<br>- Pricing calculation<br>- Conflict detection | Rất cao | 3 tuần | `/reservation`, `/reserve`, `/reservation-search-log` |

**Tổng Phase 1:** 12.5 tuần (3 tháng)

---

### **PHASE 2: BILLING & SALES - Quản lý tài chính** ⭐⭐⭐⭐
**Thời gian ước tính:** 6-8 tuần

| # | Tính năng | Mô tả chi tiết | Độ phức tạp | Thời gian | API cần |
|---|-----------|----------------|-------------|-----------|---------|
| **2.1** | **Billing Management** | - Tạo hóa đơn từ booking<br>- Multi-item billing<br>- Tax calculation<br>- Discount & promotions<br>- Receipt generation (PDF)<br>- Payment tracking | Cao | 2.5 tuần | `/bill`, `/request`, `/report/receipt` |
| **2.2** | **Sales Report** | - Daily/Weekly/Monthly reports<br>- Revenue by room type<br>- Revenue by customer type<br>- Payment method breakdown<br>- Export to Excel/PDF | Trung bình | 1.5 tuần | `/sales`, `/export-graph-data` |
| **2.3** | **Consolidated Billing** | - Group multiple bookings<br>- Corporate billing<br>- Monthly invoices<br>- Bulk payment processing | Trung bình | 1.5 tuần | `/consolidated-billing`, `/bulk-sales` |
| **2.4** | **Payment Integration** | - Cash<br>- Credit cards (JCB, UC)<br>- E-wallets (PayPay, LINE Pay)<br>- Bank transfers (5+ banks)<br>- Rakuten Travel<br>- Now Room<br>- GoTo subsidy | Cao | 2.5 tuần | `/payment/process`, `/payment/verify` |

**Tổng Phase 2:** 8 tuần (2 tháng)

---

### **PHASE 3: OPERATIONS - Vận hành hàng ngày** ⭐⭐⭐
**Thời gian ước tính:** 5-6 tuần

| # | Tính năng | Mô tả chi tiết | Độ phức tạp | Thời gian | API cần |
|---|-----------|----------------|-------------|-----------|---------|
| **3.1** | **Daily Business Report** | - Báo cáo check-in/out hôm nay<br>- Phòng trống<br>- Doanh thu ngày<br>- Tasks pending<br>- Export PDF | Trung bình | 1 tuần | `/daily-business-report`, `/report/daily` |
| **3.2** | **Cleaning Management** | - Lịch dọn dẹp theo ca<br>- Assign cleaner to room<br>- Cleaning status tracking<br>- Photo upload (before/after)<br>- Quality checklist<br>- Attendance management | Cao | 2.5 tuần | `/clean`, `/clean-master`, `/cleaning-shift`, `/roll-call-clean` |
| **3.3** | **Contact Notes** | - Internal communication<br>- Notes per room/booking<br>- Priority levels<br>- Notifications | Thấp | 0.5 tuần | `/contact-note` |
| **3.4** | **Work Checklist** | - Daily tasks<br>- Recurring tasks<br>- Completion tracking<br>- Assign to staff | Thấp | 1 tuần | `/workchecklist`, `/facility_task` |

**Tổng Phase 3:** 5 tuần (1.25 tháng)

---

### **PHASE 4: ADDITIONAL SERVICES - Dịch vụ bổ sung** ⭐⭐
**Thời gian ước tính:** 4-5 tuần

| # | Tính năng | Mô tả chi tiết | Độ phức tạp | Thời gian | API cần |
|---|-----------|----------------|-------------|-----------|---------|
| **4.1** | **Parking Management** | - Car parking slots<br>- Bicycle parking slots<br>- Availability tracking<br>- Reservation system<br>- Pricing | Trung bình | 1.5 tuần | `/parking`, `/bicycle-parking`, `/parking-reserve` |
| **4.2** | **Trunk Room** | - Storage room rental<br>- Size categories<br>- Pricing<br>- Availability | Trung bình | 1 tuần | `/trunkroom`, `/trunkroom-classes` |
| **4.3** | **Equipment Management** | - Equipment per room<br>- Categories (furniture, appliances, etc.)<br>- Inventory tracking<br>- Maintenance history | Trung bình | 1.5 tuần | `/quipment`, `/quipment-category`, `/quipment-inventory`, `/quipment-history` |
| **4.4** | **Construction/Repair** | - Maintenance requests<br>- Repair tracking<br>- Vendor assignment<br>- Cost tracking<br>- Photo documentation | Trung bình | 1 tuần | `/searchConstruction` |

**Tổng Phase 4:** 5 tuần (1.25 tháng)

---

### **PHASE 5: MASTER DATA - Dữ liệu cơ sở** ⭐⭐
**Thời gian ước tính:** 4-5 tuần

| # | Tính năng | Mô tả chi tiết | Độ phức tạp | Thời gian | API cần |
|---|-----------|----------------|-------------|-----------|---------|
| **5.1** | **Area Master** | - Geographic areas<br>- CRUD operations | Thấp | 0.5 tuần | `/area` |
| **5.2** | **Store/Facility Master** | - Buildings/properties<br>- Location<br>- Capacity<br>- Amenities | Trung bình | 1 tuần | `/facility`, `/store-master` |
| **5.3** | **Price List Master** | - Seasonal pricing<br>- Duration-based pricing<br>- Room type pricing<br>- Special rates | Trung bình | 1 tuần | `/rents-master` |
| **5.4** | **Staff Master** | - Employee management<br>- Roles & permissions<br>- Contact info<br>- Work schedule<br>- Attendance | Trung bình | 1 tuần | `/staff`, `/roll-call-staff` |
| **5.5** | **Supplier Master** | - Vendor database<br>- Services provided<br>- Contact info<br>- Performance tracking | Thấp | 0.5 tuần | `/suppliers` |

**Tổng Phase 5:** 4 tuần (1 tháng)

---

### **PHASE 6: AI & ADVANCED FEATURES - Tính năng nâng cao** ⭐
**Thời gian ước tính:** 8-10 tuần

| # | Tính năng | Mô tả chi tiết | Độ phức tạp | Thời gian | API cần |
|---|-----------|----------------|-------------|-----------|---------|
| **6.1** | **AI Chat Assistant** | - OpenAI integration<br>- Booking assistant<br>- FAQ answering<br>- Multi-turn conversations<br>- Templates management<br>- Chat history<br>- Analytics | Rất cao | 3 tuần | `/chat`, `/chat-message`, `/chat-message/statistic`, `/admin/templates`, `/admin/settings` |
| **6.2** | **ID Scan (OCR)** | - Scan CCCD/Passport<br>- Tesseract.js OCR<br>- OpenCV image processing<br>- Auto-fill customer data<br>- Validation<br>- Image storage | Cao | 2 tuần | `/scan-xml-file`, `/scan-id` |
| **6.3** | **QR Survey** | - Create surveys<br>- QR code generation<br>- Public survey form<br>- Response collection<br>- Analytics<br>- PDF reports | Trung bình | 1.5 tuần | `/survey/settings`, `/survey/questions`, `/qr-survey-data`, `/qr-pdf` |
| **6.4** | **Public Forms** | - Public reservation form<br>- Extend reservation form<br>- Embeddable widget<br>- Form validation<br>- CAPTCHA | Trung bình | 1.5 tuần | `/form-create`, `/form-extend` |
| **6.5** | **Rakuten Integration** | - Sync with Rakuten Travel<br>- Import reservations<br>- Update availability<br>- Price sync | Cao | 2 tuần | `/rakuten-master`, `/reservation-import` |
| **6.6** | **TKC Export** | - Export to accounting system<br>- Format conversion<br>- Schedule auto-export | Trung bình | 1 tuần | `/tkc` |

**Tổng Phase 6:** 11 tuần (2.75 tháng)

---

## 🔥 TOP 10 TÍNH NĂNG QUAN TRỌNG NHẤT (MUST-HAVE)

Nếu phải cắt giảm scope, ưu tiên giữ lại các tính năng sau:

| Thứ tự | Tính năng | Lý do | Phase |
|--------|-----------|-------|-------|
| **1** | 📋 **Reservation Management** | Cốt lõi của nghiệp vụ cho thuê, không có thì không thể kinh doanh | Phase 1 |
| **2** | 👥 **Customer Management** | Quản lý khách hàng, tuân thủ pháp luật Nhật (phải lưu thông tin khách) | Phase 1 |
| **3** | 🏠 **Whiteboard (Usage Situation)** | Trực quan hóa trạng thái phòng, công cụ chính cho staff | Phase 1 |
| **4** | 💰 **Billing Management** | Tạo hóa đơn và thu tiền, trực tiếp ảnh hưởng doanh thu | Phase 2 |
| **5** | 🔐 **Authentication & Authorization** | Bảo mật và phân quyền, bắt buộc với 7 roles khác nhau | Phase 1 |
| **6** | 🏢 **Room Master** | Quản lý phòng và giá, không có thì không biết phòng nào cho thuê | Phase 1 |
| **7** | 🧹 **Cleaning Management** | Dọn dẹp là quy trình bắt buộc sau mỗi lần check-out | Phase 3 |
| **8** | 📊 **Sales Report** | Báo cáo doanh thu cho quản lý và kế toán | Phase 2 |
| **9** | 💳 **Payment Integration** | Hỗ trợ đa dạng phương thức thanh toán phổ biến tại Nhật | Phase 2 |
| **10** | 📱 **Dashboard** | Tổng quan nhanh cho management, ra quyết định | Phase 1 |

---

## ⏱️ TỔNG THỜI GIAN ƯỚC TÍNH

### Theo giai đoạn
| Phase | Thời gian | Độ ưu tiên |
|-------|-----------|------------|
| Phase 1: Core Business | **12.5 tuần** (3 tháng) | ⭐⭐⭐⭐⭐ Bắt buộc |
| Phase 2: Billing & Sales | **8 tuần** (2 tháng) | ⭐⭐⭐⭐ Bắt buộc |
| Phase 3: Operations | **5 tuần** (1.25 tháng) | ⭐⭐⭐ Quan trọng |
| Phase 4: Additional Services | **5 tuần** (1.25 tháng) | ⭐⭐ Nên có |
| Phase 5: Master Data | **4 tuần** (1 tháng) | ⭐⭐ Nên có |
| Phase 6: AI & Advanced | **11 tuần** (2.75 tháng) | ⭐ Nice-to-have |

### Tổng kết
- **MVP (Phase 1 + 2):** **20.5 tuần** (~5 tháng) - Đủ để vận hành cơ bản
- **Full Basic System (Phase 1-3):** **25.5 tuần** (~6.5 tháng) - Hệ thống hoàn chỉnh
- **Complete System (All phases):** **45.5 tuần** (~11.5 tháng) - Toàn bộ tính năng

### Tính toán team size
**Với 1 Full-stack Developer:**
- MVP: 5 tháng
- Full Basic: 6.5 tháng
- Complete: 11.5 tháng

**Với 2 Developers (1 FE + 1 BE):**
- MVP: 3-4 tháng
- Full Basic: 4-5 tháng
- Complete: 7-8 tháng

**Với 3 Developers (2 FE + 1 BE):**
- MVP: 2.5-3 tháng
- Full Basic: 3-4 tháng
- Complete: 5-6 tháng

---

## 👥 HỆ THỐNG PHÂN QUYỀN (7 ROLES)

| Role ID | Tên Role | Tiếng Nhật | Quyền truy cập | Default Landing |
|---------|----------|------------|----------------|-----------------|
| 1 | **ADMIN** | 管理者 | Toàn quyền, tất cả module | `/dashboard` |
| 2 | **YW_MANAGEMENT** | YW(管理) | Quản lý cấp cao: booking, billing, reports | `/dashboard` |
| 3 | **YW** | YW | Nhân viên vận hành: booking, customer, cleaning | `/dashboard` |
| 4 | **ABK** | ABK | Giới hạn một số chức năng cụ thể | `/other-products` |
| 5 | **CLEANING_MANAGEMENT** | 清掃(管理) | Quản lý đội dọn dẹp, lịch làm việc | `/cleaning-shift` |
| 6 | **CLEANING** | 清掃 | Chỉ xem và cập nhật công việc dọn dẹp | `/cleaning-shift` |
| 9 | **OTHER** | その他 | Quyền tối thiểu, chỉ xem | Limited access |

---

## 🏗️ CẤU TRÚC DỰ ÁN

```
src/
├── routes/                    # TanStack Router (file-based)
│   ├── __root.tsx            # Root layout
│   ├── _layout.tsx           # Authenticated layout
│   ├── _layout/              # Protected routes
│   │   ├── admin/            # AI admin features
│   │   ├── bill/             # Billing pages
│   │   ├── client/           # Customer pages
│   │   ├── parking/          # Parking pages
│   │   ├── reservation/      # Reservation pages
│   │   ├── trunk_room/       # Storage pages
│   │   ├── dashboard.lazy.tsx
│   │   ├── usageSituation.lazy.tsx
│   │   └── ...
│   ├── (authentication)/     # Login pages (4 portals)
│   └── form-*.tsx            # Public forms
│
├── components/
│   ├── common/               # Reusable UI components
│   ├── commonTable/          # Data tables
│   ├── dialogs/              # Modal dialogs
│   ├── header/               # Navigation
│   ├── pages/                # Page-specific components
│   └── ui/                   # Base primitives (shadcn)
│
├── hooks/
│   ├── queries/              # React Query GET hooks
│   │   ├── use-reservation-query.ts
│   │   ├── use-client-query.ts
│   │   └── ...
│   └── mutations/            # React Query mutations
│       ├── use-reservation-mutation.ts
│       └── ...
│
├── config/
│   └── ky.config.tsx         # HTTP client setup
│
├── constants/
│   └── common.ts             # Business constants, enums, types
│
├── utils/
│   ├── accessControl.ts      # RBAC utilities
│   └── ocr-opencv-helper.ts  # OCR processing
│
└── lib/                      # Shared utilities
```

---

## 📦 DEPENDENCIES CHÍNH

### Core
```json
{
  "react": "^18.x",
  "typescript": "^5.x",
  "vite": "^5.x"
}
```

### Routing & State
```json
{
  "@tanstack/react-router": "^1.x",
  "@tanstack/react-query": "^5.x",
  "valtio": "^2.x"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.x",
  "@radix-ui/react-*": "^1.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x"
}
```

### AI & OCR
```json
{
  "openai": "^4.x",
  "tesseract.js": "^5.x",
  "opencv.js": "^4.x"
}
```

### PDF & Charts
```json
{
  "recharts": "^2.x",
  "jspdf": "^2.x",
  "@react-pdf/renderer": "^3.x"
}
```

---

## 📊 API ENDPOINTS TỔNG QUAN

### Authentication
- `POST /auth/login` - Đăng nhập
- `GET /user/info` - Thông tin user hiện tại

### Core Resources
- `GET|POST|PUT|DELETE /reservation` - Quản lý booking
- `GET|POST|PUT|DELETE /client` - Quản lý khách hàng
- `GET|POST|PUT|DELETE /room` - Quản lý phòng
- `GET|POST|PUT|DELETE /bill` - Quản lý hóa đơn

### Supporting
- `GET /facility` - Danh sách tòa nhà
- `GET /area` - Danh sách khu vực
- `GET /staff` - Danh sách nhân viên
- `GET /parking` - Thông tin parking
- `GET /trunkroom` - Thông tin trunk room

### Reports
- `POST /report/receipt` - Tạo biên lai PDF
- `POST /report/daily` - Báo cáo hàng ngày
- `GET /sales` - Dữ liệu doanh thu

### AI/Advanced
- `POST /chat-message` - AI chatbot
- `POST /scan-id` - OCR scan ID
- `GET /survey/questions` - Khảo sát

---

## 🚀 CHIẾN THUẬT TRIỂN KHAI

### Sprint Planning (2-week sprints)
1. **Sprint 1-3:** Authentication + Dashboard + Room Master
2. **Sprint 4-6:** Customer Management + OCR
3. **Sprint 7-9:** Whiteboard + Reservation Core
4. **Sprint 10-11:** Billing + Payment
5. **Sprint 12-13:** Sales Reports + Daily Reports
6. **Sprint 14-15:** Cleaning Management
7. **Sprint 16-17:** Parking + Trunk Room + Equipment
8. **Sprint 18-19:** Master Data Management
9. **Sprint 20-22:** AI Chat + Advanced Features

### Testing Strategy
- **Unit Tests:** Jest + React Testing Library (critical business logic)
- **E2E Tests:** Playwright (happy paths for top 10 features)
- **Manual Testing:** UAT with actual staff before each phase release

### Deployment Strategy
- **Staging:** After each sprint
- **Production:** After each phase completion
- **Hotfix:** Critical bugs only, deploy within 24h

---

## 🎓 BUSINESS DOMAIN KNOWLEDGE

### Loại khách hàng
- **個人** (Personal): Khách lẻ
- **法人** (Corporate): Công ty
- **特別法人** (Special Corporate): Doanh nghiệp đặc biệt

### Thời gian thuê
- 1-6 đêm: Short stay
- 7 đêm đến dưới 1 tháng: Weekly
- 1 tháng trở lên: Monthly

### Trạng thái dọn dẹp
- 清掃全残: Chưa dọn
- 清掃中: Đang dọn
- 清掃済(未確認): Đã dọn (chưa kiểm tra)
- 清掃済(確認済): Đã dọn (đã kiểm tra)

### Phương thức thanh toán phổ biến
- **Cash** (現金): Tiền mặt
- **Credit Card**: JCB, UC
- **E-wallet**: PayPay, LINE Pay
- **Bank Transfer**: Yokohama Bank, SMBC, MUFG, Gunma Bank, Rakuten Bank
- **Platform**: Rakuten Travel, Now Room
- **Subsidy**: GoTo Travel

---

## 📞 ĐIỂM LIÊN HỆ & TÍCH HỢP

### Third-party Services
- **Rakuten Travel API** - Đồng bộ booking
- **OpenAI API** - AI chat assistant
- **TKC Accounting System** - Xuất dữ liệu kế toán
- **Payment Gateways** - Tích hợp thanh toán

### External Dependencies
- Cần API credentials từ client
- Cần test accounts cho staging
- Cần production credentials trước deploy

---

## 📝 GHI CHÚ

### Assumptions
- API backend đã có sẵn hoặc phát triển song song
- Design system/UI mockups đã được approve
- Business requirements đã được clarify với stakeholders

### Risks
- OCR accuracy phụ thuộc chất lượng ảnh chụp
- Rakuten API có thể thay đổi, cần monitoring
- Multi-role system phức tạp, cần test kỹ
- Real-time whiteboard cần optimize performance

### Next Steps
1. ✅ Review plan với team
2. ⬜ Setup development environment
3. ⬜ API contract discussion với backend team
4. ⬜ Kickoff Phase 1 development

---

**Document Version:** 1.0
**Last Updated:** 2026-03-29
**Author:** Development Team
**Status:** Draft - Awaiting Approval
