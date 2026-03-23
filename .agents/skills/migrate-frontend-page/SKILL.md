---
name: migrate-frontend-page
description: Convert frontend page từ aic-yokohama-weekly-mansion-FE (Japanese) sang hotel-management-fe (Vietnamese). Giữ nguyên UI style, refactor code sạch sẽ, chia component rõ ràng và adapt API endpoints.
---

# Migrate Frontend Page

Convert frontend page từ source (Japanese) sang target (Vietnamese).
**Yêu cầu cốt lõi**: Giữ nguyên UI style nhưng MỘT MẶT phải refactor code cũ thành cấu trúc rõ ràng, chuẩn clean code và tách biệt logic.

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

### Step 2: Create Types

Extract TypeScript interfaces from source. Map to target format:

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

### Step 6: Create Target Page (with Refactoring)

Convert source page → target page. **Tuyệt đối KHÔNG bê y nguyên code cũ lộn xộn sang**, phải đảm bảo refactor:

1. **Routing**: `createLazyFileRoute('/_layout/feature')` → `createLazyFileRoute('/_authenticated/feature')`
2. **Clean Component**: Chia nhỏ các file component quá lớn (> 200 lines) thành các sub-components (ví dụ: `FeatureTable`, `FeatureForm`, `FeatureDialog`). Các logic phức tạp không được nhét chung vào UI.
3. **Logic Separation**: Di chuyển toàn bộ business logic và API calls ra custom hooks (đã tạo ở Step 4).
4. **i18n**: Replace inline Japanese text → `t('feature.key')`
5. **No Dead Code**: Bỏ đi mọi unused variables, commented code, alert/console.log hoặc inline hooks cũ bừa bộn từ FE cũ.
6. **Formatting**: Apply Biome conventions (no semicolons, single quotes) và tái sử dụng components (`CustomDialog`, v.v.).

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
- [ ] `pnpm check` passes
- [ ] `pnpm type-check` passes
- [ ] API calls point to correct NestJS endpoints

### 4C Checklist
- **Concise**: Tái sử dụng common components (như `CustomDialog`, `DataTable`), tuyệt đối không lặp lại code cũ hoặc để lại dead code.
- **Clear**: File component chỉ chứa UI. Toàn bộ logic ở trong Custom Hook. Code base của target phải "sạch", chuẩn cấu trúc, nhỏ gọn.
- **Correct**: Style giao diện và behavior phải y hệt như bản gốc. URL API endpoint gọi sang BE chính xác.
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
