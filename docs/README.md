# 📚 Documentation - AIC Yokohama Weekly Mansion System

Chào mừng đến với thư mục tài liệu dự án **AKEBONO 予約管理システム** (Hệ thống Quản lý Đặt phòng AKEBONO).

---

## 📖 Tài liệu có sẵn

### [📋 DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)
**Kế hoạch phát triển chi tiết đầy đủ**

Bao gồm:
- Tổng quan dự án và công nghệ
- 6 giai đoạn phát triển với 29+ tính năng
- Ước lượng thời gian chi tiết cho từng feature
- Top 10 tính năng quan trọng nhất
- Cấu trúc dự án và API endpoints
- Hệ thống phân quyền 7 roles
- Chiến thuật triển khai và testing
- Business domain knowledge

**Dành cho:** Project Manager, Tech Lead, Full Team

---

### [🚀 QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
**Tham khảo nhanh - Tóm tắt ngắn gọn**

Bao gồm:
- Top 10 features (bảng nhanh)
- Timeline summary
- Tech stack tóm tắt
- Key API endpoints
- Project structure tóm gọn
- MVP definition

**Dành cho:** Developers, Quick lookup

---

## 🗂️ Cấu trúc tài liệu

```
docs/
├── README.md                 # File này - Hướng dẫn sử dụng docs
├── DEVELOPMENT_PLAN.md       # Kế hoạch phát triển đầy đủ
├── QUICK_REFERENCE.md        # Tham khảo nhanh
└── (future docs)
    ├── API_SPECIFICATION.md  # API docs (tương lai)
    ├── USER_MANUAL.md        # Hướng dẫn sử dụng (tương lai)
    └── DEPLOYMENT.md         # Hướng dẫn triển khai (tương lai)
```

---

## 🎯 Sử dụng tài liệu này như thế nào?

### Nếu bạn là Project Manager / Product Owner:
1. ✅ Đọc [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) - Section "Top 10 Features"
2. ✅ Review timeline và resource estimation
3. ✅ Prioritize features theo business needs
4. ✅ Adjust phases nếu cần

### Nếu bạn là Tech Lead / Architect:
1. ✅ Đọc toàn bộ [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)
2. ✅ Review tech stack và dependencies
3. ✅ Plan sprint breakdown
4. ✅ Setup development environment theo plan

### Nếu bạn là Developer:
1. ✅ Đọc [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) để nắm tổng quan
2. ✅ Check [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) - Section của phase đang làm
3. ✅ Tham khảo API endpoints và project structure
4. ✅ Follow coding conventions (coming soon)

### Nếu bạn là QA / Tester:
1. ✅ Đọc [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) - Top 10 Features
2. ✅ Understand user roles và permissions
3. ✅ Reference testing strategy section
4. ✅ Create test cases theo từng phase

---

## 📊 Trạng thái dự án

| Tài liệu | Trạng thái | Cập nhật lần cuối |
|----------|------------|-------------------|
| Development Plan | ✅ Complete v1.0 | 2026-03-29 |
| Quick Reference | ✅ Complete v1.0 | 2026-03-29 |
| API Specification | ⏳ Planned | - |
| User Manual | ⏳ Planned | - |
| Deployment Guide | ⏳ Planned | - |

---

## 🔄 Cập nhật tài liệu

Tài liệu này là **living document** - sẽ được cập nhật khi:
- Scope thay đổi
- Features mới được thêm
- Timeline được điều chỉnh
- Tech stack thay đổi
- Lessons learned từ development

### Version Control
- **v1.0** (2026-03-29): Initial release - Comprehensive planning
- **vX.X** (TBD): Updates as project progresses

---

## 💡 Tips

### Cho Developer mới vào dự án:
```bash
# Bước 1: Đọc Quick Reference trước (10 phút)
cat docs/QUICK_REFERENCE.md

# Bước 2: Đọc kỹ Phase đang làm (30 phút)
cat docs/DEVELOPMENT_PLAN.md | grep "PHASE 1" -A 50

# Bước 3: Setup environment
npm install
npm run dev

# Bước 4: Check codebase structure
tree src/ -L 2
```

### Cho việc ước lượng task:
- Xem [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) - Time estimates per feature
- Điều chỉnh theo team experience
- Add buffer 20-30% cho unexpected issues

### Cho việc prioritize:
- Follow **Top 10 Features** list
- Phase 1-2 là MVP (5 tháng)
- Phase 3 để production-ready
- Phase 4-6 là enhancement

---

## 🤝 Đóng góp

Nếu phát hiện:
- ❌ Thông tin sai
- 📝 Thiếu sót
- 💡 Cải thiện đề xuất

➡️ Liên hệ Tech Lead hoặc tạo issue/PR

---

## 📞 Liên hệ

- **Project Owner:** [Name]
- **Tech Lead:** [Name]
- **Development Team:** [Team name]
- **Email:** [Contact email]

---

## 🔗 Links hữu ích

- **Repository:** [GitHub link]
- **Project Management:** [Jira/Trello link]
- **Design:** [Figma link]
- **API Docs:** [Backend API docs]
- **Staging:** [Staging URL]
- **Production:** [Production URL]

---

**Last Updated:** 2026-03-29
**Maintained by:** Development Team
