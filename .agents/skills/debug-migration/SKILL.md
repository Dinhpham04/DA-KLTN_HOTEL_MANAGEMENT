---
name: debug-migration
description: Debug issues phát sinh trong quá trình migration từ PHP/Laravel sang NestJS và từ Japanese FE sang Vietnamese FE. Covers API mismatches, data type diffs, missing translations.
---

# Debug Migration

Debug issues phát sinh trong quá trình chuyển đổi PHP→NestJS và JP FE→VN FE.

## Intent (Mục tiêu)

- **Goal**: Chẩn đoán và fix issues đặc thù của migration
- **Boundaries**: Issues liên quan đến migration — có thể là BE hoặc FE
- **When to use**: Khi migrate xong nhưng feature không hoạt động đúng

## Knowledge (Kiến thức)

### Common Migration Issues

| Category | Symptom | Root Cause |
|----------|---------|------------|
| API Shape | FE nhận data sai format | PHP response shape ≠ NestJS response shape |
| Data Type | Number hiện NaN, date sai | Laravel casts ≠ Prisma types |
| Auth | 401 khi gọi API | JWT config khác nhau |
| Pagination | Wrong page/total | PHP pagination khác NestJS |
| Soft Delete | Deleted items vẫn hiện | Thiếu `deletedAt: null` filter |
| Relations | Missing nested data | Prisma include chưa đúng |
| Translation | Japanese text còn sót | Chưa dịch hết strings |
| Route | 404 trên frontend | Route naming khác source |
| Validation | Form submit lỗi | Validation rules khác nhau |
| File Upload | Upload fail | Multer config khác Laravel |

### API Response Shape Comparison

```php
// PHP/Laravel response
{
  "data": [...],
  "current_page": 1,
  "last_page": 5,
  "per_page": 15,
  "total": 72
}
```

```typescript
// NestJS response (target)
{
  "items": [...],
  "meta": {
    "total": 72,
    "page": 1,
    "limit": 15,
    "totalPages": 5
  }
}
```

### Common Prisma vs Eloquent Differences

| Eloquent | Prisma | Issue |
|----------|--------|-------|
| `$model->toArray()` | `entity` (plain object) | Prisma returns plain objects |
| `$model->load('relation')` | `include: { relation: true }` | Must explicitly include |
| `Carbon` dates | `Date` objects | Date format may differ |
| `$model->getAttribute('computed')` | No equivalent | Must compute in service |
| Automatic timestamps | `@updatedAt` directive | Must configure in schema |

## Execution (Các bước chẩn đoán)

### Step 1: Identify the Layer

Lỗi xảy ra ở đâu?

1. **Browser Console** → Frontend issue
2. **Network tab (API response)** → Backend response issue
3. **Server logs** → Backend processing issue
4. **Database** → Data/schema issue

### Step 2: Compare with Source

Mở source code tương ứng và compare:

```
Source BE: aic-yokohama-weekly-mansion/app/Http/Controllers/...
Target BE: hotel-management-be/src/modules/.../

Source FE: aic-yokohama-weekly-mansion-FE/src/routes/_layout/...
Target FE: hotel-management-fe/src/routes/_authenticated/...
```

### Step 3: Fix by Category

#### API Shape Mismatch
```typescript
// Frontend đang expect shape cũ
// Fix: Update frontend types + data mapping
// OR: Adjust NestJS response to match expected shape

// Common fix in frontend:
const data = response.data as PaginatedResponse<Feature>
// If shape differs, map it:
const items = data.items ?? data.data  // Handle both shapes
```

#### Data Type Issues
```typescript
// PHP trả string cho number fields
// Prisma trả đúng type
// Fix: Check DTO mapping, ensure correct types

// Common issue: date strings
// PHP: "2024-01-01 00:00:00"
// Prisma: ISO8601 "2024-01-01T00:00:00.000Z"
// Fix: Use consistent date handling in frontend
```

#### Missing Relations / Include
```typescript
// Eloquent auto-loads some relations
// Prisma requires explicit include
// Fix:
const result = await this.prisma.feature.findMany({
  include: {
    facility: true,  // Must explicitly include
    createdBy: { select: { staffId: true, staffName: true } },
  },
})
```

#### Pagination Differences
```typescript
// PHP uses 1-based, NestJS may use 0-based
// Fix: Ensure consistent page numbering
// Target convention: 1-based (page starts from 1)
skip: (filter.page - 1) * filter.limit
```

#### Japanese Text Remaining
```bash
# Search for remaining Japanese characters in target FE
# Unicode range for Japanese: \u3000-\u9FFF, \uFF00-\uFFEF
grep -rn "[\u3000-\u9FFF]" hotel-management-fe/src/
```

#### Auth / CORS Issues
```typescript
// Check backend CORS config in main.ts
// Check axios baseURL in lib/axios.ts
// Check JWT secret matches between PHP and NestJS
// Check token format (Bearer vs other)
```

### Step 4: Verify Fix

```bash
# Backend
cd hotel-management-be
pnpm run build
pnpm test

# Frontend
cd hotel-management-fe
pnpm check
pnpm type-check
```

Test end-to-end flow in browser.

## Verification (Kiểm tra)

- Fixed feature works identically to source
- No regression in other features
- Build passes on both BE and FE
- No console errors in browser

### 4C Checklist
- **Concise**: Fix root cause, không workaround
- **Clear**: Document what was different between source and target
- **Correct**: Behavior matches source PHP/FE
- **Complete**: All related endpoints/pages verified

## Common Gotchas (Migration-specific)

1. **PHP returns `null` as `null`, Prisma returns `undefined`** — check for both
2. **PHP `0` is falsy, JS/TS `0` is also falsy** — explicit checks needed
3. **Laravel `$fillable` vs NestJS DTO** — DTO may miss fields
4. **PHP associative arrays → TypeScript objects** — type carefully
5. **PHP `Carbon::now()` vs JS `new Date()`** — timezone awareness
6. **Laravel's `deleted_at` is `SoftDeletes` trait**, NestJS must filter manually
7. **Source uses `data_status` field**: Some records use `data_status = 0` for deleted
8. **PHP integer division vs TypeScript**: `Math.floor()` or `Math.ceil()` needed
9. **Encoding**: Japanese characters in DB → ensure UTF-8 throughout
10. **API prefixes**: Source `/api/...`, Target `/api/v1/...`
