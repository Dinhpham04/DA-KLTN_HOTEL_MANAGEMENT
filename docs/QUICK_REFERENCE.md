# 🚀 QUICK REFERENCE - Weekly Mansion System

## 📋 Top 10 Features (Priority Order)

| # | Feature | Phase | Time | Priority |
|---|---------|-------|------|----------|
| 1 | Reservation Management | 1 | 3w | ⭐⭐⭐⭐⭐ |
| 2 | Customer Management + OCR | 1 | 2w | ⭐⭐⭐⭐⭐ |
| 3 | Whiteboard (Room Status) | 1 | 3w | ⭐⭐⭐⭐⭐ |
| 4 | Billing Management | 2 | 2.5w | ⭐⭐⭐⭐ |
| 5 | Authentication (7 roles) | 1 | 2w | ⭐⭐⭐⭐⭐ |
| 6 | Room Master | 1 | 1w | ⭐⭐⭐⭐⭐ |
| 7 | Cleaning Management | 3 | 2.5w | ⭐⭐⭐ |
| 8 | Sales Report | 2 | 1.5w | ⭐⭐⭐⭐ |
| 9 | Payment Integration | 2 | 2.5w | ⭐⭐⭐⭐ |
| 10 | Dashboard | 1 | 1.5w | ⭐⭐⭐⭐ |

## ⏱️ Timeline Summary

| Milestone | Duration | Features |
|-----------|----------|----------|
| **MVP** | 5 months | Phase 1 + 2 (Core + Billing) |
| **Production Ready** | 6.5 months | Phase 1-3 (+ Operations) |
| **Complete System** | 11.5 months | All 6 Phases |

### With different team sizes:
- **1 Developer:** 11.5 months (complete)
- **2 Developers:** 7-8 months (complete)
- **3 Developers:** 5-6 months (complete)

## 🎯 6 Development Phases

| Phase | Focus | Time | Priority |
|-------|-------|------|----------|
| Phase 1 | Core Business (Auth, Dashboard, Reservation, Customer, Room) | 12.5w | ⭐⭐⭐⭐⭐ |
| Phase 2 | Billing & Sales (Invoicing, Reports, Payments) | 8w | ⭐⭐⭐⭐ |
| Phase 3 | Operations (Daily Reports, Cleaning, Tasks) | 5w | ⭐⭐⭐ |
| Phase 4 | Additional Services (Parking, Trunk Room, Equipment) | 5w | ⭐⭐ |
| Phase 5 | Master Data (Area, Store, Price, Staff, Supplier) | 4w | ⭐⭐ |
| Phase 6 | AI & Advanced (Chat, OCR, Survey, Rakuten) | 11w | ⭐ |

## 🛠️ Tech Stack

**Core:** React 18 + TypeScript + Vite + TanStack Router
**State:** React Query + Valtio
**UI:** Tailwind + Radix UI + shadcn/ui
**Forms:** React Hook Form + Zod
**AI/OCR:** OpenAI + Tesseract.js + OpenCV.js
**Charts:** Recharts + Chart.js

## 👥 7 User Roles

| Role | Japanese | Access | Landing |
|------|----------|--------|---------|
| ADMIN | 管理者 | Full access | /dashboard |
| YW_MANAGEMENT | YW(管理) | Management | /dashboard |
| YW | YW | Operations | /dashboard |
| ABK | ABK | Limited | /other-products |
| CLEANING_MANAGEMENT | 清掃(管理) | Cleaning mgmt | /cleaning-shift |
| CLEANING | 清掃 | Cleaning only | /cleaning-shift |
| OTHER | その他 | Minimal | Limited |

## 🔑 Critical API Endpoints

```
# Core
POST /auth/login
GET /user/info
GET /reservation
POST /reserve
GET /client
POST /client
GET /room

# Billing
GET /bill
POST /bill
GET /sales
POST /payment/process

# Operations
GET /clean
POST /cleaning-shift
GET /daily-business-report

# Advanced
POST /chat-message
POST /scan-id
GET /survey/questions
```

## 📂 Project Structure

```
src/
├── routes/           # File-based routing
│   └── _layout/      # Protected routes
├── components/       # UI components
├── hooks/
│   ├── queries/      # API GET
│   └── mutations/    # API POST/PUT/DELETE
├── constants/        # Business logic
└── utils/           # Helpers
```

## 📊 Key Metrics to Track

- Total rooms: ~XXX rooms
- Average occupancy rate: target 80%+
- Check-in/out per day: ~XX transactions
- Active customers: ~XXX
- Monthly revenue: tracked in Sales Report
- Cleaning tasks/day: ~XX rooms

## 🚦 MVP Definition (Phase 1 + 2)

**Must Have:**
✅ Login with role-based access
✅ Room availability board
✅ Create/view/edit reservations
✅ Customer database
✅ Generate invoices
✅ Process payments
✅ Basic reports

**Can Wait:**
⏸️ AI Chat
⏸️ Advanced analytics
⏸️ Third-party integrations

## 📝 Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Generate routes
npm run generate-routes
```

## 🔗 Related Docs

- [Full Development Plan](./DEVELOPMENT_PLAN.md)
- API Documentation: (link to backend docs)
- Design System: (link to Figma/design)
- User Manual: (coming soon)
