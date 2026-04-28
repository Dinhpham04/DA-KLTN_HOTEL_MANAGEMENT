---
name: translate-japanese-ui
description: Dịch Japanese text từ source frontend sang Vietnamese/English. Extract hardcoded Japanese strings, tạo translation keys, và replace bằng i18n t() calls.
---

# Translate Japanese UI

Dịch Japanese text từ source frontend sang Vietnamese/English cho target frontend.

## Intent (Mục tiêu)

- **Goal**: Tìm và dịch tất cả Japanese strings trong frontend code sang Vietnamese
- **Boundaries**: Chỉ xử lý text/strings — KHÔNG thay đổi logic hay UI
- **When to use**: Trong quá trình `migrate-frontend-page`, hoặc khi cần dịch thêm text

## Knowledge (Kiến thức)

### Source i18n
- File: `aic-yokohama-weekly-mansion-FE/src/i18n.ts` (15KB, single file)
- Chứa Japanese translations inline

### Target i18n
- File: `hotel-management-fe/src/i18n/locales/vi.json`
- Config: `hotel-management-fe/src/i18n/index.ts`
- Format: JSON, structured by feature

### Common Japanese → Vietnamese Translations

| Japanese | Vietnamese | Key pattern |
|----------|-----------|-------------|
| 一覧 | Danh sách | `feature.list` |
| 追加 | Thêm mới | `feature.add` |
| 編集 | Chỉnh sửa | `feature.edit` |
| 削除 | Xóa | `feature.delete` |
| 検索 | Tìm kiếm | `common.search` |
| 保存 | Lưu | `common.save` |
| キャンセル | Hủy | `common.cancel` |
| 確認 | Xác nhận | `common.confirm` |
| 登録 | Đăng ký | `common.register` |
| 更新 | Cập nhật | `common.update` |
| 成功 | Thành công | `messages.success` |
| エラー | Lỗi | `messages.error` |
| 必須 | Bắt buộc | `validation.required` |
| 施設 | Cơ sở | `facility` |
| 部屋 | Phòng | `room` |
| 予約 | Đặt phòng | `reservation` |
| 顧客 | Khách hàng | `client` |
| スタッフ | Nhân viên | `staff` |
| 料金 | Giá | `price/rent` |
| 清掃 | Dọn dẹp | `cleaning` |
| 設備 | Thiết bị | `equipment` |
| 駐車場 | Bãi đỗ xe | `parking` |
| レポート | Báo cáo | `report` |
| 設定 | Cài đặt | `settings` |
| マスタ | Quản lý | `master` |

### Translation Key Structure

```json
{
  "feature": {
    "title": "Quản lý ...",
    "add": "Thêm ...",
    "edit": "Sửa ...",
    "columns": { ... },
    "messages": {
      "createSuccess": "Tạo ... thành công",
      "updateSuccess": "Cập nhật ... thành công",
      "deleteSuccess": "Xóa ... thành công",
      "deleteConfirm": "Bạn có chắc muốn xóa?"
    },
    "validation": { ... }
  }
}
```

## Execution (Các bước thực hiện)

### Step 1: Find Japanese Strings in Source

Search source file(s) for:
- Hardcoded Japanese text in JSX: `<h1>施設マスタ</h1>`
- String literals: `'予約一覧'`
- Template literals: `` `${count}件` ``
- Source i18n calls: `t('some.key')` → look up Japanese value

### Step 2: Read Source i18n File

```
File: aic-yokohama-weekly-mansion-FE/src/i18n.ts
```

Find the Japanese string values for keys used in the source page.

### Step 3: Create Translation Mapping

Create a mapping table:

```
Source (Japanese)     → Key               → Vietnamese
"施設マスタ"          → facility.title     → "Quản lý cơ sở"
"施設名"              → facility.columns.name → "Tên cơ sở"
"追加"                → facility.add       → "Thêm cơ sở"
```

### Step 4: Add to vi.json

Add the Vietnamese translations to `hotel-management-fe/src/i18n/locales/vi.json`.

### Step 5: Replace in Target Code

Replace hardcoded text with `t()` calls:

```typescript
// Before
<h1>Quản lý cơ sở</h1>

// After
<h1>{t('facility.title')}</h1>
```

For Zod schemas (outside components):
```typescript
import i18n from '@/i18n'
z.string().min(1, i18n.t('facility.validation.nameRequired'))
```

### Step 6: Format

```bash
cd hotel-management-fe
pnpm format
```

## Verification (Kiểm tra)

- No Japanese characters remaining in target code (search for Unicode range `[\u3000-\u9FFF]`)
- All `t()` keys exist in `vi.json`
- No empty translation values
- `pnpm check` passes

## Edge Cases

- **Dynamic text with variables**: Use interpolation `t('key', { count: 5 })` + `"key": "{{count}} mục"`
- **Date/number formatting**: Use `formatDate()`, `formatCurrency()` from `@/lib/utils`
- **Pluralization**: Vietnamese doesn't have plural forms, use one form
- **Technical terms**: Keep original if no Vietnamese equivalent (e.g., "ID", "Email")
- **Mixed JP + English**: Translate JP part, keep English
- **Long text in tooltips/help**: Keep translation concise
