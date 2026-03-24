---
name: migrate-frontend-page
description: Convert frontend page từ aic-yokohama-weekly-mansion-FE sang hotel-management-fe. Giữ nguyên 100% UI style (màu sắc, kích thước), refactor code sạch sẽ, chia component rõ ràng và adapt API endpoints.
---

# Migrate Frontend Page

Convert frontend page từ source (Japanese) sang target (Vietnamese).
**Yêu cầu thiết kế (CRITICAL)**: Ưu tiên giữ nguyên "Look & Feel" của bản gốc (màu sắc, cấu trúc, layout). **TUY NHIÊN**:
1. Khuyến khích sử dụng các component có sẵn của thư viện (ví dụ `shadcn/ui`, `CustomDialog`) nếu giao diện tương đương với bản gốc.
2. Khi dịch sang tiếng Việt/English, độ dài text thường dài hơn tiếng Nhật. Được TỰ DO ĐIỀU CHỈNH kích thước (width, height), padding, margins của button, label để chứa hết văn bản nhằm tránh tình trạng chữ bị ép, rớt dòng hoặc tràn viền vô lý.
3. Nếu source dùng custom component đặc thù chưa có bên target (và không có trong shadcn), hãy COPY y nguyên custom component đó sang.
4. **Loại bỏ tính năng đặc thù Nhật Bản**: FE cũ có thể chứa các text input hoặc table columns cho `nameKana`, `furigana`, `nameRuby`. **BẮT BUỘC PHẢI XÓA BỎ** chúng khỏi form và giao diện.
**Yêu cầu code**: 
- Dù UI giữ nguyên, code bên dưới phải được refactor thành cấu trúc rõ ràng, chuẩn clean code và tách biệt logic.
- **Dữ liệu phải đi đôi với Backend**: KHÔNG được migrate 100% data shape của source cũ một cách máy móc. Bạn phải nhìn vào API và DTO thực tế của Backend (`hotel-management-be`) đang trả về cái gì để map data lên UI cho chuẩn xác.

## Intent (Mục tiêu)

- **Goal 1**: Chuyển đổi một page/feature từ `aic-yokohama-weekly-mansion-FE` sang `hotel-management-fe`
- **Goal 2**: Refactor code (chia nhỏ component, extract hooks, xóa dead code), tuân thủ best practices của target repo
- **Boundaries**: Frontend only — backend API phải tồn tại trước (dùng `migrate-php-to-nestjs`)
- **When to use**: Sau khi backend API đã migrate xong

## Knowledge (Kiến thức)

### Source vs Target Structure

| Layer | Source (`aic-yokohama-weekly-mansion-FE`) | Target (`hotel-management-fe`) |
|-------|------------------------------------------|-------------------------------|
| Routes | `src/routes/_layout/{feature}*.tsx` | `src/routes/_authenticated/{feature}*.tsx` |
| Components | `src/components/` | `src/components/common/` |
| Hooks | `src/hooks/` | `src/hooks/queries/` + `src/hooks/mutations/` |
| API | Inline or `src/common/` | `src/api/{feature}.api.ts` |
| Types | Inline or `types/` | `src/types/{feature}.ts` |
| i18n | `src/i18n.ts` (single file, Japanese) | `src/i18n/locales/vi.json` (Vietnamese) |
| Styling | Tailwind CSS | Tailwind CSS (same) |
| UI lib | shadcn/ui | shadcn/ui (same) |

### Key Differences

1. **Route layout**: Source uses `_layout`, target uses `_authenticated`
2. **File router**: Both use TanStack Router, same pattern
3. **i18n**: Source has Japanese inline, target uses separate `vi.json` with `useTranslation()`
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

## Execution (Các bước thực hiện)

### Step 1: Read Source Page

Read source page(s) in `aic-yokohama-weekly-mansion-FE/src/routes/_layout/{feature}*.tsx`:
- Identify UI structure (table, forms, dialogs)
- Identify "code smells" (huge files, inline styles, mixed business logic) để chuẩn bị refactor
- List all components used
- List all API calls
- List all Japanese text strings
- Understand state management (useState, useForm, etc.)

### Step 2: Create Types & Match Target Backend

Extract TypeScript interfaces from source, **NHƯNG PHẢI CẬP NHẬT DỰA TRÊN API THỰC TẾ CỦA BACKEND MỚI**.
- Loại bỏ các field dành riêng cho Nhật Bản (như `nameKana`, `furigana`).
- Đảm bảo type khớp 100% với DTO và Response format từ NestJS, KHÔNG bưng y nguyên type của dữ liệu project PHP cũ.
Map to target format:

```typescript
// src/types/{feature}.ts
export interface Feature {
  featureId: number
  dataStatus: number
  featureName: string
  // ... fields matching API response
}

export interface CreateFeatureBody { ... }
export interface UpdateFeatureBody { ... }
export interface FeatureFilterParams { ... }
```

### Step 3: Create API Module

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

### Step 4: Create Hooks

Split source hooks into query/mutation hooks:

```typescript
// src/hooks/queries/useGetFeatures.ts
// src/hooks/mutations/useCreateFeature.ts
// src/hooks/mutations/useUpdateFeature.ts
// src/hooks/mutations/useDeleteFeature.ts
```

### Step 5: Add Translations

Extract Japanese strings → create Vietnamese translations:

```
Source: "施設マスタ" → Target: "Quản lý cơ sở"
Source: "追加" → Target: "Thêm mới"
Source: "編集" → Target: "Chỉnh sửa"
Source: "削除確認" → Target: "Xác nhận xóa"
```

Add to `src/i18n/locales/vi.json`.

### Step 6: Create Target Page (with Refactoring & Strict UI)

Convert source page → target page. **Tuyệt đối KHÔNG bê y nguyên code lộn xộn, TRỪ UI STYLE**:

1. **Routing**: `createLazyFileRoute('/_layout/feature')` → `createLazyFileRoute('/_authenticated/feature')`
2. **Clean Component**: Chia nhỏ các file component quá lớn (> 200 lines) thành các sub-components (ví dụ: `FeatureTable`, `FeatureForm`, `FeatureDialog`). Các logic phức tạp không được nhét chung vào UI.
3. **Adaptive UI Maintenance**: Dùng đúng cấu trúc Tailwind CSS của bản gốc để giữ màu sắc/layout tổng thể. **Tuy nhiên**, nhớ tăng `w-*`, `px-*`, `py-*` hoặc `margins` nếu bản dịch tiếng Việt dài hơn tiếng Nhật để tránh vỡ layout/chữ rớt dòng. Khuyến khích tận dụng các UI component hiện đại (như `shadcn`) thay thế cho HTML thuần nếu giống phong cách gốc. Nếu thiếu custom component, copy thẳng từ dự án cũ sang target rồi mới refactor logic bên trong.
4. **Logic Separation**: Di chuyển toàn bộ business logic và API calls ra custom hooks (đã tạo ở Step 4).
5. **i18n**: Replace inline Japanese text → `t('feature.key')`
6. **No Dead Code**: Bỏ đi mọi unused variables, commented code, alert/console.log hoặc inline hooks cũ bừa bộn từ FE cũ.
7. **Formatting**: Apply Biome conventions (no semicolons, single quotes) và tái sử dụng components (`CustomDialog`, v.v.).

### Step 7: Verify

```bash
cd hotel-management-fe
pnpm check        # Biome lint + format
pnpm type-check   # TypeScript check
```

Open browser và kiểm tra visual match với source.

## Verification (Kiểm tra)

- [ ] UI layout matches source page
- [ ] All CRUD operations work
- [ ] All Japanese text translated to Vietnamese
- [ ] No hardcoded strings
- [ ] `pnpm build` passes
- [ ] `pnpm check` passes
- [ ] `pnpm type-check` passes
- [ ] API calls point to correct NestJS endpoints

### 4C Checklist
- **Concise**: Tái sử dụng common components (như `CustomDialog`, `DataTable`). Nếu thiếu component đặc thù của UI cũ, copy từ source sang và refactor. Tuyệt đối không lặp lại code cũ hoặc để lại dead code.
- **Clear**: File component chỉ chứa UI. Toàn bộ logic ở trong Custom Hook. Code base của target phải "sạch", chuẩn cấu trúc, nhỏ gọn.
- **Correct**: Style tổng thể (màu sắc, layout) đảm bảo y hệt bản gốc, NHƯNG kích thước/khoảng cách đã được điều chỉnh phù hợp để hiển thị văn bản mới dịch (Vietnamese) mà không làm vỡ giao diện. URL API endpoint gọi sang BE chính xác.
- **Complete**: All features từ source phải hoạt động bình thường trên target.

## Reference Files

- Source staff page: `aic-yokohama-weekly-mansion-FE/src/routes/_layout/staff-master.lazy.tsx`
- Target staff page: `hotel-management-fe/src/routes/_authenticated/staff-master.tsx`
- Source store page: `aic-yokohama-weekly-mansion-FE/src/routes/_layout/store-master.lazy.tsx`
- Target store page: `hotel-management-fe/src/routes/_authenticated/store-master.lazy.tsx`

## Edge Cases

- **Page quá lớn (>200 lines)**: Sử dụng `.lazy.tsx` cho lazy loading
- **Sub-pages/tabs**: Tạo folder với sub-routes
- **Custom components**: Nếu source dùng component đặc biệt, tạo tương đương trong target
- **Different API shape**: NestJS response có thể khác PHP, cần adjust data mapping
- **Source dùng libraries không có trong target**: Tìm equivalent hoặc reimplement
- **Shared state giữa pages**: Sử dụng TanStack Query cache hoặc React context
