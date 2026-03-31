---
name: migrate-frontend-page
description: Convert frontend page từ aic-yokohama-weekly-mansion-FE sang hotel-management-fe. Giữ nguyên 100% UI style (màu sắc, kích thước), refactor code sạch sẽ, chia component rõ ràng và adapt API endpoints.
---

# Migrate Frontend Page

Convert frontend page từ source (Japanese) sang target (Vietnamese).
**Yêu cầu thiết kế (CRITICAL)**: BẮT BUỘC giữ nguyên "Look & Feel" giống y hệt mẫu gốc. Giao diện gốc đã rất đẹp và chính xác nên các thông số (kích thước, màu sắc, cỡ chữ...) KHÔNG CẦN CHỈNH SỬA thêm. **TUY NHIÊN**:
1. Khi dịch sang tiếng Việt/English, độ dài text thường dài hơn tiếng Nhật. Có thể ĐIỀU CHỈNH kích thước (width, height), padding, margins của button, label để chứa hết văn bản nhằm tránh tình trạng chữ bị ép, rớt dòng hoặc tràn viền vô lý.
2. Nếu source dùng custom component đặc thù chưa có bên target, hãy COPY y nguyên custom component đó sang.
3. **Loại bỏ tính năng đặc thù Nhật Bản**: FE cũ có thể chứa các text input, table columns (như `nameKana`, `furigana`, `nameRuby`...) hoặc logic xử lý dành riêng cho Nhật. **BẮT BUỘC PHẢI XÓA BỎ HOÀN TOÀN** chúng khỏi form, logic code và màn hình giao diện.
**Yêu cầu code**:
- **BƯỚC TIỀN QUYẾT (QUAN TRỌNG NHẤT)**: Khi bắt đầu migration frontend, **BẮT BUỘC PHẢI KIỂM TRA** xem code backend (Controllers, DTO, Database) đã được migrate đúng nghiệp vụ và đủ chưa. Nếu chưa, PHẢI DỪNG LẠI và thực hiện migration backend trước tiên (bằng skill `migrate-php-to-nestjs`). Tuyệt đối không làm FE mù quáng khi BE chưa sẵn sàng.
- Dù UI giữ nguyên, code bên dưới phải được refactor thành cấu trúc rõ ràng, chuẩn clean code và tách biệt logic.
- **Dữ liệu map với Backend**: KHÔNG được migrate 100% data shape của source cũ một cách máy móc. Phải nhìn vào API và DTO thực tế của Backend (`hotel-management-be`) xem trả về chính xác loại dữ liệu/tên biến thế nào để dùng gọi lên UI.

## Intent (Mục tiêu)

- **Goal 1**: Chuyển đổi một page/feature từ `aic-yokohama-weekly-mansion-FE` sang `hotel-management-fe`
- **Goal 2**: Refactor code (chia nhỏ component, extract hooks, xóa dead code), tuân thủ best practices của target repo
- **Boundaries**: Frontend only — **BẮT BUỘC** bạn phải verify backend API của NestJS đã hoàn thiện, đủ tính năng mới được tiến hành làm Frontend. Nếu API hụt chức năng, phải qua xử lý Backend trước!
- **When to use**: Sau khi backend API đã migrate 100% xong râu ria.

## Knowledge (Kiến thức)

### Source vs Target Structure

| Layer | Source (`aic-yokohama-weekly-mansion-FE`) | Target (`hotel-management-fe`) |
|-------|------------------------------------------|-------------------------------|
| Routes | `src/routes/_layout/{feature}*.tsx` | `src/routes/_authenticated/{feature}*.tsx` |
| Components | `src/components/` |
| Hooks | `src/hooks/` | `src/hooks/queries/` + `src/hooks/mutations/` |
| API | Inline or `src/common/` | `src/api/{feature}.api.ts` |
| Types | Inline or `types/` | `src/types/{feature}.ts` |
| i18n | `src/i18n.ts` (single file, Japanese) | <!-- `src/i18n/locales/vi.json` (Vietnamese) --> Dịch thẳng tiếng Việt trong code |
| Styling | Tailwind CSS | Tailwind CSS (same) |
| UI lib | shadcn/ui | shadcn/ui (same) |

### Key Differences

1. **Route layout**: Source uses `_layout`, target uses `_authenticated`
2. **File router**: Both use TanStack Router, same pattern
3. **i18n**: <!-- Source has Japanese inline, target uses separate `vi.json` with `useTranslation()` --> Tạm thời hardcode thẳng tiếng Việt thay cho tiếng Nhật để dễ debug, chưa dùng i18n vội.
4. **API client**: Source may have different Axios config, target uses `@/lib/axios`
5. **Linter**: Source may use ESLint, target uses **Biome** (no semicolons, single quotes)

### Source Files
- Pages: `aic-yokohama-weekly-mansion-FE/src/routes/_layout/`
- Components: `aic-yokohama-weekly-mansion-FE/src/components/`
- Hooks: `aic-yokohama-weekly-mansion-FE/src/hooks/`
- i18n: `aic-yokohama-weekly-mansion-FE/src/i18n.ts`

### Target Conventions
- Biome: single quotes, no semicolons, 2-space indent
- Path alias: `@/*` → `src/*`
- Hooks: separate files (`useGetFeatures.ts`, `useCreateFeature.ts`)
- API: separate file (`feature.api.ts`)
- Types: separate file (`feature.ts`)

### Japanese Features to REMOVE (Tính năng Nhật Bản cần loại bỏ)

Khi migrate, BẮT BUỘC phải xóa bỏ các tính năng đặc thù Nhật Bản sau:

| Feature | Mô tả | Cách xử lý |
|---------|-------|-----------|
| **Kana fields** | `client_name_kana`, `company_name_kana`, `contact_name_kana` | Xóa khỏi form schema, UI, và API calls |
| **Wareki Calendar** | `JpDatePicker`, `JpEraPicker`, `JpYearPicker`, `JpAgeDisplay`, `type_calendal` | Thay bằng `CustomDatePicker` với locale `vi-VN` |
| **Kuromoji conversion** | `convertToKatakanaUsingKuromoji()` | Xóa hoàn toàn logic tự động convert sang Katakana |
| **Japanese zipcode API** | `zipcloud.ibsnet.co.jp/api/search` | Xóa hoặc thay bằng API phù hợp (nếu cần) |
| **Geonames JP** | `geonames.postalCodeSearch()` với `country: 'JP'` | Xóa hoặc điều chỉnh cho phù hợp |
| **Japanese text patterns** | Regex patterns cho Hiragana/Katakana validation | Xóa validation rules đặc thù |

## Execution (Các bước thực hiện)

### Step 1: Read Source Page & Identify Dependencies

Read source page(s) in `aic-yokohama-weekly-mansion-FE/src/routes/_layout/{feature}*.tsx`:
- Identify UI structure (table, forms, dialogs)
- Identify "code smells" (huge files, inline styles, mixed business logic) để chuẩn bị refactor
- **List all components used** (đặc biệt custom components)
- **List all dependencies/imports** cần copy sang target
- List all API calls
- List all Japanese text strings
- **Identify Japanese-specific features** để loại bỏ (xem bảng trên)
- Understand state management (useState, useForm, etc.)

### Step 2: Copy Dependencies & Custom Components

**CRITICAL**: Copy tất cả dependencies từ source sang target TRƯỚC KHI viết page chính.

```bash
# Ví dụ các file cần copy:
# Components
src/components/common/CustomCheckbox.tsx
src/components/common/CustomDatePicker.tsx  # Sửa locale từ JP sang vi-VN
src/components/common/CustomSelectClean.tsx
src/components/svgs/*.tsx                   # SVG icons

# Constants
src/constants/common.ts                     # Dịch sang tiếng Việt

# Types
src/types/*.ts

# Misc utilities
src/misc/type-guard.misc.ts

# DOM type definitions
src/dom.d.ts
```

**Khi copy CustomDatePicker.tsx**:
- Thay `locale` từ `'ja-JP'` sang `'vi-VN'`
- Xóa Japanese era picker components
- Sử dụng `const locale = 'vi-VN'` thay vì `useState`

**Khi copy constants/common.ts**:
- Dịch tất cả labels sang tiếng Việt
- Giữ nguyên value/enum numbers

### Step 3: Install Missing Packages

Kiểm tra và cài đặt packages thiếu:

```bash
cd hotel-management-fe
# Thường cần cài thêm:
pnpm add dayjs usehooks-ts react-datetime-picker react-calendar react-clock
```

### Step 4: Create Types & Match Target Backend

Extract TypeScript interfaces từ source, **NHƯNG PHẢI CẬP NHẬT DỰA TRÊN API THỰC TẾ CỦA BACKEND MỚI**.
- Loại bỏ các field dành riêng cho Nhật Bản (như `nameKana`, `furigana`).
- **Thêm các field mới** nếu backend hỗ trợ (như `stayDurationAutoFlag`, `ugFlag`, `usedMessyLevel`)
- Đảm bảo type khớp 100% với DTO và Response format từ NestJS.

```typescript
// src/types/{feature}.ts
export interface CreateFeatureBody {
  // Fields from source (translated to camelCase)
  dataType: number
  clientName: string
  // ...

  // THÊM fields mới nếu cần
  stayDurationAutoFlag?: number
  ugFlag?: number
  usedMessyLevel?: number

  // XÓA fields JP-specific
  // clientNameKana: string  ← XÓA
}
```

### Step 5: Create API Module

Map source API calls → target API module:

```typescript
// src/api/{feature}.api.ts
import apiClient from '@/lib/axios'

export const featureApi = {
  getFeatures: (params) => apiClient.get('/features', { params }),
  createFeature: (data) => apiClient.post('/features', data),
  // ... match source endpoints
}
```

### Step 6: Create Hooks

Split source hooks into query/mutation hooks:

```typescript
// src/hooks/queries/useGetFeatures.ts
// src/hooks/mutations/useCreateFeature.ts

// QUAN TRỌNG: Đảm bảo callback types đúng cho useMutation
// (LƯU Ý: React Query v5 ĐÃ LOẠI BỎ onSuccess/onError trong useQuery. Chỉ được dùng cho useMutation!)
interface UseCreateFeatureParams {
  onSuccess?: (data: unknown) => void  // Trả về data nếu cần
  onError?: (error: unknown) => void
}
```

### Step 7: Add Translations

<!-- TẠM THỜI KHÔNG DÙNG i18n, CHỈ HARDCODE TIẾNG VIỆT ĐỂ DỄ DEBUG
Extract Japanese strings → create Vietnamese translations:

```
Source: "施設マスタ" → Target: "Quản lý cơ sở"
Source: "追加" → Target: "Thêm mới"
Source: "編集" → Target: "Chỉnh sửa"
Source: "削除確認" → Target: "Xác nhận xóa"
Source: "顧客作成" → Target: "Tạo khách hàng"
Source: "名前" → Target: "Họ tên"
Source: "会社名" → Target: "Tên công ty"
Source: "電話番号" → Target: "Số điện thoại"
```

Add to `src/i18n/locales/vi.json`.
-->

Dịch trực tiếp các chuỗi tiếng Nhật sang tiếng Việt và **hardcode thẳng vào code JSX/TSX**. Không sử dụng i18n/`t()` ở thời điểm hiện tại.

### Step 8: Create Target Page (with Refactoring & Strict UI)

Convert source page → target page. **Copy Y HỆT UI layout và style, CHỈ thay đổi**:

1. **Routing**: `createLazyFileRoute('/_layout/feature')` → `createLazyFileRoute('/_authenticated/feature')`

2. **Form Schema**: Copy Zod schema từ source, SỬA:
   - Xóa fields JP-specific (`client_name_kana`, `type_calendal`, etc.)
   - Dịch error messages sang tiếng Việt
   - Đảm bảo types khớp với backend DTO

3. **Form Default Values**: Copy cấu trúc, xóa JP fields

4. **onSubmit Handler**:
   - Map form data sang backend DTO format (snake_case → camelCase)
   - Convert types đúng (`null` → `undefined` nếu cần)
   - Xử lý boolean/number conversions

5. **UI Components**:
   - Copy Y HỆT layout (flex, grid, spacing, colors)
   - Thay Japanese labels → Vietnamese labels
   - Xóa JP-specific inputs (Kana fields, Wareki picker)
   - Giữ nguyên conditional rendering logic

6. **Logic Separation**: Di chuyển business logic ra custom hooks

7. **i18n**: <!-- Replace inline text → `t('feature.key')` --> Tạm thời replace inline Japanese text → inline Vietnamese text (hardcode).
8. **Add routes**: Nếu page mới, thêm route vào menu ở `src/components/layouts/Header.tsx`

### Step 9: Fix Common Issues

Sau khi viết xong, thường gặp các lỗi sau:

**1. Unused Imports**
```typescript
// XÓA imports không dùng
import { Sex, UsedMessyLevel } from '@/constants/common'  // ← Xóa nếu không dùng
import { ClientDataType, SexType } from '@/types/client'  // ← Xóa nếu không dùng
```

**2. Type Mismatches & Ép Kiểu**
```typescript
// Sai: fax có thể là null
fax: data.fax,

// Đúng: Convert null → undefined
fax: data.fax ?? undefined,

// TUYỆT ĐỐI CẤM: Lách luật TypeScript bằng "as unknown as Type"
const client = data as unknown as Client // ⛔ Không được phép

// Đúng: Xử lý type chuẩn DTO từ backend lúc fetch hoặc map dữ liệu cẩn thận
```

**3. Callback Types (Cho Mutations)**
```typescript
// Sai: onSuccess không có param
onSuccess?: () => void

// Đúng: onSuccess cần param data để dễ mở rộng
onSuccess?: (data: unknown) => void
```

**4. Anti-Pattern của React Query v5**
Tuyệt đối KHÔNG ĐƯỢC tự chế/truyền tham số `onSuccess`, `onError` vào các api gọi data (như `useGetFeatures({ onSuccess })`) rồi nhét vào `queryFn`. Cách làm này sẽ gây bug khi dữ liệu lấy từ cache. Thay vào đó hãy dùng trực tiếp `data` ra từ hook.

**5. Locale in DatePicker**
```typescript
// Sai: useState không cần thiết
const [locale, setLocale] = useState('vi-VN')

// Đúng: Const vì không thay đổi
const locale = 'vi-VN'
```

### Step 10: Verify

```bash
cd hotel-management-fe
pnpm build        # Build thử xem có crash không. NẾU CÓ LỖI: PHẢI TỰ ĐỌC LOG VÀ TỰ FIX LUÔN TỚI KHI BUILD THÀNH CÔNG THÌ THÔI.
pnpm check        # Biome lint + format (phải fix hết lỗi lint)
pnpm type-check   # TypeScript check (không được bỏ qua lỗi type)
```

Open browser và kiểm tra visual match với source.

### Step 11: Cập nhật BUSINESS_LOGIC.md (BẮT BUỘC)

Sau khi frontend migration hoàn tất, **BẮT BUỘC** phải bổ sung hoặc xác nhận `docs/BUSINESS_LOGIC.md` đã có đầy đủ thông tin về business logic của feature vừa migrate.

**Kiểm tra và bổ sung nếu chưa có**:

1. **UI Behavior rules**: Các hiển thị đặc biệt phụ thuộc vào data (ví dụ: nền màu cam khi `ug_flag = true`, ẩn/hiện field theo `data_type`).
2. **Form validation rules**: Các rule phức tạp, conditional validation không hiển nhiên.
3. **Computed/derived display values**: Các giá trị hiển thị được tính từ nhiều trường (ví dụ: full name = firstName + lastName).
4. **Enum/status values**: Nếu frontend hiển thị label cho enum, bổ sung vào bảng enum trong BUSINESS_LOGIC.md.
5. **User flow đặc biệt**: Các luồng thao tác đặc biệt (wizard, multi-step form, conditional redirect...).

**Lưu ý**: Nếu backend đã migrate trước và BUSINESS_LOGIC.md đã có section cho feature này, chỉ cần **bổ sung thêm** các UI behavior rules mà backend không cover. Không ghi trùng lặp.

**Cập nhật Changelog** ở cuối file:
```markdown
| [Ngày hiện tại] | Bổ sung UI behavior rules cho [Feature] |
```

## Verification (Kiểm tra)

- [ ] UI layout matches source page **100%** (trừ JP-specific elements)
- [ ] All CRUD operations work
- [ ] All Japanese text translated to Vietnamese
- [ ] No hardcoded strings
- [ ] **All JP features REMOVED**: No Kana fields, no Wareki calendar, no Kuromoji
- [ ] Dependencies copied and working (CustomCheckbox, CustomDatePicker, etc.)
- [ ] **BẮT BUỘC**: `pnpm build`, `pnpm check`, `pnpm type-check` PASSES hoàn toàn
- [ ] API calls point to correct NestJS endpoints
- [ ] **BẮT BUỘC**: `docs/BUSINESS_LOGIC.md` đã được cập nhật với business logic/UI behavior của feature này (bao gồm cả Changelog)

### 4C Checklist
- **Concise**: Tái sử dụng common components (như `CustomDialog`, `DataTable`). Nếu thiếu component đặc thù của UI cũ, copy từ source sang và refactor. Tuyệt đối không lặp lại code cũ hoặc để lại dead code.
- **Clear**: File component chỉ chứa UI. Toàn bộ logic ở trong Custom Hook. Code base của target phải "sạch", chuẩn cấu trúc, nhỏ gọn.
- **Correct**: Style tổng thể (màu sắc, layout) đảm bảo y hệt bản gốc, NHƯNG kích thước/khoảng cách đã được điều chỉnh phù hợp để hiển thị văn bản mới dịch (Vietnamese) mà không làm vỡ giao diện. URL API endpoint gọi sang BE chính xác.
- **Complete**: All features từ source phải hoạt động bình thường trên target (trừ JP-specific features).
- **Documented**: `docs/BUSINESS_LOGIC.md` đã được cập nhật với UI behavior rules và business logic của feature này (bao gồm cả Changelog).

## Example Migration: Client Create Page

### Files Created/Modified:

```
hotel-management-fe/
├── src/
│   ├── api/
│   │   └── country.api.ts              # NEW: Country API
│   ├── components/
│   │   ├── common/
│   │   │   ├── CustomCheckbox.tsx      # COPIED from source
│   │   │   ├── CustomDatePicker.tsx    # COPIED, fixed locale
│   │   │   └── CustomSelectClean.tsx   # ALREADY EXISTS
│   │   └── svgs/
│   │       ├── BicycleSVG.tsx          # COPIED
│   │       ├── CarSvg.tsx              # COPIED
│   │       ├── DogSvg.tsx              # COPIED
│   │       └── CloseCommonWhite.tsx    # COPIED
│   ├── constants/
│   │   └── common.ts                   # UPDATED: Vietnamese labels
│   ├── hooks/
│   │   ├── mutations/
│   │   │   └── useCreateClient.ts      # UPDATED: onSuccess callback
│   │   └── queries/
│   │       └── useGetCountries.ts      # NEW
│   ├── misc/
│   │   └── type-guard.misc.ts          # COPIED
│   ├── routes/_authenticated/clients/
│   │   └── create.lazy.tsx             # REWRITTEN: Full UI copy
│   ├── types/
│   │   ├── client.ts                   # UPDATED: New fields
│   │   └── country.ts                  # NEW
│   └── dom.d.ts                        # NEW: LooseValue type
```

### JP Features Removed from Client Create:
- `client_name_kana`, `company_name_kana`, `contact_name_kana` fields
- `JpDatePicker`, `JpEraPicker`, `JpYearPicker`, `JpAgeDisplay` components
- `convertToKatakanaUsingKuromoji()` function
- `zipcloud.ibsnet.co.jp` API call
- `type_calendal` field

### JP Features Kept (Non-JP versions):
- `CustomDatePicker` with `vi-VN` locale
- All form fields (translated labels)
- Full form validation (translated messages)
- All checkboxes (`stay_duration_auto_flag`, `ug_flag`, `postpaid_flag`, etc.)

## Edge Cases

- **Page quá lớn (>200 lines)**: Sử dụng `.lazy.tsx` cho lazy loading
- **Sub-pages/tabs**: Tạo folder với sub-routes
- **Custom components**: Nếu source dùng component đặc biệt, tạo tương đương trong target
- **Different API shape**: NestJS response có thể khác PHP, cần adjust data mapping
- **Source dùng libraries không có trong target**: Cài thêm packages (`pnpm add ...`)
- **Shared state giữa pages**: Sử dụng TanStack Query cache hoặc React context
- **Type mismatches**: Convert `null` → `undefined`, `number` ↔ `boolean` theo DTO
